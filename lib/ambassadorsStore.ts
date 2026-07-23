// lib/ambassadorsStore.ts
import { readCollection, writeCollection } from '@/lib/db';

export type AmbassadorRecord = {
  country: string;
  city: string;
  name: string;
  role: string;
  image?: string;
};

const COLLECTION = 'ambassadors';

export function readAmbassadors(): Promise<AmbassadorRecord[]> {
  return readCollection<AmbassadorRecord>(COLLECTION);
}

export function writeAmbassadors(ambassadors: AmbassadorRecord[]): Promise<void> {
  return writeCollection(COLLECTION, ambassadors);
}
