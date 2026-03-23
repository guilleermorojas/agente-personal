import { Client } from '@notionhq/client';
import { config } from '../config/index.js';

const notion = new Client({
  auth: process.env.NOTION_TOKEN || 'dummy',
});

export const notionTools = {
  add_notion_page: {
    name: 'add_notion_page',
    description: 'Adds a new page (note) to a Notion database. Parameters: title (string), content (string)',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' }
      }
    },
    execute: async ({ title, content }: any) => {
      const databaseId = process.env.NOTION_DATABASE_ID;
      if (!databaseId) return 'Error: NOTION_DATABASE_ID no configurado.';

      try {
        const response = await notion.pages.create({
          parent: { database_id: databaseId },
          properties: {
            title: {
              title: [
                {
                  text: { content: title },
                },
              ],
            },
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content: content },
                  },
                ],
              },
            },
          ],
        });
        return `Página creada en Notion: ${(response as any).url}`;
      } catch (error) {
        console.error('Notion Error:', error);
        return 'Error al crear la página en Notion.';
      }
    }
  },
  search_notion: {
    name: 'search_notion',
    description: 'Searches for pages or databases in Notion by query string. Parameters: query (string)',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      }
    },
    execute: async ({ query }: any) => {
      try {
        const response = await notion.search({
          query,
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time',
          },
        });
        const results = response.results.map((r: any) => `- ${r.properties?.title?.title?.[0]?.plain_text || 'Sin título'} (${r.url})`).join('\n');
        return results || 'No se encontraron resultados.';
      } catch (error) {
        console.error('Notion Search Error:', error);
        return 'Error al buscar en Notion.';
      }
    }
  }
};
