![Ultimate Claude mascot](https://raw.githubusercontent.com/angyedz/ultimate-claude/main/assets/mascot.png)

# Ultimate Claude

## Overview

**Ultimate Claude** is a high-efficiency, fully private, and telemetry-free AI-powered coding assistant that brings elite development workflows directly to your terminal. Combining the robust capabilities of Claude Code and OpenClaude, it is designed from the ground up to offer **maximum customization, extreme ease of use, and lightning-fast developer efficiency**.

- **Maximum Customization** – Seamlessly switch between Anthropic, DeepSeek, OpenAI, Gemini, and local providers. Easily configure rules, agents, and install modular skills directly from Git.
- **Privacy First** – Fully telemetry-free. No phone-home, no background data leakage, and complete control over your session histories.
- **Effort Modes on Demand** – Fine-tune reasoning budgets with a simple key press—ranging from `low`, `medium`, and `high` to the exhaustive, deep-thinking **`max`** and **`ultracode`** levels for complex refactorings.
- **Elite Keyboard UX** – Interactive horizontal effort sliders, inline auto-completions, and Right-Arrow / Tab acceptance make navigation feel fluid and natural.

### Source Repositories
- Claude Code: https://github.com/codeaashu/claude-code
- OpenClaude: https://github.com/Gitlawb/openclaude

---

## Features

| Feature | Focus | Description |
| :--- | :--- | :--- |
| **Exhaustive Reasoning** | Efficiency | **Ultracode** & **Max** effort levels give models maximum token budgets to explore multiple code pathways, catching edge cases before you compile. |
| **Interactive Git Skills** | Customization | Install modular, custom command packages directly from any `.git` repository url inside the `/skills` menu. |
| **Multi-Provider Support** | Customization | First-class integration with Anthropic, DeepSeek, Gemini, OpenAI, and local runners (Ollama / Llama.cpp) in just one command. |
| **Memory Control** | Ease of Use | Edit, review, and clear what the AI remembers about your preferences and project rules via the `/memory` command. |
| **Offline Changelogs** | Efficiency | Startup updates and recent release notes load instantly from a local file without sending outbound telemetry queries. |

---

## Getting Started

### Prerequisites

- **Node.js** (v22 or later)
- **Bun** or **npm** installed on your system
- **Git** configured and accessible in your shell environment

---

## Quick Start

Get up and running immediately using our automated one-line installers:

- **macOS / Linux**:
  ```sh
  curl -fsSL https://raw.githubusercontent.com/angyedz/ultimate-claude/main/install.sh | bash
  ```

- **Windows (PowerShell)**:
  ```powershell
  irm https://raw.githubusercontent.com/angyedz/ultimate-claude/main/install.ps1 | iex
  ```

Once installed, start ultimate-claude in any repository directory using:
```sh
ultimate-claude
```

---

## Manual Installation

To build and run ultimate-claude locally for development:

```bash
# 1. Clone the repository
git clone https://github.com/angyedz/ultimate-claude.git
cd ultimate-claude

# 2. Install dependencies
bun install # or `npm install`

# 3. Build the project
bun run build # or `npm run build`
```

### Running the CLI

Start the interactive coding environment:
```bash
bun run start # or `npm run start`
```

---

## Project Structure

```
ultimate-claude/
├── src/
│   ├── components/       # Stateful Ink terminal UI components (EffortPicker, SkillsMenu)
│   ├── services/api/     # API transporters, shims, and model route controllers
│   ├── utils/            # Shared utilities (local memory, changelogs, autocompletion)
│   └── cli/              # Main process, terminal handlers, and CLI commands
├── assets/               # Branding assets, mascot images, and design graphics
├── updates.json          # Local offline changelog history
├── package.json          # Dependency definition and packaging scripts
└── README.md             # This documentation
```

---

## Contributing

We love contributions! Follow these steps to improve the assistant:

1. Fork this repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Make changes and verify they compile and pass type checks (`bun run typecheck`).
4. Commit your work and open a Pull Request explaining the enhancements.

### Development Guidelines

- **Keep It Private** – Do not add external trackers, analytics, or telephone-home endpoints.
- **Maintain Performance** – Optimize rendering pathways to keep terminal interface repaints fast and flicker-free.
- **Consistent Code** – Document any new custom commands or skills with clear instructions.

---

## License

This project is distributed under the **MIT License**. Check out `LICENSE` for details.
