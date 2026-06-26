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
  PROJECT_ROOT="$(pwd)"
else
  # Clone repository
  REPO_URL="https://github.com/angyedz/ultimate-claude.git"
  PROJECT_DIR="ultimate-claude"
  if [ -d "$PROJECT_DIR" ]; then
    echo "Directory $PROJECT_DIR already exists. Pulling latest changes..."
    cd "$PROJECT_DIR"
  else
    git clone "$REPO_URL"
    cd "$PROJECT_DIR"
  fi
  # Always pull to get the latest commits
  git pull
  PROJECT_ROOT="$(pwd)"
fi

# Install dependencies (prefer bun for speed, fallback to npm)
if command -v bun >/dev/null 2>&1; then
  bun install
elif command -v npm >/dev/null 2>&1; then
  npm install
else
  echo "Neither bun nor npm is available. Please install one of them."
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

# Create wrapper script.
# IMPORTANT: bake the absolute PROJECT_ROOT in at install time (via unquoted
# heredoc EOS) so the wrapper works from any working directory at runtime.
WRAPPER="$BIN_DIR/ultimate-claude"
cat > "$WRAPPER" <<EOS
#!/usr/bin/env bash
# Absolute path to the ultimate-claude project (recorded at install time)
PROJECT_ROOT="${PROJECT_ROOT}"

if [ ! -d "\${PROJECT_ROOT}" ]; then
  echo "Error: project directory not found: \${PROJECT_ROOT}"
  echo "Re-run the installer to fix this."
  exit 1
fi

# Run the pre-built CLI bundle directly — no npm/bun overhead at launch
exec node "\${PROJECT_ROOT}/dist/cli.mjs" "\$@"
EOS
chmod +x "$WRAPPER"

echo "Installed → $WRAPPER"
echo "  Project root: $PROJECT_ROOT"

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

echo ""
echo "✓ Done! Run: ultimate-claude"
echo "  (you may need to restart your shell or run: source ${RCFILE:-~/.bashrc})"
