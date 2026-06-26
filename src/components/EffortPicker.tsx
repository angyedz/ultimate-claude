import { useState, useEffect, useCallback } from 'react'
import { Box, Text, useInput } from '../ink.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import { useMainLoopModel } from '../hooks/useMainLoopModel.js'
import { useAppState, useSetAppState } from '../state/AppState.js'
import type { EffortLevel } from '../utils/effort.js'
import {
  getAvailableEffortLevels,
  getDisplayedEffortLevel,
  getEffortLevelDescription,
  isOpenAIEffortLevel,
  modelSupportsEffort,
  modelUsesOpenAIEffort,
  openAIEffortToStandard,
} from '../utils/effort.js'
import { getAPIProvider } from '../utils/model/providers.js'
import { getReasoningEffortForModel } from '../services/api/providerConfig.js'
import { getRainbowColor } from '../utils/thinking.js'

type EffortOption = {
  value: string
  description: string
}

type Props = {
  onSelect: (effort: EffortLevel | undefined) => void
  onCancel?: () => void
}

// Purple color palette for the animated wave
const WAVE_PALETTE = [
  '#0d001a',
  '#1a0033',
  '#2d004d',
  '#3d0070',
  '#5200a0',
  '#6600cc',
  '#7b00e0',
  '#9000f0',
  '#a020f0',
  '#b44df0',
  '#c875ff',
  '#8b00ff',
  '#6600cc',
  '#4b0082',
  '#2d004d',
] as const

function buildWaveRow(widthCells: number, rowY: number, frame: number): Array<{ char: string; color: string }> {
  const cells: Array<{ char: string; color: string }> = []
  for (let x = 0; x < widthCells; x++) {
    // Traveling wave: combination of two sine waves for a shimmering effect
    const wave1 = Math.sin(x * 0.35 - frame * 0.5 + rowY * 1.1)
    const wave2 = Math.sin(x * 0.15 + frame * 0.3 - rowY * 0.7)
    const combined = (wave1 + wave2 + 2) / 4 // normalize to [0, 1]
    const idx = Math.floor(combined * WAVE_PALETTE.length) % WAVE_PALETTE.length
    cells.push({ char: '█', color: WAVE_PALETTE[idx]! })
  }
  return cells
}

