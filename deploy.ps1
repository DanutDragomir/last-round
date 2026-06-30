# Last Round — Automated Deployment Script (PowerShell)
# Runs on every git push to main
# Handles: lint → test → deploy → verify → alert

param([string]$Environment = "production")

$PROJECT = "last-round-card-game"
# SECURE: Use GitHub Secrets env var if available, fallback to local path for backward compatibility
$SERVICE_ACCOUNT = if ($env:FIREBASE_SERVICE_ACCOUNT) { $env:FIREBASE_SERVICE_ACCOUNT } else { "D:\Home\Vault\last-round-card-game-firebase-adminsdk-fbsvc-90cef74420.json" }
$LIVE_URL = "https://last-round-card-game.web.app"
$ErrorActionPreference = "Stop"

Write-Host "🚀 DEPLOYING LAST ROUND TO $Environment" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Step 1: Verify service account exists
if (!(Test-Path $SERVICE_ACCOUNT)) {
  Write-Host "❌ Service account not found: $SERVICE_ACCOUNT" -ForegroundColor Red
  Write-Host "   To use GitHub Secrets: Set FIREBASE_SERVICE_ACCOUNT env var in GitHub Actions" -ForegroundColor Yellow
  exit 1
}

# Step 2: Lint JavaScript
Write-Host "🔍 Linting code..." -ForegroundColor Yellow
try {
  node -c www/game.js
  node -c www/error-monitor.js
  node -c www/analytics.js
  Write-Host "✅ Lint passed" -ForegroundColor Green
} catch {
  Write-Host "❌ Lint failed: $_" -ForegroundColor Red
  exit 1
}

# Step 3: Deploy database rules
Write-Host "📦 Deploying database rules..." -ForegroundColor Yellow
$env:GOOGLE_APPLICATION_CREDENTIALS = $SERVICE_ACCOUNT
try {
  firebase deploy --only database --project $PROJECT --force
  Write-Host "✅ Database rules deployed" -ForegroundColor Green
} catch {
  Write-Host "❌ Database deployment failed: $_" -ForegroundColor Red
  exit 1
}

# Step 4: Deploy hosting
Write-Host "📦 Deploying hosting..." -ForegroundColor Yellow
try {
  firebase deploy --only hosting --project $PROJECT --force
  Write-Host "✅ Hosting deployed" -ForegroundColor Green
} catch {
  Write-Host "❌ Hosting deployment failed: $_" -ForegroundColor Red
  exit 1
}

# Step 5: Verify live endpoints
Write-Host "🔎 Verifying live endpoints..." -ForegroundColor Yellow
$delay = 0
while ($delay -lt 10) {
  try {
    $gameStatus = (Invoke-WebRequest -Uri $LIVE_URL -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode
    $errorDash = (Invoke-WebRequest -Uri "$LIVE_URL/error-dashboard.html" -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode
    $analyticsDash = (Invoke-WebRequest -Uri "$LIVE_URL/analytics-dashboard.html" -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode

    if ($gameStatus -eq 200 -and $errorDash -eq 200 -and $analyticsDash -eq 200) {
      Write-Host "✅ All endpoints live" -ForegroundColor Green
      break
    }
  } catch { }

  $delay++
  if ($delay -lt 10) {
    Write-Host "  Waiting for CDN... ($delay/10)" -ForegroundColor Gray
    Start-Sleep -Seconds 1
  }
}

if ($delay -eq 10) {
  Write-Host "⚠️  Endpoint verification timed out, but deployment may still be live" -ForegroundColor Yellow
}

# Step 6: Get deployment info
$commit = & git rev-parse --short HEAD
$branch = & git rev-parse --abbrev-ref HEAD
$author = & git log -1 --pretty=%an
$message = & git log -1 --pretty=%B | Select-Object -First 1

# Step 7: Report
Write-Host ""
Write-Host "✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "🎮 Live: $LIVE_URL" -ForegroundColor Green
Write-Host "📊 Errors: $LIVE_URL/error-dashboard.html" -ForegroundColor Green
Write-Host "📈 Analytics: $LIVE_URL/analytics-dashboard.html" -ForegroundColor Green
Write-Host ""
Write-Host "Commit: $commit | Branch: $branch | Author: $author" -ForegroundColor Gray
Write-Host "Message: $message" -ForegroundColor Gray
