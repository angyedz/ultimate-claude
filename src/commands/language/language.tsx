import * as React from 'react'
import { Box, Text } from '../../ink.js'
import { Select } from '../../components/CustomSelect/index.js'
import type {
  LocalJSXCommandCall,
  LocalJSXCommandOnDone,
} from '../../types/command.js'
import { useSettings } from '../../hooks/useSettings.js'
import { updateSettingsForSource } from '../../utils/settings/settings.js'

type Props = {
  onDone: LocalJSXCommandOnDone
}

function LanguagePickerCommand({ onDone }: Props): React.ReactElement {
  const settings = useSettings()

  const initial = React.useMemo(() => {
    const lang = settings?.language?.toLowerCase();
    if (lang === 'russian' || lang === 'ru') {
      return 'russian';
    }
    return 'english';
  }, [settings]);

  const options = React.useMemo(() => [
    { label: 'English', value: 'english' },
    { label: 'Русский (Russian)', value: 'russian' }
  ], [])

  const handleSelect = React.useCallback(
    (chosen: string) => {
      updateSettingsForSource('userSettings', { language: chosen })
      const msg = chosen === 'russian'
        ? 'Язык интерфейса изменен на Русский.'
        : 'Interface language set to English.';
      onDone(msg)
    },
    [onDone],
  )

  const handleCancel = React.useCallback(() => {
    onDone('Language picker dismissed', { display: 'system' })
  }, [onDone])

  const title = initial === 'russian'
    ? 'Выберите предпочитаемый язык'
    : 'Choose your preferred language';

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>{title}</Text>
      <Select
        options={options}
        onChange={handleSelect}
        onCancel={handleCancel}
        visibleOptionCount={options.length}
        defaultValue={initial}
        defaultFocusValue={initial}
      />
    </Box>
  )
}

export const call: LocalJSXCommandCall = async (onDone, _context) => {
  return <LanguagePickerCommand onDone={onDone} />
}
