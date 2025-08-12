'use server';

import { analyzeResume, AnalyzeResumeOutput } from '@/ai/flows/analyze-resume';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function callAnalyzeResume(
  values: { resumeText: string; jobDescription?: string },
  uid: string
): Promise<AnalyzeResumeOutput | { error: string }> {
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
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    return { error: error.message || 'An unexpected error occurred while analyzing the resume. This could be due to API rate limits or an issue with the service. Please try again later.' };
  }
}
