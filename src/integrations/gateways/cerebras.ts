import { defineGateway } from '../define.js'

export default defineGateway({
  id: 'cerebras',
  label: 'Cerebras',
  category: 'aggregating',
  defaultBaseUrl: 'https://api.cerebras.ai/v1',
  defaultModel: 'llama-4-scout-17b-16e-instruct',
  supportsModelRouting: true,
  setup: {
    requiresAuth: true,
    authMode: 'api-key',
    credentialEnvVars: ['CEREBRAS_API_KEY'],
  },
  transportConfig: {
    kind: 'openai-compatible',
    openaiShim: {
      supportsAuthHeaders: true,
      removeBodyFields: ['store', 'reasoning_effort'],
    },
  },
  preset: {
    id: 'cerebras',
    description: 'Cerebras AI OpenAI-compatible endpoint (fast inference)',
    apiKeyEnvVars: ['CEREBRAS_API_KEY'],
    vendorId: 'openai',
  },
  catalog: {
    source: 'static',
    models: [
      { id: 'cerebras-llama-4-scout', apiName: 'llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B' },
      { id: 'cerebras-llama-3.3-70b', apiName: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
      { id: 'cerebras-llama3.1-8b', apiName: 'llama3.1-8b', label: 'Llama 3.1 8B' },
      { id: 'cerebras-qwen-3-32b', apiName: 'qwen-3-32b', label: 'Qwen 3 32B' },
    ],
  },
  usage: { supported: false },
})
