import { toString as qrToString } from 'qrcode';
import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Pane } from '../../components/design-system/Pane.js';
import { Dialog } from '../../components/design-system/Dialog.js';
import { Select } from '../../components/CustomSelect/index.js';
import { LogSelector } from '../../components/LogSelector.js';
import { Box, Text } from '../../ink.js';
import { useKeybinding } from '../../keybindings/useKeybinding.js';
import { useAppState } from '../../state/AppState.js';
import type { LocalJSXCommandCall } from '../../types/command.js';
import { logForDebugging } from '../../utils/debug.js';
import { getIsRemoteMode, getOriginalCwd, getSessionId } from '../../bootstrap/state.js';
import { clearConversation } from '../clear/conversation.js';
import { loadSameRepoMessageLogs, getSessionIdFromLog, isLiteLog, loadFullLog, getTranscriptPathForSession } from '../../utils/sessionStorage.js';
import { getWorktreePaths } from '../../utils/getWorktreePaths.js';
import { validateUuid } from '../../utils/uuid.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import { useIsInsideModal } from '../../context/modalContext.js';
import { agenticSessionSearch } from '../../utils/agenticSessionSearch.js';
import { checkCrossProjectResume } from '../../utils/crossProjectResume.js';
import { setClipboard } from '../../ink/termio/osc.js';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { logError } from '../../utils/log.js';
import type { LogOption } from '../../types/logs.js';

type Props = {
  onDone: () => void;
};

function SessionInfo({ onDone }: Props) {
  const remoteSessionUrl = useAppState(s => s.remoteSessionUrl);
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    if (!remoteSessionUrl) {
      return;
    }
    const generateQRCode = async () => {
      try {
        const qr = await qrToString(remoteSessionUrl, {
          type: "utf8",
          errorCorrectionLevel: "L"
        });
        setQrCode(qr);
      } catch (e) {
        logForDebugging("QR code generation failed: " + (e instanceof Error ? e.message : String(e)));
      }
    };
    generateQRCode();
  }, [remoteSessionUrl]);

  useKeybinding("confirm:no", onDone, { context: "Confirmation" });

  if (!remoteSessionUrl) {
    return (
      <Pane>
        <Text color="warning">Not in remote mode. Start with `ultimate-claude --remote` to use this command.</Text>
        <Text dimColor={true}>(press esc to close)</Text>
      </Pane>
    );
  }

  const lines = qrCode.split("\n").filter(line => line.length > 0);
  const isLoading = lines.length === 0;

  return (
    <Pane>
      <Box marginBottom={1}>
        <Text bold={true}>Remote session</Text>
      </Box>
      {isLoading ? (
        <Text dimColor={true}>Generating QR code…</Text>
      ) : (
        lines.map((line, i) => <Text key={i}>{line}</Text>)
      )}
      <Box marginTop={1}>
        <Text dimColor={true}>Open in browser: </Text>
        <Text color="ide">{remoteSessionUrl}</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor={true}>(press esc to close)</Text>
      </Box>
    </Pane>
  );
}

type LocalSessionScreen = 'main' | 'new_confirm' | 'resume_select' | 'delete_select' | 'delete_confirm';

