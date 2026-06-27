import { feature } from 'bun:bundle';
import * as React from 'react';
import { Box, Text } from 'src/ink.js';
import { getPlatform } from 'src/utils/platform.js';
import { isKeybindingCustomizationEnabled } from '../../keybindings/loadUserBindings.js';
import { useShortcutDisplay } from '../../keybindings/useShortcutDisplay.js';
import { getFeatureValue_CACHED_MAY_BE_STALE } from '../../services/analytics/growthbook.js';
import { isFastModeAvailable, isFastModeEnabled } from '../../utils/fastMode.js';
import { getNewlineInstructions } from './utils.js';
import { localize } from '../../i18n/index.js';

function formatShortcut(shortcut: string): string {
  return shortcut.replace(/\+/g, ' + ');
}

type Props = {
  dimColor?: boolean;
  fixedWidth?: boolean;
  gap?: number;
  paddingX?: number;
};

export function PromptInputHelpMenu({
  dimColor,
  fixedWidth,
  gap,
  paddingX,
}: Props) {
  const transcriptShortcut = formatShortcut(useShortcutDisplay("app:toggleTranscript", "Global", "ctrl+o"));
  const todosShortcut = formatShortcut(useShortcutDisplay("app:toggleTodos", "Global", "ctrl+t"));
  const undoShortcut = formatShortcut(useShortcutDisplay("chat:undo", "Chat", "ctrl+_"));
  const stashShortcut = formatShortcut(useShortcutDisplay("chat:stash", "Chat", "ctrl+s"));
  const cycleModeShortcut = formatShortcut(useShortcutDisplay("chat:cycleMode", "Chat", "shift+tab"));
  const modelPickerShortcut = formatShortcut(useShortcutDisplay("chat:modelPicker", "Chat", "alt+p"));
  const fastModeShortcut = formatShortcut(useShortcutDisplay("chat:fastMode", "Chat", "alt+o"));
  const externalEditorShortcut = formatShortcut(useShortcutDisplay("chat:externalEditor", "Chat", "ctrl+g"));
  const terminalShortcut = formatShortcut(useShortcutDisplay("app:toggleTerminal", "Global", "meta+j"));
  const imagePasteShortcut = formatShortcut(useShortcutDisplay("chat:imagePaste", "Chat", "ctrl+v"));

  const terminalShortcutElement = feature("TERMINAL_PANEL") && getFeatureValue_CACHED_MAY_BE_STALE("tengu_terminal_panel", false) ? (
    <Box>
      <Text dimColor={dimColor}>
        {terminalShortcut} {localize('help.terminal', 'for terminal')}
      </Text>
    </Box>
  ) : null;

  const leftWidth = fixedWidth ? 24 : undefined;
  const middleWidth = fixedWidth ? 35 : undefined;

  const newlineText = getNewlineInstructions();

  return (
    <Box paddingX={paddingX} flexDirection="row" gap={gap}>
      {/* Левая колонка */}
      <Box flexDirection="column" width={leftWidth}>
        <Box>
          <Text dimColor={dimColor}>
            {localize('help.bash_mode', '! for bash mode')}
          </Text>
        </Box>
        <Box>
          <Text dimColor={dimColor}>
            {localize('help.commands', '/ for commands')}
          </Text>
        </Box>
        <Box>
          <Text dimColor={dimColor}>
            {localize('help.file_paths', '@ for file paths')}
          </Text>
        </Box>
        <Box>
          <Text dimColor={dimColor}>
            {localize('help.background', '& for background')}
          </Text>
        </Box>
        <Box>
          <Text dimColor={dimColor}>
            {localize('help.btw', '/btw for side question')}
          </Text>
        </Box>
      </Box>

      {/* Средняя колонка */}
      <Box flexDirection="column" width={middleWidth}>
        <Box>
          <Text dimColor={dimColor}>
            {localize('help.clear_input', 'double tap esc to clear input')}
          </Text>
        </Box>
        <Box>
          <Text dimColor={dimColor}>
            {cycleModeShortcut}{' '}
            {localize('help.auto_accept_edits', 'to auto-accept edits')}
          </Text>
        </Box>
        <Box>
          <Text dimColor={dimColor}>
            {transcriptShortcut} {localize('help.verbose_output', 'for verbose output')}
          </Text>
        </Box>
        <Box>
          <Text dimColor={dimColor}>
            {todosShortcut} {localize('help.toggle_tasks', 'to toggle tasks')}
          </Text>
        </Box>
        {terminalShortcutElement}
        <Box>
          <Text dimColor={dimColor}>{newlineText}</Text>
        </Box>
      </Box>

      {/* Правая колонка */}
      <Box flexDirection="column">
        <Box>
          <Text dimColor={dimColor}>
            {undoShortcut} {localize('help.undo', 'to undo')}
          </Text>
        </Box>
        {getPlatform() !== 'windows' && (
          <Box>
            <Text dimColor={dimColor}>
              {localize('help.suspend', 'ctrl + z to suspend')}
            </Text>
          </Box>
        )}
        <Box>
          <Text dimColor={dimColor}>
            {imagePasteShortcut} {localize('help.paste_images', 'to paste images')}
          </Text>
        </Box>
        <Box>
          <Text dimColor={dimColor}>
            {modelPickerShortcut} {localize('help.switch_model', 'to switch model')}
          </Text>
        </Box>
        {isFastModeEnabled() && isFastModeAvailable() && (
          <Box>
            <Text dimColor={dimColor}>
              {fastModeShortcut} {localize('help.toggle_fast_mode', 'to toggle fast mode')}
            </Text>
          </Box>
        )}
        <Box>
          <Text dimColor={dimColor}>
            {stashShortcut} {localize('help.stash_prompt', 'to stash prompt')}
          </Text>
        </Box>
        <Box>
          <Text dimColor={dimColor}>
            {externalEditorShortcut} {localize('help.external_editor', 'to edit in $EDITOR')}
          </Text>
        </Box>
        {isKeybindingCustomizationEnabled() && (
          <Box>
            <Text dimColor={dimColor}>
              {localize('help.keybindings', '/keybindings to customize')}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
