// lib/factsStore.ts
import { readCollection, writeCollection } from '@/lib/db';

export interface Fact {
  id: number;
  claim: string;
  verdict: 'true' | 'false' | 'half';
  vlabel: string;
  exp: string;
}

const COLLECTION = 'facts';

export function readFacts(): Promise<Fact[]> {
  return readCollection<Fact>(COLLECTION);
}

export function writeFacts(facts: Fact[]): Promise<void> {
  return writeCollection(COLLECTION, facts);
}
