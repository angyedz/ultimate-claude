import {
  EFFORT_HIGH,
  EFFORT_LOW,
  EFFORT_MAX,
  EFFORT_MEDIUM,
} from '../constants/figures.js'
import {
  type EffortLevel,
  type EffortValue,
  getDisplayedEffortLevel,
  modelSupportsEffort,
} from '../utils/effort.js'

/**
 * Build the text for the effort-changed notification, e.g. "◐ medium · /effort".
 * Returns undefined if the model doesn't support effort.
 */
import { getInitialSettings } from '../utils/settings/settings.js'

export function getEffortNotificationText(
  effortValue: EffortValue | undefined,
  model: string,
): string | undefined {
  if (!modelSupportsEffort(model)) return undefined
  const level = getDisplayedEffortLevel(model, effortValue)

  const settings = getInitialSettings()
  const isRussian = settings?.language?.toLowerCase() === 'russian' || settings?.language?.toLowerCase() === 'ru'

  let displayLevel: string = level
  if (isRussian) {
    if (level === 'low') displayLevel = 'низкий'
    else if (level === 'medium') displayLevel = 'средний'
    else if (level === 'high') displayLevel = 'высокий'
    else if (level === 'xhigh') displayLevel = 'очень высокий'
  }

  return `${effortLevelToSymbol(level)} ${displayLevel} · /effort`
}

export function effortLevelToSymbol(level: EffortLevel): string {
  switch (level) {
    case 'low':
      return EFFORT_LOW
    case 'medium':
      return EFFORT_MEDIUM
    case 'high':
      return EFFORT_HIGH
    case 'xhigh':
      return EFFORT_HIGH
    case 'max':
      return EFFORT_MAX
    case 'ultracode':
      return '✦'
    default:
      // Defensive: level can originate from remote config. If an unknown
      // value slips through, render the high symbol rather than undefined.
      return EFFORT_HIGH
  }
}
