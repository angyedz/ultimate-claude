import * as React from 'react';
import { useState } from 'react';
import type { LocalJSXCommandCall } from '../../types/command.js';
import { Dialog } from '../../components/design-system/Dialog.js';
import { Select } from '../../components/CustomSelect/index.js';
import { detectLocale } from '../../i18n/locale.js';
import { getCwd } from '../../utils/cwd.js';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import { spawnSync } from 'child_process';
import { Box, Text } from '../../ink.js';

async function performCompleteReset(): Promise<void> {
  const home = homedir();
  const cwd = getCwd();

  const pathsToDelete = [
    join(home, '.ultimate-claude'),
    join(home, '.ultimate-claude.json'),
    join(home, '.claude'),
    join(home, '.claude.json'),
    join(cwd, '.ultimate-claude'),
    join(cwd, '.claude'),
  ];

  for (const p of pathsToDelete) {
    try {
      if (existsSync(p)) {
        await rm(p, { recursive: true, force: true });
      }
    } catch {}
  }
}

function relaunchApp() {
  spawnSync(process.argv[0], process.argv.slice(1), {
    stdio: 'inherit',
  });
  // eslint-disable-next-line custom-rules/no-process-exit
  process.exit(0);
}

type Props = {
  onDone: (result?: string) => void;
};

function ClaudeResetManager({ onDone }: Props) {
  const isRu = detectLocale() === 'ru';
  const [resetting, setResetting] = useState(false);

  const options = [
    {
      value: 'yes',
      label: isRu
        ? 'Да, полностью сбросить и удалить все данные'
        : 'Yes, completely reset and delete all data',
    },
    {
      value: 'no',
      label: isRu ? 'Нет, отменить' : 'No, cancel',
    },
  ];

  const handleChange = async (val: string) => {
    if (val === 'no') {
      onDone(isRu ? 'Сброс настроек отменен' : 'Reset cancelled');
      return;
    }

    setResetting(true);
    await performCompleteReset();
    
    // Relaunch the app immediately
    relaunchApp();
  };

  const handleCancel = () => {
    onDone(isRu ? 'Сброс настроек отменен' : 'Reset cancelled');
  };

  if (resetting) {
    return (
      <Box padding={1} flexDirection="column">
        <Text color="warning" bold>
          {isRu ? 'Выполняется полный сброс и перезапуск...' : 'Performing complete reset and relaunching...'}
        </Text>
      </Box>
    );
  }

  return (
    <Dialog
      title={isRu ? 'Полный сброс настроек' : 'Complete Reset'}
      subtitle={
        isRu
          ? 'Вы действительно хотите полностью сбросить Ultimate Claude? Это удалит все сессии, историю, промпты и ключи.'
          : 'Are you sure you want to completely reset Ultimate Claude? This will delete all sessions, history, prompts, and keys.'
      }
      onCancel={handleCancel}
      color="error"
      showNavigationHint
    >
      <Select options={options} onChange={handleChange} onCancel={handleCancel} />
    </Dialog>
  );
}

export const call: LocalJSXCommandCall = async (onDone, _context) => {
  return <ClaudeResetManager onDone={onDone} />;
};
