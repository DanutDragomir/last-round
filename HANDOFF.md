# Last Round — Project Handoff Document
> Prepared: 2026-06-29

---

## 1. What This Project Is

**Last Round** is a browser-based pub card game (Dutch rules). The last player holding cards buys the round.

- Runs in any browser — no download needed
- Wraps as an Android APK via Capacitor
- Real-time multiplayer via Firebase Realtime Database
- 14 languages supported
- 7 registered players in the database as of handoff date

**Live URL:** https://last-round-card-game.web.app  
**Play Store listing:** com.lastround.cardgame

---

## 2. Repositories

| Repo | URL | What's in it |
|---|---|---|
| Game | https://github.com/DanutDragomir/last-round | All game code |
| AI Assistant (Spark) | https://github.com/DanutDragomir/spark-skill | Spark skill files |

Both are **private**. You need to be added as a collaborator to access them.

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Game UI | HTML + CSS + Vanilla JS | No framework, no build step |
| Multiplayer | Firebase Realtime Database | europe-west1 instance |
| Auth | Firebase Auth | Anonymous + Google Sign-In + Email |
| Android | Capacitor 8 | Wraps the web app as a native APK |
| Signing | lastround.keystore | Keep this file safe — required for Play Store |
| Firebase project | last-round-card-game | Managed at console.firebase.google.com |

---

## 4. File Structure

```
last-round/
├── www/                    ← All game code lives here
│   ├── index.html          ← Shell: Firebase init, screen layouts, overlays
│   ├── game.js             ← All game logic (~4000 lines)
│   ├── style.css           ← All visual styling
│   ├── translations.js     ← 14-language string table
│   └── version.json        ← Current version number
├── android/                ← Capacitor Android wrapper
│   ├── app/
│   │   ├── google-services.json   ← Firebase Android config
│   │   └── build.gradle           ← Android build config
│   └── local.properties    ← Points to Android SDK (machine-specific, not in git)
├── firebase.json           ← Firebase project config
├── database.rules.json     ← Firebase security rules (deploy with: firebase deploy --only database)
├── capacitor.config.json   ← Capacitor settings
└── package.json            ← npm dependencies
```

---

## 5. How Rendering Works

### The core mental model
> JavaScript decides what exists and what's visible. CSS decides how it looks and moves. The browser draws it.

### Screens = divs with a hidden class
Every screen (menu, lobby, game, results) exists in the HTML at all times. Only one is visible. JavaScript toggles a `hidden` class.

```javascript
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(name).classList.remove('hidden');
}
```

### Design system = CSS custom properties
All colours and spacing are defined once at the top of style.css:
```css
:root {
  --color-primary: #6366F1;
  --color-bg: #1E1B4B;
  --radius: 12px;
}
```
Change a variable → updates everywhere. Never hardcode a colour twice.

### Animations = CSS keyframes, not JavaScript loops
```css
@keyframes dealCard {
  from { transform: translateY(-100px); opacity: 0; }
  to   { transform: translateY(0);      opacity: 1; }
}
```
JavaScript adds/removes CSS classes. The browser handles smooth movement.

### Layout = Flexbox throughout
No absolute pixel positioning. Everything centres and spaces with Flexbox.

### Emoji do the visual heavy lifting
Avatars, suits, reactions — all emoji. No image files for UI elements.

---

## 6. Rendering Tips (Good Practices)

### Performance
- **Only animate `transform` and `opacity`** — these are GPU-composited and never cause layout recalculation. Animating `width`, `height`, `top`, `left` causes jank.
- **Never animate inside a `setInterval`** — use CSS keyframes or `requestAnimationFrame`.
- **Touch targets must be at least 44×44px** — anything smaller is unreliable on mobile.

### Visual feedback
- Every meaningful tap needs a response within 100ms — use CSS `:active` states if nothing else.
- Screen shake = `transform: translateX()` keyframe, 200ms, 3-4 oscillations.
- Score counters should animate (count up) not jump — creates satisfaction.
- Sound is 50% of the feel — a tap with no sound feels broken.

### CSS architecture
- Use `rem` not `px` for font sizes — respects user accessibility settings.
- Use `gap` inside flex containers instead of `margin` on children — easier to reason about.
- Name classes by what they ARE, not what they look like: `.card-hand` not `.horizontal-list`.
- Keep all colours in CSS variables — never in JavaScript.

### Mobile-specific
- Test every layout in portrait AND landscape.
- Add `touch-action: manipulation` to tappable elements — removes the 300ms tap delay on mobile browsers.
- Use `-webkit-tap-highlight-color: transparent` to remove the grey flash on tap.
- `overflow: hidden` on the body prevents accidental scroll during gameplay.

