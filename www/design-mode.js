/**
 * Last Round — In-Browser Design Mode
 *
 * Ctrl+Shift+D  → toggle on/off
 *
 * When active:
 *   • Draggable elements are outlined in gold
 *   • Click to select, drag to reposition
 *   • Floating panel shows live x / y / size
 *   • 📋 Copy CSS  → copies the delta to clipboard
 *   • 💾 Save      → POSTs to design-server.js (localhost:3001)
 *
 * Only active on desktop (≥600 px viewport width).
 * Has zero effect on mobile or the released build.
 */
(function () {
  'use strict';

  const SAVE_URL    = 'http://localhost:3001/save-css';
  const CSS_MARKER  = 'DESKTOP_LAYOUT';

  // Elements that can be dragged. `containerId` is the element whose
  // bounding rect we use as the coordinate origin for CSS output.
  const TARGETS = [
    { sel: '#gameLog',           label: '📋 Moves Log',      container: '#screen-game' },
    { sel: '.game-info',         label: '⏱ Turn Badge',      container: '.game-main'   },
    { sel: '.requirement-info',  label: '🟠 Req. Info',      container: '.center-area' },
    { sel: '.play-pile-area',    label: '🃏 Play Pile Area',  container: '.center-area' },
    { sel: '.center-bottom-row', label: '🎴 Draw/Burn Row',   container: '.center-area' },
    { sel: '.bottom-player-area',label: '🙋 Player Zone',     container: '.game-main'   },
  ];

  let active   = false;
  let panel    = null;
  let dragData = null;
  let overrides = {};  // sel → { top, left, width, height, container }

  // ── Keyboard toggle ────────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      active ? deactivate() : activate();
    }
  });

  // ── Activate ───────────────────────────────────────────────────────────────
  function activate() {
    if (window.innerWidth < 600) {
      alert('Design mode is desktop-only (viewport ≥ 600 px).');
      return;
    }
    active = true;
    buildPanel();
    attachTargets();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
  }

  function deactivate() {
    active = false;
    detachTargets();
    if (panel) { panel.remove(); panel = null; }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup',   onMouseUp);
    dragData = null;
  }

  // ── Panel ──────────────────────────────────────────────────────────────────
  function btn(label, bg, id) {
    return `<button id="${id}" style="flex:1;padding:5px 2px;background:${bg};border:none;
border-radius:5px;color:#fff;cursor:pointer;font:11px/1 monospace;white-space:nowrap">${label}</button>`;
  }

  function buildPanel() {
    panel = document.createElement('div');
    panel.style.cssText = [
      'position:fixed', 'bottom:14px', 'right:14px', 'z-index:999999',
      'background:#0d1117', 'border:1.5px solid #f0c040', 'border-radius:10px',
      'padding:10px 14px', 'color:#fff', 'font:12px/1.5 monospace',
      'min-width:234px', 'box-shadow:0 6px 24px rgba(0,0,0,.85)',
      'user-select:none', 'pointer-events:auto',
    ].join(';');

    panel.innerHTML = `
      <div style="color:#f0c040;font-weight:700;font-size:13px;margin-bottom:6px">
        ⚙ Design Mode
        <span style="font-size:9px;opacity:.45;margin-left:4px">Ctrl+Shift+D</span>
      </div>
      <div id="_dm_label" style="color:#aed6b0;font-size:11px;margin-bottom:3px">
        Click a highlighted element
      </div>
      <div id="_dm_pos" style="color:#fff;font-size:11px;min-height:16px;margin-bottom:8px"></div>
      <div style="display:flex;gap:5px;margin-bottom:6px">
        ${btn('📋 Copy CSS', '#2a5a8c', '_dm_copy')}
        ${btn('💾 Save to File', '#1e6b42', '_dm_save')}
        ${btn('↩ Reset', '#5a4a00', '_dm_reset')}
        ${btn('✕ Exit', '#6b1a1a', '_dm_exit')}
      </div>
      <div id="_dm_msg" style="color:#8bc98c;font-size:10px;min-height:12px"></div>
    `;

    document.body.appendChild(panel);

    panel.querySelector('#_dm_copy') .addEventListener('click', copyCss);
    panel.querySelector('#_dm_save') .addEventListener('click', saveCss);
    panel.querySelector('#_dm_reset').addEventListener('click', resetAll);
    panel.querySelector('#_dm_exit') .addEventListener('click', deactivate);
  }

  // ── Target management ──────────────────────────────────────────────────────
  function attachTargets() {
    TARGETS.forEach(t => {
      const el = document.querySelector(t.sel);
      if (!el) return;
      el._dmTarget = t;
      el.style.outline       = '2px dashed rgba(240,192,64,.8)';
      el.style.outlineOffset = '2px';
      el.style.cursor        = 'grab';
      el.addEventListener('mousedown', onMouseDown);
    });
  }

  function detachTargets() {
    TARGETS.forEach(t => {
      const el = document.querySelector(t.sel);
      if (!el) return;
      el.style.outline       = '';
      el.style.outlineOffset = '';
      el.style.cursor        = '';
      el.removeEventListener('mousedown', onMouseDown);
      delete el._dmTarget;
    });
  }

  // ── Drag ───────────────────────────────────────────────────────────────────
  function onMouseDown(e) {
    if (!active || !e.currentTarget._dmTarget) return;
    e.preventDefault();
    e.stopPropagation();

    const el     = e.currentTarget;
    const target = el._dmTarget;
    const ref    = document.querySelector(target.container) || document.body;

    const elRect  = el.getBoundingClientRect();
    const refRect = ref.getBoundingClientRect();

    // Compute position relative to the container's top-left
    const curTop  = elRect.top  - refRect.top;
    const curLeft = elRect.left - refRect.left;

    // Switch to absolute so we can free-position it
    const cs = window.getComputedStyle(el);
    if (cs.position !== 'absolute' && cs.position !== 'fixed') {
      el.style.position = 'absolute';
      el.style.width    = elRect.width  + 'px';
      el.style.height   = elRect.height + 'px';
      el.style.margin   = '0';
    }
    el.style.top  = curTop  + 'px';
    el.style.left = curLeft + 'px';

    // Make sure the container is a positioning context
    const refCs = window.getComputedStyle(ref);
    if (refCs.position === 'static') ref.style.position = 'relative';

    el.style.cursor  = 'grabbing';
    el.style.outline = '2px solid #f0c040';
    el.style.zIndex  = '500';

    dragData = {
      el, ref, refRect, target,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startTop:  curTop,
      startLeft: curLeft,
    };

    updatePanel(el, target.label, Math.round(curLeft), Math.round(curTop),
      Math.round(elRect.width), Math.round(elRect.height));
  }

  function onMouseMove(e) {
    if (!dragData) return;
    const { el, target, startMouseX, startMouseY, startTop, startLeft } = dragData;

    const newTop  = startTop  + (e.clientY - startMouseY);
    const newLeft = startLeft + (e.clientX - startMouseX);
    el.style.top  = newTop  + 'px';
    el.style.left = newLeft + 'px';

    const r = el.getBoundingClientRect();
    updatePanel(el, target.label,
      Math.round(newLeft), Math.round(newTop),
      Math.round(r.width), Math.round(r.height));
  }

  function onMouseUp() {
    if (!dragData) return;
    const { el, ref, target } = dragData;

    el.style.cursor  = 'grab';
    el.style.outline = '2px dashed rgba(240,192,64,.8)';

    const elRect  = el.getBoundingClientRect();
    const refRect = ref.getBoundingClientRect();

    overrides[target.sel] = {
      top:       Math.round(elRect.top  - refRect.top),
      left:      Math.round(elRect.left - refRect.left),
      width:     Math.round(elRect.width),
      height:    Math.round(elRect.height),
      container: target.container,
    };

    dragData = null;
  }

  // ── Panel updates ──────────────────────────────────────────────────────────
  function updatePanel(el, label, left, top, w, h) {
    const labelEl = panel.querySelector('#_dm_label');
    const posEl   = panel.querySelector('#_dm_pos');
    if (labelEl) labelEl.textContent = label;
    if (posEl)   posEl.innerHTML =
      `x: <b style="color:#f0c040">${left}px</b>  ` +
      `y: <b style="color:#f0c040">${top}px</b>  ` +
      `<span style="opacity:.6">${w}×${h}px</span>`;
  }

  function msg(text, color) {
    const el = panel && panel.querySelector('#_dm_msg');
    if (!el) return;
    el.style.color = color || '#8bc98c';
    el.textContent = text;
    if (text) setTimeout(() => { if (el) el.textContent = ''; }, 4000);
  }

  // ── CSS generation ─────────────────────────────────────────────────────────
  function buildCss() {
    const entries = Object.entries(overrides);
    if (!entries.length) return '/* No changes made */';

    const lines = ['@media (min-width: 600px) {'];
    for (const [sel, pos] of entries) {
      lines.push(`  /* ${sel} — dragged in design mode */`);
      lines.push(`  ${sel} {`);
      lines.push(`    position: absolute !important;`);
      lines.push(`    top:    ${pos.top}px !important;`);
      lines.push(`    left:   ${pos.left}px !important;`);
      lines.push(`    width:  ${pos.width}px !important;`);
      lines.push(`    height: ${pos.height}px !important;`);
      lines.push(`  }`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  async function copyCss() {
    const css = buildCss();
    try {
      await navigator.clipboard.writeText(css);
      msg('✅ Copied to clipboard!');
    } catch {
      showCssModal(css);
    }
  }

  async function saveCss() {
    const css = buildCss();
    if (css === '/* No changes made */') { msg('⚠ Nothing to save yet.', '#f0c040'); return; }
    try {
      const res = await fetch(SAVE_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ marker: CSS_MARKER, css }),
      });
      if (res.ok) {
        msg('✅ Saved! Reload the page to apply.');
      } else {
        const j = await res.json().catch(() => ({}));
        msg('❌ ' + (j.error || 'Save failed'), '#ff7766');
      }
    } catch {
      msg('❌ Server offline — use 📋 Copy CSS instead.', '#ff7766');
    }
  }

  function resetAll() {
    TARGETS.forEach(t => {
      const el = document.querySelector(t.sel);
      if (!el) return;
      el.style.position = '';
      el.style.top      = '';
      el.style.left     = '';
      el.style.width    = '';
      el.style.height   = '';
      el.style.margin   = '';
      el.style.zIndex   = '';
    });
    overrides = {};
    const labelEl = panel.querySelector('#_dm_label');
    const posEl   = panel.querySelector('#_dm_pos');
    if (labelEl) labelEl.textContent = 'Click a highlighted element';
    if (posEl)   posEl.textContent   = '';
    msg('↩ Positions reset to CSS defaults.', '#aed6b0');
  }

  function showCssModal(css) {
    const m = document.createElement('div');
    m.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:1000000',
      'background:rgba(0,0,0,.85)',
      'display:flex', 'align-items:center', 'justify-content:center',
    ].join(';');
    m.innerHTML = `
      <div style="background:#0d1117;border:1.5px solid #f0c040;border-radius:10px;
                  padding:16px;max-width:520px;width:92%">
        <div style="color:#f0c040;font-weight:700;margin-bottom:8px;font-family:monospace">
          📋 Paste this into style.css
        </div>
        <textarea style="width:100%;height:200px;background:#1a1a2e;color:#aed6b0;
                         border:1px solid #444;border-radius:5px;padding:8px;
                         font:11px/1.5 monospace;resize:vertical"
                  readonly>${escapeHtml(css)}</textarea>
        <button onclick="this.closest('div').parentElement.remove()"
                style="margin-top:8px;padding:6px 18px;background:#7a2020;
                       border:none;border-radius:5px;color:#fff;cursor:pointer;
                       font-family:monospace">Close</button>
      </div>`;
    document.body.appendChild(m);
    m.querySelector('textarea').select();
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  console.log('%c⚙ Design Mode available — Ctrl+Shift+D', 'color:#f0c040;font-weight:700');
})();
