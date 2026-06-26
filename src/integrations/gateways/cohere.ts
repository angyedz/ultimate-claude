import { defineGateway } from '../define.js'

export default defineGateway({
  id: 'cohere',
  label: 'Cohere',
  category: 'aggregating',
  defaultBaseUrl: 'https://api.cohere.com/compatibility/v1',
  defaultModel: 'command-a-03-2025',
  supportsModelRouting: true,
  setup: {
    requiresAuth: true,
    authMode: 'api-key',
    credentialEnvVars: ['CO_API_KEY', 'COHERE_API_KEY'],
  },
  transportConfig: {
    kind: 'openai-compatible',
    openaiShim: {
      supportsAuthHeaders: true,
      removeBodyFields: ['store', 'reasoning_effort'],
    },
  },
  preset: {
    id: 'cohere',
    description: 'Cohere Command OpenAI-compatible endpoint',
    apiKeyEnvVars: ['CO_API_KEY', 'COHERE_API_KEY'],
    vendorId: 'openai',
  },
  catalog: {
    source: 'static',
    models: [
      { id: 'cohere-command-a', apiName: 'command-a-03-2025', label: 'Command A' },
      { id: 'cohere-command-r-plus', apiName: 'command-r-plus', label: 'Command R+' },
      { id: 'cohere-command-r', apiName: 'command-r', label: 'Command R' },
    ],
  },
  usage: { supported: false },
})
