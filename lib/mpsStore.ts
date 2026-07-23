// lib/mpsStore.ts
import { readCollection, writeCollection } from '@/lib/db';
import { MP } from '@/data/newsData';

const COLLECTION = 'mps';

export function readMps(): Promise<MP[]> {
  return readCollection<MP>(COLLECTION);
}

export function writeMps(mps: MP[]): Promise<void> {
  return writeCollection(COLLECTION, mps);
}
