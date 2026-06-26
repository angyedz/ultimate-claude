import { mkdir, readdir, readFile, writeFile, unlink } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as React from 'react';
import { useState, useEffect } from 'react';
import type { LocalJSXCommandCall, LocalJSXCommandOnDone, LocalJSXCommandContext } from '../../types/command.js';
import { Dialog } from '../../components/design-system/Dialog.js';
import { Select } from '../../components/CustomSelect/index.js';
import { editPromptInEditor } from '../../utils/promptEditor.js';
import {
  getSystemPrompt,
  getSimpleIntroSection,
  getSimpleSystemSection,
  getSimpleDoingTasksSection,
  getActionsSection,
  getUsingYourToolsSection,
  getSimpleToneAndStyleSection,
  getOutputEfficiencySection,
} from '../../constants/prompts.js';
import { getOutputStyleConfig } from '../../constants/outputStyles.js';
import { getClaudeConfigHomeDir } from '../../utils/envUtils.js';
import { Box, Text } from '../../ink.js';

const BUILTIN_PERSONAS = [
  {
    name: 'developer',
    label: 'Senior Developer (Pragmatic & Clean)',
    prompt: 'You are a pragmatic, senior developer who writes clean, idiomatic, and highly readable code. You explain complex architectural patterns in a clear, concise manner and focus on performance, security, and testability.'
  },
  {
    name: 'reviewer',
    label: 'Meticulous Code Reviewer',
    prompt: 'You are a meticulous, pedantic code reviewer. Your goal is to find bugs, security vulnerabilities, edge cases, performance issues, and stylistic problems in the code. For every issue, explain why it is a problem and suggest a concrete, step-by-step fix.'
  },
  {
    name: 'ux',
    label: 'UX/UI Frontend Specialist',
    prompt: 'You are an expert UX/UI designer and frontend engineer. You focus on building stunning, polished, highly responsive, and accessible user interfaces. You advocate for clean CSS/HTML, consistent spacing, modern color theory (e.g. curated palettes, glassmorphism), and subtle, pleasing micro-animations.'
  },
  {
    name: 'rust-cpp',
    label: 'Low-Level Systems Expert (Rust / C++)',
    prompt: 'You are a low-level systems programming expert specializing in Rust and C++. You prioritize memory safety, zero-cost abstractions, efficient CPU/memory usage, concurrency safety, and proper idiomatic patterns (e.g., lifetimes, borrow checker, smart pointers).'
  },
  {
    name: 'writer',
    label: 'Technical Copywriter & Writer',
    prompt: 'You are a professional technical writer and documentation specialist. You write clear, structured, and user-friendly documentation, tutorials, and comments. You prefer using Markdown, clear headings, diagrams, and illustrative examples.'
  }
];

const SECTIONS = [
  {
    name: 'intro',
    label: 'Section 1: Intro & Cyber Risk',
    getDefault: (opts: { outputStyleConfig: any }) => getSimpleIntroSection(opts.outputStyleConfig, true)
  },
  {
    name: 'system',
    label: 'Section 2: System & Permissions',
    getDefault: () => getSimpleSystemSection(true)
  },
  {
    name: 'doing_tasks',
    label: 'Section 3: Doing tasks & Code style',
    getDefault: () => getSimpleDoingTasksSection(true)
  },
  {
    name: 'actions',
    label: 'Section 4: Executing actions with care',
    getDefault: () => getActionsSection(true)
  },
  {
    name: 'using_tools',
    label: 'Section 5: Using your tools',
    getDefault: (opts: { enabledTools: Set<string> }) => getUsingYourToolsSection(opts.enabledTools, true)
  },
  {
    name: 'tone_and_style',
    label: 'Section 6: Tone and style',
    getDefault: () => getSimpleToneAndStyleSection(true)
  },
  {
    name: 'output_efficiency',
    label: 'Section 7: Output efficiency',
    getDefault: () => getOutputEfficiencySection(true)
  }
];

function getPersonasDir() {
  return join(getClaudeConfigHomeDir(), 'personas');
}

function getSystemPromptsDir() {
  return join(getClaudeConfigHomeDir(), 'system_prompts');
}

function getSectionContent(name: string, defaultText: string): string {
  try {
    const filePath = join(getSystemPromptsDir(), `${name}.txt`);
    if (existsSync(filePath)) {
      return readFileSync(filePath, 'utf8');
    }
  } catch {}
  return defaultText;
}

