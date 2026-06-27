import capitalize from 'lodash-es/capitalize.js';
import * as React from 'react';
import { useMemo, useState, useCallback } from 'react';
import { type Command, type CommandBase, type CommandResultDisplay, type PromptCommand, getCommands, clearCommandsCache } from '../../commands.js';
import { Box, Text, useInput } from '../../ink.js';
import { estimateSkillFrontmatterTokens, getSkillsPath } from '../../skills/loadSkillsDir.js';
import { getDisplayPath } from '../../utils/file.js';
import { formatTokens } from '../../utils/format.js';
import { getUserSkillExampleDisplayPath } from '../../utils/ultimateDisplayPaths.js';
import { getSettingSourceName, type SettingSource } from '../../utils/settings/constants.js';
import { plural } from '../../utils/stringUtils.js';
import { ConfigurableShortcutHint } from '../ConfigurableShortcutHint.js';
import { Dialog } from '../design-system/Dialog.js';
import FullWidthRow from '../design-system/FullWidthRow.js';
import TextInput from '../TextInput.js';
import { getFsImplementation } from '../../utils/fsOperations.js';
import { execFileNoThrow } from '../../utils/execFileNoThrow.js';
import { getCwd } from '../../utils/cwd.js';
import { join } from 'path';

// Skills are always PromptCommands with CommandBase properties
type SkillCommand = CommandBase & PromptCommand;
type SkillSource = SettingSource | 'plugin' | 'mcp';

type Props = {
  onExit: (result?: string, options?: {
    display?: CommandResultDisplay;
  }) => void;
  commands: Command[];
};

function getSourceTitle(source: SkillSource): string {
  if (source === 'plugin') {
    return 'Plugin skills';
  }
  if (source === 'mcp') {
    return 'MCP skills';
  }
  return `${capitalize(getSettingSourceName(source))} skills`;
}

function getSourceSubtitle(source: SkillSource, skills: SkillCommand[]): string | undefined {
  if (source === 'mcp') {
    const servers = [...new Set(skills.map(s => {
      const idx = s.name.indexOf(':');
      return idx > 0 ? s.name.slice(0, idx) : null;
    }).filter((n): n is string => n != null))];
    return servers.length > 0 ? servers.join(', ') : undefined;
  }
  const skillsPath = getDisplayPath(getSkillsPath(source, 'skills'));
  const hasCommandsSkills = skills.some(s => s.loadedFrom === 'commands_DEPRECATED');
  return hasCommandsSkills ? `${skillsPath}, ${getDisplayPath(getSkillsPath(source, 'commands'))}` : skillsPath;
}

function getSkillListLabel(skill: SkillCommand): string {
  const leafName = skill.name.split(':').pop() ?? skill.name;
  return leafName === skill.name ? skill.name : `${skill.name} - ${leafName}`;
}

export function getEmptySkillsMenuMessage(): string {
  return `Create skills in .claude/skills/<name>/SKILL.md or ${getUserSkillExampleDisplayPath()}`;
}

function renderSkill(skill: SkillCommand) {
  const estimatedTokens = estimateSkillFrontmatterTokens(skill);
  const tokenDisplay = `~${formatTokens(estimatedTokens)}`;
  const pluginName = skill.source === 'plugin' ? skill.pluginInfo?.pluginManifest.name : undefined;
  return (
    <FullWidthRow key={`${skill.name}-${skill.source}`}>
      <Text>{getSkillListLabel(skill)}</Text>
      <Text dimColor={true}>{pluginName ? ` · ${pluginName}` : ""} · {tokenDisplay} description tokens</Text>
    </FullWidthRow>
  );
}

