'use server';

import { optimizeLinkedInProfile, OptimizeLinkedInProfileOutput } from '@/ai/flows/optimize-linkedin-profile';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function callOptimizeLinkedInProfile(
  profileDataUri: string,
  uid: string
): Promise<OptimizeLinkedInProfileOutput | { error: string }> {
  try {
    const result = await optimizeLinkedInProfile({ profileDataUri });
    
    await addDoc(collection(db, 'users', uid, 'analysisHistory'), {
      type: 'linkedin',
      output: result,
      createdAt: serverTimestamp(),
    });

    return result;
  } catch (error: any) {
    console.error('Error optimizing LinkedIn profile:', error);
    return { error: error.message || 'An unexpected error occurred while optimizing the LinkedIn profile. This could be due to API rate limits or an issue with the service. Please try again later.' };
  }
}
