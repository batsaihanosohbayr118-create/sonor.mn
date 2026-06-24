// lib/ambassadorsStore.ts
import fs from 'fs';
import path from 'path';

export type AmbassadorRecord = {
  country: string;
  city: string;
  name: string;
  role: string;
  image?: string;
};

const DATA_FILE = path.join(process.cwd(), 'data', 'ambassadors.json');

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function readAmbassadors(): AmbassadorRecord[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as AmbassadorRecord[];
  } catch {
    return [];
  }
}

export function writeAmbassadors(ambassadors: AmbassadorRecord[]): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(ambassadors, null, 2), 'utf-8');
}