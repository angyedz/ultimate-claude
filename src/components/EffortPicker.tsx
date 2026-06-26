import { useState, useEffect } from 'react'
import { Box, Text, useInput } from '../ink.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
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
  const { columns } = useTerminalSize()
  const height = 5
  
  // Wave origin (centered horizontally, or on the right where ultracode is)
  const originX = Math.min(Math.floor(columns * 0.8), columns - 5)
  const originY = 2
  
  const colors = [
    '#030f26',
    '#07224f',
    '#0b3a7a',
    '#0055bb',
    '#0088ee',
    '#00d5ff',
    '#a6f5ff'
  ] as const
  
  const textLines: Record<number, string> = {
    1: '✦ ULTRACODE ACTIVE ✦',
    3: 'Maximum thinking tokens for extreme complexity'
  }
  
  const rowsList: Array<Array<{ char: string; bgColor: string; isTextChar: boolean }>> = []
  
  for (let y = 0; y < height; y++) {
    const text = textLines[y]
    const textLength = text ? text.length : 0
    const startX = Math.floor((columns - textLength) / 2)
    
    const cells: Array<{ char: string; bgColor: string; isTextChar: boolean }> = []
    for (let x = 0; x < columns; x++) {
      // Calculate distance to origin
      // Vertical distance is scaled by 2.2 to adjust for terminal font aspect ratio
      const dx = x - originX
      const dy = (y - originY) * 2.2
      const d = Math.sqrt(dx * dx + dy * dy)
      
      // Calculate wave value
      const val = Math.sin(d * 0.25 - frame * 0.4)
      const colorIndex = Math.floor(((val + 1) / 2) * (colors.length - 0.01))
      const bgColor = colors[colorIndex]!
      
      let char = ' '
      let isTextChar = false
      if (text && x >= startX && x < startX + textLength) {
        char = text[x - startX]!
        isTextChar = true
      }
      
      cells.push({ char, bgColor, isTextChar })
    }
    rowsList.push(cells)
  }
  
  return (
    <Box flexDirection="column" borderStyle="single" borderColor="ansi:cyan" paddingX={1} paddingY={0} marginBottom={1}>
      {rowsList.map((row, y) => (
        <Box key={y} flexDirection="row">
          {row.map((cell, x) => {
            const fgColor = cell.isTextChar ? '#ffffff' : undefined
            return (
              <Text
                key={x}
                backgroundColor={cell.bgColor as any}
                color={fgColor as any}
                bold={cell.isTextChar}
              >
                {cell.char}
              </Text>
            )
          })}
        </Box>
      ))}
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
