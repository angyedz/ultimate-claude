import type { Command } from '../../commands.js'

const system = {
  type: 'local-jsx',
  name: 'system',
  description: 'View, edit, or switch the system prompt',
  load: () => import('./system.js'),
} satisfies Command

export default system
