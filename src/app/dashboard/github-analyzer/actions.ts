'use server';

import { analyzeGithubProfile, AnalyzeGithubProfileOutput } from '@/ai/flows/analyze-github-profile';
import { analyzeGithubRepository, AnalyzeGithubRepositoryOutput } from '@/ai/flows/analyze-github-repository';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function callAnalyzeProfile(username: string, uid: string): Promise<AnalyzeGithubProfileOutput> {
  const result = await analyzeGithubProfile({ githubUsername: username });
  await addDoc(collection(db, 'users', uid, 'analysisHistory'), {
    type: 'githubProfile',
    input: { username },
    output: result,
    createdAt: serverTimestamp(),
  });
  return result;
}

export async function callAnalyzeRepo(url: string, uid: string): Promise<AnalyzeGithubRepositoryOutput> {
  const result = await analyzeGithubRepository({ repositoryUrl: url });
  await addDoc(collection(db, 'users', uid, 'analysisHistory'), {
    type: 'githubRepo',
    input: { url },
    output: result,
    createdAt: serverTimestamp(),
  });
  return result;
}
