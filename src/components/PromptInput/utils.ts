import {
  hasUsedBackslashReturn,
  isShiftEnterKeyBindingInstalled,
} from '../../commands/terminalSetup/terminalSetup.js'
import type { Key } from '../../ink.js'
import { getGlobalConfig } from '../../utils/config.js'
import { env } from '../../utils/env.js'
/**
 * Helper function to check if vim mode is currently enabled
 * @returns boolean indicating if vim mode is active
 */
export function isVimModeEnabled(): boolean {
  const config = getGlobalConfig()
  return config.editorMode === 'vim'
}

import { getInitialSettings } from '../../utils/settings/settings.js'

export function getNewlineInstructions(): string {
  const settings = getInitialSettings()
  const isRussian = settings?.language?.toLowerCase() === 'russian' || settings?.language?.toLowerCase() === 'ru'

  // Apple Terminal on macOS uses native modifier key detection for Shift+Enter
  if (env.terminal === 'Apple_Terminal' && process.platform === 'darwin') {
    return isRussian ? 'shift + ⏎ для новой строки' : 'shift + ⏎ for newline'
  }

  // For iTerm2 and VSCode, show Shift+Enter instructions if installed
  if (isShiftEnterKeyBindingInstalled()) {
    return isRussian ? 'shift + ⏎ для новой строки' : 'shift + ⏎ for newline'
  }

  // Otherwise show backslash+return instructions
  if (hasUsedBackslashReturn()) {
    return isRussian ? '\\⏎ для новой строки' : '\\⏎ for newline'
  }
  return isRussian
    ? 'обратный слэш (\\) + return (⏎) для новой строки'
    : 'backslash (\\) + return (⏎) for newline'
}

/**
 * True when the keystroke is a printable character that does not begin
 * with whitespace — i.e., a normal letter/digit/symbol the user typed.
 * Used to gate the lazy space inserted after an image pill.
 */
export function isNonSpacePrintable(input: string, key: Key): boolean {
  if (
    key.ctrl ||
    key.meta ||
    key.escape ||
    key.return ||
    key.tab ||
    key.backspace ||
    key.delete ||
    key.upArrow ||
    key.downArrow ||
    key.leftArrow ||
    key.rightArrow ||
    key.pageUp ||
    key.pageDown ||
    key.home ||
    key.end
  ) {
    return false
  }
  return input.length > 0 && !/^\s/.test(input) && !input.startsWith('\x1b')
}
