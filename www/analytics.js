// ============================================================
// ANALYTICS TRACKING SYSTEM
// Tracks player engagement: sessions, wins, playtime, card plays
// Sends to Google Analytics 4 for analysis
// ============================================================

const Analytics = (() => {
  // Google Analytics 4 Measurement ID
  const GA_ID = 'G-Y0EXAMPLE';  // TODO: Replace with actual GA4 ID from Firebase

  let sessionStart = null;
  let sessionData = {
    sessionDuration: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    cardPlays: 0,
    roomsCreated: 0,
    roomsJoined: 0,
    gameMode: null,
    deckTheme: null,
    league: null,
    abandoned: false,
    lastActive: null,
  };

  function init() {
    sessionStart = Date.now();
    sessionData.lastActive = sessionStart;

    // Load GA4 script
    if (!window.gtag) {
      loadGAScript();
    }

    // Track session start
    trackEvent('session_start', {
      timestamp: new Date().toISOString(),
      platform: IS_WEB ? 'web' : 'mobile',
    });

    // Monitor inactivity (abandon detection)
    setupAbandonmentDetection();

    // Track page visibility (when player leaves/returns)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    log('Analytics initialized', { sessionStart });
  }

  function loadGAScript() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function trackEvent(event, data = {}) {
    sessionData.lastActive = Date.now();

    // Send to GA4
    if (window.gtag) {
      try {
        window.gtag('event', event, {
          ...data,
          session_id: window._fbUid || 'anonymous',
        });
      } catch (e) {
        log('GA4 event failed', { event, error: e.message });
      }
    }

    // Also log locally
    console.log(`[ANALYTICS] ${event}`, data);
  }

  function trackGameStart(config) {
    sessionData.gamesPlayed++;
    sessionData.gameMode = config.mode || 'offline';
    sessionData.deckTheme = config.design || 'classic';

    trackEvent('game_start', {
      game_number: sessionData.gamesPlayed,
      mode: config.mode,
      num_players: config.numPlayers,
      design: config.design,
      drinking_mode: config.drinkingMode || false,
    });
  }

  function trackGameEnd(result) {
    const duration = result.duration || 0;
    const isWin = result.win || false;

    if (isWin) sessionData.gamesWon++;

    trackEvent('game_end', {
      game_number: sessionData.gamesPlayed,
      duration_seconds: Math.round(duration / 1000),
      win: isWin,
      league: result.league,
      final_score: result.score,
      turns: result.turns,
    });
  }

  function trackCardPlay(card, context = {}) {
    sessionData.cardPlays++;

    // Sample 1-in-10 card plays to avoid overwhelming GA
    if (sessionData.cardPlays % 10 === 0) {
      trackEvent('card_played', {
        card_value: card.value,
        card_suit: card.suit,
        is_action: card.isAction || false,
        game_number: sessionData.gamesPlayed,
        ...context,
      });
    }
  }

  function trackRoomCreated(code) {
    sessionData.roomsCreated++;

    trackEvent('room_created', {
      room_code: code.substring(0, 3), // Hash for privacy
      mode: 'online',
    });
  }

  function trackRoomJoined(code) {
    sessionData.roomsJoined++;

    trackEvent('room_joined', {
      room_code: code.substring(0, 3),
      mode: 'online',
    });
  }

  function trackScreenView(screenName) {
    trackEvent('screen_view', {
      screen_name: screenName,
    });
  }

  function trackFeatureUsed(featureName) {
    trackEvent('feature_used', {
      feature: featureName,
    });
  }

  function trackError(errorMsg) {
    trackEvent('app_error', {
      error_message: errorMsg.substring(0, 100),
    });
  }

  function setupAbandonmentDetection() {
    // Track if game is idle for 5 minutes
    let inactivityTimer = null;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        sessionData.abandoned = true;
        trackEvent('session_abandoned', {
          inactivity_minutes: 5,
          session_duration_seconds: Math.round((Date.now() - sessionStart) / 1000),
        });
      }, 5 * 60 * 1000);
    };

    // Reset timer on user activity
    document.addEventListener('click', resetTimer);
    document.addEventListener('keydown', resetTimer);
    document.addEventListener('touchstart', resetTimer);

    resetTimer();
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      trackEvent('app_backgrounded', {
        session_duration_seconds: Math.round((Date.now() - sessionStart) / 1000),
      });
    } else {
      trackEvent('app_foregrounded', {});
    }
  }

  function getSessionStats() {
    const duration = Date.now() - sessionStart;
    const winRate = sessionData.gamesPlayed > 0 ? (sessionData.gamesWon / sessionData.gamesPlayed * 100).toFixed(1) : 0;

    return {
      sessionDuration: Math.round(duration / 1000),
      gamesPlayed: sessionData.gamesPlayed,
      gamesWon: sessionData.gamesWon,
      winRate: `${winRate}%`,
      cardPlays: sessionData.cardPlays,
      roomsCreated: sessionData.roomsCreated,
      roomsJoined: sessionData.roomsJoined,
      abandoned: sessionData.abandoned,
    };
  }

  function flushSession() {
    const stats = getSessionStats();
    trackEvent('session_end', {
      ...stats,
      timestamp: new Date().toISOString(),
    });
    log('Session stats', stats);
  }

  function log(msg, data = {}) {
    console.log(`[ANALYTICS] ${msg}`, data);
  }

  // Auto-flush on page unload
  window.addEventListener('beforeunload', flushSession);

  return {
    init,
    trackGameStart,
    trackGameEnd,
    trackCardPlay,
    trackRoomCreated,
    trackRoomJoined,
    trackScreenView,
    trackFeatureUsed,
    trackError,
    getSessionStats,
    flushSession,
  };
})();

if (typeof window !== 'undefined') {
  window.Analytics = Analytics;
}
