# Last Round — Month 1 Deployment Checklist

**Goal:** Ship guest multiplayer + error monitoring + analytics to production  
**Timeline:** This week (June 27-28)  
**Status:** Ready to deploy

---

## ✅ PRE-DEPLOYMENT VERIFICATION

- [x] Guest multiplayer implemented (signInAnonymously + /guests path)
- [x] Error monitoring system built (error-monitor.js + dashboard)
- [x] Analytics tracking system built (analytics.js + dashboard)
- [x] Firebase rules updated (guests + errors collections)
- [x] Code syntax verified (no JS errors)
- [x] Git commits clean (3 new commits this session)

---

## 📋 DEPLOYMENT STEPS

### Step 1: Authenticate Firebase CLI
```bash
cd D:\Home\Projects\Games\Last Round\repo
firebase login
```
(Use the same Google account as the Firebase project)

### Step 2: Deploy Database Rules
```bash
firebase deploy --only database
```
**What this does:**
- Pushes `/guests` collection rules (anonymous read/write)
- Pushes `/errors` collection rules (anonymous write, auth read)
- Preserves existing `/rooms`, `/profiles`, `/leaderboard` rules

### Step 3: Deploy Hosting
```bash
firebase deploy --only hosting
```
**What this includes:**
- www/error-monitor.js (error tracking)
- www/analytics.js (GA4 tracking)
- Updated index.html (includes both scripts)
- error-dashboard.html (accessible at `/error-dashboard.html`)
- analytics-dashboard.html (accessible at `/analytics-dashboard.html`)

### Step 4: Verify Deployment
Open in browser: https://last-round-card-game.web.app

**Checks:**
- [ ] Landing page loads without errors
- [ ] "Play as Guest" button appears
- [ ] Open browser DevTools → Console
- [ ] Look for: `[ANALYTICS] Analytics initialized` message
- [ ] Look for: `[ERROR] Error monitor initialized` message

### Step 5: Test Guest Mode
1. Click "Play as Guest"
2. Complete game setup
3. Create a room (triggers Firebase anonymous auth)
4. Verify room is created in `/guests/{code}` (not `/rooms/{code}`)

### Step 6: Check Error Monitoring Dashboard
Open: https://last-round-card-game.web.app/error-dashboard.html
- Should show "No errors recorded" initially
- After playing, errors will appear in real-time

### Step 7: Check Analytics Dashboard
Open: https://last-round-card-game.web.app/analytics-dashboard.html
- Shows setup guide
- Once GA4 ID is configured, will display real player data

---

## 🔄 POST-DEPLOYMENT MONITORING

**Week 1 (June 27 - July 4):**
- Monitor error dashboard daily
- Check for critical errors (red alerts)
- Verify guest mode is working (check `/guests` collection in Firebase Console)
- Track analytics events in GA4 (if Measurement ID configured)

**Key Signals to Watch:**
- Error rate trending down (system is stable) or up (bug found)
- Guest mode conversion (% of players who use guest vs signup)
- Session abandonment rate (players leaving early?)
- Card plays per session (engagement metric)

**If Critical Error Found:**
1. Note error in error-dashboard.html
2. Check error.stack for file/line
3. Fix in www/game.js
4. Redeploy: `firebase deploy --only hosting`
5. Monitor for regression

---

## 📊 MONTH 1 PRIORITIES — POST-DEPLOYMENT

| Item | Status | Owner | Timeline |
|---|---|---|---|
| Guest multiplayer | ✅ LIVE | — | Week 1 |
| Error monitoring | ✅ LIVE | — | Week 1 |
| Analytics | ✅ LIVE | — | Week 1 (needs GA4 ID) |
| Modularize game.js | 📋 QUEUED | — | Week 2 (July 2-9) |

---

## 🚨 ROLLBACK PLAN

If something breaks in production:

```bash
# Rollback hosting to previous version
firebase hosting:channels:list
firebase hosting:clone last-round-card-game PREVIOUS_HASH

# Or revert database rules manually in Firebase Console
# (Rules > Last Round > Restore previous version)
```

---

## 📝 NOTES FOR NEXT WEEK

**By July 2:**
1. Review error-dashboard.html for common errors
2. Check GA4 analytics (if configured) for player behavior
3. Prioritize modularization based on error patterns
4. Start Month 2 planning with real data

**Modularization targets (prioritized by telemetry):**
- If errors in game.js → refactor engine module first
- If abandonment in online mode → refactor multiplayer module first
- If UI crashes → refactor ui module first

---

**Deployment Owner:** Dorothy Hart  
**Last Updated:** 2026-06-27  
**Status:** Ready for production
