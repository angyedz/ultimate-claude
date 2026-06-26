#!/usr/bin/env bash
set -e

# Simple installer for Ultimate Claude on macOS/Linux
# Requirements: git, curl, Node.js (v18+), npm or bun

# Check for required commands
for cmd in git curl node; do
  if ! command -v $cmd >/dev/null 2>&1; then
    echo "Error: $cmd is not installed. Please install it before proceeding."
    exit 1
  fi
done

# Detect if we are already inside the repository
if [ -f "package.json" ] && grep -q "ultimate-claude" package.json; then
  echo "Detected existing repository – using current directory."
else
  # Clone repository (replace with actual URL if different)
  REPO_URL="https://github.com/angyedz/ultimate-claude.git"
  PROJECT_DIR="ultimate-claude"
  if [ -d "$PROJECT_DIR" ]; then
    echo "Directory $PROJECT_DIR already exists. Pulling latest changes..."
    cd "$PROJECT_DIR"
    git pull
  else
    git clone "$REPO_URL"
    cd "$PROJECT_DIR"
  fi
fi

# Install dependencies (npm preferred, fallback to bun)
if command -v npm >/dev/null 2>&1; then
  npm install
elif command -v bun >/dev/null 2>&1; then
  bun install
else
  echo "Neither npm nor bun is available. Please install one of them."
  exit 1
fi

# Build the project (creates dist/cli.mjs)
if command -v bun >/dev/null 2>&1; then
  bun run build
else
  npm run build
fi

echo "Installation and build complete."

# Determine bin directory (default to ~/.local/bin)
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

# Create wrapper script
WRAPPER="$BIN_DIR/ultimate-claude"
cat > "$WRAPPER" <<'EOS'
#!/usr/bin/env bash
# Resolve script directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Change to project root (assumes script located in repo root's bin)
PROJECT_ROOT="$(cd "${DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"
# Prefer npm, fallback to bun
if command -v npm >/dev/null 2>&1; then
  npm run start "$@"
elif command -v bun >/dev/null 2>&1; then
  bun run start "$@"
else
  echo "Neither npm nor bun is available. Install one to run Ultimate Claude."
  exit 1
fi
EOS
chmod +x "$WRAPPER"

echo "A wrapper script has been installed to $WRAPPER"

# Add BIN_DIR to PATH in common shell rc files
if [ -n "$SHELL" ]; then
  case "$SHELL" in
    */bash)   RCFILE="$HOME/.bashrc" ;;
    */zsh)    RCFILE="$HOME/.zshrc" ;;
    */fish)   RCFILE="$HOME/.config/fish/config.fish" ;;
    *)        RCFILE="" ;;
  esac
fi

if [ -n "$RCFILE" ]; then
  if [[ "$RCFILE" == *.fish ]]; then
    if ! grep -Fxq "set -gx PATH $BIN_DIR \$PATH" "$RCFILE"; then
      echo "set -gx PATH $BIN_DIR \$PATH" >> "$RCFILE"
      echo "Added $BIN_DIR to PATH in $RCFILE"
    fi
  else
    if ! grep -Fxq "export PATH=\"$BIN_DIR:\$PATH\"" "$RCFILE"; then
      echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$RCFILE"
      echo "Added $BIN_DIR to PATH in $RCFILE"
    fi
  fi
else
  echo "Add $BIN_DIR to your PATH manually to run 'ultimate-claude' from any location."
fi
