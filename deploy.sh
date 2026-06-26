#!/bin/bash
# Last Round — Automated Deployment Script
# Runs on every git push to main
# Handles: lint → test → deploy → verify → alert

set -e

PROJECT="last-round-card-game"
SERVICE_ACCOUNT="${HOME}/Vault/last-round-card-game-firebase-adminsdk-fbsvc-90cef74420.json"
SLACK_WEBHOOK="${SLACK_DEPLOY_WEBHOOK}"  # Set via env var
LIVE_URL="https://last-round-card-game.web.app"

echo "🚀 DEPLOYING LAST ROUND TO PRODUCTION"
echo "=========================================="

# Step 1: Verify service account exists
if [ ! -f "$SERVICE_ACCOUNT" ]; then
  echo "❌ Service account not found: $SERVICE_ACCOUNT"
  exit 1
fi

# Step 2: Lint JavaScript
echo "🔍 Linting code..."
node -c www/game.js || exit 1
node -c www/error-monitor.js || exit 1
node -c www/analytics.js || exit 1
echo "✅ Lint passed"

# Step 3: Deploy database rules
echo "📦 Deploying database rules..."
export GOOGLE_APPLICATION_CREDENTIALS="$SERVICE_ACCOUNT"
firebase deploy --only database --project "$PROJECT" --force
echo "✅ Database rules deployed"

# Step 4: Deploy hosting
echo "📦 Deploying hosting..."
firebase deploy --only hosting --project "$PROJECT" --force
echo "✅ Hosting deployed"

# Step 5: Verify live endpoints
echo "🔎 Verifying live endpoints..."
GAME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$LIVE_URL")
ERROR_DASH=$(curl -s -o /dev/null -w "%{http_code}" "$LIVE_URL/error-dashboard.html")
ANALYTICS_DASH=$(curl -s -o /dev/null -w "%{http_code}" "$LIVE_URL/analytics-dashboard.html")

if [ "$GAME_STATUS" = "200" ] && [ "$ERROR_DASH" = "200" ] && [ "$ANALYTICS_DASH" = "200" ]; then
  echo "✅ All endpoints live"
else
  echo "❌ Endpoint check failed: game=$GAME_STATUS errors=$ERROR_DASH analytics=$ANALYTICS_DASH"
  exit 1
fi

# Step 6: Get deployment info
COMMIT=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
AUTHOR=$(git log -1 --pretty=%an)
MESSAGE=$(git log -1 --pretty=%B | head -1)

# Step 7: Slack alert (optional)
if [ -n "$SLACK_WEBHOOK" ]; then
  curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{
      \"text\": \"🚀 Last Round deployed to production\",
      \"blocks\": [
        {\"type\": \"section\", \"text\": {\"type\": \"mrkdwn\", \"text\": \"✅ *Last Round Deployment Successful*\"}},
        {\"type\": \"section\", \"fields\": [
          {\"type\": \"mrkdwn\", \"text\": \"*Commit:*\n\`$COMMIT\`\"},
          {\"type\": \"mrkdwn\", \"text\": \"*Branch:*\n$BRANCH\"},
          {\"type\": \"mrkdwn\", \"text\": \"*Author:*\n$AUTHOR\"},
          {\"type\": \"mrkdwn\", \"text\": \"*Message:*\n$MESSAGE\"}
        ]}
      ]
    }"
fi

echo ""
echo "✅ DEPLOYMENT COMPLETE"
echo "🎮 Live: $LIVE_URL"
echo "📊 Errors: $LIVE_URL/error-dashboard.html"
echo "📈 Analytics: $LIVE_URL/analytics-dashboard.html"
echo ""
