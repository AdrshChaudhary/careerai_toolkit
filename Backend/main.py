from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
import fitz  # PyMuPDF
import httpx
import json
import os
from typing import Optional
import logging
from datetime import datetime
from dotenv import load_dotenv
from typing import List
import asyncio
from collections import Counter
import re
# Load environment variables from .env file
load_dotenv()

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Print startup information
print("🚀 Starting CareerAI Toolkit API...")
print(f"📁 Working directory: {os.getcwd()}")
print(f"🔑 GEMINI_API_KEY present: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")

# Initialize FastAPI app with more configuration
app = FastAPI(
    title="CareerAI Toolkit API", 
    version="1.0.0",
    description="AI-powered career tools for resume analysis, LinkedIn optimization, and GitHub analysis",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS with more specific settings for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Configure Gemini API with better error handling
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.error("❌ GEMINI_API_KEY not found in environment variables")
    print("❌ GEMINI_API_KEY not found! Please check your .env file")
    # Don't raise error immediately, let the app start for health checks
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        print("✅ Gemini API configured successfully")
    except Exception as e:
        logger.error(f"❌ Error configuring Gemini API: {str(e)}")
        print(f"❌ Error configuring Gemini API: {str(e)}")

def extract_clean_json(text: str):
    """
    Extracts and cleans JSON from LLM responses, removing markdown fences
    and extra commentary.
    """
    if not text:
        raise ValueError("Empty response from LLM")

    # Remove leading/trailing whitespace
    text = text.strip()

    # Remove markdown code fences (```json ... ```)
    text = re.sub(r"^```[a-zA-Z]*\n", "", text)
    text = re.sub(r"\n```$", "", text)

    # Extract the first valid JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        logger.error("❌ No JSON object found in LLM output")
        raise ValueError("No JSON object found in LLM output")
    
    json_str = match.group(0)

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parsing failed: {e}")
        logger.error(f"Problematic JSON string preview: {json_str[:500]}")
        raise

# Pydantic models for request/response validation
class GitHubProfileRequest(BaseModel):
    githubUsername: str

class GitHubRepoRequest(BaseModel):
    repositoryUrl: str

class ResumeAnalysisJobResponse(BaseModel):
    score: float
    summaryFeedback: str
    skillsFeedback: str
    experienceFeedback: str
    educationFeedback: str
    projectFeedback: str
    jobRoleSuggestions: str
    overallSuggestions: str

class ResumeAnalysisComprehensiveResponse(BaseModel):
    score: float
    comprehensiveAnalysis: str
    summaryFeedback: str
    skillsFeedback: str
    experienceFeedback: str
    educationFeedback: str
    projectFeedback: str
    jobRoleSuggestions: str
    overallSuggestions: str

class LinkedInOptimizerResponse(BaseModel):
    profileStrengthScore: float
    headlineFeedback: str
    summaryFeedback: str
    experienceFeedback: str
    skillsFeedback: str
    activityFeedback: str
    keywordSuggestions: str
    overallSuggestions: str

class LanguageItem(BaseModel):
    name: str
    value: int

class GitHubProfileResponse(BaseModel):
    techStack: str
    codeQualityInsights: str
    languageDistribution: List[LanguageItem]
    languageDistributionChart: str
    repositoryCreationActivity: List[LanguageItem]
    repositoryCreationActivityChart: str
    overallSuggestions: str

class GitHubRepoResponse(BaseModel):
    purposeFeedback: str
    documentationQualityFeedback: str
    overallSuggestions: str

# Add startup event handler
@app.on_event("startup")
async def startup_event():
    logger.info("🎯 FastAPI startup event triggered")
    
    # Test Gemini API connectivity
    if GEMINI_API_KEY:
        try:
            # Test with a simple prompt
            logger.info("🧪 Testing Gemini API connectivity...")
            model = genai.GenerativeModel('gemini-1.5-flash')
            test_response = model.generate_content("Hello, respond with 'API working'")
            if test_response and test_response.text:
                logger.info("✅ Gemini API test successful")
            else:
                logger.warning("⚠️ Gemini API test returned empty response")
        except Exception as e:
            logger.error(f"❌ Gemini API test failed: {str(e)}")
    
    logger.info("✅ Startup completed successfully")

# Add shutdown event handler
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 FastAPI shutdown event triggered")

# Utility functions
def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text content from PDF file"""
    try:
        logger.info(f"📄 Extracting text from PDF ({len(file_content)} bytes)")
        doc = fitz.open(stream=file_content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        logger.info(f"✅ Successfully extracted {len(text)} characters from PDF")
        return text.strip()
    except Exception as e:
        logger.error(f"❌ Error extracting PDF text: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF")

async def call_gemini(prompt: str, max_retries: int = 3) -> str:
    """Call Gemini API with retry logic and better error handling"""
    
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    # Try different model names in order of preference
    model_names = [
        'gemini-2.5-flash',
        'gemini-2.5-pro', 
        'gemini-1.5-flash',
        'gemini-1.5-pro', 
        'gemini-pro'
    ]
    
    for attempt in range(max_retries):
        for model_name in model_names:
            try:
                logger.info(f"🤖 Calling Gemini API (model: {model_name}, attempt: {attempt + 1})")
                
                # Add timeout for API calls
                model = genai.GenerativeModel(model_name)
                
                # Use asyncio to add timeout
                response = await asyncio.wait_for(
                    asyncio.to_thread(model.generate_content, prompt),
                    timeout=30.0  # 30 second timeout
                )
                
                # Check if response has text
                if hasattr(response, 'text') and response.text:
                    logger.info(f"✅ Successful response from {model_name}")
                    return response.text
                elif hasattr(response, 'candidates') and response.candidates:
                    text = response.candidates[0].content.parts[0].text
                    logger.info(f"✅ Successful response from {model_name} (via candidates)")
                    return text
                else:
                    raise ValueError("Empty response from model")
                    
            except asyncio.TimeoutError:
                logger.warning(f"⏰ Timeout for model {model_name} (attempt {attempt + 1})")
                continue
            except Exception as e:
                logger.warning(f"⚠️ Model {model_name} failed (attempt {attempt + 1}): {str(e)}")
                continue
        
        # If all models failed for this attempt, log and continue to next attempt
        logger.error(f"❌ All models failed on attempt {attempt + 1}")
        if attempt < max_retries - 1:
            await asyncio.sleep(1)  # Brief pause before retry
    
    raise HTTPException(status_code=500, detail="LLM service unavailable. Please check your API key and try again.")

def parse_json_response(text: str) -> dict:
    """Parse JSON response from LLM output and ensure all values are strings"""
    try:
        logger.info("🔍 Parsing JSON response from LLM")
        
        # Find JSON content between ```json and ``` or just parse directly
        if "```json" in text:
            start = text.find("```json") + 7
            end = text.find("```", start)
            json_text = text[start:end].strip()
        else:
            json_text = text.strip()
        
        data = json.loads(json_text)
        
        # Convert any list values to comma-separated strings
        for key, value in data.items():
            if isinstance(value, list):
                data[key] = ", ".join(str(item) for item in value)
            elif not isinstance(value, (str, int, float)):
                data[key] = str(value)
        
        logger.info("✅ Successfully parsed JSON response")
        return data
    except Exception as e:
        logger.error(f"❌ Failed to parse JSON from LLM response: {str(e)}")
        logger.error(f"Response text preview: {text[:500]}...")
        raise HTTPException(status_code=500, detail="Failed to parse LLM response")

async def fetch_github_user_repos(username: str) -> list:
    """Fetch user repositories from GitHub API with optional authentication"""
    try:
        logger.info(f"🐙 Fetching GitHub repos for user: {username}")

        headers = {"Accept": "application/vnd.github.v3+json"}
        github_token = os.getenv("GITHUB_TOKEN")
        if github_token:
            headers["Authorization"] = f"token {github_token}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://api.github.com/users/{username}/repos",
                headers=headers
            )

            if response.status_code == 403 and "rate limit" in response.text.lower():
                logger.error("❌ GitHub API rate limit reached")
                raise HTTPException(
                    status_code=429,
                    detail="GitHub API rate limit exceeded. Please try again later."
                )

            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="GitHub user not found")

            response.raise_for_status()
            repos = response.json()
            logger.info(f"✅ Fetched {len(repos)} repositories")
            return repos

    except httpx.HTTPStatusError as e:
        logger.error(f"❌ GitHub API error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch GitHub data")

def normalize_score(raw_score: float) -> float:
    try:
        raw_score = float(raw_score)
    except (ValueError, TypeError):
        return 75.0  # fallback

    if raw_score >= 90:
        return min(100, raw_score)  # Excellent → keep up to 100
    elif raw_score >= 80:
        return 75 + (raw_score - 80)  # Good → map 80–89 to 75–85
    elif raw_score >= 70:
        return 65 + (raw_score - 70)  # Average → map 70–79 to 65–74
    else:
        return raw_score  # Poor → keep as-is

def keyword_match_score(resume_text: str, job_desc: str) -> float:
    resume_words = set(resume_text.lower().split())
    job_words = set(job_desc.lower().split())
    if not job_words:
        return 0.0
    matches = resume_words.intersection(job_words)
    return round((len(matches) / len(job_words)) * 100, 2)

REQUIRED_KEYS_COMPREHENSIVE = [
    "score", "comprehensiveAnalysis", "summaryFeedback", "skillsFeedback",
    "experienceFeedback", "educationFeedback", "projectFeedback",
    "jobRoleSuggestions", "overallSuggestions"
]

REQUIRED_KEYS_JOB = [
    "score", "summaryFeedback", "skillsFeedback", "experienceFeedback",
    "educationFeedback", "projectFeedback", "jobRoleSuggestions", "overallSuggestions"
]

REQUIRED_KEYS_LINKEDIN = [
    "profileStrengthScore", "headlineFeedback", "summaryFeedback",
    "experienceFeedback", "skillsFeedback", "activityFeedback",
    "keywordSuggestions", "overallSuggestions"
]

REQUIRED_KEYS_REPO = [
    "purposeFeedback",
    "documentationQualityFeedback",
    "overallSuggestions"
]

def ensure_all_keys(data: dict, required_keys: list):
    for key in required_keys:
        if key not in data or data[key] is None:
            data[key] = "" if key != "score" and key != "profileStrengthScore" else 0.0
    return data

async def fetch_github_readme(repo_url: str) -> str:
    """Fetch README content from GitHub repository"""
    try:
        logger.info(f"📖 Fetching README for: {repo_url}")
        
        # Extract owner and repo from URL
        parts = repo_url.rstrip('/').split('/')
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid repository URL")
        
        owner = parts[-2]
        repo = parts[-1]
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Try different README variations
            for readme_name in ["README.md", "readme.md", "README", "readme"]:
                for branch in ["main", "master"]:
                    try:
                        response = await client.get(
                            f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{readme_name}"
                        )
                        if response.status_code == 200:
                            logger.info(f"✅ Found README: {readme_name} on {branch}")
                            return response.text
                    except:
                        continue
        
        logger.info("📝 No README file found")
        return "No README file found in the repository."
    except Exception as e:
        logger.error(f"❌ Error fetching README: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch repository README")

# Health check endpoint (move to top for quick testing)
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "gemini_configured": bool(GEMINI_API_KEY)
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CareerAI Toolkit API", 
        "version": "1.0.0",
        "status": "running",
        "docs_url": "/docs"
    }

@app.get("/models")
async def list_available_models():
    """List available Gemini models"""
    try:
        if not GEMINI_API_KEY:
            return {"error": "Gemini API key not configured"}
            
        models = genai.list_models()
        available_models = []
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                available_models.append({
                    "name": model.name,
                    "display_name": model.display_name,
                    "supported_methods": model.supported_generation_methods
                })
        return {"available_models": available_models}
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        return {"error": "Could not fetch available models", "detail": str(e)}

# API Endpoints
@app.post("/api/resume-analyzer/job-description", response_model=ResumeAnalysisJobResponse)
async def analyze_resume_job_description(
    resume: UploadFile = File(...),
    jobDescription: str = Form(...)
):
    """Analyze resume against a specific job description"""
    try:
        logger.info("📊 Starting resume analysis with job description")
        
        # Extract text from resume PDF
        resume_content = await resume.read()
        resume_text = extract_text_from_pdf(resume_content)
        
        keyword_score = keyword_match_score(resume_text, jobDescription)
        
        # Create prompt for LLM
        prompt = f"""
        You are an expert ATS (Applicant Tracking System) evaluator and career coach. 
        Analyze the following resume against the provided job description and give detailed, constructive feedback.

        Scoring guidance:
        - Use the FULL range from 0 to 100.
        - Exceptional quality resumes: 90–100.
        - Strong resumes: 80–89.
        - Good resumes: 75–79.
        - Average resumes: 65–74.
        - Below average resumes: below 65.
        - Be fair – if a resume is truly outstanding, do not hesitate to score above 90.
        - Avoid clustering all scores in a narrow range.
        
        RESUME TEXT:
        {resume_text}

        JOB DESCRIPTION:
        {jobDescription}

        Return the result in EXACTLY this JSON format (keep the same keys as shown):
        {{
            "score": <number between 0-100>,
            "summaryFeedback": "<feedback on the summary/objective>",
            "skillsFeedback": "<feedback on skills alignment with job requirements>",
            "experienceFeedback": "<feedback on work experience relevance>",
            "educationFeedback": "<feedback on education background>",
            "projectFeedback": "<feedback on projects and achievements>",
            "jobRoleSuggestions": "<suggestions for better job role positioning>",
            "overallSuggestions": "<overall recommendations for improvement>"
        }}
        IMPORTANT: 
        - The score must be a raw number between 0 and 100 (integer or float) without a percent sign.
        - If the resume is a perfect match for the job description, do not hesitate to score above 90.
        """
        
        # Get response from Gemini
        response_text = await call_gemini(prompt)
        response_data = extract_clean_json(response_text)

        # Ensure all required keys are present
        response_data = ensure_all_keys(response_data, REQUIRED_KEYS_JOB)        
        base_score = normalize_score(response_data["score"])
        boosted_score = (base_score * 0.85) + (keyword_score * 0.15)
        response_data["score"] = round(boosted_score, 2)

        logger.info("✅ Resume analysis completed successfully")
        return ResumeAnalysisJobResponse(**response_data)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in resume analysis (job description): {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing your request")

@app.post("/api/resume-analyzer/comprehensive", response_model=ResumeAnalysisComprehensiveResponse)
async def analyze_resume_comprehensive(resume: UploadFile = File(...)):
    """Provide comprehensive analysis of resume without specific job description"""
    try:
        logger.info("📊 Starting comprehensive resume analysis")
        
        # Extract text from resume PDF
        resume_content = await resume.read()
        resume_text = extract_text_from_pdf(resume_content)
        
        # Create prompt for LLM
        prompt = f"""
        You are an expert ATS (Applicant Tracking System) evaluator and career coach. 
        Analyze the resume carefully and give constructive, actionable feedback.

        Scoring guidance:
        - Use the FULL range from 0 to 100.
        - Exceptional quality resumes: 90–100.
        - Strong resumes: 80–89.
        - Good resumes: 75–79.
        - Average resumes: 65–74.
        - Below average resumes: below 65.
        - Be fair – if a resume is truly outstanding, do not hesitate to score above 90.
        - Avoid clustering all scores in a narrow range.

        RESUME TEXT:
        {resume_text}

        Return the result in EXACTLY this JSON format (keys and structure must match exactly):
        {{
            "score": <number between 0-100>,
            "comprehensiveAnalysis": "<detailed overall analysis of the resume>",
            "summaryFeedback": "<feedback on the summary/objective>",
            "skillsFeedback": "<feedback on skills relevance and presentation>",
            "experienceFeedback": "<feedback on work experience relevance and impact>",
            "educationFeedback": "<feedback on education background>",
            "projectFeedback": "<feedback on projects and achievements>",
            "jobRoleSuggestions": "<suggestions for better job role positioning>",
            "overallSuggestions": "<overall recommendations for improvement>"
        }}
        IMPORTANT:
        - The score must be a raw number between 0 and 100 (integer or float) without a percent sign.
        """
        
        # Get response from Gemini
        response_text = await call_gemini(prompt)
        response_data = extract_clean_json(response_text)

        # Ensure all required keys are present
        response_data = ensure_all_keys(response_data, REQUIRED_KEYS_COMPREHENSIVE)
        
        response_data["score"] = normalize_score(response_data["score"])
        
        logger.info("✅ Comprehensive resume analysis completed successfully")
        return ResumeAnalysisComprehensiveResponse(**response_data)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in comprehensive resume analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing your request")

@app.post("/api/linkedin-optimizer", response_model=LinkedInOptimizerResponse)
async def optimize_linkedin_profile(profile: UploadFile = File(...)):
    """Analyze LinkedIn profile PDF and provide optimization feedback"""
    try:
        logger.info("💼 Starting LinkedIn profile optimization")
        
        # Extract text from LinkedIn profile PDF
        profile_content = await profile.read()
        profile_text = extract_text_from_pdf(profile_content)
        
        # Create prompt for LLM
        prompt = f"""
        You are a LinkedIn branding expert and career coach.
        Evaluate the LinkedIn profile content and provide constructive, improvement-focused feedback.

        Scoring guidance:
        - Use the FULL range from 0 to 100.
        - Exceptional profiles: 90–100.
        - Strong profiles: 80–89.
        - Good profiles: 75–79.
        - Average profiles: 65–74.
        - Weak profiles: below 65.
        - Avoid clustering all scores between 70 and 79 – reward excellence, penalize weak points.

        LINKEDIN PROFILE TEXT:
        {profile_text}

        Return the result in EXACTLY this JSON format (all values must be strings except profileStrengthScore which must be a float):
        {{
            "profileStrengthScore": <number between 0-100>,
            "headlineFeedback": "<feedback on profile headline optimization>",
            "summaryFeedback": "<feedback on profile summary/about section>",
            "experienceFeedback": "<feedback on experience section descriptions>",
            "skillsFeedback": "<feedback on skills section and endorsements>",
            "activityFeedback": "<feedback on posts, articles, and engagement>",
            "keywordSuggestions": "<comma-separated keywords to include for SEO>",
            "overallSuggestions": "<overall recommendations for profile optimization>"
        }}
        IMPORTANT:
        - profileStrengthScore must be a raw number between 0 and 100 (integer or float) without a percent sign.
        """
        
        # Get response from Gemini
        response_text = await call_gemini(prompt)
        response_data = extract_clean_json(response_text)
        # Ensure all required keys are present
        response_data = ensure_all_keys(response_data, REQUIRED_KEYS_LINKEDIN)
        
        # Convert profileStrengthScore to float if it's a string
        response_data["profileStrengthScore"] = normalize_score(response_data["profileStrengthScore"])

        logger.info("✅ LinkedIn profile optimization completed successfully")
        return LinkedInOptimizerResponse(**response_data)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in LinkedIn optimization: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing your request")

@app.post("/api/github-analyzer/profile", response_model=GitHubProfileResponse)
async def analyze_github_profile(request: GitHubProfileRequest):
    """Analyze GitHub user profile for tech stack and code quality insights"""
    try:
        logger.info(f"🐙 Starting GitHub profile analysis for: {request.githubUsername}")
        
        # Fetch user repositories
        repos = await fetch_github_user_repos(request.githubUsername)
        
        # Prepare repository data for analysis
        repo_data = []
        languages = {}
        creation_dates = []
        
        for repo in repos:
            repo_info = {
                "name": repo["name"],
                "description": repo["description"] or "No description",
                "language": repo["language"],
                "created_at": repo["created_at"],
                "updated_at": repo["updated_at"],
                "stars": repo["stargazers_count"],
                "forks": repo["forks_count"]
            }
            repo_data.append(repo_info)
            
            # Count languages
            if repo["language"]:
                languages[repo["language"]] = languages.get(repo["language"], 0) + 1
            
            # Track creation dates for activity chart
            creation_dates.append(repo["created_at"][:7])  # YYYY-MM format
        
        # Create Mermaid charts with simpler, more compatible syntax
        # Prepare language distribution for charts
        language_distribution_array = []
        language_chart = "pie\n"
        if languages:
            for lang, count in sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5]:
                clean_lang = lang.replace('"', '').replace("'", "")
                language_chart += f'    "{clean_lang}" : {count}\n'
                language_distribution_array.append({"name": clean_lang, "value": count})
        else:
            language_chart += '    "No languages detected" : 1\n'
            language_distribution_array.append({"name": "No languages detected", "value": 1})
 
        # Activity chart (simplified) - using repository count per year instead
        years = [date[:4] for date in creation_dates if date]  # Extract years
        year_counts = Counter(years)
        
        activity_chart = "pie\n"
        activity_distribution_array = []
        if year_counts:
            for year, count in sorted(year_counts.items())[-5:]:  # Last 5 years with activity
                activity_chart += f'    "{year}" : {count}\n'
                activity_distribution_array.append({"name": year, "value": count})
        else:
            activity_chart += '    "No activity data" : 1\n'
            activity_distribution_array.append({"name": "No activity data", "value": 1})
        
        # Create prompt for LLM
        prompt = f"""
        You are a senior engineering manager reviewing a candidate's GitHub profile. Analyze the following repository data to provide insights into their tech stack and development practices.

        GITHUB PROFILE DATA:
        Username: {request.githubUsername}
        Number of repositories: {len(repos)}
        
        Repository Details:
        {json.dumps(repo_data, indent=2)}

        CHART DATA PROVIDED:
        Language Distribution Chart: {language_chart}
        Repository Activity Chart: {activity_chart}

        Please analyze the profile and provide a response in the following JSON format. ALL VALUES MUST BE STRINGS:
        {{
            "techStack": "<detailed analysis of the technology stack and programming languages used>",
            "codeQualityInsights": "<insights about code quality based on repository structure, naming, descriptions, and activity>",
            "languageDistributionChart": "{language_chart.strip()}",
            "repositoryCreationActivityChart": "{activity_chart.strip()}",
            "overallSuggestions": "<suggestions for improving the GitHub profile and development practices>"
        }}

        IMPORTANT: 
        - Use the exact chart data provided above for languageDistributionChart and repositoryCreationActivityChart
        - Do NOT modify the chart syntax - copy it exactly as shown
        - All fields should be detailed string responses

        Focus on:
        1. Diversity and depth of technology stack
        2. Project complexity and innovation
        3. Consistency in development activity
        4. Documentation quality (based on descriptions)
        5. Open source contributions and collaboration
        6. Professional presentation of work
        """
        
        # Get response from Gemini
        response_text = await call_gemini(prompt)
        response_data = extract_clean_json(response_text)
        response_data["languageDistribution"] = language_distribution_array
        response_data["languageDistributionChart"] = language_chart.strip()
        response_data["repositoryCreationActivity"] = activity_distribution_array
        response_data["repositoryCreationActivityChart"] = activity_chart.strip()
        
        logger.info("✅ GitHub profile analysis completed successfully")
        return GitHubProfileResponse(**response_data)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in GitHub profile analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing your request")

@app.post("/api/github-analyzer/repository", response_model=GitHubRepoResponse)
async def analyze_github_repository(request: GitHubRepoRequest):
    """Analyze a single GitHub repository's README for quality and clarity"""
    try:
        logger.info(f"📖 Starting GitHub repository analysis for: {request.repositoryUrl}")
        
        # Fetch README content
        readme_content = await fetch_github_readme(request.repositoryUrl)
        
        # Create prompt for LLM
        prompt = f"""
        You are an experienced open-source project maintainer and documentation expert. Analyze the following repository README for quality, clarity, and completeness.

        REPOSITORY URL: {request.repositoryUrl}
        
        README CONTENT:
        {readme_content}

        Please analyze the README and provide a response in the following JSON format:
        {{
            "purposeFeedback": "<feedback on how clearly the project purpose and goals are communicated>",
            "documentationQualityFeedback": "<feedback on documentation quality, completeness, and clarity>",
            "overallSuggestions": "<overall suggestions for improving the repository documentation>"
        }}

        Focus on:
        1. Project description and purpose clarity
        2. Installation and setup instructions
        3. Usage examples and documentation
        4. Contribution guidelines
        5. Code organization and structure explanation
        6. Professional presentation
        7. Missing essential sections
        8. Technical accuracy and completeness
        """
        
        # Get response from Gemini
        response_text = await call_gemini(prompt)
        response_data = extract_clean_json(response_text)
        response_data = ensure_all_keys(response_data, REQUIRED_KEYS_REPO)
        logger.info("✅ GitHub repository analysis completed successfully")
        return GitHubRepoResponse(**response_data)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in GitHub repository analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing your request")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/models")
async def list_available_models():
    """List available Gemini models"""
    try:
        models = genai.list_models()
        available_models = []
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                available_models.append({
                    "name": model.name,
                    "display_name": model.display_name,
                    "supported_methods": model.supported_generation_methods
                })
        return {"available_models": available_models}
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        return {"error": "Could not fetch available models", "detail": str(e)}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "CareerAI Toolkit API", "version": "1.0.0"}

if __name__ == "__main__":
    print("🚀 Starting server with uvicorn...")
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info",
        access_log=True
    )