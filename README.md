# Ultimate Claude

![Ultimate Claude mascot](https://raw.githubusercontent.com/your-repo/ultimate-claude/main/assets/mascot.png)

## Overview

**Ultimate Claude** is a next‑generation AI‑assisted coding companion that builds on the classic OpenClaude experience. It features a bold, vibrant UI, a powerful **Ultracode** reasoning mode for deep, exhaustive analysis, and a sleek horizontal effort selector that can be navigated entirely with the keyboard.

- **Vibrant Visuals** – Custom color palettes, gradient glass‑morphism, smooth micro‑animations, and a mascot that brings personality to the terminal.
- **Effort Levels** – `quick`, `balanced`, `deep`, and the newly introduced **`ultracode`** which forces the model to think as much as possible, providing the most thorough suggestions.
- **Keyboard‑Friendly UI** – The effort selector is linear and fully navigable with arrow keys, complete with a shimmering animated cursor.
- **Modular Architecture** – Written in TypeScript, using the `ink` library for a rich CLI experience.

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

### Installation

```bash
# Clone the repository (once we have a remote)
# git clone https://github.com/your-org/ultimate-claude.git
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

*Generated with love by the Antigravity AI assistant.*