async function saveSectionContent(name: string, content: string): Promise<void> {
  const dir = getSystemPromptsDir();
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${name}.txt`);
  if (!content.trim()) {
    try {
      await unlink(filePath);
    } catch {}
  } else {
    await writeFile(filePath, content, 'utf8');
  }
}

async function listCustomPersonas(): Promise<{ name: string; prompt: string }[]> {
  const dir = getPersonasDir();
  try {
    await mkdir(dir, { recursive: true });
    const files = await readdir(dir);
    const personas: { name: string; prompt: string }[] = [];
    for (const file of files) {
      if (file.endsWith('.txt') || file.endsWith('.md')) {
        const name = file.replace(/\.(txt|md)$/, '');
        const prompt = await readFile(join(dir, file), 'utf8');
        personas.push({ name, prompt });
      }
    }
    return personas;
  } catch {
    return [];
  }
}

async function saveCustomPersona(name: string, prompt: string): Promise<void> {
  const dir = getPersonasDir();
  await mkdir(dir, { recursive: true });
  const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  await writeFile(join(dir, `${sanitizedName}.txt`), prompt, 'utf8');
}

type ScreenState = 'main' | 'builtin' | 'custom' | 'save' | 'sections';

type Props = {
  onDone: LocalJSXCommandOnDone;
  context: LocalJSXCommandContext;
};

function SystemPromptManager({ onDone, context }: Props) {
  const [screen, setScreen] = useState<ScreenState>('main');
  const [customPersonas, setCustomPersonas] = useState<{ name: string; prompt: string }[]>([]);
  const [saveName, setSaveName] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [outputStyleConfig, setOutputStyleConfig] = useState<any>(null);

  const appState = context.getAppState();
  const currentCustom = appState.customSystemPrompt;
  const currentAppend = appState.appendSystemPrompt;

  const enabledTools = React.useMemo(() => new Set((context.options.tools || []).map(_ => _.name)), [context.options.tools]);

  useEffect(() => {
    getOutputStyleConfig().then(setOutputStyleConfig);
  }, []);

  useEffect(() => {
    if (screen === 'custom') {
      listCustomPersonas().then(setCustomPersonas);
    }
  }, [screen]);

  const handleSelectMain = async (val: string) => {
    if (val === 'cancel') {
      onDone('System prompt manager dismissed', { display: 'system' });
      return;
    }
    if (val === 'reset') {
      context.setAppState(prev => ({
        ...prev,
        customSystemPrompt: undefined,
        appendSystemPrompt: undefined
      }));
      // Also delete all section overrides
      try {
        const dir = getSystemPromptsDir();
        if (existsSync(dir)) {
          const files = await readdir(dir);
          for (const file of files) {
            if (file.endsWith('.txt')) {
              await unlink(join(dir, file));
            }
          }
        }
      } catch {}
      onDone('System prompts and section overrides reset to default', { display: 'system' });
      return;
    }
    if (val === 'edit_sections') {
      setScreen('sections');
      setStatusMessage(null);
      return;
    }
    if (val === 'edit_append') {
      const active = currentAppend || '';
      const result = editPromptInEditor(active);
      if (result.content !== null) {
        context.setAppState(prev => ({
          ...prev,
          appendSystemPrompt: result.content || undefined
        }));
        onDone('Custom instructions (append) updated successfully', { display: 'system' });
      } else {
        onDone('System prompt editing cancelled', { display: 'system' });
      }
      return;
    }
    if (val === 'edit_custom') {
      let active = currentCustom;
      if (!active) {
        try {
          const mcpClients = (appState.mcp?.clients || []) as any;
          const additionalDirs = Array.from(appState.toolPermissionContext?.additionalWorkingDirectories?.keys() || []);
          const defaultPromptSegments = await getSystemPrompt(
            context.options.tools,
            appState.mainLoopModel || context.options.mainLoopModel,
            additionalDirs,
            mcpClients
          );
          active = defaultPromptSegments.join('\n\n');
        } catch (err) {
          active = '';
        }
      }
      const result = editPromptInEditor(active);
      if (result.content !== null) {
        context.setAppState(prev => ({
          ...prev,
          customSystemPrompt: result.content || undefined
        }));
        onDone('Full override prompt updated successfully', { display: 'system' });
      } else {
        onDone('System prompt editing cancelled', { display: 'system' });
      }
      return;
    }
    if (val === 'builtin') {
      setScreen('builtin');
      return;
    }
    if (val === 'custom') {
      setScreen('custom');
      return;
    }
    if (val === 'save') {
      setScreen('save');
      return;
    }
  };

  const handleSelectBuiltin = (val: string) => {
    if (val === 'back') {
      setScreen('main');
      return;
    }
    const persona = BUILTIN_PERSONAS.find(p => p.name === val);
    if (persona) {
      context.setAppState(prev => ({
        ...prev,
        appendSystemPrompt: persona.prompt
      }));
      onDone(`System prompt updated to builtin persona: ${persona.name}`, { display: 'system' });
    }
  };

  const handleSelectCustom = (val: string) => {
    if (val === 'back') {
      setScreen('main');
      return;
    }
    const persona = customPersonas.find(p => p.name === val);
    if (persona) {
      context.setAppState(prev => ({
        ...prev,
        appendSystemPrompt: persona.prompt
      }));
      onDone(`System prompt updated to custom persona: ${persona.name}`, { display: 'system' });
    }
  };

  const handleSelectSection = async (val: string) => {
    if (val === 'back') {
      setScreen('main');
      setStatusMessage(null);
      return;
    }
    const section = SECTIONS.find(s => s.name === val);
    if (section) {
      try {
        const defaultText = section.getDefault({ outputStyleConfig, enabledTools });
        const currentText = getSectionContent(section.name, defaultText);
        const result = editPromptInEditor(currentText);
        if (result.content !== null) {
          await saveSectionContent(section.name, result.content);
          if (!result.content.trim()) {
            setStatusMessage(`Reset section "${section.name}" to default`);
          } else {
            setStatusMessage(`Updated section "${section.name}" successfully`);
          }
        }
      } catch (err) {
        setStatusMessage(`Error: ${err}`);
      }
    }
  };

  const handleSaveSubmit = async (val: string) => {
    if (val === 'cancel' || val === 'cancel_save') {
      setScreen('main');
      return;
    }
    if (val === 'submit_save') {
      const promptToSave = currentAppend || currentCustom;
      if (!promptToSave) {
        onDone('Error: No custom prompt or instructions to save. Edit a prompt first.', { display: 'system' });
        return;
      }
      if (!saveName.trim()) {
        onDone('Error: Please enter a valid name for the persona.', { display: 'system' });
        return;
      }
      try {
        await saveCustomPersona(saveName, promptToSave);
        onDone(`Successfully saved custom persona: ${saveName}`, { display: 'system' });
      } catch (err) {
        onDone(`Error saving persona: ${err}`, { display: 'system' });
      }
    }
  };

  const handleCancel = () => {
    onDone('System prompt manager dismissed', { display: 'system' });
  };

  const getStatusLine = () => {
    if (currentCustom) {
      return `Override active: "${currentCustom.split('\n')[0]?.substring(0, 40)}..."`;
    }
    if (currentAppend) {
      return `Custom instructions appended: "${currentAppend.split('\n')[0]?.substring(0, 40)}..."`;
    }
    return 'Using default system prompt';
  };

  if (screen === 'main') {
    const mainOptions = [
      { value: 'edit_sections', label: 'Edit individual system prompt sections (recommended)' },
      { value: 'edit_append', label: 'Edit custom instructions (appended to default)' },
      { value: 'edit_custom', label: 'Edit full override prompt (replaces default instructions)' },
      { value: 'builtin', label: 'Switch to built-in persona' },
      { value: 'custom', label: 'Load custom persona from disk' },
      { value: 'save', label: 'Save current custom instructions as persona' },
      { value: 'reset', label: 'Reset to default' },
      { value: 'cancel', label: 'Cancel' }
    ];
    return (
      <Dialog title="System Prompt Manager" subtitle={getStatusLine()} onCancel={handleCancel} color="permission" showNavigationHint>
        <Select options={mainOptions} onChange={handleSelectMain} onCancel={handleCancel} />
      </Dialog>
    );
  }

  if (screen === 'sections') {
    const sectionOptions = SECTIONS.map(s => {
      const isOverridden = existsSync(join(getSystemPromptsDir(), `${s.name}.txt`));
      return {
        value: s.name,
        label: `${s.label}${isOverridden ? ' (modified)' : ''}`
      };
    });
    sectionOptions.push({ value: 'back', label: 'Back' });

    const getSectionsSubtitle = () => {
      if (statusMessage) return statusMessage;
      return 'Select a section to customize its instructions.';
    };

    return (
      <Dialog title="Edit System Prompt Sections" subtitle={getSectionsSubtitle()} onCancel={() => setScreen('main')} color="permission" showNavigationHint>
        <Select options={sectionOptions} onChange={handleSelectSection} onCancel={() => setScreen('main')} />
      </Dialog>
    );
  }

  if (screen === 'builtin') {
    const builtinOptions = [
      ...BUILTIN_PERSONAS.map(p => ({ value: p.name, label: p.label, description: p.prompt, inlineDescriptions: true })),
      { value: 'back', label: 'Back' }
    ];
    return (
      <Dialog title="Choose Built-in Persona" subtitle="This will be appended as custom instructions." onCancel={() => setScreen('main')} color="permission" showNavigationHint>
        <Select options={builtinOptions} onChange={handleSelectBuiltin} onCancel={() => setScreen('main')} />
      </Dialog>
    );
  }

  if (screen === 'custom') {
    const customOptions = [
      ...customPersonas.map(p => ({ value: p.name, label: p.name, description: p.prompt })),
      { value: 'back', label: 'Back' }
    ];
    return (
      <Dialog title="Choose Custom Persona" subtitle="Select a previously saved custom prompt." onCancel={() => setScreen('main')} color="permission" showNavigationHint>
        {customPersonas.length === 0 ? (
          <Box flexDirection="column" gap={1}>
            <Text dimColor>No custom personas found in ~/.config/claude/personas/</Text>
            <Select options={[{ value: 'back', label: 'Back' }]} onChange={() => setScreen('main')} onCancel={() => setScreen('main')} />
          </Box>
        ) : (
          <Select options={customOptions} onChange={handleSelectCustom} onCancel={() => setScreen('main')} />
        )}
      </Dialog>
    );
  }

  if (screen === 'save') {
    const saveOptions = [
      {
        value: 'submit_save',
        label: 'Enter persona name',
        type: 'input' as const,
        placeholder: 'e.g. rust-expert',
        initialValue: '',
        allowEmptySubmitToCancel: false,
        showLabelWithValue: true,
        labelValueSeparator: ': ',
        onChange: setSaveName
      },
      { value: 'cancel_save', label: 'Back' }
    ];
    return (
      <Dialog title="Save Custom Persona" subtitle="Saves current instructions so you can load them later." onCancel={() => setScreen('main')} color="permission" showNavigationHint>
        <Select options={saveOptions} onChange={handleSaveSubmit} onCancel={() => setScreen('main')} />
      </Dialog>
    );
  }

  return null;
}

export const call: LocalJSXCommandCall = async (onDone, context, args) => {
  if (args && args.trim()) {
    const cleaned = args.trim();
    if (cleaned === 'default' || cleaned === 'reset') {
      context.setAppState(prev => ({
        ...prev,
        customSystemPrompt: undefined,
        appendSystemPrompt: undefined
      }));
      onDone('System prompts reset to default', { display: 'system' });
      return null;
    }
    const builtin = BUILTIN_PERSONAS.find(p => p.name === cleaned);
    if (builtin) {
      context.setAppState(prev => ({
        ...prev,
        appendSystemPrompt: builtin.prompt
      }));
      onDone(`System prompt set to persona: ${builtin.name}`, { display: 'system' });
      return null;
    }
    // Check if it's a custom persona on disk
    try {
      const customList = await listCustomPersonas();
      const custom = customList.find(p => p.name === cleaned);
      if (custom) {
        context.setAppState(prev => ({
          ...prev,
          appendSystemPrompt: custom.prompt
        }));
        onDone(`System prompt set to custom persona: ${custom.name}`, { display: 'system' });
        return null;
      }
    } catch {}

    // Otherwise set as custom override prompt directly
    context.setAppState(prev => ({
      ...prev,
      appendSystemPrompt: cleaned
    }));
    onDone('System prompt updated to custom text', { display: 'system' });
    return null;
  }

  return <SystemPromptManager onDone={onDone} context={context} />;
};
