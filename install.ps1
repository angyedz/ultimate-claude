Write-Host "Installing Ultimate Claude on Windows..."

# Configuration
$repoUrl = "https://github.com/angyedz/ultimate-claude.git"

# Determine install directory based on privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
    $installDir = "$env:ProgramFiles\UltimateClaude"
} else {
    $installDir = "$env:LOCALAPPDATA\UltimateClaude"
    Write-Host "Running without Administrator privileges. Installing to user directory: $installDir"
}

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
    git -c core.protectNTFS=false clone $repoUrl $installDir
    Set-Location $installDir
}

# Ensure package.json exists (checkout recovery)
if (-Not (Test-Path "$installDir\package.json")) {
    Write-Host "Recovering checkout..."
    Set-Location $installDir
    git -c core.protectNTFS=false checkout HEAD -- .
}

if (-Not (Test-Path "$installDir\package.json")) {
    Write-Error "Checkout failed: package.json not found in $installDir."
    exit 1
}

# Ensure Bun is installed (needed for building scripts/build.ts)
$bunInstalled = $false
if (Get-Command bun -ErrorAction SilentlyContinue) {
    $bunInstalled = $true
} else {
    # Check if bun exists in the default User Profile location
    $localBunPath = "$env:USERPROFILE\.bun\bin"
    if (Test-Path "$localBunPath\bun.exe") {
        $env:Path = "$localBunPath;$env:Path"
        $bunInstalled = $true
    }
}

if (-not $bunInstalled) {
    Write-Host "Bun is required for building Ultimate Claude. Installing Bun..."
    try {
        # Run official Bun installer for Windows
        Invoke-Expression (Invoke-WebRequest -Uri "https://bun.sh/install.ps1" -UseBasicParsing).Content
        
        $localBunPath = "$env:USERPROFILE\.bun\bin"
        if (Test-Path "$localBunPath\bun.exe") {
            $env:Path = "$localBunPath;$env:Path"
            $bunInstalled = $true
            Write-Host "Bun installed successfully!"
        } else {
            Write-Warning "Bun installer finished but bun.exe was not found at $localBunPath."
        }
    } catch {
        Write-Warning "Failed to install Bun automatically: $_"
    }
}

# Install dependencies and build
if ($bunInstalled) {
    Write-Host "Installing dependencies using Bun..."
    bun install
    Write-Host "Building Ultimate Claude..."
    bun run build
} else {
    Write-Warning "Bun is not available. Trying fallback to npm..."
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "Installing dependencies using npm..."
        npm install
        
        # If bun is not available, try to install it locally via npm to run the build script
        Write-Host "Installing bun locally via npm to run the build script..."
        npm install --no-save bun
        
        Write-Host "Building Ultimate Claude..."
        npx bun run scripts/build.ts
    } else {
        Write-Error "Neither npm nor bun is installed. Please install Node.js (v18+) or Bun and try again."
        exit 1
    }
}

# Double check that build succeeded and dist/cli.mjs exists
if (-Not (Test-Path "$installDir\dist\cli.mjs")) {
    Write-Error "Build failed: dist\cli.mjs was not generated."
    exit 1
}

# Create a wrapper script in a directory that is likely on PATH
$binDir = "$env:USERPROFILE\bin"
if (-Not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir -Force | Out-Null
}
$wrapperPath = "$binDir\ultimate-claude.ps1"

# We launch the built cli using node directly, which avoids runtime bun dependency
$wrapperContent = @"
#!/usr/bin/env pwsh
Set-Location -Path '$installDir'
node bin/ultimate-claude @args
"@

$wrapperContent | Set-Content -Path $wrapperPath -Encoding UTF8
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

# Also add Bun to PATH in profile if it was installed by us
if ($bunInstalled -and -not (Get-Command bun -ErrorAction SilentlyContinue)) {
    $localBunPath = "$env:USERPROFILE\.bun\bin"
    $bunPathAddition = "`n# Added by Ultimate Claude installer (Bun)`n`$env:Path = `"$localBunPath;`$env:Path`""
    if (-Not (Select-String -Path $profilePath -Pattern $localBunPath -SimpleMatch)) {
        Add-Content -Path $profilePath -Value $bunPathAddition
        Write-Host "Added Bun path ($localBunPath) to PowerShell profile."
    }
}

Write-Host "Installation complete! You can now run 'ultimate-claude' from any PowerShell terminal."
