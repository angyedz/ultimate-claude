import { c as _c } from "react-compiler-runtime";
import React from 'react';
import Text from '../../ink/components/Text.js';
type Props = {
  /** The key or chord to display (e.g., "ctrl+o", "Enter", "↑/↓") */
  shortcut: string;
  /** The action the key performs (e.g., "expand", "select", "navigate") */
  action: string;
  /** Whether to wrap the hint in parentheses. Default: false */
  parens?: boolean;
  /** Whether to render the shortcut in bold. Default: false */
  bold?: boolean;
};

/**
 * Renders a keyboard shortcut hint like "ctrl+o to expand" or "(tab to toggle)"
 *
 * Wrap in <Text dimColor> for the common dim styling.
 *
 * @example
 * // Simple hint wrapped in dim Text
 * <Text dimColor><KeyboardShortcutHint shortcut="esc" action="cancel" /></Text>
 *
 * // With parentheses: "(ctrl+o to expand)"
 * <Text dimColor><KeyboardShortcutHint shortcut="ctrl+o" action="expand" parens /></Text>
 *
 * // With bold shortcut: "Enter to confirm" (Enter is bold)
 * <Text dimColor><KeyboardShortcutHint shortcut="Enter" action="confirm" bold /></Text>
 *
 * // Multiple hints with middot separator - use Byline
 * <Text dimColor>
 *   <Byline>
 *     <KeyboardShortcutHint shortcut="Enter" action="confirm" />
 *     <KeyboardShortcutHint shortcut="Esc" action="cancel" />
 *   </Byline>
 * </Text>
 */
import { getInitialSettings } from '../../utils/settings/settings.js';
import { localize } from '../../i18n/index.js';

export function KeyboardShortcutHint(t0) {
  const {
    shortcut,
    action,
    parens: t1,
    bold: t2
  } = t0;
  const parens = t1 === undefined ? false : t1;
  const bold = t2 === undefined ? false : t2;

  const shortcutText = bold ? <Text bold={true}>{shortcut}</Text> : shortcut;

  const settings = getInitialSettings();
  const lang = settings?.language?.toLowerCase();
  const isRussian = lang === 'russian' || lang === 'ru';

  const localizedAction = localize(`shortcut.action.${action}`, action);

  if (parens) {
    return isRussian
      ? <Text>({shortcutText} — {localizedAction})</Text>
      : <Text>({shortcutText} to {localizedAction})</Text>;
  }
  return isRussian
    ? <Text>{shortcutText} — {localizedAction}</Text>
    : <Text>{shortcutText} to {localizedAction}</Text>;
}
