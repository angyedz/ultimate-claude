import type { Command } from '../../commands.js'

const language = {
  type: 'local-jsx',
  name: 'language',
  description: 'Change the preferred interface and response language (English / Русский)',
  isHidden: false,
  load: () => import('./language.js'),
} satisfies Command

export default language
