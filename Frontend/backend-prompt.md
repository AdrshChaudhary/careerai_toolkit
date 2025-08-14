# Prompt for Building the CareerAI Toolkit Python Backend

Your task is to create a complete Python backend for the "CareerAI Toolkit" application using the FastAPI framework. This backend will provide several API endpoints that the Next.js frontend will call. Each endpoint will receive data (like a resume PDF or a job description), process it using a Large Language Model (LLM) like Google's Gemini, and return a structured JSON response with AI-generated feedback.

**You must adhere strictly to the defined API routes and JSON output schemas below.**

## Technology Stack

- **Framework**: Python 3.9+ with FastAPI.
- **LLM Integration**: Use the `google-generativeai` library to interact with the Gemini API.
- **Dependencies**:
  - `fastapi`: For building the API.
  - `uvicorn`: For serving the application.
  - `python-multipart`: For handling file uploads.
  - `pydantic`: For data validation and request/response models.
  - `PyMuPDF` (or a similar library): For extracting text from PDF files.
  - `google-generativeai`: For LLM interactions.

## General Instructions

1.  **CORS**: Enable CORS for all origins to allow the Next.js frontend (running on a different port) to communicate with the API.
2.  **Error Handling**: Implement robust error handling. If an analysis fails, return a proper HTTP status code (e.g., 500) with a JSON error message like `{"detail": "Error processing your request."}`.
3.  **LLM Prompts**: For each tool, you need to design a high-quality "system prompt" or context that instructs the LLM on its role (e.g., "You are an expert career coach and resume reviewer..."). The prompt should guide the LLM to generate feedback that is constructive, professional, and directly related to the user's input.
4.  **Input Processing**:
    -   PDF files will be sent from the frontend as part of a `multipart/form-data` request. You need to read the uploaded file, extract its text content, and use that text in your prompt to the LLM.
    -   Text inputs (like job descriptions or usernames) will be sent as plain strings in the request body.

---

## API Endpoint and Schema Definitions

### 1. Resume Analyzer (Job Description Based)

-   **Route**: `POST /api/resume-analyzer/job-description`
-   **Description**: Analyzes a user's resume against a specific job description.
-   **Request Format**: `multipart/form-data` containing:
    -   `resume`: The user's resume file (`UploadFile`).
    -   `jobDescription`: The text of the job description (`Form(str)`).
-   **LLM Prompt Guidance**: The LLM should act as an ATS (Applicant Tracking System) and a career coach. It needs to compare the resume text against the job description text, calculate a score based on the match, and provide feedback on how to improve the resume for this specific role.
-   **Strict Output JSON Schema**:

```json
{
  "score": "number",
  "summaryFeedback": "string",
  "skillsFeedback": "string",
  "experienceFeedback": "string",
  "educationFeedback": "string",
  "projectFeedback": "string",
  "jobRoleSuggestions": "string",
  "overallSuggestions": "string"
}
```

### 2. Resume Analyzer (Comprehensive)

-   **Route**: `POST /api/resume-analyzer/comprehensive`
-   **Description**: Provides a general analysis of a user's resume without a specific job description.
-   **Request Format**: `multipart/form-data` containing:
    -   `resume`: The user's resume file (`UploadFile`).
-   **LLM Prompt Guidance**: The LLM should act as a professional resume reviewer. It should analyze the resume for clarity, impact, and formatting. It should also suggest suitable job roles based on the content.
-   **Strict Output JSON Schema**:

```json
{
  "score": "number",
  "comprehensiveAnalysis": "string",
  "summaryFeedback": "string",
  "skillsFeedback": "string",
  "experienceFeedback": "string",
  "educationFeedback": "string",
  "projectFeedback": "string",
  "jobRoleSuggestions": "string",
  "overallSuggestions": "string"
}
```

### 3. LinkedIn Optimizer

-   **Route**: `POST /api/linkedin-optimizer`
-   **Description**: Analyzes a PDF export of a user's LinkedIn profile and provides optimization feedback.
-   **Request Format**: `multipart/form-data` containing:
    -   `profile`: The user's LinkedIn profile PDF file (`UploadFile`).
-   **LLM Prompt Guidance**: The LLM should act as a LinkedIn branding expert. It should review the profile text and suggest improvements for the headline, summary, experience descriptions, and skills to increase visibility and attract recruiters.
-   **Strict Output JSON Schema**:

```json
{
  "profileStrengthScore": "number",
  "headlineFeedback": "string",
  "summaryFeedback": "string",
  "experienceFeedback": "string",
  "skillsFeedback": "string",
  "activityFeedback": "string",
  "keywordSuggestions": "string",
  "overallSuggestions": "string"
}
```

### 4. GitHub Analyzer (Profile)

-   **Route**: `POST /api/github-analyzer/profile`
-   **Description**: Analyzes a GitHub user's profile to provide insights into their tech stack and code quality.
-   **Request Format**: JSON body containing:
    -   `githubUsername`: The user's GitHub username (`str`).
-   **LLM Prompt Guidance**: The LLM should act as a senior engineering manager reviewing a candidate's GitHub profile. You will need to use the GitHub API to fetch the user's repositories and then analyze the repository names, descriptions, and languages to infer the tech stack and potential code quality. **Do not analyze the actual code**.
-   **Strict Output JSON Schema**:

```json
{
  "techStack": "string",
  "codeQualityInsights": "string",
  "languageDistributionChart": "string",
  "repositoryCreationActivityChart": "string",
  "overallSuggestions": "string"
}
```
*Note*: For the chart data (`languageDistributionChart`, `repositoryCreationActivityChart`), generate a string formatted for [Mermaid.js](https://mermaid.js.org/syntax/pie.html) pie charts or gantt charts, as the frontend uses this library for rendering.

### 5. GitHub Analyzer (Repository)

-   **Route**: `POST /api/github-analyzer/repository`
-   **Description**: Analyzes a single GitHub repository's README for quality and clarity.
-   **Request Format**: JSON body containing:
    -   `repositoryUrl`: The full URL of the GitHub repository (`str`).
-   **LLM Prompt Guidance**: The LLM should act as an open-source project maintainer. It should review the repository's README file (which you must fetch using the GitHub API) for clarity, completeness, and documentation quality.
-   **Strict Output JSON Schema**:

```json
{
  "purposeFeedback": "string",
  "documentationQualityFeedback": "string",
  "overallSuggestions": "string"
}
```