import { existsSync } from 'fs';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';
import * as React from 'react';
import { useState, useEffect } from 'react';
import type { LocalJSXCommandCall } from '../../types/command.js';
import { Dialog } from '../../components/design-system/Dialog.js';
import { Select } from '../../components/CustomSelect/index.js';
import { getClaudeConfigHomeDir } from '../../utils/envUtils.js';

const SECTIONS = [
  { name: 'intro', label: 'Section 1: Intro & Cyber Risk' },
  { name: 'system', label: 'Section 2: System & Permissions' },
  { name: 'doing_tasks', label: 'Section 3: Doing tasks & Code style' },
  { name: 'actions', label: 'Section 4: Executing actions with care' },
  { name: 'using_tools', label: 'Section 5: Using your tools' },
  { name: 'tone_and_style', label: 'Section 6: Tone and style' },
  { name: 'output_efficiency', label: 'Section 7: Output efficiency' }
];

function getSystemPromptsDir() {
  return join(getClaudeConfigHomeDir(), 'system_prompts');
}

async function resetAll(context: any): Promise<string> {
  context.setAppState((prev: any) => ({
    ...prev,
    customSystemPrompt: undefined,
    appendSystemPrompt: undefined
  }));
  
  let count = 0;
  try {
    const dir = getSystemPromptsDir();
    if (existsSync(dir)) {
      const files = await readdir(dir);
      for (const file of files) {
        if (file.endsWith('.txt')) {
          await unlink(join(dir, file));
          count++;
        }
      }
    }
  } catch {}
  return `Successfully restored all system prompts to default (cleared AppState and removed ${count} override files)`;
}

async function resetSection(name: string): Promise<string> {
  const filePath = join(getSystemPromptsDir(), `${name}.txt`);
  if (existsSync(filePath)) {
    await unlink(filePath);
    return `Successfully restored Section "${name}" to default`;
  }
  return `Section "${name}" is already at its default state`;
}

type Props = {
  onDone: (result?: string) => void;
  context: any;
};

function SystemResetManager({ onDone, context }: Props) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      const dir = getSystemPromptsDir();
      const overridden = new Set<string>();
      try {
        if (existsSync(dir)) {
          const files = await readdir(dir);
          for (const file of files) {
            if (file.endsWith('.txt')) {
              overridden.add(file.replace('.txt', ''));
            }
          }
        }
      } catch {}

      const list = [
        { value: 'all', label: 'Restore all system prompts to default' }
      ];

      for (const s of SECTIONS) {
        const isOverridden = overridden.has(s.name);
        list.push({
          value: s.name,
          label: `${s.label}${isOverridden ? ' (modified)' : ' (default)'}`
        });
      }

      list.push({ value: 'cancel', label: 'Cancel' });
      setOptions(list);
    };

    loadOptions();
  }, []);

  const handleChange = async (val: string) => {
    if (val === 'cancel') {
      onDone('System prompt reset cancelled');
      return;
    }
    if (val === 'all') {
      const msg = await resetAll(context);
      onDone(msg);
      return;
    }
    const msg = await resetSection(val);
    onDone(msg);
  };

  const handleCancel = () => {
    onDone('System prompt reset cancelled');
  };

  return (
    <Dialog title="Restore System Prompts" subtitle="Select a prompt section to restore to its default state." onCancel={handleCancel} color="permission" showNavigationHint>
      <Select options={options} onChange={handleChange} onCancel={handleCancel} />
    </Dialog>
  );
}

export const call: LocalJSXCommandCall = async (onDone, context, args) => {
  const cleaned = args?.trim().toLowerCase();
  if (cleaned) {
    if (cleaned === 'all') {
      const msg = await resetAll(context);
      onDone(msg);
      return null;
    }
    const section = SECTIONS.find(s => s.name === cleaned);
    if (section) {
      const msg = await resetSection(section.name);
      onDone(msg);
      return null;
    }
    onDone(`Error: Unknown section name "${args}". Choose from: all, ${SECTIONS.map(s => s.name).join(', ')}`);
    return null;
  }

  return <SystemResetManager onDone={onDone} context={context} />;
};
