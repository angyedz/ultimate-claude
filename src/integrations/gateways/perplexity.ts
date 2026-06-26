import { defineGateway } from '../define.js'

export default defineGateway({
  id: 'perplexity',
  label: 'Perplexity',
  category: 'aggregating',
  defaultBaseUrl: 'https://api.perplexity.ai',
  defaultModel: 'sonar-pro',
  supportsModelRouting: true,
  setup: {
    requiresAuth: true,
    authMode: 'api-key',
    credentialEnvVars: ['PERPLEXITY_API_KEY'],
  },
  transportConfig: {
    kind: 'openai-compatible',
    openaiShim: {
      supportsAuthHeaders: true,
      removeBodyFields: ['store', 'reasoning_effort'],
    },
  },
  preset: {
    id: 'perplexity',
    description: 'Perplexity AI OpenAI-compatible endpoint',
    apiKeyEnvVars: ['PERPLEXITY_API_KEY'],
    vendorId: 'openai',
  },
  catalog: {
    source: 'static',
    models: [
      { id: 'perplexity-sonar-pro', apiName: 'sonar-pro', label: 'Sonar Pro' },
      { id: 'perplexity-sonar', apiName: 'sonar', label: 'Sonar' },
      { id: 'perplexity-sonar-reasoning-pro', apiName: 'sonar-reasoning-pro', label: 'Sonar Reasoning Pro' },
      { id: 'perplexity-sonar-reasoning', apiName: 'sonar-reasoning', label: 'Sonar Reasoning' },
      { id: 'perplexity-r1-1776', apiName: 'r1-1776', label: 'R1 1776' },
    ],
  },
  usage: { supported: false },
})
