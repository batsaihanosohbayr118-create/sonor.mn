// lib/factsStore.ts
import fs from 'fs';
import path from 'path';

export interface Fact {
  id: number;
  claim: string;
  verdict: 'true' | 'false' | 'half';
  vlabel: string;
  exp: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'facts.json');

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function readFacts(): Fact[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Fact[];
  } catch {
    return [];
  }
}

export function writeFacts(facts: Fact[]): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(facts, null, 2), 'utf-8');
}