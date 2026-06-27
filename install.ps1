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
    git -c core.protectNTFS=false pull
} else {
    Write-Host "Cloning repository..."
    # core.protectNTFS=false allows git to skip invalid Windows paths (e.g. paths with colons)
    # without aborting the entire checkout
    git -c core.protectNTFS=false clone $repoUrl $installDir
    Set-Location $installDir
}

# Ensure package.json exists (checkout may have partially failed on some files)
if (-Not (Test-Path "$installDir\package.json")) {
    Write-Host "Recovering checkout..."
    Set-Location $installDir
    git -c core.protectNTFS=false checkout HEAD -- .
}

# Final check — abort if package.json still missing
if (-Not (Test-Path "$installDir\package.json")) {
    Write-Error "Checkout failed: package.json not found in $installDir. Please report this issue."
    exit 1
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