export function SkillsMenu({ onExit, commands: initialCommands }: Props) {
  const [commandsList, setCommandsList] = useState<Command[]>(initialCommands);
  const [viewState, setViewState] = useState<'list' | 'install-prompt' | 'installing' | 'install-success' | 'install-error'>('list');
  const [gitUrl, setGitUrl] = useState('');
  const [cursorOffset, setCursorOffset] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const skills = useMemo(() => {
    return commandsList.filter((cmd): cmd is SkillCommand =>
      cmd.type === 'prompt' &&
      (cmd.loadedFrom === 'skills' || cmd.loadedFrom === 'commands_DEPRECATED' || cmd.loadedFrom === 'plugin' || cmd.loadedFrom === 'mcp')
    );
  }, [commandsList]);

  const skillsBySource = useMemo(() => {
    const groups: Record<SkillSource, SkillCommand[]> = {
      policySettings: [],
      userSettings: [],
      projectSettings: [],
      localSettings: [],
      flagSettings: [],
      plugin: [],
      mcp: []
    };
    for (const skill of skills) {
      const source = skill.source as SkillSource;
      if (source in groups) {
        groups[source].push(skill);
      }
    }
    for (const group of Object.values(groups)) {
      group.sort((a, b) => a.name.localeCompare(b.name));
    }
    return groups;
  }, [skills]);

  const handleCancel = useCallback(() => {
    onExit("Skills dialog dismissed", {
      display: "system"
    });
  }, [onExit]);

  const handleGitInstall = useCallback(async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMessage('Git URL cannot be empty.');
      setViewState('install-error');
      return;
    }

    setViewState('installing');

    try {
      const match = trimmed.match(/\/([^/]+?)(?:\.git)?$/);
      const repoName = match ? match[1] : 'downloaded-skill-' + Date.now();

      const fs = getFsImplementation();
      const userSkillsPath = getSkillsPath('userSettings', 'skills');

      if (!fs.existsSync(userSkillsPath)) {
        await fs.mkdir(userSkillsPath);
      }

      const targetPath = join(userSkillsPath, repoName);
      if (fs.existsSync(targetPath)) {
        await fs.rm(targetPath, { recursive: true, force: true });
      }

      const result = await execFileNoThrow('git', ['clone', trimmed, targetPath]);
      if (result.code !== 0) {
        setErrorMessage(`Git clone failed with code ${result.code}: ${result.stderr || result.error || 'Unknown error'}`);
        setViewState('install-error');
        return;
      }

      const skillFile = join(targetPath, 'SKILL.md');
      const skillFileLower = join(targetPath, 'skill.md');
      if (!fs.existsSync(skillFile) && !fs.existsSync(skillFileLower)) {
        setErrorMessage(`Repository cloned, but no SKILL.md or skill.md found at the root of ${repoName}.`);
        setViewState('install-error');
        try {
          await fs.rm(targetPath, { recursive: true, force: true });
        } catch {}
        return;
      }

      clearCommandsCache();
      const reloaded = await getCommands(getCwd());
      setCommandsList(reloaded);

      setViewState('install-success');
    } catch (err: any) {
      setErrorMessage(`Installation failed: ${err.message || err}`);
      setViewState('install-error');
    }
  }, []);

  useInput((input, key) => {
    if (viewState === 'list') {
      if (input.toLowerCase() === 'i') {
        setViewState('install-prompt');
        setGitUrl('');
        setCursorOffset(0);
        setErrorMessage('');
      }
    } else if (viewState === 'install-success' || viewState === 'install-error') {
      if (key.return || key.escape) {
        setViewState('list');
      }
    }
  });

  const renderSkillGroup = (source: SkillSource) => {
    const groupSkills = skillsBySource[source];
    if (groupSkills.length === 0) {
      return null;
    }
    const title = getSourceTitle(source);
    const subtitle = getSourceSubtitle(source, groupSkills);
    return (
      <Box flexDirection="column" key={source}>
        <FullWidthRow>
          <Text bold={true} dimColor={true}>{title}</Text>
          {subtitle && <Text dimColor={true}> ({subtitle})</Text>}
        </FullWidthRow>
        {groupSkills.map(skill => renderSkill(skill))}
      </Box>
    );
  };

  if (viewState === 'install-prompt') {
    return (
      <Dialog title="Install Skill from Git" subtitle="Enter repository URL to install custom skill" onCancel={() => setViewState('list')} isCancelActive={false}>
        <Box flexDirection="column" gap={1}>
          <Text>Git Repository URL (.git):</Text>
          <Box borderStyle="round" borderColor="permission" paddingLeft={1}>
            <TextInput
              value={gitUrl}
              onChange={setGitUrl}
              onSubmit={handleGitInstall}
              onExit={() => setViewState('list')}
              focus={true}
              showCursor={true}
              columns={80}
              cursorOffset={cursorOffset}
              onChangeCursorOffset={setCursorOffset}
            />
          </Box>
          <Text dimColor={true} italic={true}>
            Press <ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="back" /> to go back to list
          </Text>
        </Box>
      </Dialog>
    );
  }

  if (viewState === 'installing') {
    return (
      <Dialog title="Installing Skill" subtitle="Running git clone..." onCancel={() => {}} isCancelActive={false}>
        <Box flexDirection="column" gap={1}>
          <Text color="brand">Cloning {gitUrl}...</Text>
          <Text dimColor={true}>Please wait while files are being downloaded and parsed.</Text>
        </Box>
      </Dialog>
    );
  }

  if (viewState === 'install-success') {
    return (
      <Dialog title="Success!" subtitle="Skill installed successfully" onCancel={() => setViewState('list')} isCancelActive={false}>
        <Box flexDirection="column" gap={1}>
          <Text color="green">The skill was successfully cloned, verified, and loaded!</Text>
          <Text dimColor={true} italic={true}>
            Press <Text bold>[Enter]</Text> or <Text bold>[Esc]</Text> to return to the skills list
          </Text>
        </Box>
      </Dialog>
    );
  }

  if (viewState === 'install-error') {
    return (
      <Dialog title="Error Installing Skill" subtitle="Installation failed" onCancel={() => setViewState('list')} isCancelActive={false}>
        <Box flexDirection="column" gap={1}>
          <Text color="red">{errorMessage}</Text>
          <Text dimColor={true} italic={true}>
            Press <Text bold>[Enter]</Text> or <Text bold>[Esc]</Text> to return to the skills list
          </Text>
        </Box>
      </Dialog>
    );
  }

  const skillCountText = `${skills.length} ${plural(skills.length, 'skill')}`;

  const hasSkills = skills.length > 0;
  const listContent = hasSkills ? (
    <Box flexDirection="column" gap={1}>
      {renderSkillGroup('projectSettings')}
      {renderSkillGroup('userSettings')}
      {renderSkillGroup('policySettings')}
      {renderSkillGroup('plugin')}
      {renderSkillGroup('mcp')}
      <Box marginTop={1} flexDirection="column">
        <Text dimColor={true}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        <FullWidthRow>
          <Text dimColor={true}>Press <Text bold={true} color="brand">[I]</Text> to install a skill from a Git repository</Text>
        </FullWidthRow>
      </Box>
    </Box>
  ) : (
    <Box flexDirection="column">
      <FullWidthRow>
        <Text dimColor={true}>{getEmptySkillsMenuMessage()}</Text>
      </FullWidthRow>
      <Box marginTop={1} flexDirection="column">
        <Text dimColor={true}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        <FullWidthRow>
          <Text dimColor={true}>Press <Text bold={true} color="brand">[I]</Text> to install a skill from a Git repository</Text>
        </FullWidthRow>
      </Box>
    </Box>
  );

  return (
    <Dialog title="Skills" subtitle={skillCountText} onCancel={handleCancel} hideInputGuide={true}>
      {listContent}
      <FullWidthRow>
        <Text dimColor={true} italic={true}>
          <ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="close" />
        </Text>
      </FullWidthRow>
    </Dialog>
  );
}
