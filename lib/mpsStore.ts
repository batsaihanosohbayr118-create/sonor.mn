// lib/mpsStore.ts
import fs from 'fs';
import path from 'path';
import { MP } from '@/data/newsData';

const DATA_FILE = path.join(process.cwd(), 'data', 'mps.json');

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function readMps(): MP[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as MP[];
  } catch {
    return [];
  }
}

export function writeMps(mps: MP[]): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(mps, null, 2), 'utf-8');
}