### Common mistakes to avoid
- Don't use `innerHTML` for user-generated content — XSS risk. Use `textContent` instead.
- Don't create DOM elements in a loop without a document fragment — causes layout thrashing.
- Don't use `visibility: hidden` when you mean `display: none` — hidden elements still take up space.
- Don't forget to unsubscribe Firebase listeners when leaving a screen — causes memory leaks and ghost updates.

---

## 7. Firebase Architecture

### Database structure
```
/profiles/{name}        ← Player profiles (avatar, stats, lastSeen)
/authMap/{uid}          ← Maps Firebase Auth UID → profile name
/leaderboard/{name}     ← Public leaderboard entries
/rooms/{code}           ← Active game rooms (deleted when host leaves)
/challenges/{name}      ← Pending duel challenges
/season/meta            ← Current season name and start date
/season/archive         ← Historical season results
```

### Security rules
All paths require authentication (`auth != null`). Rules file: `database.rules.json`.  
Deploy with: `firebase deploy --only database`

### Key patterns
- **Host creates room** → sets `onDisconnect` to delete the whole room
- **Guest joins room** → sets `onDisconnect` to mark their `connected` field false
- **Heartbeat** runs every 30s updating `lastSeen` timestamp
- **Stale player detection** uses `lastSeen` age — if > 60s, player considered disconnected

---

## 8. Building an APK

Prerequisites: Android Studio, Android SDK, Java 21, Capacitor CLI

```bash
# 1. Sync web code into Android project
npx cap sync android

# 2. Build signed release APK
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

The keystore is at `D:\last-round\lastround.keystore`.  
Passwords are in `android\keystore.properties` (not in git — keep safe).

---

## 9. The i18n Rule

**Every text change must go to all 14 languages at once.**  
The string table is in `www/translations.js`. Languages:
`en, ro, nl, de, fr, es, it, pt, pl, hu, cs, sk, hr, sr`

Never update one language and leave the others. Partial updates = broken release.

---

## 10. AI Assistant — Spark

Spark is a Claude Code skill trained specifically for mobile game development. She knows:
- The full Last Round codebase context
- Mobile game business metrics (CPI, ROAS, LTV, D1 retention)
- Firebase architecture patterns
- Capacitor + Android build process
- Monetisation strategy (AdMob, IAP, HTML5 licensing)
- Storytelling and content marketing for indie devs

**To use Spark:** Open Claude Code → she activates automatically when game dev topics come up.

**Spark's knowledge base** (in `~/.claude/skills/spark/references/`):
- `mobile-games.md` — 18 sections, market data, prototype-to-scale pipeline
- `storytelling.md` — dev log and trailer frameworks
- `skills-2026.md` — engineering patterns (DDA, seeded random, CI/CD)
- `data-viz.md` — chart rules for analytics screens

**Training queue (next sessions):**
1. AdMob/Capacitor ad integration → `ad-integration.md`
2. Google Play Console publishing workflow
3. Howler.js + game audio → `sound-design.md`
4. Matter.js physics → `game-physics.md`
5. Privacy policy + GDPR for mobile games

---

## 11. What Was Done This Session

- Migrated `.claude` directory from USB stick to `D:` drive via junction
- Restored all Spark files (SKILL.md iteration 5, PROMPT.md, 4 reference files)
- Restored all 5 memory files
- Reinstalled Android SDK to `D:\AndroidSdk` (was lost when USB died)
- Set ANDROID_HOME, JAVA_HOME, PATH environment variables
- Updated `local.properties` to point to `D:\AndroidSdk`
- Fixed Firebase stale room bug (PINT39 — deleted)
- Fixed `joinRoom()` missing `onDisconnect` for guest players
- Fixed `leaveRoom()` — guests now clean up their connection state
- Created `firebase.json`, `.firebaserc`, `database.rules.json`
- Deployed Firebase security rules
- Installed FFmpeg, ImageMagick, GitHub CLI, jq
- Created private GitHub repo for Last Round
- Created private GitHub repo for Spark
- Pushed both repos to GitHub
- Created this handoff document + SETUP.md for new machine

---

## 12. New Machine Setup (Quick Reference)

See `SETUP.md` in the spark-skill repo for full instructions.

**Critical path:**
1. Install Claude Code (claude.ai/download)
2. Install Git (git-scm.com) — choose D:\Git, select "Git from command line" option
3. Clone repos:
   ```bash
   git clone https://github.com/DanutDragomir/spark-skill.git ~/.claude/skills/spark
   git clone https://github.com/DanutDragomir/last-round.git D:/last-round
   ```
4. Place `lastround.keystore` → `D:\last-round\`
5. Place `keystore.properties` → `D:\last-round\android\`
6. Install Node.js (nodejs.org LTS)
7. `npm install -g firebase-tools` then `firebase login`

---

*Document generated: 2026-06-29*  
*Project: Last Round Card Game*  
*Firebase project: last-round-card-game*
