import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: config.groq.apiKey || 'dummy' });

export async function transcribeAudio(fileUrl: string) {
  try {
    // Download the file
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const filePath = path.join(process.cwd(), 'temp_voice.ogg');
    fs.writeFileSync(filePath, Buffer.from(response.data));

    // Transcribe using Groq (Whisper)
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
    });

    // Clean up
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return transcription.text;
  } catch (error) {
    console.error('Transcription Error:', error);
    throw new Error('No he podido transcribir el audio.');
  }
}
