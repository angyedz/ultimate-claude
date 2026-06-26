import type { Command } from '../../commands.js'

const systemReset: Command = {
  type: 'local-jsx',
  name: 'system-reset',
  description: 'Restore any system prompt section or all prompts to default',
  argumentHint: '[all | section-name]',
  load: () => import('./system-reset.js'),
}

export default systemReset