// Renders one row of the wave, grouping consecutive same-color chars for fewer React nodes
function WaveRow({ widthCells, rowY, frame }: { widthCells: number; rowY: number; frame: number }) {
  const cells = buildWaveRow(widthCells, rowY, frame)

  // Group consecutive same-color cells into spans
  const spans: Array<{ text: string; color: string }> = []
  for (const cell of cells) {
    const last = spans[spans.length - 1]
    if (last && last.color === cell.color) {
      last.text += cell.char
    } else {
      spans.push({ text: cell.char, color: cell.color })
    }
  }

  return (
    <Box flexDirection="row">
      {spans.map((span, i) => (
        <Text key={i} color={span.color as any}>{span.text}</Text>
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
  const rawAvailableLevels = getAvailableEffortLevels(model)
  const availableLevels = Array.from(new Set(rawAvailableLevels.map(lvl => lvl === 'xhigh' ? 'max' : lvl)))
  const currentDisplayedLevel = getDisplayedEffortLevel(model, appStateEffort)
  const supportsEffort = modelSupportsEffort(model)

  const modelReasoningEffort = usesOpenAIEffort ? getReasoningEffortForModel(model) : undefined

  const options: EffortOption[] = [
    {
      value: 'auto',
      description: 'Use the default effort level for your model',
    },
    ...availableLevels.map(level => ({
      value: level,
      description: getEffortLevelDescription(level as EffortLevel),
    })),
  ]

  if (availableLevels.length > 0) {
    options.push({
      value: 'ultracode',
      description: getEffortLevelDescription('ultracode'),
    })
  }

  const initialFocusVal = usesOpenAIEffort
    ? (appStateEffort === 'max'
        ? 'xhigh'
        : appStateEffort
          ? String(appStateEffort)
          : (modelReasoningEffort || 'auto'))
    : (appStateEffort ? String(appStateEffort) : 'auto')
  const initialFocus = initialFocusVal === 'xhigh' ? 'max' : initialFocusVal

  const [focusedIndex, setFocusedIndex] = useState(() => {
    const idx = options.findIndex(opt => opt.value === initialFocus)
    return idx >= 0 ? idx : 0
  })

  const [frame, setFrame] = useState(0)

  // Always animate — wave is always visible when ultracode zone is in view
  useEffect(() => {
    const timer = setInterval(() => setFrame(f => (f + 1) % 1000), 80)
    return () => clearInterval(timer)
  }, [])

  const handleSelect = useCallback((value: string) => {
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
  }, [setAppState, onSelect])

  useInput((input, key) => {
    if (key.leftArrow || key.upArrow) {
      setFocusedIndex(prev => (prev - 1 + options.length) % options.length)
    } else if (key.rightArrow || key.downArrow) {
      setFocusedIndex(prev => (prev + 1) % options.length)
    } else if (key.return) {
      handleSelect(options[focusedIndex]!.value)
    } else if (key.escape) {
      onCancel?.()
    }
  })

  const n = options.length
  // Leave 4 chars margin each side
  const sliderWidth = Math.min(columns - 8, 78)
  const slotWidth = Math.floor(sliderWidth / n)

  const focused = options[focusedIndex]!
  const isFocusedUltracode = focused.value === 'ultracode'

  // Where the purple wave starts — from xhigh or ~60% if no xhigh
  const purpleStartIndex = Math.max(
    options.findIndex(o => o.value === 'xhigh' || o.value === 'max'),
    Math.floor(n * 0.6)
  )
  const purpleStartCol = purpleStartIndex * slotWidth
  const purpleWidth = sliderWidth - purpleStartCol

  // Triangle indicator column (centered on the focused option text)
  const indicatorCol = focusedIndex * slotWidth + Math.floor(focused.value.length / 2)

  // Height of the wave block area (rows above the line)
  const WAVE_HEIGHT = 3

  return (
    <Box flexDirection="column" paddingTop={1} paddingLeft={2}>
      {/* Header */}
      <Box marginBottom={1} flexDirection="row" gap={2}>
        <Text bold color="white">Effort</Text>
        <Text dimColor>
          {supportsEffort && usesOpenAIEffort
            ? `OpenAI/Codex (${provider})`
            : supportsEffort
            ? `Claude · ${provider}`
            : `Effort not supported for this model`}
        </Text>
      </Box>

      {/* Faster / Smarter row with wave block behind right section */}
      <Box flexDirection="row" width={sliderWidth} marginBottom={0}>
        {/* Left plain section: "Faster" label padded to purple start */}
        <Box width={purpleStartCol} flexDirection="column">
          <Box flexDirection="row" justifyContent="flex-start">
            <Text dimColor>Faster</Text>
          </Box>
          {/* Empty rows to match wave height */}
          {Array.from({ length: WAVE_HEIGHT - 1 }, (_, i) => (
            <Box key={i}><Text> </Text></Box>
          ))}
        </Box>

        {/* Right purple wave section with "Smarter" label on top */}
        <Box flexDirection="column" width={purpleWidth}>
          {/* Row 0: "Smarter" text right-aligned over the wave */}
          <Box flexDirection="row" width={purpleWidth} justifyContent="flex-end">
            <Text dimColor>Smarter</Text>
          </Box>
          {/* Wave rows 1..WAVE_HEIGHT-1 */}
          {Array.from({ length: WAVE_HEIGHT - 1 }, (_, rowY) => (
            <WaveRow key={rowY} widthCells={purpleWidth} rowY={rowY + 1} frame={frame} />
          ))}
        </Box>
      </Box>

      {/* Horizontal line */}
      <Box flexDirection="row" width={sliderWidth}>
        {Array.from({ length: sliderWidth }, (_, x) => (
          <Text key={x} dimColor>─</Text>
        ))}
      </Box>

      {/* Triangle indicator row — sits just below the slider line, pointing at option name */}
      <Box flexDirection="row" width={sliderWidth}>
        {Array.from({ length: sliderWidth }, (_, x) => {
          const isTriangle = x === indicatorCol
          return <Text key={x} color={isTriangle ? 'white' : undefined} bold={isTriangle}>{isTriangle ? '▲' : ' '}</Text>
        })}
      </Box>

      {/* Option labels row */}
      <Box flexDirection="row" width={sliderWidth} marginBottom={0}>
        {options.map((opt, i) => {
          const isFocused = i === focusedIndex
          const isCurrent = opt.value === 'auto'
            ? appStateEffort === undefined
            : currentDisplayedLevel === opt.value
          const label = opt.value

          if (label === 'max') {
            const labelText = "max"
            const paddingLength = Math.max(0, slotWidth - labelText.length)
            const paddedSpaces = " ".repeat(paddingLength)
            return (
              <Text key={opt.value} bold={isFocused}>
                {Array.from(labelText).map((char, charIdx) => {
                  const colorIdx = (charIdx + frame) % 7
                  return (
                    <Text key={charIdx} color={getRainbowColor(colorIdx) as any}>
                      {char}
                    </Text>
                  )
                })}
                <Text>{paddedSpaces}</Text>
              </Text>
            )
          }

          // Pad to slot width
          const padded = label.slice(0, slotWidth).padEnd(slotWidth)
          let col: string
          if (isFocused) col = 'white'
          else if (isCurrent) col = '#888'
          else col = '#555'
          return (
            <Text key={opt.value} color={col as any} bold={isFocused}>
              {padded}
            </Text>
          )
        })}
      </Box>

      {/* Sub-label for ultracode */}
      {isFocusedUltracode && (
        <Box paddingLeft={Math.max(0, (options.length - 1) * slotWidth)} marginBottom={0}>
          <Text dimColor>xhigh + workflows</Text>
        </Box>
      )}

      {/* Description */}
      <Box marginTop={1} marginBottom={1}>
        <Text italic color="cyan">{focused.description}</Text>
      </Box>

      {/* Keyboard hint */}
      <Box>
        <Text dimColor>←/→ to adjust · Enter to confirm · Esc to cancel</Text>
      </Box>
    </Box>
  )
}

// Single cell in the purple wave zone (for the triangle row)
function WaveCell({ x, frame, char }: { x: number; frame: number; char: string }) {
  const wave1 = Math.sin(x * 0.35 - frame * 0.5)
  const wave2 = Math.sin(x * 0.15 + frame * 0.3)
  const combined = (wave1 + wave2 + 2) / 4
  const idx = Math.floor(combined * WAVE_PALETTE.length) % WAVE_PALETTE.length
  return <Text color={WAVE_PALETTE[idx]! as any}>{char === ' ' ? '█' : char}</Text>
}
