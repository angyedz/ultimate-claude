import type { Command, LocalCommandCall } from '../types/command.js'

const call: LocalCommandCall = async () => {
  const displayVer = MACRO.DISPLAY_VERSION ?? MACRO.VERSION
  return {
    type: 'text',
    value: MACRO.BUILD_TIME
      ? `${displayVer} (based on Claude Code 0.20.1, built ${MACRO.BUILD_TIME})`
      : `${displayVer} (based on Claude Code 0.20.1)`,
  }
}

const version = {
  type: 'local',
  name: 'version',
  description:
    'Print the version this session is running (not what autoupdate downloaded)',
  isEnabled: () => process.env.USER_TYPE === 'ant',
  supportsNonInteractive: true,
  load: () => Promise.resolve({ call }),
} satisfies Command

export default version
