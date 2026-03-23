import { chatCompletion } from './llm.js';
import { tools } from '../tools/index.js';

const SYSTEM_PROMPT = `
You are OpenGravity, a personal AI agent. 
You can use tools to help the user.

Available Tools:
- get_current_time: Returns the current date and time.
- list_emails: Lists the last 5 emails from Gmail.
- create_calendar_event: Creates a new event in Google Calendar (args: summary, start_time, end_time).
- add_notion_page: Adds a new page (note) to a Notion database (args: title, content).
- search_notion: Searches for pages or databases in Notion (args: query).
- trigger_n8n_workflow: Triggers a manually activated n8n workflow by ID (args: workflowId, data).
- call_n8n_webhook: Sends a POST request to an n8n webhook URL (args: webhookPath, data).

If you need to use a tool, respond ONLY with:
TOOL: <tool_name> ARGS: <json_args>

Current date/time: ${new Date().toLocaleString()}
`;

export async function runAgent(userId: number, message: string, history: any[] = []) {
  let iterations = 0;
  const maxIterations = 5;
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  while (iterations < maxIterations) {
    const response = await chatCompletion(messages);
    if (!response) break;

    const content = response.content || '';
    messages.push({ role: 'assistant', content });

    // Simple Tool Parsing
    if (content.includes('TOOL:')) {
      const toolMatch = content.match(/TOOL:\s*(\w+)\s*ARGS:\s*(\{.*\})/);
      if (toolMatch) {
        const toolName = toolMatch[1];
        const argsStr = toolMatch[2];
        const tool = tools[toolName];

        if (tool) {
          try {
            const args = JSON.parse(argsStr);
            const result = await tool.execute(args);
            messages.push({ role: 'user', content: `TOOL RESULT (${toolName}): ${result}` });
            iterations++;
            continue;
          } catch (e) {
            messages.push({ role: 'user', content: `TOOL ERROR: ${e}` });
          }
        }
      }
    }

    return content;
  }

  return "Perdona, me he liado con los pensamientos. ¿En qué más puedo ayudarte?";
}
