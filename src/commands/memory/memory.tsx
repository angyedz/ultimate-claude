import { mkdir, writeFile, unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import * as React from 'react';
import { useState } from 'react';
import type { CommandResultDisplay } from '../../commands.js';
import { Dialog } from '../../components/design-system/Dialog.js';
import { MemoryFileSelector } from '../../components/memory/MemoryFileSelector.js';
import { getRelativeMemoryPath } from '../../components/memory/MemoryUpdateNotification.js';
import { Box, Link, Text } from '../../ink.js';
import type { LocalJSXCommandCall } from '../../types/command.js';
import { clearMemoryFileCaches, getMemoryFiles } from '../../utils/claudemd.js';
import { getClaudeConfigHomeDir } from '../../utils/envUtils.js';
import { getErrnoCode } from '../../utils/errors.js';
import { logError } from '../../utils/log.js';
import { editFileInEditor } from '../../utils/promptEditor.js';
import { Select } from '../../components/CustomSelect/index.js';
import { getOriginalCwd } from '../../bootstrap/state.js';
import { localize } from '../../i18n/index.js';

function MemoryCommand({
  onDone
}: {
  onDone: (result?: string, options?: {
    display?: CommandResultDisplay;
  }) => void;
}): React.ReactNode {
  const [screen, setScreen] = useState<'select' | 'file_actions' | 'reset_confirm'>('select');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSelectMemoryFile = (memoryPath: string) => {
    setSelectedPath(memoryPath);
    setScreen('file_actions');
    setStatusMessage(null);
  };

  const handleSelectAction = async (val: string) => {
    if (val === 'back') {
      setScreen('select');
      return;
    }
    if (val === 'edit' && selectedPath) {
      try {
        if (selectedPath.includes(getClaudeConfigHomeDir())) {
          await mkdir(getClaudeConfigHomeDir(), {
            recursive: true
          });
        }
        try {
          await writeFile(selectedPath, '', {
            encoding: 'utf8',
            flag: 'wx'
          });
        } catch (e: unknown) {
          if (getErrnoCode(e) !== 'EEXIST') {
            throw e;
          }
        }
        await editFileInEditor(selectedPath);

        let editorSource = 'default';
        let editorValue = '';
        if (process.env.VISUAL) {
          editorSource = '$VISUAL';
          editorValue = process.env.VISUAL;
        } else if (process.env.EDITOR) {
          editorSource = '$EDITOR';
          editorValue = process.env.EDITOR;
        }
        const editorInfo = editorSource !== 'default' ? `Using ${editorSource}="${editorValue}".` : '';
        const editorHint = editorInfo ? `> ${editorInfo} To change editor, set $EDITOR or $VISUAL environment variable.` : `> To use a different editor, set the $EDITOR or $VISUAL environment variable.`;
        onDone(`Opened memory file at ${getRelativeMemoryPath(selectedPath)}\n\n${editorHint}`, {
          display: 'system'
        });
      } catch (error) {
        logError(error);
        onDone(`Error opening memory file: ${error}`);
      }
      return;
    }
    if (val === 'reset' && selectedPath) {
      setScreen('reset_confirm');
      return;
    }
  };

  const handleConfirmReset = async (val: string) => {
    if (val === 'yes' && selectedPath) {
      try {
        if (existsSync(selectedPath)) {
          await unlink(selectedPath);
          clearMemoryFileCaches();
          await getMemoryFiles();
          setStatusMessage(localize('memory.reset_success', 'Memory file reset/deleted successfully'));
        } else {
          setStatusMessage(localize('memory.not_exists', 'Memory file does not exist'));
        }
      } catch (err) {
        setStatusMessage(localize('memory.reset_failed', `Error resetting memory file: ${err}`, { err: String(err) }));
      }
      setSelectedPath(null);
      setScreen('select');
    } else {
      setScreen('file_actions');
    }
  };

  const handleCancel = () => {
    onDone(localize('memory.cancelled', 'Cancelled memory editing'), {
      display: 'system'
    });
  };

  if (screen === 'select') {
    return (
      <Dialog title={localize('memory.title', 'Memory')} subtitle={statusMessage || undefined} onCancel={handleCancel} color="remember">
        <Box flexDirection="column">
          <React.Suspense fallback={null}>
            <MemoryFileSelector onSelect={handleSelectMemoryFile} onCancel={handleCancel} />
          </React.Suspense>

          <Box marginTop={1}>
            <Text dimColor>
              {localize('memory.learn_more', 'Learn more:')} <Link url="https://code.claude.com/docs/en/memory" />
            </Text>
          </Box>
        </Box>
      </Dialog>
    );
  }

  if (screen === 'file_actions' && selectedPath) {
    const filename = basename(selectedPath);
    const exists = existsSync(selectedPath);
    const actionsOptions = [
      { value: 'edit', label: localize('memory.edit_option', 'Edit memory file') },
      { value: 'reset', label: localize('memory.reset_option', 'Reset/Clear memory file') },
      { value: 'back', label: localize('memory.back_option', 'Back') }
    ];
    return (
      <Dialog title={`${localize('memory.manage_title', 'Manage Memory')}: ${filename}`} subtitle={exists ? localize('memory.saved_in', `Saved in ${getRelativeMemoryPath(selectedPath)}`, { path: getRelativeMemoryPath(selectedPath) }) : localize('memory.new_file', 'New file (not yet created)')} onCancel={() => setScreen('select')} color="remember" showNavigationHint>
        <Select options={actionsOptions} onChange={handleSelectAction} onCancel={() => setScreen('select')} />
      </Dialog>
    );
  }

  if (screen === 'reset_confirm' && selectedPath) {
    const filename = basename(selectedPath);
    const confirmOptions = [
      { value: 'yes', label: localize('memory.confirm_reset_yes', 'Yes, permanently delete/reset') },
      { value: 'no', label: localize('memory.confirm_reset_no', 'No, keep it') }
    ];
    return (
      <Dialog title={localize('memory.confirm_reset_title', 'Confirm Reset/Clear')} subtitle={`${localize('memory.confirm_reset_title', 'Are you sure you want to reset/clear the memory file')} "${filename}"?`} onCancel={() => setScreen('file_actions')} color="remember" showNavigationHint>
        <Select options={confirmOptions} onChange={handleConfirmReset} onCancel={() => setScreen('file_actions')} />
      </Dialog>
    );
  }

  return null;
}

export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  clearMemoryFileCaches();
  const existingMemoryFiles = await getMemoryFiles();

  args = args?.trim() || '';
  if (args.toLowerCase() === 'help' || args.toLowerCase() === '-h' || args.toLowerCase() === '--help') {
    onDone(
      `Usage: /memory [action] [file]\n\n` +
      `Actions:\n` +
      `  - /memory              : Open the interactive memory selector dialog\n` +
      `  - /memory list         : List all memory files, paths, and status\n` +
      `  - /memory edit [file]  : Edit a memory file (user or project) in your terminal editor\n` +
      `  - /memory show [file]  : Display the contents of a memory file\n` +
      `  - /memory clear [file] : Delete/reset a memory file\n\n` +
      `File values can be 'user', 'project', or a specific filename (e.g. 'CLAUDE.md').`
    );
    return;
  }

  const parts = args.split(/\s+/).filter(Boolean);
  if (parts.length > 0) {
    const action = parts[0]!.toLowerCase();
    const targetFile = parts[1]?.toLowerCase();

    // Resolve target path helper
    const resolveTargetPath = (target: string | undefined): string | null => {
      const userPath = join(getClaudeConfigHomeDir(), 'CLAUDE.md');
      const projectPath = join(getOriginalCwd(), 'CLAUDE.md');

      if (!target || target === 'user') {
        return userPath;
      }
      if (target === 'project') {
        return projectPath;
      }
      // Look for a match in existing files
      const match = existingMemoryFiles.find(
        f => basename(f.path).toLowerCase() === target || f.path.toLowerCase().includes(target)
      );
      if (match) {
        return match.path;
      }
      return null;
    };

    if (action === 'list') {
      const userPath = join(getClaudeConfigHomeDir(), 'CLAUDE.md');
      const projectPath = join(getOriginalCwd(), 'CLAUDE.md');
      const listLines = [
        `User Memory (global config):`,
        `  Path: ${userPath}`,
        `  Exists: ${existsSync(userPath) ? 'Yes' : 'No (new)'}`,
        ``,
        `Project Memory (workspace root):`,
        `  Path: ${projectPath}`,
        `  Exists: ${existsSync(projectPath) ? 'Yes' : 'No (new)'}`,
      ];
      if (existingMemoryFiles.length > 0) {
        const others = existingMemoryFiles.filter(f => f.path !== userPath && f.path !== projectPath);
        if (others.length > 0) {
          listLines.push(``, `Other memories:`);
          for (const f of others) {
            listLines.push(`  - ${basename(f.path)}: ${f.path}`);
          }
        }
      }
      onDone(listLines.join('\n'));
      return;
    }

    if (action === 'edit') {
      const path = resolveTargetPath(targetFile);
      if (!path) {
        onDone(`Error: Could not resolve memory file target '${targetFile || 'user'}'`);
        return;
      }
      try {
        if (path.includes(getClaudeConfigHomeDir())) {
          await mkdir(getClaudeConfigHomeDir(), { recursive: true });
        }
        try {
          await writeFile(path, '', { encoding: 'utf8', flag: 'wx' });
        } catch (e: unknown) {
          if (getErrnoCode(e) !== 'EEXIST') {
            throw e;
          }
        }
        await editFileInEditor(path);
        onDone(`Opened memory file at ${getRelativeMemoryPath(path)} for editing.`);
      } catch (err) {
        onDone(`Error editing memory file: ${err}`);
      }
      return;
    }

    if (action === 'show' || action === 'view') {
      const path = resolveTargetPath(targetFile || 'user');
      if (!path) {
        onDone(`Error: Could not resolve memory file target '${targetFile || 'user'}'`);
        return;
      }
      if (!existsSync(path)) {
        onDone(`Memory file does not exist yet: ${getRelativeMemoryPath(path)}`);
        return;
      }
      try {
        const content = await readFile(path, 'utf8');
        onDone(`--- ${basename(path)} ---\n${content || '(Empty memory file)'}\n---`);
      } catch (err) {
        onDone(`Error reading memory file: ${err}`);
      }
      return;
    }

    if (action === 'clear' || action === 'reset' || action === 'delete') {
      const path = resolveTargetPath(targetFile);
      if (!path) {
        onDone(`Error: Could not resolve memory file target '${targetFile || 'user'}'`);
        return;
      }
      if (!existsSync(path)) {
        onDone(`Memory file does not exist: ${getRelativeMemoryPath(path)}`);
        return;
      }
      try {
        await unlink(path);
        onDone(`Memory file deleted/reset successfully: ${getRelativeMemoryPath(path)}`);
      } catch (err) {
        onDone(`Error deleting memory file: ${err}`);
      }
      return;
    }

    onDone(`Unknown memory command action: ${action}. Type '/memory --help' for usage.`);
    return;
  }

  return <MemoryCommand onDone={onDone} />;
};
