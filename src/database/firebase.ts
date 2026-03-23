import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!getApps().length) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined
  });
}

const db = getFirestore();

export const memory = {
  addMessage: async (userId: number, role: string, content: string) => {
    const userDoc = db.collection('users').doc(String(userId));
    const userData = await userDoc.get();
    const messages = userData.exists ? (userData.data()?.messages || []) : [];
    messages.push({
      userId,
      role,
      content,
      timestamp: new Date().toISOString()
    });
    await userDoc.set({ messages });
  },
  getHistory: async (userId: number, limit: number = 20) => {
    const userDoc = db.collection('users').doc(String(userId));
    const userData = await userDoc.get();
    if (!userData.exists) return [];
    const messages = userData.data()?.messages || [];
    return messages.slice(-limit);
  },
  set: async (key: string, value: string) => {
    const memDoc = db.collection('memory').doc('data');
    const memData = await memDoc.get();
    const memory = memData.exists ? (memData.data() || {}) : {};
    memory[key] = value;
    await memDoc.set(memory);
  },
  get: async (key: string) => {
    const memDoc = db.collection('memory').doc('data');
    const memData = await memDoc.get();
    if (!memData.exists) return undefined;
    const memory = memData.data() || {};
    return memory[key];
  }
};
