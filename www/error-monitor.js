// ============================================================
// ERROR MONITORING SYSTEM
// Captures client-side errors, Firebase failures, and game crashes
// Stores to Firestore for analysis and alerting
// ============================================================

const ErrorMonitor = (() => {
  const CONFIG = {
    MAX_ERRORS_PER_SESSION: 100,
    ERROR_RETENTION_DAYS: 7,
    ALERT_THRESHOLD: 0.01, // 1% error rate
    BATCH_SIZE: 10,
    BATCH_INTERVAL_MS: 5000,
  };

  let errorBuffer = [];
  let sessionId = null;
  let sessionStartTime = null;
  let errorCount = 0;
  let gameErrors = {
    gameRuleViolations: 0,
    stateSync: 0,
    uiRender: 0,
    firebase: 0,
    network: 0,
    unknown: 0,
  };

  function init() {
    if (!fb()) return;

    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStartTime = Date.now();

    // Capture global JS errors
    window.addEventListener('error', handleJSError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Monkey-patch Firebase methods to catch failures
    monkeyPatchFirebase();

    // Start batch upload process
    setInterval(flushErrors, CONFIG.BATCH_INTERVAL_MS);

    log('ERROR', 'Error monitor initialized', { sessionId });
  }

  function handleJSError(event) {
    const error = {
      type: 'js_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack || '',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId,
    };

    // Categorize error
    if (error.message.includes('game')) error.category = 'gameRuleViolations';
    else if (error.message.includes('state') || error.message.includes('sync')) error.category = 'stateSync';
    else if (error.message.includes('render') || error.message.includes('DOM')) error.category = 'uiRender';
    else error.category = 'unknown';

    captureError(error);
  }

  function handleUnhandledRejection(event) {
    const error = {
      type: 'unhandled_rejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || '',
      timestamp: Date.now(),
      url: window.location.href,
      sessionId,
      category: event.reason?.message?.includes('firebase') ? 'firebase' : 'network',
    };

    captureError(error);
  }

  function monkeyPatchFirebase() {
    if (!window._fbAuth || !window._fbAuth.auth) return;

    const originalRef = fb().ref;
    const originalGet = fb().get;
    const originalSet = fb().set;
    const originalUpdate = fb().update;

    fb().ref = function(...args) {
      try {
        return originalRef.apply(this, args);
      } catch (e) {
        captureFirebaseError('ref', e);
        throw e;
      }
    };

    fb().get = async function(...args) {
      try {
        return await originalGet.apply(this, args);
      } catch (e) {
        captureFirebaseError('get', e);
        throw e;
      }
    };

    fb().set = async function(...args) {
      try {
        return await originalSet.apply(this, args);
      } catch (e) {
        captureFirebaseError('set', e);
        throw e;
      }
    };

    fb().update = async function(...args) {
      try {
        return await originalUpdate.apply(this, args);
      } catch (e) {
        captureFirebaseError('update', e);
        throw e;
      }
    };
  }

  function captureFirebaseError(operation, error) {
    const fbError = {
      type: 'firebase_error',
      operation,
      message: error.message || String(error),
      code: error.code || 'unknown',
      stack: error.stack || '',
      timestamp: Date.now(),
      sessionId,
      category: 'firebase',
    };
    captureError(fbError);
  }

  function captureGameError(context, message) {
    const error = {
      type: 'game_error',
      message,
      context,
      timestamp: Date.now(),
      sessionId,
      gameState: {
        screen: document.querySelector('.screen.active')?.id || 'unknown',
        onlineActive: ONLINE?.active || false,
      },
      category: 'gameRuleViolations',
    };
    captureError(error);
  }

  function captureError(error) {
    if (errorCount >= CONFIG.MAX_ERRORS_PER_SESSION) {
      log('WARN', 'Error buffer full, dropping error', { message: error.message });
      return;
    }

    errorBuffer.push(error);
    errorCount++;

    // Track by category
    if (gameErrors[error.category]) {
      gameErrors[error.category]++;
    }

    // Flush if buffer is full
    if (errorBuffer.length >= CONFIG.BATCH_SIZE) {
      flushErrors();
    }
  }

  async function flushErrors() {
    if (errorBuffer.length === 0 || !fb()) return;

    const toUpload = [...errorBuffer];
    errorBuffer = [];

    try {
      const { db, ref, set: fbSet, serverTimestamp } = fb();
      const errorsRef = ref(db, `errors/${sessionId}`);

      for (const error of toUpload) {
        const errorId = `${error.timestamp}-${Math.random().toString(36).substr(2, 5)}`;
        await fbSet(ref(db, `errors/${sessionId}/${errorId}`), {
          ...error,
          serverTimestamp: serverTimestamp(),
        });
      }

      log('DEBUG', `Uploaded ${toUpload.length} errors to Firestore`);
    } catch (e) {
      log('ERROR', 'Failed to upload errors', { message: e.message });
      // Re-add errors to buffer if upload failed
      errorBuffer.unshift(...toUpload);
    }
  }

  function getErrorStats() {
    return {
      sessionId,
      uptime: Date.now() - sessionStartTime,
      errorCount,
      errorRate: errorCount / ((Date.now() - sessionStartTime) / 1000 / 60),
      breakdown: gameErrors,
    };
  }

  function log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, context);
  }

  return {
    init,
    captureGameError,
    captureError,
    getErrorStats,
    flushErrors,
  };
})();

// Export for use in game.js
if (typeof window !== 'undefined') {
  window.ErrorMonitor = ErrorMonitor;
}
