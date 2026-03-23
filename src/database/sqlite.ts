import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

interface Message {
  userId: number;
  role: string;
  content: string;
  timestamp: string;
}

interface DB {
  messages: Message[];
  memory: Record<string, string>;
}

const dbPath = './memory.json';

function readDB(): DB {
  if (!fs.existsSync(dbPath)) {
    return { messages: [], memory: {} };
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDB(data: DB) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export const memory = {
  addMessage: (userId: number, role: string, content: string) => {
    const db = readDB();
    db.messages.push({
      userId,
      role,
      content,
      timestamp: new Date().toISOString()
    });
    writeDB(db);
  },
  getHistory: (userId: number, limit: number = 20) => {
    const db = readDB();
    return db.messages
      .filter(m => m.userId === userId)
      .slice(-limit);
  },
  set: (key: string, value: string) => {
    const db = readDB();
    db.memory[key] = value;
    writeDB(db);
  },
  get: (key: string) => {
    const db = readDB();
    return db.memory[key];
  }
};
