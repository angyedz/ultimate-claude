#!/usr/bin/env bash
set -euo pipefail

# Simple installer for Ultimate Claude on macOS/Linux
# Requirements: git, curl, Node.js (v22+), npm or bun

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
die() { echo "Error: $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Check required commands
# ---------------------------------------------------------------------------
for cmd in git curl node; do
  command -v "$cmd" >/dev/null 2>&1 || die "$cmd is not installed. Please install it before proceeding."
done

# Node >= 22 required
NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
[ "$NODE_MAJOR" -ge 22 ] || die "Node.js v22+ required (found v$(node --version | tr -d v))"

# ---------------------------------------------------------------------------
# Clone / pull
# ---------------------------------------------------------------------------
if [ -f "package.json" ] && grep -q "ultimate-claude" package.json 2>/dev/null; then
  echo "Detected existing repository – using current directory."
  PROJECT_ROOT="$(pwd)"
else
  REPO_URL="https://github.com/angyedz/ultimate-claude.git"
  PROJECT_DIR="ultimate-claude"

  if [ -d "$PROJECT_DIR/.git" ]; then
    echo "Directory $PROJECT_DIR already exists. Pulling latest changes..."
    cd "$PROJECT_DIR"
    git pull
  elif [ -d "$PROJECT_DIR" ]; then
    die "Directory '$PROJECT_DIR' exists but is not a git repository. Remove it and re-run."
  else
    git clone "$REPO_URL"
    cd "$PROJECT_DIR"
  fi

  PROJECT_ROOT="$(pwd)"
fi

# ---------------------------------------------------------------------------
# Install dependencies
# ---------------------------------------------------------------------------
if command -v bun >/dev/null 2>&1; then
  bun install
elif command -v npm >/dev/null 2>&1; then
  npm install
  # If bun is not available globally, install it locally via npm to run the build script
  if ! command -v bun >/dev/null 2>&1; then
    echo "Bun is required for building. Installing bun locally via npm..."
    npm install --no-save bun
  fi
else
  die "Neither bun nor npm is available. Please install one of them."
fi

# ---------------------------------------------------------------------------
# Build (creates dist/cli.mjs)
# ---------------------------------------------------------------------------
if command -v bun >/dev/null 2>&1; then
  bun run build
else
  npm run build
fi

[ -f "$PROJECT_ROOT/dist/cli.mjs" ] || die "Build succeeded but dist/cli.mjs is missing."

echo ""
echo "Installation and build complete."

# ---------------------------------------------------------------------------
# Install wrapper to ~/.local/bin
# IMPORTANT: the heredoc is UNQUOTED (<<EOS) so $PROJECT_ROOT is substituted
# at install time — the wrapper therefore works from any CWD at runtime.
# ---------------------------------------------------------------------------
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

WRAPPER="$BIN_DIR/ultimate-claude"
cat > "$WRAPPER" <<EOS
#!/usr/bin/env bash
# Absolute path to the project — recorded at install time.
PROJECT_ROOT="${PROJECT_ROOT}"

if [ ! -d "\${PROJECT_ROOT}" ]; then
  echo "ultimate-claude: project directory not found: \${PROJECT_ROOT}" >&2
  echo "Re-run the installer to fix this." >&2
  exit 1
fi

if [ ! -f "\${PROJECT_ROOT}/dist/cli.mjs" ]; then
  echo "ultimate-claude: dist/cli.mjs not found. Re-run the installer to rebuild." >&2
  exit 1
fi

# Delegate to the real launcher (bin/ultimate-claude) which handles the
# --max-old-space-size / --expose-gc heap-relaunch logic for long sessions.
exec node "\${PROJECT_ROOT}/bin/ultimate-claude" "\$@"
EOS
chmod +x "$WRAPPER"

echo "Installed → $WRAPPER"
echo "  Project root: $PROJECT_ROOT"

# ---------------------------------------------------------------------------
# Add BIN_DIR to PATH
# ---------------------------------------------------------------------------
RCFILE=""
if [ -n "${SHELL:-}" ]; then
  case "$SHELL" in
    */bash)   RCFILE="$HOME/.bashrc" ;;
    */zsh)    RCFILE="$HOME/.zshrc" ;;
    */fish)   RCFILE="$HOME/.config/fish/config.fish" ;;
  esac
fi

if [ -n "$RCFILE" ]; then
  if [[ "$RCFILE" == *.fish ]]; then
    grep -Fxq "set -gx PATH $BIN_DIR \$PATH" "$RCFILE" 2>/dev/null || {
      echo "set -gx PATH $BIN_DIR \$PATH" >> "$RCFILE"
      echo "Added $BIN_DIR to PATH in $RCFILE"
    }
  else
    grep -Fxq "export PATH=\"$BIN_DIR:\$PATH\"" "$RCFILE" 2>/dev/null || {
      echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$RCFILE"
      echo "Added $BIN_DIR to PATH in $RCFILE"
    }
  fi
else
  echo "Add $BIN_DIR to your PATH manually to run 'ultimate-claude' from any location."
fi

echo ""
echo "✓ Done! Run: ultimate-claude"
if [ -n "$RCFILE" ]; then
  echo "  (you may need to restart your shell or run: source \"$RCFILE\")"
fi
