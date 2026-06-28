import type { Command } from '../../commands.js'

const claudeReset = {
  type: 'local-jsx',
  name: 'claude-reset',
  description: 'Complete reset of settings and session data',
  immediate: true,
  load: () => import('./claude-reset.js'),
} satisfies Command

export default claudeReset
