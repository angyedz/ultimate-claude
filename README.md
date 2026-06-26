# Ultimate Claude

![Ultimate Claude mascot](https://raw.githubusercontent.com/angyedz/ultimate-claude/main/assets/mascot.png)

## Overview

**Ultimate Claude** is a modern AI‑powered coding assistant that streamlines development with intelligent code generation, context‑aware suggestions, and deep analysis capabilities. It combines the best of Claude Code and OpenClaude, delivering a polished, vibrant command‑line experience.

- **Stunning UI** – Gradient glass‑morphism, smooth micro‑animations, and a friendly mascot.
- **Effort Modes** – Choose between `low`, `medium`, `high`, `extra high`, and the exhaustive **`ultracode`** for maximum reasoning depth.
- **Keyboard‑First Navigation** – Seamless arrow‑key selection with animated feedback.
- **Extensible Architecture** – Built with TypeScript and the `ink` library, easy to extend with custom commands.

### Source Repositories
- Claude Code: https://github.com/codeaashu/claude-code
- OpenClaude: https://github.com/Gitlawb/openclaude

## Features

| Feature | Description |
|--------|-------------|
| **Ultracode Mode** | Pushes the model to its maximum token budget, delivering exhaustive reasoning and multiple solution paths. |
| **Horizontal Effort Picker** | A sleek, animated selector that replaces the old vertical list, offering instant visual feedback. |
| **Custom Theme** | Tailored color scheme with vibrant gradients and dark‑mode support for a premium look. |
| **Extensible CLI** | Easy to add new commands or integrate with other services. |
| **Cross‑Platform** | Works on macOS, Linux, and Windows (via Node.js). |

## Getting Started

### Prerequisites

- **Node.js** (v18 or later) with **npm** or **bun**.
- **Git** installed and available in your `PATH`.

## Quick Start

**One‑line installers**

- macOS / Linux:

```sh
curl -fsSL https://raw.githubusercontent.com/angyedz/ultimate-claude/main/install.sh | bash
```

- Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/angyedz/ultimate-claude/main/install.ps1 | iex
```

You can now launch Ultimate Claude from any terminal with:

```sh
ultimate-claude
```

## Manual Installation

```bash
# Clone the repository
git clone https://github.com/angyedz/ultimate-claude.git
cd ultimate-claude

# Install dependencies
npm install   # or `bun install`
```


```bash
# Clone the repository (once we have a remote)
# git clone https://github.com/your-org/ultimate-claude.git
# cd ultimate-claude

# Install dependencies
npm install   # or `bun install`
```

**One‑line installers**

- macOS / Linux:

```sh
curl -fsSL https://raw.githubusercontent.com/angyedz/ultimate-claude/main/install.sh | bash
```

- Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/angyedz/ultimate-claude/main/install.ps1 | iex
```


```bash
# Clone the repository (once we have a remote)
# git clone https://github.com/angyedz/ultimate-claude.git
# cd ultimate-claude

# Install dependencies
npm install   # or `bun install`
```

### Running the CLI

```bash
# Start the interactive UI
npm run start   # or `bun run start`
```

Use the left and right arrow keys to select an effort level. Press **Enter** to confirm. The `ultracode` level will produce the most extensive output.

## Project Structure

```
ultimate-claude/
├─ src/
│  ├─ components/          # UI components (EffortPicker, etc.)
│  ├─ services/api/        # API wrappers for Claude endpoints
│  ├─ utils/               # Helper utilities (effort logic, theming)
│  └─ cli/                 # Command‑line entry points
├─ assets/                 # Images, mascot, icons
├─ README.md               # You're reading it!
└─ package.json            # Project metadata and scripts
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Make your changes, ensuring the code passes all tests (`npm test`).
4. Submit a pull request with a clear description of the changes.

### Development Guidelines

- **Styling** – Keep the UI vibrant but accessible; use the defined color tokens.
- **Testing** – Add unit tests for new logic and UI components.
- **Documentation** – Update the README and inline JSDoc comments for any public APIs.

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

