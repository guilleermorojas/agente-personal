import axios from 'axios';
import { config } from '../config/index.js';

export const n8nTools = {
  trigger_n8n_workflow: {
    name: 'trigger_n8n_workflow',
    description: 'Triggers a manually activated n8n workflow by ID. Parameters: workflowId (string), data (object)',
    parameters: {
      type: 'object',
      properties: {
        workflowId: { type: 'string' },
        data: { type: 'object' }
      }
    },
    execute: async ({ workflowId, data }: any) => {
      const apiKey = process.env.N8N_API_KEY;
      const baseUrl = process.env.N8N_URL;
      
      if (!apiKey || !baseUrl) return 'Error: n8n API Key o URL no configurados.';

      try {
        const response = await axios.post(`${baseUrl}/api/v1/workflows/${workflowId}/run`, data, {
          headers: {
            'X-N8N-API-KEY': apiKey,
            'Content-Type': 'application/json'
          }
        });
        return `Workflow ejecutado con éxito. ID de ejecución: ${response.data.executionId}`;
      } catch (error: any) {
        console.error('n8n error:', error.response?.data || error.message);
        return 'Error al ejecutar el workflow en n8n.';
      }
    }
  },
  call_n8n_webhook: {
    name: 'call_n8n_webhook',
    description: 'Sends a POST request to an n8n webhook URL. Parameters: webhookPath (string), data (object)',
    parameters: {
      type: 'object',
      properties: {
        webhookPath: { type: 'string' },
        data: { type: 'object' }
      }
    },
    execute: async ({ webhookPath, data }: any) => {
      const baseUrl = process.env.N8N_URL;
      if (!baseUrl) return 'Error: n8n URL no configurado.';

      const url = webhookPath.startsWith('http') ? webhookPath : `${baseUrl}/webhook/${webhookPath}`;

      try {
        const response = await axios.post(url, data);
        return `Webhook de n8n llamado con éxito. Respuesta: ${JSON.stringify(response.data)}`;
      } catch (error: any) {
        console.error('n8n webhook error:', error.response?.data || error.message);
        return 'Error al llamar al webhook de n8n.';
      }
    }
  }
};
