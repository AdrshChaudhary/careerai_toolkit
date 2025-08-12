'use server';

import { analyzeGithubProfile, AnalyzeGithubProfileOutput } from '@/ai/flows/analyze-github-profile';
import { analyzeGithubRepository, AnalyzeGithubRepositoryOutput } from '@/ai/flows/analyze-github-repository';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function callAnalyzeProfile(username: string, uid: string): Promise<AnalyzeGithubProfileOutput | { error: string }> {
  try {
    const result = await analyzeGithubProfile({ githubUsername: username });
    await addDoc(collection(db, 'users', uid, 'analysisHistory'), {
      type: 'githubProfile',
      input: { username },
      output: result,
      createdAt: serverTimestamp(),
    });
    return result;
  } catch (error: any) {
    console.error('Error analyzing GitHub profile:', error);
    return { error: error.message || 'An unexpected error occurred while analyzing the GitHub profile. This could be due to API rate limits or an issue with the service. Please try again later.' };
  }
}

export async function callAnalyzeRepo(url: string, uid: string): Promise<AnalyzeGithubRepositoryOutput | { error: string }> {
  try {
    const result = await analyzeGithubRepository({ repositoryUrl: url });
    await addDoc(collection(db, 'users', uid, 'analysisHistory'), {
      type: 'githubRepo',
      input: { url },
      output: result,
      createdAt: serverTimestamp(),
    });
    return result;
  } catch (error: any) {
    console.error('Error analyzing GitHub repository:', error);
    return { error: error.message || 'An unexpected error occurred while analyzing the GitHub repository. This could be due to API rate limits or an issue with the service. Please try again later.'};
  }
}