function LocalSessionManager({
  onDone,
  context
}: {
  onDone: (result?: string, options?: any) => void;
  context: any;
}) {
  const [screen, setScreen] = useState<LocalSessionScreen>('main');
  const [logs, setLogs] = useState<LogOption[]>([]);
  const [worktreePaths, setWorktreePaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogOption | null>(null);
  
  const { rows } = useTerminalSize();
  const insideModal = useIsInsideModal();

  const loadLogs = useCallback(async (paths: string[]) => {
    setLoading(true);
    try {
      const allLogs = await loadSameRepoMessageLogs(paths);
      const currentSessionId = getSessionId();
      const filtered = allLogs.filter(l => !l.isSidechain && getSessionIdFromLog(l) !== currentSessionId);
      setLogs(filtered);
    } catch (err) {
      setStatusMessage('Failed to load sessions list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen === 'resume_select' || screen === 'delete_select') {
      async function init() {
        const paths = await getWorktreePaths(getOriginalCwd());
        setWorktreePaths(paths);
        await loadLogs(paths);
      }
      init();
    }
  }, [screen, loadLogs]);

  const handleSelectMain = (val: string) => {
    if (val === 'cancel') {
      onDone('Session manager closed');
      return;
    }
    if (val === 'new') {
      setScreen('new_confirm');
      return;
    }
    if (val === 'resume') {
      setScreen('resume_select');
      return;
    }
    if (val === 'delete') {
      setScreen('delete_select');
      return;
    }
  };

  const handleConfirmNew = async (val: string) => {
    if (val === 'yes') {
      try {
        await clearConversation({
          setMessages: context.setMessages,
          readFileState: context.readFileState,
          discoveredSkillNames: context.discoveredSkillNames,
          loadedNestedMemoryPaths: context.loadedNestedMemoryPaths,
          getAppState: context.getAppState,
          setAppState: context.setAppState,
        });
        onDone('Started a new conversation session.');
      } catch (err) {
        onDone(`Error starting new session: ${err}`);
      }
    } else {
      setScreen('main');
    }
  };

  const handleSelectLogResume = async (log: LogOption) => {
    const sessionId = validateUuid(getSessionIdFromLog(log));
    if (!sessionId) {
      setStatusMessage('Failed to parse session ID');
      return;
    }

    try {
      const fullLog = isLiteLog(log) ? await loadFullLog(log) : log;
      const crossProjectCheck = checkCrossProjectResume(fullLog, false, worktreePaths);
      if (crossProjectCheck.isCrossProject && !crossProjectCheck.isSameRepoWorktree) {
        const raw = await setClipboard(crossProjectCheck.command);
        if (raw) process.stdout.write(raw);
        onDone(`This session is from a different project directory. Run: ${crossProjectCheck.command} (copied to clipboard)`);
        return;
      }

      await context.resume?.(sessionId, fullLog, 'slash_command_picker');
      onDone(undefined, { display: 'skip' });
    } catch (err) {
      logError(err as Error);
      setStatusMessage(`Failed to resume: ${(err as Error).message}`);
    }
  };

  const handleSelectLogDelete = (log: LogOption) => {
    setSelectedLog(log);
    setScreen('delete_confirm');
  };

  const handleConfirmDelete = async (val: string) => {
    if (val === 'yes' && selectedLog) {
      const sessionId = getSessionIdFromLog(selectedLog);
      if (sessionId) {
        try {
          const filePath = selectedLog.fullPath ?? getTranscriptPathForSession(sessionId);
          if (existsSync(filePath)) {
            await unlink(filePath);
          }
          const replayPath = filePath.replace('.jsonl', '.replay.json');
          if (existsSync(replayPath)) {
            await unlink(replayPath);
          }
          const todoPath = filePath.replace('.jsonl', '.todo.json');
          if (existsSync(todoPath)) {
            await unlink(todoPath);
          }
          setStatusMessage(`Session deleted successfully`);
        } catch (err) {
          setStatusMessage(`Error deleting session: ${err}`);
        }
      }
      setSelectedLog(null);
      setScreen('main');
    } else {
      setSelectedLog(null);
      setScreen('main');
    }
  };

  if (screen === 'main') {
    const options = [
      { value: 'new', label: 'Start a new conversation session' },
      { value: 'resume', label: 'Resume a past conversation session' },
      { value: 'delete', label: 'Delete a past conversation session' },
      { value: 'cancel', label: 'Cancel' }
    ];
    return (
      <Dialog title="Session Manager" subtitle={statusMessage || `Active Session: ${getSessionId()}`} onCancel={() => onDone('Session manager closed')} color="permission" showNavigationHint>
        <Select options={options} onChange={handleSelectMain} onCancel={() => onDone('Session manager closed')} />
      </Dialog>
    );
  }

  if (screen === 'new_confirm') {
    return (
      <Dialog title="Start New Session?" subtitle="This will clear your current conversation history and start fresh. Proceed?" onCancel={() => setScreen('main')} color="permission" showNavigationHint>
        <Select
          options={[
            { value: 'yes', label: 'Yes, start new session' },
            { value: 'no', label: 'No, cancel' }
          ]}
          onChange={handleConfirmNew}
          onCancel={() => setScreen('main')}
        />
      </Dialog>
    );
  }

  if (screen === 'resume_select') {
    if (loading) {
      return (
        <Dialog title="Resume Session" subtitle="Loading sessions list..." onCancel={() => setScreen('main')} color="permission">
          <Text dimColor>Loading past sessions...</Text>
        </Dialog>
      );
    }
    return (
      <LogSelector
        logs={logs}
        maxHeight={insideModal ? Math.floor(rows / 2) : rows - 2}
        onCancel={() => setScreen('main')}
        onSelect={handleSelectLogResume}
        onLogsChanged={() => loadLogs(worktreePaths)}
        showAllProjects={false}
        onToggleAllProjects={() => {}}
        onAgenticSearch={agenticSessionSearch}
      />
    );
  }

  if (screen === 'delete_select') {
    if (loading) {
      return (
        <Dialog title="Delete Session" subtitle="Loading sessions list..." onCancel={() => setScreen('main')} color="permission">
          <Text dimColor>Loading past sessions...</Text>
        </Dialog>
      );
    }
    return (
      <LogSelector
        logs={logs}
        maxHeight={insideModal ? Math.floor(rows / 2) : rows - 2}
        onCancel={() => setScreen('main')}
        onSelect={handleSelectLogDelete}
        onLogsChanged={() => loadLogs(worktreePaths)}
        showAllProjects={false}
        onToggleAllProjects={() => {}}
        onAgenticSearch={agenticSessionSearch}
      />
    );
  }

  if (screen === 'delete_confirm') {
    const title = selectedLog?.customTitle || selectedLog?.firstPrompt || 'Untitled Session';
    return (
      <Dialog title="Confirm Delete Session" subtitle={`Are you sure you want to delete the session: "${title.substring(0, 50)}..."? This cannot be undone.`} onCancel={() => setScreen('main')} color="permission" showNavigationHint>
        <Select
          options={[
            { value: 'yes', label: 'Yes, permanently delete' },
            { value: 'no', label: 'No, keep it' }
          ]}
          onChange={handleConfirmDelete}
          onCancel={() => setScreen('main')}
        />
      </Dialog>
    );
  }

  return null;
}

export const call: LocalJSXCommandCall = async (onDone, context) => {
  if (getIsRemoteMode()) {
    return <SessionInfo onDone={onDone} />;
  }
  return <LocalSessionManager onDone={onDone} context={context} />;
};
