Write-Host "Installing Ultimate Claude on Windows..."

# Configuration
$repoUrl = "https://github.com/angyedz/ultimate-claude.git"
$installDir = "$env:ProgramFiles\UltimateClaude"

# Ensure install directory exists
if (-Not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Clone or update repository
if (Test-Path "$installDir\.git") {
    Write-Host "Repository exists, pulling latest changes..."
    Set-Location $installDir
    git pull
} else {
    Write-Host "Cloning repository..."
    git clone $repoUrl $installDir
    Set-Location $installDir
}

# Install Node.js dependencies (npm preferred, fallback to bun)
if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm install
} elseif (Get-Command bun -ErrorAction SilentlyContinue) {
    bun install
} else {
    Write-Error "Neither npm nor bun is installed. Please install Node.js (v18+) and try again."
    exit 1
}

# Create a wrapper script in a directory that is likely on PATH
$binDir = "$env:USERPROFILE\bin"
if (-Not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir -Force | Out-Null
}
$wrapperPath = "$binDir\ultimate-claude.ps1"
@"
#!/usr/bin/env pwsh
Set-Location -Path '$installDir'
if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm run start @args
} elseif (Get-Command bun -ErrorAction SilentlyContinue) {
    bun run start @args
} else {
    Write-Error 'Neither npm nor bun is available.'
    exit 1
}
"@ | Set-Content -Path $wrapperPath -Encoding UTF8
# Ensure the wrapper is executable
Set-ItemProperty -Path $wrapperPath -Name IsReadOnly -Value $false
Write-Host "Wrapper script created at $wrapperPath"

# Add bin directory to user's PATH if not already present
$profilePath = "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
if (-Not (Test-Path $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
}
$pathAddition = "`n# Added by Ultimate Claude installer`n`$env:Path = `"$binDir;`$env:Path`""
if (-Not (Select-String -Path $profilePath -Pattern $binDir -SimpleMatch)) {
    Add-Content -Path $profilePath -Value $pathAddition
    Write-Host "Added $binDir to PATH in PowerShell profile. Restart your terminal to apply."
}

Write-Host "Installation complete! You can now run 'ultimate-claude' from any PowerShell terminal."
