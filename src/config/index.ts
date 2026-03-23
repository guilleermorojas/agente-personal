import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    allowedIds: (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'openrouter/free',
  },
  database: {
    path: process.env.DB_PATH || './memory.db',
  }
};

if (!config.telegram.token) {
  console.warn('WARNING: TELEGRAM_BOT_TOKEN is not set in .env');
}
