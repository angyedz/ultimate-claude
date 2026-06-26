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

type EffortOption = {
  value: string
  description: string
  isAvailable: boolean
}

type Props = {
  onSelect: (effort: EffortLevel | undefined) => void
  onCancel?: () => void
}

// Purple pixel wave pattern — a 7-column wide pixelated noise field
// animated by shifting rows per frame. Covers the ultracode zone.
function UltracodeWave({ frameCount, widthCells, height }: { frameCount: number; widthCells: number; height: number }) {
  // Build a simple pseudo-random purple/violet pixel matrix that scrolls
  const palette = [
    '#1a0040',
    '#2d006e',
    '#3d0098',
    '#5200c8',
    '#6b00f0',
    '#8a2be2',
    '#9932cc',
    '#b44df0',
    '#c875ff',
    '#7b00d4',
    '#4b0082',
  ] as const

  const rows: string[][] = []
  for (let y = 0; y < height; y++) {
    const cells: string[] = []
    for (let x = 0; x < widthCells; x++) {
      // pseudo-random but deterministic per cell; animated by frame offset
      const seed = (x * 17 + y * 31 + frameCount * 7) % 256
      const noiseVal = (Math.sin(seed * 2.39996) + 1) / 2
      const idx = Math.floor(noiseVal * palette.length) % palette.length
      cells.push(palette[idx]!)
    }
    rows.push(cells)
  }

  return (
    <Box flexDirection="column">
      {rows.map((row, y) => (
        <Box key={y} flexDirection="row">
          {row.map((bg, x) => (
            <Text key={x} backgroundColor={bg as any}> </Text>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export function EffortPicker({ onSelect, onCancel }: Props) {
  const model = useMainLoopModel()
  const appStateEffort = useAppState((s: any) => s.effortValue)
  const setAppState = useSetAppState()
  const { columns } = useTerminalSize()
  const provider = getAPIProvider()
  const usesOpenAIEffort = modelUsesOpenAIEffort(model)
  const availableLevels = getAvailableEffortLevels(model)
  const currentDisplayedLevel = getDisplayedEffortLevel(model, appStateEffort)
  const supportsEffort = modelSupportsEffort(model)

  const modelReasoningEffort = usesOpenAIEffort ? getReasoningEffortForModel(model) : undefined

  const options: EffortOption[] = [
    {
      value: 'auto',
      description: 'Use the default effort level for your model',
      isAvailable: true,
    },
    ...availableLevels.map(level => ({
      value: level,
      description: getEffortLevelDescription(level as EffortLevel),
      isAvailable: true,
    })),
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

  const [animFrame, setAnimFrame] = useState(0)
  const isUltracodeSelected = options[focusedIndex]?.value === 'ultracode'

  useEffect(() => {
    const timer = setInterval(() => setAnimFrame(f => f + 1), 80)
    return () => clearInterval(timer)
  }, [])

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
      setAppState(prev => ({ ...prev, effortValue: undefined }))
      onSelect(undefined)
    } else {
      const effortLevel = isOpenAIEffortLevel(value)
        ? openAIEffortToStandard(value)
        : (value as EffortLevel)
      setAppState(prev => ({ ...prev, effortValue: effortLevel }))
      onSelect(effortLevel)
    }
  }

  function handleCancel() {
    onCancel?.()
  }

  const n = options.length
  // How many terminal columns the slider occupies
  const sliderWidth = Math.min(columns - 4, 80)
  // Width of each option slot
  const slotWidth = Math.floor(sliderWidth / n)

  // Current option label and sub-label
  const focused = options[focusedIndex]!
  const subLabel = focused.value === 'ultracode' ? 'xhigh + workflows' : undefined

  // For the ultracode purple block: it covers the right portion of the slider
  // starting from the xhigh position to the right edge
  const ultracodeIndex = options.findIndex(o => o.value === 'ultracode')
  const xhighIndex = options.findIndex(o => o.value === 'xhigh' || o.value === 'max')
  // Start of the purple zone (from xhigh onward if exists, else 60%)
  const purpleStartSlot = xhighIndex >= 0 ? xhighIndex : Math.floor(n * 0.6)
  const purpleWidthCells = sliderWidth - purpleStartSlot * slotWidth

  // Indicator triangle column position
  const indicatorCol = focusedIndex * slotWidth + Math.floor(slotWidth / 2)

  return (
    <Box flexDirection="column" paddingTop={1}>
      {/* Header */}
      <Box marginBottom={1} flexDirection="row" gap={2}>
        <Text bold color="white">Effort</Text>
        <Text dimColor>
          {supportsEffort && usesOpenAIEffort
            ? `OpenAI/Codex (${provider})`
            : supportsEffort
            ? `Claude · ${provider}`
            : `Effort not supported`}
        </Text>
      </Box>

      {/* Faster / Smarter labels */}
      <Box width={sliderWidth} flexDirection="row" justifyContent="space-between" marginBottom={0}>
        <Text dimColor>Faster</Text>
        <Text dimColor>Smarter</Text>
      </Box>

      {/* Purple pixel wave zone — absolutely positioned to right portion */}
      <Box flexDirection="row" width={sliderWidth} position="relative" marginBottom={0}>
        {/* Empty left portion */}
        <Box width={purpleStartSlot * slotWidth} flexDirection="column">
          {/* Indicator triangle row */}
          <Box flexDirection="row">
            {Array.from({ length: purpleStartSlot * slotWidth }, (_, i) => {
              const isIndicator = i === indicatorCol && indicatorCol < purpleStartSlot * slotWidth
              return (
                <Text key={i} color={isIndicator ? 'white' : undefined}>
                  {isIndicator ? '▲' : ' '}
                </Text>
              )
            })}
          </Box>
          {/* Empty space below (wave height - 1 extra rows) */}
          {Array.from({ length: 3 }, (_, row) => (
            <Box key={row} flexDirection="row">
              {Array.from({ length: purpleStartSlot * slotWidth }, (_, i) => (
                <Text key={i}> </Text>
              ))}
            </Box>
          ))}
        </Box>

        {/* Purple animated wave covering right portion */}
        {purpleWidthCells > 0 && (
          <Box flexDirection="column">
            {/* Triangle row within wave zone */}
            <Box flexDirection="row">
              {Array.from({ length: purpleWidthCells }, (_, i) => {
                const globalCol = purpleStartSlot * slotWidth + i
                const isIndicator = globalCol === indicatorCol
                return (
                  <Text
                    key={i}
                    backgroundColor={isIndicator ? undefined : ('#3d0098' as any)}
                    color={isIndicator ? 'white' : undefined}
                    bold={isIndicator}
                  >
                    {isIndicator ? '▲' : ' '}
                  </Text>
                )
              })}
            </Box>
            {/* Wave rows */}
            <UltracodeWave frameCount={animFrame} widthCells={purpleWidthCells} height={3} />
          </Box>
        )}
      </Box>

      {/* Horizontal line */}
      <Box flexDirection="row" width={sliderWidth} marginBottom={0}>
        <Text dimColor>{'─'.repeat(sliderWidth)}</Text>
      </Box>

      {/* Option labels row */}
      <Box flexDirection="row" width={sliderWidth} marginBottom={1}>
        {options.map((opt, i) => {
          const isFocused = i === focusedIndex
          const label = opt.value === 'auto' ? 'auto' : opt.value === 'ultracode' ? 'ultracode' : opt.value
          const paddedLabel = label.padEnd(slotWidth).slice(0, slotWidth)
          return (
            <Text
              key={opt.value}
              bold={isFocused}
              color={isFocused ? 'white' : ('gray' as any)}
            >
              {paddedLabel}
            </Text>
          )
        })}
      </Box>

      {/* Sub-label for ultracode */}
      {subLabel && (
        <Box marginBottom={0} paddingLeft={Math.max(0, ultracodeIndex * slotWidth)}>
          <Text dimColor>{subLabel}</Text>
        </Box>
      )}

      {/* Description */}
      <Box marginBottom={1}>
        <Text italic color="cyan">{focused.description}</Text>
      </Box>

      {/* Keyboard hint */}
      <Box>
        <Text dimColor>←/→ to adjust · Enter to confirm · Esc to cancel</Text>
      </Box>
    </Box>
  )
}
