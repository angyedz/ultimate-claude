/**
 * Utility to auto-fetch and refresh updates.json from the GitHub repo on startup.
 * Fetches silently in the background; on failure, local file is preserved.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const UPDATES_JSON_URL =
  'https://raw.githubusercontent.com/Gitlawb/ultimate-claude/main/updates.json'

const UPDATES_JSON_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'updates.json',
)

/** Fetch updates.json from GitHub and overwrite local copy if successful. */
export async function refreshUpdatesJson(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(UPDATES_JSON_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ultimate-claude-updater' },
    })
    clearTimeout(timeout)

    if (!res.ok) return false

    const text = await res.text()

    // Validate it's valid JSON before overwriting
    JSON.parse(text)

    writeFileSync(UPDATES_JSON_PATH, text, 'utf-8')
    return true
  } catch {
    // Network unavailable or timeout — keep local file, return false silently
    return false
  }
}

/** Read updates.json from disk (local copy, possibly freshly fetched). */
export function readLocalUpdatesJson(): Record<
  string,
  { en: string[]; ru: string[] } | string[]
> {
  try {
    if (!existsSync(UPDATES_JSON_PATH)) return {}
    const content = readFileSync(UPDATES_JSON_PATH, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}
