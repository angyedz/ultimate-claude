import { useState, useEffect } from 'react'
import { Box, Text, useInput } from '../ink.js'
import { useMainLoopModel } from '../hooks/useMainLoopModel.js'
import { useAppState, useSetAppState } from '../state/AppState.js'
import type { EffortLevel } from '../utils/effort.js'
import {
  getAvailableEffortLevels,
  getDisplayedEffortLevel,
  getEffortLevelDescription,
  getEffortLevelLabel,
  isOpenAIEffortLevel,
  modelSupportsEffort,
  modelUsesOpenAIEffort,
  openAIEffortToStandard,
} from '../utils/effort.js'
import { getAPIProvider } from '../utils/model/providers.js'
import { getReasoningEffortForModel } from '../services/api/providerConfig.js'
import { effortLevelToSymbol } from './EffortIndicator.js'
import { KeyboardShortcutHint } from './design-system/KeyboardShortcutHint.js'
import { Byline } from './design-system/Byline.js'

type EffortOption = {
  value: string
  description: string
  isAvailable: boolean
}

type Props = {
  onSelect: (effort: EffortLevel | undefined) => void
  onCancel?: () => void
}

export function EffortPicker({ onSelect, onCancel }: Props) {
  const model = useMainLoopModel()
  const appStateEffort = useAppState((s: any) => s.effortValue)
  const setAppState = useSetAppState()
  const provider = getAPIProvider()
  const usesOpenAIEffort = modelUsesOpenAIEffort(model)
  const availableLevels = getAvailableEffortLevels(model)
  const currentDisplayedLevel = getDisplayedEffortLevel(model, appStateEffort)

  const modelReasoningEffort = usesOpenAIEffort ? getReasoningEffortForModel(model) : undefined
  
  const options: EffortOption[] = [
    {
      value: 'auto',
      description: 'Use the default effort level for your model',
      isAvailable: true,
    },
    ...availableLevels.map(level => {
      return {
        value: level,
        description: getEffortLevelDescription(level as EffortLevel),
        isAvailable: true,
      }
    }),
  ]

  if (availableLevels.length > 0) {
    options.push({
      value: 'ultracode',
      description: getEffortLevelDescription('ultracode'),
      isAvailable: true,
    })
  }

  const initialFocus = usesOpenAIEffort
    ? (appStateEffort === 'max'
        ? 'xhigh'
        : appStateEffort
          ? String(appStateEffort)
          : (modelReasoningEffort || 'auto'))
    : (appStateEffort ? String(appStateEffort) : 'auto')

  const [focusedIndex, setFocusedIndex] = useState(() => {
    const idx = options.findIndex(opt => opt.value === initialFocus)
    return idx >= 0 ? idx : 0
  })

  useInput((input, key) => {
    if (key.leftArrow || key.upArrow) {
      setFocusedIndex(prev => (prev - 1 + options.length) % options.length)
    } else if (key.rightArrow || key.downArrow) {
      setFocusedIndex(prev => (prev + 1) % options.length)
    } else if (key.return) {
      handleSelect(options[focusedIndex]!.value)
    } else if (key.escape) {
      handleCancel()
    }
  })

  function handleSelect(value: string) {
    if (value === 'auto') {
      setAppState(prev => ({
        ...prev,
        effortValue: undefined,
      }))
      onSelect(undefined)
    } else {
      const effortLevel = isOpenAIEffortLevel(value)
        ? openAIEffortToStandard(value)
        : (value as EffortLevel)
      setAppState(prev => ({
        ...prev,
        effortValue: effortLevel,
      }))
      onSelect(effortLevel)
    }
  }

  function handleCancel() {
    onCancel?.()
  }

  const supportsEffort = modelSupportsEffort(model)

  const [animationFrame, setAnimationFrame] = useState(0)
  const isUltracodeFocused = options[focusedIndex]?.value === 'ultracode'

  useEffect(() => {
    if (isUltracodeFocused) {
      const timer = setInterval(() => {
        setAnimationFrame(f => f + 1)
      }, 100)
      return () => clearInterval(timer)
    }
  }, [isUltracodeFocused])

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} flexDirection="column">
        <Text color="remember" bold={true}>Set effort level</Text>
        <Text dimColor={true}>
            {supportsEffort && usesOpenAIEffort
              ? `OpenAI/Codex provider (${provider})`
              : supportsEffort
              ? `Claude model · ${provider} provider`
              : `Effort not supported for this model`
          }
        </Text>
      </Box>

      <Box flexDirection="row" flexWrap="wrap" marginBottom={1}>
        {options.map((option, index) => {
          const isFocused = index === focusedIndex
          const isCurrent = option.value === 'auto'
            ? appStateEffort === undefined
            : currentDisplayedLevel === option.value || (usesOpenAIEffort && option.value === 'xhigh' && currentDisplayedLevel === 'max')
          
          return (
            <Box key={option.value} marginRight={3}>
              <OptionItem
                option={option}
                isFocused={isFocused}
                isCurrent={isCurrent}
                animationFrame={animationFrame}
              />
            </Box>
          )
        })}
      </Box>

      <Box marginBottom={1} minHeight={2} flexDirection="row">
        <Text dimColor={true}>Description: </Text>
        <Text italic={true} color="remember">
          {options[focusedIndex]?.description}
        </Text>
      </Box>

      {isUltracodeFocused && <SeaWave frame={animationFrame} />}

      <Box marginBottom={1}>
        <Text dimColor={true} italic={true}>
          <Byline>
            <KeyboardShortcutHint shortcut="Enter" action="confirm" />
            <KeyboardShortcutHint shortcut="Esc" action="cancel" />
          </Byline>
        </Text>
      </Box>
    </Box>
  )
}

