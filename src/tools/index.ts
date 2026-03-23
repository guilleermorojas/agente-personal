export interface Tool {
  name: string;
  description: string;
  parameters: object;
  execute: (...args: any[]) => Promise<string>;
}

import { googleTools } from './google.js';
import { notionTools } from './notion.js';
import { n8nTools } from './n8n.js';

export const tools: Record<string, Tool> = {
  get_current_time: {
    name: 'get_current_time',
    description: 'Returns the current local time.',
    parameters: {
      type: 'object',
      properties: {}
    },
    execute: async () => {
      return new Date().toLocaleString();
    }
  },
  ...googleTools,
  ...notionTools,
  ...n8nTools
};
