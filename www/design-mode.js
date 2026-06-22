/**
 * Last Round — Universal In-Browser Design Mode
 *
 * Ctrl+Shift+D  → toggle on/off
 *
 * Click any element to highlight it, then DRAG to move or use handles to resize.
 * Plain clicks pass through to the game normally — drag threshold is 6 px.
 *
 * Desktop-only (≥600 px). Zero effect on mobile or released build.
 */
(function () {
  'use strict';

  const SAVE_URL   = 'http://localhost:3001/save-css';
  const CSS_MARKER = 'DESKTOP_LAYOUT';
  const DRAG_THRESHOLD = 6; // px before we commit to a drag

  // Human-friendly labels for known selectors
  const LABELS = {
    '#gameLog':           '📋 Moves Log',
    '.game-info':         '⏱ Turn Badge',
    '.requirement-info':  '🟠 Req. Info',
    '.play-pile-area':    '🃏 Play Pile Area',
    '.center-bottom-row': '🎴 Draw/Burn Row',
    '.bottom-player-area':'🙋 Player Zone',
    '.center-area':       '🎯 Center Area',
    '.game-main':         '🖼 Game Main',
    '#screen-game':       '📺 Game Screen',
    '#burnDeckDisplay':   '🔥 Burn Deck',
  };

  let active    = false;
  let panel     = null;
  let pending   = null;  // mousedown recorded, not yet committed to drag
  let dragData  = null;  // drag committed (mouse moved past threshold)
  let resData   = null;  // resize in progress
  let overrides = {};
  let history   = [];
  let selEl     = null;
  let handleBox = null;
  let paused    = false;
  let _origRenderGame = null;
  let _dmWrapped = false;

  // ── Keyboard toggle ──────────────────────────────────────────────────────────
  // Ctrl+Shift+E = our layout tool  |  Ctrl+Shift+D = built-in game design mode
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      e.stopPropagation();
      active ? deactivate() : activate();
    }
  }, true);

  // ── Activate / Deactivate ────────────────────────────────────────────────────
  function activate() {
    if (window.innerWidth < 600) { alert('Design mode is desktop-only (≥600 px).'); return; }
    active = true;
    wrapRenderGame();
    buildPanel();
    // capture phase so we see events first, but we only block them once drag starts
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mouseup',   onMouseUp,   true);
  }

  function deactivate() {
    active = false;
    paused = false;
    unwrapRenderGame();
    hideHandles();
    if (panel) { panel.remove(); panel = null; }
    document.removeEventListener('mousedown', onMouseDown, true);
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mouseup',   onMouseUp,   true);
    pending = null; dragData = null; resData = null; selEl = null;
    document.body.style.cursor = '';
  }

  // ── renderGame wrapper — re-applies overrides after every render ──────────────
  function wrapRenderGame() {
    if (_dmWrapped) return;
    _origRenderGame = window.renderGame;
    window.renderGame = function() {
      if (!paused && _origRenderGame) _origRenderGame.apply(this, arguments);
      if (active) reapplyOverrides();
    };
    _dmWrapped = true;
  }

  function unwrapRenderGame() {
    if (!_dmWrapped) return;
    window.renderGame = _origRenderGame;
    _origRenderGame = null;
    _dmWrapped = false;
  }

  function reapplyOverrides() {
    for (const [sel, pos] of Object.entries(overrides)) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const ref = pos.refSel ? document.querySelector(pos.refSel) : document.body;
      if (ref && window.getComputedStyle(ref).position === 'static') ref.style.position = 'relative';
      el.style.position = 'absolute';
      el.style.top      = pos.top    + 'px';
      el.style.left     = pos.left   + 'px';
      el.style.width    = pos.width  + 'px';
      el.style.height   = pos.height + 'px';
      el.style.margin   = '0';
      el.style.zIndex   = '500';
    }
  }

  // ── Selector / label helpers ─────────────────────────────────────────────────
  function selectorFor(el) {
    if (el.id) return '#' + el.id;
    const cls = [...el.classList].find(c => c && !c.startsWith('_dm'));
    if (cls) return '.' + cls;
    const parent = el.parentElement;
    if (parent) {
      const idx = [...parent.children].indexOf(el) + 1;
      return selectorFor(parent) + '>' + el.tagName.toLowerCase() + ':nth-child(' + idx + ')';
    }
    return el.tagName.toLowerCase();
  }

  function labelFor(sel, el) {
    if (LABELS[sel]) return LABELS[sel];
    if (el.id) return '#' + el.id;
    if (el.classList.length) return '.' + el.classList[0];
    return el.tagName.toLowerCase();
  }

  function containerFor(el) {
    let p = el.parentElement;
    while (p && p !== document.body) {
      if (window.getComputedStyle(p).position !== 'static') return p;
      p = p.parentElement;
    }
    return document.body;
  }

  // ── Own-element guard ────────────────────────────────────────────────────────
  function isOwnElement(el) {
    let p = el;
    while (p) {
      if (p.id === '_dm_panel') return true;
      if (p === handleBox) return true;
      p = p.parentElement;
    }
    return false;
  }

  // ── Mouse events ─────────────────────────────────────────────────────────────
  function onMouseDown(e) {
    if (!active || e.button !== 0) return;
    if (isOwnElement(e.target)) return;

    // Record pending — do NOT prevent default yet (game still gets this click)
    pending = {
      el:     e.target,
      startX: e.clientX,
      startY: e.clientY,
    };
  }

  function onMouseMove(e) {
    // ── Resize in progress ──
    if (resData) {
      e.preventDefault(); e.stopPropagation();
      const { el, dir, startMouseX, startMouseY,
              startTop, startLeft, startWidth, startHeight } = resData;
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;
      let newTop = startTop, newLeft = startLeft, newW = startWidth, newH = startHeight;
      if (dir.includes('e'))  newW = Math.max(20, startWidth  + dx);
      if (dir.includes('s'))  newH = Math.max(20, startHeight + dy);
      if (dir.includes('w')) { newW = Math.max(20, startWidth - dx); newLeft = startLeft + (startWidth - newW); }
      if (dir.includes('n')) { newH = Math.max(20, startHeight - dy); newTop  = startTop  + (startHeight - newH); }
      el.style.width = newW + 'px'; el.style.height = newH + 'px';
      el.style.top   = newTop + 'px'; el.style.left   = newLeft + 'px';
      positionHandleBox(el);
      const sel = selectorFor(el);
      updatePanel(labelFor(sel, el), sel, Math.round(newLeft), Math.round(newTop), Math.round(newW), Math.round(newH));
      return;
    }

    // ── Drag in progress ──
    if (dragData) {
      e.preventDefault(); e.stopPropagation();
      const { el, label, sel, startMouseX, startMouseY, startTop, startLeft } = dragData;
      const newTop  = startTop  + (e.clientY - startMouseY);
      const newLeft = startLeft + (e.clientX - startMouseX);
      el.style.top  = newTop  + 'px';
      el.style.left = newLeft + 'px';
      positionHandleBox(el);
      const r = el.getBoundingClientRect();
      updatePanel(label, sel, Math.round(newLeft), Math.round(newTop), Math.round(r.width), Math.round(r.height));
      return;
    }

    // ── Pending: check threshold ──
    if (!pending) return;
    const dx = Math.abs(e.clientX - pending.startX);
    const dy = Math.abs(e.clientY - pending.startY);
    if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;

    // If the built-in design mode is active, let it handle the drag
    if (window._designActive) { pending = null; return; }

    // Threshold crossed — commit to drag
    e.preventDefault(); e.stopPropagation();
    commitDrag(pending.el, pending.startX, pending.startY);
    pending = null;
  }

  function commitDrag(el, startX, startY) {
    const sel    = selectorFor(el);
    const label  = labelFor(sel, el);
    const ref    = containerFor(el);
    const refSel = ref === document.body ? null : selectorFor(ref);

    const elRect  = el.getBoundingClientRect();
    const refRect = ref.getBoundingClientRect();

    const cs = window.getComputedStyle(el);
    let curTop, curLeft;
    if (cs.position === 'absolute' || cs.position === 'fixed') {
      curTop  = parseFloat(el.style.top)  !== undefined ? parseFloat(el.style.top)  : elRect.top  - refRect.top;
      curLeft = parseFloat(el.style.left) !== undefined ? parseFloat(el.style.left) : elRect.left - refRect.left;
    } else {
      curTop  = elRect.top  - refRect.top;
      curLeft = elRect.left - refRect.left;
      el.style.position = 'absolute';
      el.style.width    = elRect.width  + 'px';
      el.style.height   = elRect.height + 'px';
      el.style.margin   = '0';
    }
    el.style.top    = curTop  + 'px';
    el.style.left   = curLeft + 'px';
    el.style.zIndex = '500';

    if (window.getComputedStyle(ref).position === 'static') ref.style.position = 'relative';

    // Update selection highlight
    if (selEl && selEl !== el) { selEl.style.outline = ''; selEl.style.outlineOffset = ''; }
    el.style.outline       = '2px solid #f0c040';
    el.style.outlineOffset = '2px';
    el.style.cursor        = 'grabbing';
    showHandles(el);

    dragData = { el, sel, label, ref, refSel, startMouseX: startX, startMouseY: startY, startTop: curTop, startLeft: curLeft };
    updatePanel(label, sel, Math.round(curLeft), Math.round(curTop), Math.round(elRect.width), Math.round(elRect.height));
  }

  function onMouseUp(e) {
    // ── Finish resize ──
    if (resData) {
      e.preventDefault(); e.stopPropagation();
      const el  = resData.el;
      const sel = selectorFor(el);
      const top    = parseFloat(el.style.top)    || 0;
      const left   = parseFloat(el.style.left)   || 0;
      const width  = parseFloat(el.style.width)  || el.getBoundingClientRect().width;
      const height = parseFloat(el.style.height) || el.getBoundingClientRect().height;
      history.push(JSON.parse(JSON.stringify(overrides)));
      overrides[sel] = { top: Math.round(top), left: Math.round(left),
                         width: Math.round(width), height: Math.round(height),
                         refSel: dragData ? dragData.refSel : null };
      el.style.cursor = 'default';
      positionHandleBox(el);
      resData = null;
      return;
    }

    // ── Finish drag ──
    if (dragData) {
      e.preventDefault(); e.stopPropagation();
      const { el, sel, refSel } = dragData;
      const top    = parseFloat(el.style.top)    || 0;
      const left   = parseFloat(el.style.left)   || 0;
      const width  = parseFloat(el.style.width)  || el.getBoundingClientRect().width;
      const height = parseFloat(el.style.height) || el.getBoundingClientRect().height;
      history.push(JSON.parse(JSON.stringify(overrides)));
      overrides[sel] = { top: Math.round(top), left: Math.round(left),
                         width: Math.round(width), height: Math.round(height), refSel };
      el.style.cursor = 'default';
      positionHandleBox(el);
      dragData = null;
      return;
    }

    // ── Plain click (no drag) — just highlight the element ──
    if (pending) {
      const el  = pending.target || pending.el;
      if (!isOwnElement(el)) {
        if (selEl && selEl !== el) { selEl.style.outline = ''; selEl.style.outlineOffset = ''; }
        el.style.outline       = '2px dashed rgba(240,192,64,.7)';
        el.style.outlineOffset = '2px';
        showHandles(el);
        const sel   = selectorFor(el);
        const label = labelFor(sel, el);
        const r     = el.getBoundingClientRect();
        updatePanel(label, sel, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height));
      }
      pending = null;
    }
  }

  // ── Resize handles ────────────────────────────────────────────────────────────
  const CURSORS = {
    nw:'nw-resize', n:'n-resize', ne:'ne-resize',
    e:'e-resize',   se:'se-resize', s:'s-resize',
    sw:'sw-resize', w:'w-resize',
  };

  function showHandles(el) {
    hideHandles();
    selEl = el;
    handleBox = document.createElement('div');
    handleBox.style.cssText = 'position:fixed;pointer-events:none;z-index:999998;box-sizing:border-box;border:1.5px solid rgba(240,192,64,0.6)';
    positionHandleBox(el);

    Object.keys(CURSORS).forEach(dir => {
      const h = document.createElement('div');
      h.dataset.dir = dir;
      const isCorner = dir.length === 2;
      h.style.cssText = [
        'position:absolute','width:10px','height:10px',
        'background:#f0c040','border:1.5px solid #000',
        `border-radius:${isCorner ? '2px' : '3px'}`,
        `cursor:${CURSORS[dir]}`,
        'pointer-events:auto',
        ...anchorStyle(dir),
      ].join(';');
      h.addEventListener('mousedown', onResizeStart);
      handleBox.appendChild(h);
    });
    document.body.appendChild(handleBox);
  }

  function anchorStyle(dir) {
    const mid = 'transform:translate(-50%,-50%)';
    return ({
      nw: ['top:-5px','left:-5px'],
      n:  ['top:-5px','left:50%', mid],
      ne: ['top:-5px','right:-5px'],
      e:  ['top:50%','right:-5px','transform:translate(50%,-50%)'],
      se: ['bottom:-5px','right:-5px'],
      s:  ['bottom:-5px','left:50%', mid],
      sw: ['bottom:-5px','left:-5px'],
      w:  ['top:50%','left:-5px', mid],
    })[dir] || [];
  }

  function positionHandleBox(el) {
    if (!handleBox) return;
    const r = el.getBoundingClientRect();
    handleBox.style.left   = r.left   + 'px';
    handleBox.style.top    = r.top    + 'px';
    handleBox.style.width  = r.width  + 'px';
    handleBox.style.height = r.height + 'px';
  }

  function hideHandles() {
    if (handleBox) { handleBox.remove(); handleBox = null; }
    if (selEl) { selEl.style.outline = ''; selEl.style.outlineOffset = ''; selEl = null; }
  }

  function onResizeStart(e) {
    if (!selEl) return;
    e.preventDefault(); e.stopPropagation();
    const el     = selEl;
    const elRect = el.getBoundingClientRect();
    // Ensure element is positioned absolutely before resize
    const cs = window.getComputedStyle(el);
    if (cs.position !== 'absolute' && cs.position !== 'fixed') {
      const ref    = containerFor(el);
      const refRect = ref.getBoundingClientRect();
      if (window.getComputedStyle(ref).position === 'static') ref.style.position = 'relative';
      el.style.position = 'absolute';
      el.style.top      = (elRect.top  - refRect.top)  + 'px';
      el.style.left     = (elRect.left - refRect.left) + 'px';
      el.style.width    = elRect.width  + 'px';
      el.style.height   = elRect.height + 'px';
      el.style.margin   = '0';
      el.style.zIndex   = '500';
    }
    resData = {
      el,
      dir:         e.currentTarget.dataset.dir,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startTop:    parseFloat(el.style.top)   || 0,
      startLeft:   parseFloat(el.style.left)  || 0,
      startWidth:  elRect.width,
      startHeight: elRect.height,
    };
  }

  // ── Panel ────────────────────────────────────────────────────────────────────
  function mkBtn(label, bg, id) {
    return `<button id="${id}" style="flex:1;padding:5px 2px;background:${bg};border:none;
border-radius:5px;color:#fff;cursor:pointer;font:11px/1 monospace;white-space:nowrap">${label}</button>`;
  }

  function buildPanel() {
    panel = document.createElement('div');
    panel.id = '_dm_panel';
    panel.style.cssText = [
      'position:fixed','bottom:14px','right:14px','z-index:999999',
      'background:#0d1117','border:1.5px solid #f0c040','border-radius:10px',
      'padding:10px 14px','color:#fff','font:12px/1.5 monospace',
      'min-width:260px','box-shadow:0 6px 24px rgba(0,0,0,.85)',
      'user-select:none','pointer-events:auto',
    ].join(';');
    panel.innerHTML = `
      <div style="color:#f0c040;font-weight:700;font-size:13px;margin-bottom:6px">
        ⚙ Layout Tool
        <span style="font-size:9px;opacity:.45;margin-left:4px">Ctrl+Shift+E</span>
      </div>
      <div id="_dm_label" style="color:#aed6b0;font-size:11px;margin-bottom:2px">Drag any element to move it</div>
      <div id="_dm_sel"   style="color:#888;font-size:10px;margin-bottom:2px;font-style:italic"></div>
      <div id="_dm_pos"   style="color:#fff;font-size:11px;min-height:16px;margin-bottom:8px"></div>
      <div style="display:flex;gap:4px;margin-bottom:4px">
        ${mkBtn('⏸ Pause',       '#1a4a6a', '_dm_pause')}
        ${mkBtn('📋 Copy CSS',    '#2a5a8c', '_dm_copy')}
        ${mkBtn('💾 Save to File','#1e6b42', '_dm_save')}
      </div>
      <div style="display:flex;gap:4px;margin-bottom:6px">
        ${mkBtn('⎌ Undo',  '#3a3a6a', '_dm_undo')}
        ${mkBtn('↩ Reset', '#5a4a00', '_dm_reset')}
        ${mkBtn('✕ Exit',  '#6b1a1a', '_dm_exit')}
      </div>
      <div id="_dm_msg" style="color:#8bc98c;font-size:10px;min-height:12px"></div>
    `;
    document.body.appendChild(panel);
    panel.querySelector('#_dm_pause').addEventListener('click', togglePause);
    panel.querySelector('#_dm_copy') .addEventListener('click', copyCss);
    panel.querySelector('#_dm_save') .addEventListener('click', saveCss);
    panel.querySelector('#_dm_undo') .addEventListener('click', undoLast);
    panel.querySelector('#_dm_reset').addEventListener('click', resetAll);
    panel.querySelector('#_dm_exit') .addEventListener('click', deactivate);
  }

  // ── Panel updates ─────────────────────────────────────────────────────────────
  function updatePanel(label, sel, left, top, w, h) {
    if (!panel) return;
    const lEl = panel.querySelector('#_dm_label');
    const sEl = panel.querySelector('#_dm_sel');
    const pEl = panel.querySelector('#_dm_pos');
    if (lEl) lEl.textContent = label;
    if (sEl) sEl.textContent = sel;
    if (pEl) pEl.innerHTML =
      `x:<b style="color:#f0c040">${left}px</b> y:<b style="color:#f0c040">${top}px</b>  ` +
      `<span style="opacity:.6">${w}×${h}px</span>`;
  }

  function msg(text, color) {
    const el = panel && panel.querySelector('#_dm_msg');
    if (!el) return;
    el.style.color = color || '#8bc98c';
    el.textContent = text;
    if (text) setTimeout(() => { if (el) el.textContent = ''; }, 4000);
  }

  // ── Pause ────────────────────────────────────────────────────────────────────
  function togglePause() {
    paused = !paused;
    const b = panel && panel.querySelector('#_dm_pause');
    if (paused) {
      if (b) { b.textContent = '▶ Resume'; b.style.background = '#6b3a00'; }
      msg('⏸ Game frozen.', '#4ab4f0');
    } else {
      if (b) { b.textContent = '⏸ Pause'; b.style.background = '#1a4a6a'; }
      if (_origRenderGame) _origRenderGame();
      reapplyOverrides();
      msg('▶ Resumed.', '#aed6b0');
    }
  }

  // ── CSS generation ────────────────────────────────────────────────────────────
  function buildCss() {
    const entries      = Object.entries(overrides);
    const builtInMoved = (window._designMoved || []).filter(m => m.dx || m.dy || m.w || m.h);
    if (!entries.length && !builtInMoved.length) return '/* No changes made */';

    const lines = ['@media (min-width: 600px) {'];

    // Our layout tool — absolute position overrides
    for (const [sel, pos] of entries) {
      lines.push(`  /* ${sel} */`);
      lines.push(`  ${sel} {`);
      lines.push(`    position: absolute !important;`);
      lines.push(`    top:    ${pos.top}px !important;`);
      lines.push(`    left:   ${pos.left}px !important;`);
      lines.push(`    width:  ${pos.width}px !important;`);
      lines.push(`    height: ${pos.height}px !important;`);
      lines.push(`  }`);
    }

    // Built-in design mode — translate offsets
    for (const m of builtInMoved) {
      if (!document.getElementById(m.id)) continue;
      lines.push(`  /* #${m.id} (built-in) */`);
      lines.push(`  #${m.id} {`);
      if (m.dx || m.dy) lines.push(`    transform: translate(${m.dx}px, ${m.dy}px) !important;`);
      if (m.w)          lines.push(`    width:  ${Math.round(m.w)}px !important;`);
      if (m.h)          lines.push(`    height: ${Math.round(m.h)}px !important;`);
      lines.push(`  }`);
    }

    lines.push('}');
    return lines.join('\n');
  }

  async function copyCss() {
    const css = buildCss();
    try { await navigator.clipboard.writeText(css); msg('✅ Copied!'); }
    catch { showCssModal(css); }
  }

  async function saveCss() {
    const css = buildCss();
    if (css === '/* No changes made */') { msg('⚠ Nothing to save.', '#f0c040'); return; }
    try {
      const res = await fetch(SAVE_URL, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ marker: CSS_MARKER, css }),
      });
      if (res.ok) msg('✅ Saved! Reload to apply.');
      else { const j = await res.json().catch(()=>({})); msg('❌ ' + (j.error||'Failed'), '#ff7766'); }
    } catch { msg('❌ Server offline — use 📋 Copy CSS.', '#ff7766'); }
  }

  // ── Undo ─────────────────────────────────────────────────────────────────────
  function undoLast() {
    if (!history.length) { msg('Nothing to undo.', '#f0c040'); return; }
    for (const sel of Object.keys(overrides)) {
      const el = document.querySelector(sel);
      if (el) el.style.cssText = el.style.cssText
        .replace(/position[^;]*;?/g,'').replace(/top[^;]*;?/g,'')
        .replace(/left[^;]*;?/g,'').replace(/width[^;]*;?/g,'')
        .replace(/height[^;]*;?/g,'').replace(/margin[^;]*;?/g,'')
        .replace(/z-index[^;]*;?/g,'');
    }
    overrides = history.pop();
    reapplyOverrides();
    hideHandles();
    msg(`⎌ Undone. ${history.length} left.`, '#aed6b0');
  }

  // ── Reset ─────────────────────────────────────────────────────────────────────
  function resetAll() {
    for (const sel of Object.keys(overrides)) {
      const el = document.querySelector(sel);
      if (el) { el.style.position = el.style.top = el.style.left =
                el.style.width = el.style.height = el.style.margin = el.style.zIndex = ''; }
    }
    overrides = {}; history = [];
    hideHandles();
    if (panel) {
      panel.querySelector('#_dm_label').textContent = 'Drag any element to move it';
      panel.querySelector('#_dm_sel').textContent   = '';
      panel.querySelector('#_dm_pos').textContent   = '';
    }
    msg('↩ Reset.', '#aed6b0');
  }

  // ── CSS modal fallback ────────────────────────────────────────────────────────
  function showCssModal(css) {
    const m = document.createElement('div');
    m.style.cssText = 'position:fixed;inset:0;z-index:1000000;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center';
    m.innerHTML = `
      <div style="background:#0d1117;border:1.5px solid #f0c040;border-radius:10px;padding:16px;max-width:520px;width:92%">
        <div style="color:#f0c040;font-weight:700;margin-bottom:8px;font-family:monospace">📋 Paste into style.css</div>
        <textarea style="width:100%;height:200px;background:#1a1a2e;color:#aed6b0;border:1px solid #444;border-radius:5px;padding:8px;font:11px/1.5 monospace;resize:vertical" readonly>${css.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
        <button onclick="this.closest('div').parentElement.remove()" style="margin-top:8px;padding:6px 18px;background:#7a2020;border:none;border-radius:5px;color:#fff;cursor:pointer;font-family:monospace">Close</button>
      </div>`;
    document.body.appendChild(m);
    m.querySelector('textarea').select();
  }

  console.log('%c⚙ Layout Tool — Ctrl+Shift+E | Built-in Design Mode — Ctrl+Shift+D', 'color:#f0c040;font-weight:700');
})();
