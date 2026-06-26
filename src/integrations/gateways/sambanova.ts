import { defineGateway } from '../define.js'

export default defineGateway({
  id: 'sambanova',
  label: 'SambaNova',
  category: 'aggregating',
  defaultBaseUrl: 'https://api.sambanova.ai/v1',
  defaultModel: 'Meta-Llama-3.3-70B-Instruct',
  supportsModelRouting: true,
  setup: {
    requiresAuth: true,
    authMode: 'api-key',
    credentialEnvVars: ['SAMBANOVA_API_KEY'],
  },
  transportConfig: {
    kind: 'openai-compatible',
    openaiShim: {
      supportsAuthHeaders: true,
      removeBodyFields: ['store', 'reasoning_effort'],
    },
  },
  preset: {
    id: 'sambanova',
    description: 'SambaNova AI OpenAI-compatible endpoint',
    apiKeyEnvVars: ['SAMBANOVA_API_KEY'],
    vendorId: 'openai',
  },
  catalog: {
    source: 'static',
    models: [
      { id: 'sambanova-llama-3.3-70b', apiName: 'Meta-Llama-3.3-70B-Instruct', label: 'Llama 3.3 70B Instruct' },
      { id: 'sambanova-llama-3.1-405b', apiName: 'Meta-Llama-3.1-405B-Instruct', label: 'Llama 3.1 405B Instruct' },
      { id: 'sambanova-deepseek-r1', apiName: 'DeepSeek-R1', label: 'DeepSeek R1' },
      { id: 'sambanova-qwen3-32b', apiName: 'Qwen3-32B', label: 'Qwen3 32B' },
    ],
  },
  usage: { supported: false },
})
