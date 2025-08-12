'use server';

import { analyzeResume, AnalyzeResumeOutput } from '@/ai/flows/analyze-resume';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function callAnalyzeResume(
  values: { resumeText: string; jobDescription?: string },
  uid: string
): Promise<AnalyzeResumeOutput> {
  try {
    const result = await analyzeResume({
      resumeText: values.resumeText,
      jobDescription: values.jobDescription,
    });
    
    await addDoc(collection(db, 'users', uid, 'analysisHistory'), {
      type: 'resume',
      input: {
        jobDescription: !!values.jobDescription,
      },
      output: result,
      createdAt: serverTimestamp(),
    });

    return result;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('An unexpected error occurred while analyzing the resume. This could be due to API rate limits or an issue with the service. Please try again later.');
  }
}
