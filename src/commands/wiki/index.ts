import type { Command } from '../../commands.js'

const wiki = {
  type: 'local-jsx',
  name: 'wiki',
  description: 'Initialize and inspect the Claude Code project wiki',
  argumentHint: '[init|status|scan|ingest <path>]',
  immediate: true,
  load: () => import('./wiki.js'),
} satisfies Command

export default wiki
