import Groq from 'groq-sdk';
import { config } from '../config/index.js';

const groq = new Groq({ apiKey: config.groq.apiKey || 'dummy' });

export async function chatCompletion(messages: any[]) {
  try {
    const response = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile', // updated model name
    });
    return response.choices[0].message;
  } catch (error) {
    console.error('Groq Error:', error);
    
    // Fallback logic
    const fallbackModels = [
      { provider: 'openrouter', model: config.openrouter.model || 'anthropic/claude-3.5-sonnet' },
      { provider: 'openrouter', model: 'openrouter/free' } // Last resort
    ];

    for (const fallback of fallbackModels) {
      if (config.openrouter.apiKey) {
        console.log(`Fallback: Trying ${fallback.model} via OpenRouter...`);
        try {
          const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.openrouter.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: fallback.model,
              messages,
            }),
          });
          const data = await orResponse.json();
          if (data.choices?.[0]?.message) {
            return data.choices[0].message;
          }
        } catch (e) {
          console.error(`Fallback failed for ${fallback.model}:`, e);
        }
      }
    }
    throw error;
  }
}
