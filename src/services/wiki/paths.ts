import { join } from 'path'
import type { WikiPaths } from './types.js'

export const ULTIMATE_CLAUDE_DIRNAME = '.ultimate-claude'
export const WIKI_DIRNAME = 'wiki'

export function getWikiPaths(cwd: string): WikiPaths {
  const root = join(cwd, ULTIMATE_CLAUDE_DIRNAME, WIKI_DIRNAME)

  return {
    root,
    pagesDir: join(root, 'pages'),
    sourcesDir: join(root, 'sources'),
    schemaFile: join(root, 'schema.md'),
    indexFile: join(root, 'index.md'),
    logFile: join(root, 'log.md'),
    conventionsFile: join(root, 'pages', 'conventions.md'),
    conventionsCacheFile: join(cwd, ULTIMATE_CLAUDE_DIRNAME, '.conventions-cache.json'),
  }
}
