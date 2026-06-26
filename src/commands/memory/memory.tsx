import { mkdir, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { basename } from 'path';
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
          setStatusMessage(`Memory file reset/deleted successfully`);
        } else {
          setStatusMessage(`Memory file does not exist`);
        }
      } catch (err) {
        setStatusMessage(`Error resetting memory file: ${err}`);
      }
      setSelectedPath(null);
      setScreen('select');
    } else {
      setScreen('file_actions');
    }
  };

  const handleCancel = () => {
    onDone('Cancelled memory editing', {
      display: 'system'
    });
  };

  if (screen === 'select') {
    return (
      <Dialog title="Memory" subtitle={statusMessage || undefined} onCancel={handleCancel} color="remember">
        <Box flexDirection="column">
          <React.Suspense fallback={null}>
            <MemoryFileSelector onSelect={handleSelectMemoryFile} onCancel={handleCancel} />
          </React.Suspense>

          <Box marginTop={1}>
            <Text dimColor>
              Learn more: <Link url="https://code.claude.com/docs/en/memory" />
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
      { value: 'edit', label: 'Edit memory file' },
      { value: 'reset', label: 'Reset/Clear memory file' },
      { value: 'back', label: 'Back' }
    ];
    return (
      <Dialog title={`Manage Memory: ${filename}`} subtitle={exists ? `Saved in ${getRelativeMemoryPath(selectedPath)}` : 'New file (not yet created)'} onCancel={() => setScreen('select')} color="remember" showNavigationHint>
        <Select options={actionsOptions} onChange={handleSelectAction} onCancel={() => setScreen('select')} />
      </Dialog>
    );
  }

  if (screen === 'reset_confirm' && selectedPath) {
    const filename = basename(selectedPath);
    const confirmOptions = [
      { value: 'yes', label: 'Yes, permanently delete/reset' },
      { value: 'no', label: 'No, keep it' }
    ];
    return (
      <Dialog title="Confirm Reset/Clear" subtitle={`Are you sure you want to reset/clear the memory file "${filename}"? This will permanently delete the file.`} onCancel={() => setScreen('file_actions')} color="remember" showNavigationHint>
        <Select options={confirmOptions} onChange={handleConfirmReset} onCancel={() => setScreen('file_actions')} />
      </Dialog>
    );
  }

  return null;
}

export const call: LocalJSXCommandCall = async onDone => {
  clearMemoryFileCaches();
  await getMemoryFiles();
  return <MemoryCommand onDone={onDone} />;
};
