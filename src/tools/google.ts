import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

const TOKEN_PATH = path.join(process.cwd(), 'data/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'client_secret.json');

export async function getGoogleAuth() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('Falta el archivo client_secret.json en el root del proyecto.');
  }

  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, 'utf8');
    oAuth2Client.setCredentials(JSON.parse(token));
  }

  return oAuth2Client;
}

export const googleTools = {
  list_emails: {
    name: 'list_emails',
    description: 'Lists the last 5 emails from Gmail.',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const auth = await getGoogleAuth();
      const gmail = google.gmail({ version: 'v1', auth });
      const res = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
      const messages = res.data.messages || [];
      
      let result = 'Últimos correos:\n';
      for (const msg of messages) {
        const details = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
        const subject = details.data.payload?.headers?.find(h => h.name === 'Subject')?.value || 'Sin asunto';
        result += `- ${subject}\n`;
      }
      return result;
    }
  },
  create_calendar_event: {
    name: 'create_calendar_event',
    description: 'Creates a new event in Google Calendar. Parameters: summary, start_time (ISO string), end_time (ISO string)',
    parameters: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        start_time: { type: 'string' },
        end_time: { type: 'string' }
      }
    },
    execute: async ({ summary, start_time, end_time }: any) => {
      const auth = await getGoogleAuth();
      const calendar = google.calendar({ version: 'v3', auth });
      const event = {
        summary,
        start: { dateTime: start_time },
        end: { dateTime: end_time },
      };
      const res = await calendar.events.insert({ calendarId: 'primary', requestBody: event });
      return `Evento creado: ${res.data.htmlLink}`;
    }
  }
};
