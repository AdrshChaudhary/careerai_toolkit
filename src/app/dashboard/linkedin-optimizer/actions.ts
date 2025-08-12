'use server';

import { optimizeLinkedInProfile, OptimizeLinkedInProfileOutput } from '@/ai/flows/optimize-linkedin-profile';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function callOptimizeLinkedInProfile(
  profileDataUri: string,
  uid: string
): Promise<OptimizeLinkedInProfileOutput> {
  try {
    const result = await optimizeLinkedInProfile({ profileDataUri });
    
    await addDoc(collection(db, 'users', uid, 'analysisHistory'), {
      type: 'linkedin',
      output: result,
      createdAt: serverTimestamp(),
    });

    return result;
  } catch (error) {
    console.error('Error optimizing LinkedIn profile:', error);
    throw new Error('Failed to optimize LinkedIn profile. Please try again.');
  }
}
