import { Bot } from 'grammy';
import { config } from '../config/index.js';
import { memory } from '../database/sqlite.js';
import { runAgent } from '../agent/loop.js';
import { transcribeAudio } from '../agent/transcription.js';

console.log('Config:', {
  telegramToken: config.telegram.token ? 'OK' : 'MISSING',
  allowedIds: config.telegram.allowedIds,
  groqKey: config.groq.apiKey ? 'OK' : 'MISSING'
});

export const bot = new Bot(config.telegram.token);

// Middleware to check whitelist
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;
  console.log('Message from user:', userId, '| Allowed:', config.telegram.allowedIds);
  if (!userId || !config.telegram.allowedIds.includes(userId)) {
    console.warn(`Unauthorized access attempt from ID: ${userId}`);
    return;
  }
  await next();
});

bot.command('start', (ctx) => {
  ctx.reply('¡Hola! Soy OpenGravity, tu agente personal. ¿En qué puedo ayudarte hoy?');
});

bot.on('message:text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  console.log('Received text:', text);

  try {
    await ctx.replyWithChatAction('typing');
    const history = memory.getHistory(userId);
    memory.addMessage(userId, 'user', text);
    const response = await runAgent(userId, text, history);
    memory.addMessage(userId, 'assistant', response);
    await ctx.reply(response);
  } catch (error) {
    console.error('Bot Error:', error);
    await ctx.reply('Lo siento, ha ocurrido un error al procesar tu mensaje.');
  }
});

bot.on('message:voice', async (ctx) => {
  const userId = ctx.from.id;
  
  // Show "typing" status
  await ctx.replyWithChatAction('typing');

  try {
    // Get file info from Telegram
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${config.telegram.token}/${file.file_path}`;

    // Transcribe
    await ctx.reply('🎤 Transcribiendo audio...');
    const transcript = await transcribeAudio(fileUrl);
    
    // Process as text message
    memory.addMessage(userId, 'user', `[Nota de voz]: ${transcript}`);
    
    const history = memory.getHistory(userId);
    const response = await runAgent(userId, transcript, history);

    memory.addMessage(userId, 'assistant', response);
    await ctx.reply(response);

  } catch (error) {
    console.error('Voice handling error:', error);
    await ctx.reply('No he podido procesar tu nota de voz.');
  }
});

export function startBot() {
  bot.start({
    onStart: (botInfo) => {
      console.log(`Bot @${botInfo.username} is running...`);
    },
  });
}
