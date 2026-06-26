import { getIsRemoteMode } from '../../bootstrap/state.js'
import type { Command } from '../../commands.js'

const session = {
  type: 'local-jsx',
  name: 'session',
  aliases: ['remote'],
  description: 'Manage active and past sessions',
  immediate: true,
  load: () => import('./session.js'),
} satisfies Command

export default session
