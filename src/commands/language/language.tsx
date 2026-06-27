import * as React from 'react'
import { Box, Text } from '../../ink.js'
import { Select } from '../../components/CustomSelect/index.js'
import type {
  LocalJSXCommandCall,
  LocalJSXCommandOnDone,
} from '../../types/command.js'
import { useSettings } from '../../hooks/useSettings.js'
import { updateSettingsForSource } from '../../utils/settings/settings.js'
import { localize } from '../../i18n/index.js'

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
        ? localize('language.set_russian', 'Язык интерфейса изменён на Русский.')
        : localize('language.set_english', 'Interface language set to English.');
      onDone(msg, {
        nextInput: '/clear',
        submitNextInput: true
      })
    },
    [onDone],
  )

  const handleCancel = React.useCallback(() => {
    onDone(localize('language.dismissed', 'Language picker dismissed'), { display: 'system' })
  }, [onDone])

  const title = localize('language.title', 'Choose your preferred language');

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