function RainbowText({ text, frame }: { text: string; frame: number }) {
  const colors: Array<'red' | 'yellow' | 'green' | 'blue' | 'magenta' | 'cyan'> = [
    'red', 'yellow', 'green', 'blue', 'magenta', 'cyan'
  ]
  return (
    <>
      {text.split('').map((char, index) => {
        const color = colors[(index + frame) % colors.length]!
        return (
          <Text key={index} color={color} bold={true}>
            {char}
          </Text>
        )
      })}
    </>
  )
}

function SeaWave({ frame }: { frame: number }) {
  const width = 60
  
  // Sea wave text graphics using cyan/blue shades
  const chars1 = ['~', ' ', ' ', ' ', '~', ' ', ' ', ' ']
  const chars2 = [' ', '≈', ' ', ' ', ' ', '≈', ' ', ' ']
  const chars3 = [' ', ' ', '≋', ' ', ' ', ' ', '≋', ' ']
  
  let line1 = ''
  let line2 = ''
  let line3 = ''
  
  for (let i = 0; i < width; i++) {
    line1 += chars1[(i + frame) % chars1.length]
    line2 += chars2[(i - frame) % chars2.length]
    line3 += chars3[(i + Math.floor(frame / 2)) % chars3.length]
  }
  
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="cyan" bold={true}>{line1}</Text>
      <Text color="cyan" dimColor={true}>{line2}</Text>
      <Text color="blue" bold={true}>{line3}</Text>
    </Box>
  )
}

function OptionItem({
  option,
  isFocused,
  isCurrent,
  animationFrame
}: {
  option: EffortOption
  isFocused: boolean
  isCurrent: boolean
  animationFrame: number
}) {
  const level = option.value as EffortLevel | 'auto'
  const symbol = level === 'auto' ? '⊘' : effortLevelToSymbol(level)

  if (level === 'ultracode' && isFocused) {
    const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    const spinner = spinnerFrames[animationFrame % spinnerFrames.length]!
    
    return (
      <Box flexDirection="row">
        <Text color="cyan" bold={true}>{spinner} </Text>
        <RainbowText text="ULTRACODE" frame={animationFrame} />
        <Text color="cyan" bold={true}> {spinner}</Text>
        {isCurrent && <Text color="success" bold={true}> (current)</Text>}
      </Box>
    )
  }

  const color = isFocused 
    ? 'suggestion' 
    : isCurrent 
      ? 'remember' 
      : 'subtle'

  const textLabel = level === 'auto' ? 'Auto' : getEffortLevelLabel(level)

  return (
    <Box flexDirection="row">
      {isFocused ? (
        <Text color="suggestion" bold={true}>› </Text>
      ) : (
        <Text>  </Text>
      )}
      <Text color={color}>{symbol} </Text>
      <Text color={color} bold={isFocused || isCurrent}>
        {textLabel}
      </Text>
      {isCurrent && <Text color={isFocused ? 'suggestion' : 'remember'} dimColor={!isFocused}> (current)</Text>}
    </Box>
  )
}
