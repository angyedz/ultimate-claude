export const en = {
  'commands.add-dir.description': 'Add a new working directory',
  'commands.agents.description': 'Manage agent configurations',
  'commands.auto-fix.description':
    'Configure auto-fix: run lint/test after AI edits',
  'commands.branch.description':
    'Create a branch of the current conversation at this point',
  'commands.btw.description':
    'Ask a quick side question without interrupting the main conversation',
  'commands.cache-stats.description':
    'Show per-turn and session cache hit/miss stats (works across all providers)',
  'commands.clear.description':
    'Clear conversation history and free up context',
  'commands.color.description': 'Set the prompt bar color for this session',
  'commands.compact.description':
    'Clear conversation history but keep a summary in context. Optional: /compact [instructions for summarization]',
  'commands.commit-message.description':
    'Configure commit attribution text',
  'commands.config.description': 'Open config panel',
  'commands.continue.description': 'Continue the current task',
  'commands.copy.description':
    "Copy Claude's last response to clipboard (or /copy N for the Nth-latest)",
  'commands.context.description': 'Show current context usage',
  'commands.cost.description':
    'Show the total cost and duration of the current session',
  'commands.diff.description': 'View uncommitted changes and per-turn diffs',
  'commands.doctor.description':
    'Diagnose and verify your Claude Code installation and settings',
  'commands.dream.description':
    'Run memory consolidation — synthesize recent sessions into durable memories',
  'commands.effort.description': 'Set effort level for model usage',
  'commands.exit.description': 'Exit the REPL',
  'commands.export.description':
    'Export the current conversation to a file or clipboard',
  'commands.heapdump.description': 'Dump the JS heap to ~/Desktop',
  'commands.help.description': 'Show help and available commands',
  'commands.hooks.description': 'View hook configurations for tool events',
  'commands.ide.description': 'Manage IDE integrations and show status',
  'commands.init.description':
    'Initialize a new project instruction file with codebase documentation',
  'commands.insights.description':
    'Generate a report analyzing your Claude Code sessions',
  'commands.install-github-app.description':
    'Set up Claude GitHub Actions for a repository',
  'commands.knowledge.description': 'Manage native Knowledge Graph',
  'commands.login.description': 'Sign in with your Anthropic account',
  'commands.logout.description': 'Sign out from your Anthropic account',
  'commands.lsp.description':
    'Inspect and set up Language Server Protocol code intelligence',
  'commands.mcp.description': 'Manage MCP servers',
  'commands.memory.description': 'Edit Claude memory files',
  'commands.onboard-github.description':
    'Interactive setup for GitHub Copilot: OAuth device login stored in secure storage',
  'commands.output-style.description':
    'Deprecated: use /config to change output style',
  'commands.permissions.description':
    'Manage allow & deny tool permission rules',
  'commands.plan.description':
    'Enable plan mode or view the current session plan',
  'commands.plugin.description': 'Manage Claude Code plugins',
  'commands.provider.description': 'Manage API provider profiles',
  'commands.pr-comments.description':
    'Get comments from a GitHub pull request',
  'commands.release-notes.description': 'View release notes',
  'commands.reload-plugins.description':
    'Activate pending plugin changes in the current session',
  'commands.rename.description': 'Rename the current conversation',
  'commands.request-size.description':
    'Show estimated request context load and top contributors',
  'commands.resume.description': 'Resume a previous conversation',
  'commands.review.description': 'Review a pull request',
  'commands.rewind.description':
    'Restore the code and/or conversation to a previous point',
  'commands.security-review.description':
    'Complete a security review of the pending changes on the current branch',
  'commands.skills.description': 'List available skills',
  'commands.stats.description':
    'Show your Claude Code usage statistics and activity',
  'commands.status.description':
    'Show Claude Code status including version, model, account, API connectivity, and tool statuses',
  'commands.statusline.description': "Set up Claude Code's status line UI",
  'commands.stickers.description': 'Order Claude Code stickers',
  'commands.tasks.description': 'List and manage background tasks',
  'commands.terminal-setup.description':
    'Install Shift+Enter key binding for newlines',
  'commands.theme.description': 'Change the theme',
  'commands.usage.description': 'Show plan usage limits',
  'commands.vim.description': 'Toggle between Vim and Normal editing modes',
  'commands.wiki.description':
    'Initialize and inspect the Claude Code project wiki',
  'skills.batch.description':
    'Research and plan a large-scale change, then execute it in parallel across 5–30 isolated worktree agents that each open a PR.',
  'skills.batch.whenToUse':
    'Use when the user wants to make a sweeping, mechanical change across many files (migrations, refactors, bulk renames) that can be decomposed into independent parallel units.',
  'skills.debug.ant.description':
    'Debug your current Claude Code session by reading the session debug log. Includes all event logging',
  'skills.debug.default.description':
    'Enable debug logging for this session and help diagnose issues',
  'skills.loop.description':
    'Run a prompt on a fixed interval or dynamically reschedule it, including bare maintenance-mode loops.',
  'skills.loop.whenToUse':
    'When the user wants to poll for status, babysit a workflow, run recurring maintenance, or keep re-running a prompt within the current session.',
  'skills.simplify.description':
    'Review changed code for reuse, quality, and efficiency, then fix any issues found.',
  'skills.update-config.description':
    'Use this skill to configure the Claude Code harness via settings.json. Automated behaviors ("from now on when X", "each time X", "whenever X", "before/after X") require hooks configured in settings.json - the harness executes these, not Claude, so memory/preferences cannot fulfill them. Also use for: permissions ("allow X", "add permission", "move permission to"), env vars ("set X=Y"), hook troubleshooting, or any changes to settings.json/settings.local.json files. Examples: "allow npm commands", "add bq permission to global settings", "move permission to user settings", "set DEBUG=true", "when claude stops show X". For simple settings like theme/model, use Config tool.',

  // Our custom commands
  'commands.language.description': 'Change the interface language',
  'commands.session.description': 'View and manage local sessions',
  'commands.system-reset.description': 'Reset the system prompt to default',

  // Skills menu UI
  'skills.menu.title': 'Skills',
  'skills.menu.install_hint': 'Press [I] to install a skill from a Git repository',
  'skills.menu.empty': 'Create skills in .claude/skills/<name>/SKILL.md',
  'skills.menu.install_title': 'Install Skill from Git',
  'skills.menu.install_subtitle': 'Enter the Git URL of the skill repository (.git)',
  'skills.menu.install_back': 'Press Esc to go back to list',
  'skills.menu.installing_title': 'Installing Skill',
  'skills.menu.installing_subtitle': 'Running git clone...',
  'skills.menu.installing_msg': 'Cloning {url}...',
  'skills.menu.installing_wait': 'Please wait while files are being downloaded and parsed.',
  'skills.menu.success_title': 'Success!',
  'skills.menu.success_subtitle': 'Skill installed successfully',
  'skills.menu.success_msg': 'The skill was successfully cloned, verified, and loaded!',
  'skills.menu.success_back': 'Press [Enter] or [Esc] to return to the skills list',
  'skills.menu.error_title': 'Error Installing Skill',
  'skills.menu.error_subtitle': 'Installation failed',
  'skills.menu.error_back': 'Press [Enter] or [Esc] to return to the skills list',
  'skills.menu.source.plugin': 'Plugin skills',
  'skills.menu.source.mcp': 'MCP skills',
  'skills.source.title': '{source} skills',

  // Memory command UI
  'memory.title': 'Memory',
  'memory.manage_title': 'Manage Memory',
  'memory.edit_option': 'Edit memory file',
  'memory.reset_option': 'Reset/Clear memory file',
  'memory.back_option': 'Back',
  'memory.confirm_reset_title': 'Confirm Reset/Clear',
  'memory.confirm_reset_yes': 'Yes, permanently delete/reset',
  'memory.confirm_reset_no': 'No, keep it',
  'memory.new_file': 'New file (not yet created)',
  'memory.saved_in': 'Saved in {path}',
  'memory.learn_more': 'Learn more:',
  'memory.cancelled': 'Cancelled memory editing',
  'memory.opened': 'Opened memory file at {path}',
  'memory.reset_success': 'Memory file reset/deleted successfully',
  'memory.reset_failed': 'Error resetting memory file: {err}',
  'memory.not_exists': 'Memory file does not exist',

  // Language command UI
  'language.title': 'Choose your preferred language',
  'language.set_russian': 'Язык интерфейса изменён на Русский.',
  'language.set_english': 'Interface language set to English.',
  'language.dismissed': 'Language picker dismissed',

  // Effort command UI
  'effort.title': 'Effort Level',
  'effort.subtitle': 'Choose the compute level for model reasoning',

  // Update notification
  'update.available': 'Ultimate Claude Code update available: v{version}. Run /update to install.',

  // Logo welcome screen
  'logo.recent_updates': 'Recent updates',

  // Feed section strings
  'feed.recent_sessions': 'Recent Sessions',
  'feed.no_sessions': 'No recent sessions',
  'feed.check_release_notes': 'Check /release-notes for recent updates',
  'feed.tips_title': 'Tips for getting started',
  'feed.home_dir_warning': 'Note: You have launched ultimate-claude in your home directory. For the best experience, launch it in a project directory instead.',
} as const
