import figures from 'figures';
import { homedir } from 'os';
import * as React from 'react';
import { Box, Text } from '../../ink.js';
import type { Step } from '../../projectOnboardingState.js';
import { formatCreditAmount, getCachedReferrerReward } from '../../services/api/referral.js';
import type { LogOption } from '../../types/logs.js';
import { getCwd } from '../../utils/cwd.js';
import { formatRelativeTimeAgo } from '../../utils/format.js';
import { getReleaseSectionHeaderTitle, isReleaseSectionHeader } from '../../utils/releaseNotes.js';
import type { FeedConfig, FeedLine } from './Feed.js';
import { localize } from '../../i18n/index.js';
export function createRecentActivityFeed(activities: LogOption[]): FeedConfig {
  const lines: FeedLine[] = activities.map(log => {
    const time = formatRelativeTimeAgo(log.modified);
    const description = log.summary && log.summary !== 'No prompt' ? log.summary : log.firstPrompt;
    return {
      text: description || '',
      timestamp: time
    };
  });
  return {
    title: localize('feed.recent_sessions', 'Recent Sessions'),
    lines,
    footer: lines.length > 0 ? '/resume for more' : undefined,
    emptyMessage: localize('feed.no_sessions', 'No recent sessions')
  };
}
export function createWhatsNewFeed(releaseNotes: string[]): FeedConfig {
  const lines: FeedLine[] = releaseNotes.map(note => {
    if (isReleaseSectionHeader(note)) {
      return {
        text: `${getReleaseSectionHeaderTitle(note)}:`
      };
    }
    return {
      text: note
    };
  });
  return {
    title: localize('logo.recent_updates', 'Ultimate Claude Code Updates'),
    lines,
    footer: lines.length > 0 ? '/release-notes for more' : undefined,
    emptyMessage: localize('feed.check_release_notes', 'Check /release-notes for recent updates')
  };
}
export function createProjectOnboardingFeed(steps: Step[]): FeedConfig {
  const enabledSteps = steps.filter(({
    isEnabled
  }) => isEnabled).sort((a, b) => Number(a.isComplete) - Number(b.isComplete));
  const lines: FeedLine[] = enabledSteps.map(({
    text,
    isComplete
  }) => {
    const checkmark = isComplete ? `${figures.tick} ` : '';
    return {
      text: `${checkmark}${text}`
    };
  });
  const warningText = getCwd() === homedir() ? localize('feed.home_dir_warning', 'Note: You have launched ultimate-claude in your home directory. For the best experience, launch it in a project directory instead.') : undefined;
  if (warningText) {
    lines.push({
      text: warningText
    });
  }
  return {
    title: localize('feed.tips_title', 'Tips for getting started'),
    lines
  };
}
export function createGuestPassesFeed(): FeedConfig {
  const reward = getCachedReferrerReward();
  const subtitle = reward ? `Share Claude Code and earn ${formatCreditAmount(reward)} of extra usage` : 'Share Claude Code with friends';
  return {
    title: '3 guest passes',
    lines: [],
    customContent: {
      content: <>
          <Box marginY={1}>
            <Text color="claude">[✻] [✻] [✻]</Text>
          </Box>
          <Text dimColor>{subtitle}</Text>
        </>,
      width: 48
    },
    footer: '/passes'
  };
}
