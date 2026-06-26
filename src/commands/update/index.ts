import type { Command } from '../../types/command.js'

const update = {
  type: 'local-jsx',
  name: 'update',
  description: 'Update Claude Code to the latest version',
  load: () => import('./update.js'),
} satisfies Command

export default update
