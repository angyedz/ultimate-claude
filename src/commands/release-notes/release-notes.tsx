import * as React from 'react'
import { Box, Text } from '../../ink.js'
import { Select } from '../../components/CustomSelect/index.js'
import type {
  LocalJSXCommandCall,
  LocalJSXCommandOnDone,
} from '../../types/command.js'
import { useSettings } from '../../hooks/useSettings.js'
import { localize } from '../../i18n/index.js'
import { readLocalUpdatesJson } from '../../utils/updatesSync.js'
import { publicBuildVersion } from '../../utils/version.js'
import { gt } from '../../utils/semver.js'

type Props = {
  onDone: LocalJSXCommandOnDone
}

function ReleaseNotesPicker({ onDone }: Props): React.ReactElement {
  const settings = useSettings()
  const isRussian = settings?.language?.toLowerCase() === 'russian' || settings?.language?.toLowerCase() === 'ru'

  const updates = React.useMemo(() => readLocalUpdatesJson(), [])
  const versions = React.useMemo(() => {
    return Object.keys(updates).sort((a, b) => gt(a, b) ? -1 : 1)
  }, [updates])

  const [viewState, setViewState] = React.useState<'list' | 'detail'>('list')
  const [selectedVersion, setSelectedVersion] = React.useState<string | null>(null)

  const handleSelectVersion = React.useCallback((val: string) => {
    if (val === 'close') {
      onDone(undefined, { display: 'system' })
      return
    }
    setSelectedVersion(val)
    setViewState('detail')
  }, [onDone])

  const handleCancelList = React.useCallback(() => {
    onDone(undefined, { display: 'system' })
  }, [onDone])

  const handleBackToList = React.useCallback(() => {
    setViewState('list')
    setSelectedVersion(null)
  }, [])

  const listOptions = React.useMemo(() => {
    const opts = versions.map(v => {
      const isCurrent = v === publicBuildVersion
      const label = isCurrent 
        ? `${v} (${localize('release_notes.current', 'current')})` 
        : v
      return { label, value: v }
    })
    opts.push({
      label: localize('release_notes.close', '[Close]'),
      value: 'close'
    })
    return opts
  }, [versions])

  if (viewState === 'detail' && selectedVersion) {
    const versionData = updates[selectedVersion]
    let notes: string[] = []
    if (versionData) {
      if (Array.isArray(versionData)) {
        notes = versionData
      } else {
        notes = isRussian ? (versionData.ru || versionData.en || []) : (versionData.en || versionData.ru || [])
      }
    }

    const detailOptions = [
      { label: localize('release_notes.back', '‹ Back to list'), value: 'back' }
    ]

    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color="claude">
          {localize('release_notes.details_title', 'Release Notes for {version}', { version: selectedVersion })}
        </Text>
        <Box flexDirection="column" paddingLeft={2} gap={0}>
          {notes.map((note, index) => (
            <Text key={index}>• {note}</Text>
          ))}
        </Box>
        <Select
          options={detailOptions}
          onChange={handleBackToList}
          onCancel={handleBackToList}
          visibleOptionCount={1}
        />
      </Box>
    )
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="claude">
        {localize('release_notes.list_title', 'Select version to view release notes')}
      </Text>
      <Select
        options={listOptions}
        onChange={handleSelectVersion}
        onCancel={handleCancelList}
        visibleOptionCount={Math.min(listOptions.length, 8)}
      />
    </Box>
  )
}

export const call: LocalJSXCommandCall = async (onDone, _context) => {
  return React.createElement(ReleaseNotesPicker, { onDone })
}
