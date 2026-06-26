// ============================================================
// PLATFORM DETECTION
// ============================================================
const IS_WEB = !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const GAME_VERSION = '1.1';

// ============================================================
// CONSTANTS
// ============================================================
const SUITS = ['♠', '♥', '♦', '♣'];
const RED_SUITS = new Set(['♥', '♦']);
const ALL_VALUES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const ACTION_VALUES = new Set(['2','3','5','7','10']);
const NUMBER_HIERARCHY = ['4','6','8','9','J','Q','K','A'];

function getRank(v) { return NUMBER_HIERARCHY.indexOf(v); } // -1 = action card
function isAction(v) { return ACTION_VALUES.has(v); }
function suitColor(s) { return RED_SUITS.has(s) ? 'red' : 'black'; }

const ACTION_EFFECTS = {
  '2':  'Fresh Pint! Next player can play anything',
  '3':  "Bull's Eye! Draw a card and play again",
  '5':  'Bar Mirror — copies the card beneath it',
  '7':  'Last Orders — next must play 4 or 6',
  '10': 'Keg Blast! Pile burns — play again!',
};

// Inline SVG icons per deck theme — used in action reveal overlay
const ACTION_SVG_THEMES = {
  classic: {
    '2':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6L11 30H25L27 6Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 11C34 11 34 23 27 23" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M9 9Q13 6 18 8Q22 5 27 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="15" cy="16" r="1.5" fill="currentColor"/><circle cx="21" cy="20" r="1.2" fill="currentColor"/></svg>',
    '3':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="13" stroke="currentColor" stroke-width="2.5"/><circle cx="18" cy="18" r="8.5" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="4" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="1.5" fill="currentColor"/><line x1="29" y1="7" x2="20.5" y2="15.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polygon points="29,7 34,3 31,8.5 27.5,7" fill="currentColor"/></svg>',
    '5':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="15" rx="11" ry="13" stroke="currentColor" stroke-width="2.5"/><path d="M13 28L11 33M23 28L25 33" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="9" y1="33" x2="27" y2="33" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M11 11Q12 8 15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>',
    '7':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 5Q28 8 28 20H8Q8 8 18 5Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><line x1="7" y1="21" x2="29" y2="21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="18" cy="24" r="2.5" stroke="currentColor" stroke-width="2"/><line x1="18" y1="27" x2="18" y2="31" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="13,29 18,33 23,29" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '10': '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="11" y="15" width="14" height="16" rx="4" stroke="currentColor" stroke-width="2.5"/><line x1="11" y1="21" x2="25" y2="21" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="27" x2="25" y2="27" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="11" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="7" r="2.5" fill="currentColor"/><line x1="18" y1="4" x2="18" y2="2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="5" x2="24" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="5" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="26" y1="8" x2="28" y2="7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="10" y1="8" x2="8" y2="7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  },
  forest: {
    '2':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 21Q7 9 18 9Q29 9 29 21Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 21Q13 27 15 30Q17 32 19 30Q21 27 22 21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="14" cy="14" r="2" fill="currentColor"/><circle cx="23" cy="13" r="1.5" fill="currentColor"/><circle cx="18" cy="11" r="1.2" fill="currentColor"/></svg>',
    '3':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="24" rx="7" ry="9" stroke="currentColor" stroke-width="2.5"/><path d="M11 20Q11 15 18 15Q25 15 25 20Z" stroke="currentColor" stroke-width="2.5"/><line x1="18" y1="15" x2="18" y2="11" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M18 11Q22 6 26 9Q23 13 18 11Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    '5':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L13 8L17 18Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 18L23 8L27 18Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><line x1="4" y1="18" x2="32" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 20L13 30L17 20Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity="0.45"/><path d="M19 20L23 30L27 20Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity="0.45"/></svg>',
    '7':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 4L20.5 10L26 8L22.5 14L28 15L22.5 17L24 22L18 19L12 22L13.5 17L8 15L13.5 14L10 8L15.5 10Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="18" y1="19" x2="18" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="24" x2="18" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="14,27 18,32 22,27" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '10': '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23 3L13 18L19 18L13 33L25 16L19 16Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="8" x2="11" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/><line x1="4" y1="17" x2="10" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/><line x1="30" y1="10" x2="27" y2="14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/><line x1="33" y1="19" x2="27" y2="19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/></svg>',
  },
  royal: {
    '2':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 26L5 19L11 24L18 10L25 24L31 19L31 26Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><line x1="5" y1="26" x2="31" y2="26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="18" cy="12" r="2.5" fill="currentColor"/><circle cx="6" cy="21" r="2" fill="currentColor"/><circle cx="30" cy="21" r="2" fill="currentColor"/></svg>',
    '3':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="18,4 31,14 18,33 5,14" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><polygon points="18,4 31,14 18,19 5,14" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="5" y1="14" x2="31" y2="14" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="6" x2="5" y2="14" stroke="currentColor" stroke-width="1"/><line x1="25" y1="6" x2="31" y2="14" stroke="currentColor" stroke-width="1"/></svg>',
    '5':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="15" rx="10" ry="12" stroke="currentColor" stroke-width="2.5"/><path d="M14 4Q18 1 22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="2" r="1.8" fill="currentColor"/><path d="M13 27L11 33M23 27L25 33" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="9" y1="33" x2="27" y2="33" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M11 11Q12 8 15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>',
    '7':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="8" r="5.5" stroke="currentColor" stroke-width="2.5"/><line x1="18" y1="13.5" x2="18" y2="27" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="11" y1="20" x2="25" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="13,24 18,30 23,24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '10': '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="14" width="22" height="7" rx="3.5" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="14" x2="12" y2="21" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="14" x2="18" y2="21" stroke="currentColor" stroke-width="1.5"/><circle cx="11" cy="23" r="4" stroke="currentColor" stroke-width="2.2"/><circle cx="21" cy="23" r="4" stroke="currentColor" stroke-width="2.2"/><circle cx="30" cy="10" r="3.5" stroke="currentColor" stroke-width="2.2"/><path d="M24 14L28 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/></svg>',
  },
  midnight: {
    '2':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 7Q28 12 28 18Q28 27 20 31Q12 30 9 24Q16 23 20 18Q24 12 20 7Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="10" cy="9" r="1.5" fill="currentColor"/><circle cx="7" cy="16" r="1.2" fill="currentColor"/><circle cx="13" cy="5" r="1" fill="currentColor"/></svg>',
    '3':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 7L11.5 11.5L16 11.5L12.5 14L14 18.5L10 16L6 18.5L7.5 14L4 11.5L8.5 11.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M26 4L27.5 8.5L32 8.5L28.5 11L30 15.5L26 13L22 15.5L23.5 11L20 8.5L24.5 8.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M18 21L19.5 25.5L24 25.5L20.5 28L22 32.5L18 30L14 32.5L15.5 28L12 25.5L16.5 25.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><line x1="10" y1="13" x2="23" y2="10" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity="0.45"/><line x1="26" y1="11" x2="20" y2="24" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity="0.45"/></svg>',
    '5':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 9Q17 5 18 12Q15 14 12 14Q9 21 12 26Q9 24 8 18Q7 12 10 9Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 9Q19 5 18 12Q21 14 24 14Q27 21 24 26Q27 24 28 18Q29 12 26 9Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="18" cy="18" r="1.5" fill="currentColor"/><circle cx="18" cy="10" r="1" fill="currentColor"/><circle cx="18" cy="26" r="1" fill="currentColor"/></svg>',
    '7':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 5L20 10.5L26 10.5L21.5 14L23 19.5L18 16L13 19.5L14.5 14L10 10.5L16 10.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="18" y1="19" x2="18" y2="27" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="13,24 18,30 23,24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="15.5" y1="22" x2="18" y2="27" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><line x1="20.5" y1="22" x2="18" y2="27" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>',
    '10': '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="4.5" stroke="currentColor" stroke-width="2.5"/><line x1="18" y1="13.5" x2="18" y2="6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="22.5" x2="18" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="13.5" y1="18" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="22.5" y1="18" x2="30" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="15.5" y1="15.5" x2="9" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="20.5" y1="15.5" x2="27" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15.5" y1="20.5" x2="9" y2="27" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="20.5" y1="20.5" x2="27" y2="27" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="5" r="2" fill="currentColor"/><circle cx="18" cy="31" r="2" fill="currentColor"/><circle cx="5" cy="18" r="2" fill="currentColor"/><circle cx="31" cy="18" r="2" fill="currentColor"/></svg>',
  },
  inferno: {
    '2':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 32Q10 22 14 13Q16 8 18 5Q20 8 22 13Q26 22 18 32Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 13Q7 9 10 3L15 10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 13Q29 9 26 3L21 10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '3':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 32Q7 24 10 18Q12 14 12 11Q14 15 13 22Q14 27 10 32Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M18 32Q14 23 18 16Q20 11 20 8Q22 13 21 20Q22 26 18 32Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 32Q23 24 26 18Q28 14 28 11Q30 15 29 22Q30 27 26 32Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
    '5':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 32Q6 23 9 14Q11 8 13 5Q15 10 14 18Q15 25 12 32Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 32Q30 23 27 14Q25 8 23 5Q21 10 22 18Q21 25 24 32Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><line x1="18" y1="5" x2="18" y2="32" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.3"/></svg>',
    '7':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 4Q25 11 25 20Q25 29 18 33Q11 29 11 20Q11 11 18 4Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M15 17Q17 14 19 17Q18 22 15 17Z" stroke="currentColor" stroke-width="1.5" opacity="0.55"/></svg>',
    '10': '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 33L18 8L33 33Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M13 14Q18 10 23 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 10Q16 4 18 2Q20 4 21 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M10 24Q7 27 9 31" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M26 24Q29 27 27 31" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="14" cy="2" r="1.5" fill="currentColor"/><circle cx="22" cy="2" r="1.5" fill="currentColor"/></svg>',
  },
  legend: {
    '2':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 20Q10 12 16 10Q22 8 26 12Q30 16 28 22Q26 28 18 30Q12 28 10 20Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M22 8Q25 4 28 6Q26 9 22 10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="22" cy="18" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="22" cy="18" r="1" fill="currentColor"/><path d="M10 22Q6 20 4 24Q7 26 10 24" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 24Q2 27 4 29" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/></svg>',
    '3':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="20" width="22" height="13" rx="2" stroke="currentColor" stroke-width="2.5"/><path d="M7 20Q7 13 18 13Q29 13 29 20" stroke="currentColor" stroke-width="2.5"/><line x1="7" y1="20" x2="29" y2="20" stroke="currentColor" stroke-width="2.5"/><rect x="14" y="23" width="8" height="5" rx="1.5" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="23" r="1.5" fill="currentColor"/><line x1="11" y1="12" x2="9" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="10" x2="18" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="12" x2="27" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    '5':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="17" r="13" stroke="currentColor" stroke-width="2.5"/><line x1="10" y1="30" x2="26" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M12 30L10 33Q14 35 18 35Q22 35 26 33L24 30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 13Q13 10 16 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.45"/><circle cx="22" cy="12" r="1.5" fill="currentColor" opacity="0.7"/><circle cx="24" cy="19" r="1" fill="currentColor" opacity="0.5"/></svg>',
    '7':  '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23 3L12 18L19 18L13 33L25 16L18 16Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="26" y1="6" x2="29" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.65"/><line x1="28" y1="13" x2="32" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/><line x1="8" y1="8" x2="5" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.65"/><line x1="6" y1="15" x2="2" y2="14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/></svg>',
    '10': '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="5" stroke="currentColor" stroke-width="2.5"/><line x1="18" y1="13" x2="18" y2="5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="23" x2="18" y2="31" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="13" y1="18" x2="5" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="23" y1="18" x2="31" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="14.5" y1="14.5" x2="8" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="21.5" y1="14.5" x2="28" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="14.5" y1="21.5" x2="8" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="21.5" y1="21.5" x2="28" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="4" r="2" fill="currentColor"/><circle cx="18" cy="32" r="2" fill="currentColor"/><circle cx="4" cy="18" r="2" fill="currentColor"/><circle cx="32" cy="18" r="2" fill="currentColor"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/><circle cx="29" cy="7" r="1.5" fill="currentColor"/><circle cx="7" cy="29" r="1.5" fill="currentColor"/><circle cx="29" cy="29" r="1.5" fill="currentColor"/></svg>',
  },
};

function getActionSVG(value) {
  return (ACTION_SVG_THEMES[G_DESIGN] || ACTION_SVG_THEMES.classic)[value] || '';
}

const CARD_PICTOGRAM = {
  '2':  '🍺',  // Fresh pint — wipes the slate, anything goes
  '3':  '🎯',  // Bull's eye — draw a card and keep your turn
  '4':  '🔑',  // The key — unlocks the game
  '5':  '🪞',  // Bar mirror — copies the card below
  '6':  '🤫',  // Sneaky — flies under the 7 restriction
  '7':  '🔔',  // Last orders — next player must go lower
  '8':  '🥔',  // Burnt potato — worthless
  '9':  '🥔',  // Burnt potato — still worthless
  '10': '💥',  // Keg blast — blows up the pile
  'J':  '🤡',  // Jester — the court fool
  'Q':  '💅',  // Queen energy
  'K':  '👑',  // Crown
  'A':  '🌟',  // Star — top of the deck
};

// ============================================================
// LEAGUES & DECK DESIGNS
// ============================================================
const LEAGUES = [
  { id: 'rookie',   name: 'Pub Rookie',       icon: '🍺', min: 0,    max: 99,   color: '#6a9450' },
  { id: 'regular',  name: 'Regular',           icon: '🎲', min: 100,  max: 299,  color: '#4a80b0' },
  { id: 'sharp',    name: 'Card Sharp',        icon: '🃏', min: 300,  max: 599,  color: '#8050b0' },
  { id: 'house',    name: 'House Player',      icon: '🏠', min: 600,  max: 999,  color: '#b08030' },
  { id: 'standing', name: 'Last Man Standing', icon: '🥇', min: 1000, max: 1499, color: '#c09020' },
  { id: 'legend',   name: 'Pub Legend',        icon: '👑', min: 1500, max: 99999, color: '#c030a0' },
];

const DECK_DESIGNS = [
  { id: 'classic',  name: 'Classic Pub',   icon: '🍺', unlockWins: 0,    unlockLabel: 'Available to all'               },
  { id: 'forest',   name: 'Dark Forest',   icon: '🌲', unlockWins: 100,  unlockLabel: 'Unlock at Regular (100 wins)'    },
  { id: 'royal',    name: 'Royal Gold',    icon: '👑', unlockWins: 300,  unlockLabel: 'Unlock at Card Sharp (300 wins)' },
  { id: 'midnight', name: 'Midnight',      icon: '🌙', unlockWins: 600,  unlockLabel: 'Unlock at House Player (600 wins)' },
  { id: 'inferno',  name: 'Inferno',       icon: '🔥', unlockWins: 1000, unlockLabel: 'Unlock at Last Man Standing (1000 wins)' },
  { id: 'legend',   name: 'Pub Legend',    icon: '✨', unlockWins: 1500, unlockLabel: 'Unlock at Pub Legend (1500 wins)' },
];

function getLeague(wins) {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (wins >= LEAGUES[i].min) return LEAGUES[i];
  }
  return LEAGUES[0];
}

function getUnlockedDesigns(wins) {
  return DECK_DESIGNS.filter(d => wins >= d.unlockWins);
}

function getBestDesign() {
  const myName = localStorage.getItem('lr_my_name');
  const wins = myName ? (getLB()[myName]?.wins || 0) : 0;
  const unlocked = getUnlockedDesigns(wins);
  return unlocked[unlocked.length - 1]?.id || 'classic';
}

let G_DESIGN = 'classic';
let _lastPlayedCard = null;

function applyDesign(id) {
  G_DESIGN = id || 'classic';
  document.body.className = document.body.className.replace(/\btheme-\S+/g, '').trim();
  document.body.classList.add('theme-' + G_DESIGN);
}

function getProfile(name) {
  try { return JSON.parse(localStorage.getItem('lr_profiles') || '{}')[name] || null; }
  catch { return null; }
}

function saveProfile(name, data) {
  try {
    const p = JSON.parse(localStorage.getItem('lr_profiles') || '{}');
    p[name] = { ...(p[name] || {}), ...data };
    localStorage.setItem('lr_profiles', JSON.stringify(p));
    if (fbReady()) {
      const { db, ref, update: fbUp } = fb();
      fbUp(ref(db, `profiles/${fbSafe(name)}`), { ...p[name], name })
        .catch(() => {});
    }
  } catch {}
}

// ============================================================
// AVATAR SYSTEM
// ============================================================
const AVATAR_EMOJIS = [
  '😈','🥔','💀','🤡','🫵','👑','💅','🔥','💣','🌀',
  '🍺','⚡','🏆','🤙','😤','🤬','🤯','😴','😏','👀',
  '🎲','🃏','🎭','🦊','🐺','🤖','👻','💩','🦄','🐉',
];

function getAvatar(name) {
  return getProfile(name)?.avatar || '🎲';
}

function isRegisteredPlayer(name) {
  if (name === localStorage.getItem('lr_my_name') && isRegistered()) return true;
  return getProfile(name)?.registered === true;
}

function avatarHTML(name, size) {
  const lb = getLB();
  const wins = lb[name]?.wins || 0;
  const league = getLeague(wins);
  const emoji = getAvatar(name);
  const badge = isRegisteredPlayer(name) ? '' : '<span class="visitor-badge">VISITOR</span>';
  return `<div class="avatar-wrap league-${league.id} avatar-${size || 'md'}" title="${league.name}"><div class="avatar-inner">${emoji}</div>${badge}</div>`;
}

let _avPickerCloser = null;

function openAvatarPicker(e, getName, onPick) {
  e.stopPropagation();
  if (_avPickerCloser) { _avPickerCloser(); return; }

  const name = getName();
  const panel = document.createElement('div');
  panel.className = 'avatar-picker-panel';
  panel.innerHTML = AVATAR_EMOJIS.map(em =>
    `<button class="av-em-btn${getAvatar(name) === em ? ' av-active' : ''}" data-em="${em}">${em}</button>`
  ).join('');

  panel.querySelectorAll('.av-em-btn').forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.stopPropagation();
      const em = btn.dataset.em;
      saveProfile(getName(), { avatar: em });
      if (onPick) onPick(em);
      close();
    });
  });

  const rect = e.currentTarget.getBoundingClientRect();
  panel.style.position = 'fixed';
  panel.style.top  = (rect.bottom + 6) + 'px';
  panel.style.left = Math.max(4, Math.min(window.innerWidth - 218, rect.left - 80)) + 'px';
  document.body.appendChild(panel);

  const close = () => {
    panel.remove();
    document.removeEventListener('click', close);
    _avPickerCloser = null;
  };
  _avPickerCloser = close;
  setTimeout(() => document.addEventListener('click', close), 0);
}

function renderDesignPicker() {
  const container = document.getElementById('designPicker');
  if (!container) return;
  const p1Input = document.getElementById('playerNameInputs')?.querySelector('input');
  const name = p1Input?.value?.trim() || '';
  const wins = getLB()[name]?.wins || 0;
  container.innerHTML = '';
  DECK_DESIGNS.forEach(d => {
    const unlocked = wins >= d.unlockWins;
    const selected = G_DESIGN === d.id;
    const item = document.createElement('div');
    item.className = 'design-item' + (selected ? ' design-selected' : '') + (!unlocked ? ' design-locked' : '');
    item.title = unlocked ? d.name : d.unlockLabel;
    item.innerHTML = `<div class="design-preview back-${d.id}"></div>
      <div class="design-name">${d.icon} ${d.name}</div>
      ${!unlocked ? `<div class="design-lock-label">🔒 ${d.unlockWins}w</div>` : ''}`;
    if (unlocked) {
      item.addEventListener('click', () => { applyDesign(d.id); renderDesignPicker(); });
    }
    container.appendChild(item);
  });
}

// ============================================================
// DECK
// ============================================================
function createDeck() {
  const d = [];
  for (const s of SUITS)
    for (const v of ALL_VALUES)
      d.push({ suit: s, value: v });
  return d;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// GAME STATE
// ============================================================
let G = null;
let _winAutoRedirect = null;
let _lastGameConfig = null;
let _rematchStreak = { name: null, count: 0 };

// AFK demo
let _afkTimer = null;
let _afkDemoActive = false;
let _afkListenersActive = false;
const _AFK_DEMO_MS = 5 * 60 * 1000;

function _resetAfkTimer() {
  clearTimeout(_afkTimer);
  _afkTimer = setTimeout(_startAfkDemo, _AFK_DEMO_MS);
}

function _addAfkListeners() {
  if (_afkListenersActive) return;
  _afkListenersActive = true;
  document.addEventListener('pointermove', _resetAfkTimer, { passive: true });
  document.addEventListener('pointerdown', _resetAfkTimer, { passive: true });
  document.addEventListener('keydown', _resetAfkTimer);
}

function _removeAfkListeners() {
  if (!_afkListenersActive) return;
  _afkListenersActive = false;
  document.removeEventListener('pointermove', _resetAfkTimer);
  document.removeEventListener('pointerdown', _resetAfkTimer);
  document.removeEventListener('keydown', _resetAfkTimer);
}

function _startAfkDemo() {
  _afkDemoActive = true;
  _removeAfkListeners();
  newGame({ numPlayers: 2, vsAI: true, direction: 1, names: ['CPU 1', 'CPU 2'] });
  G.players[0].isAI = true;
  G.setupIdx = 0;
  G.gamePhase = 'setup';
  aiDoSetup(); // recurses through both AI players, calls showScreen('game')
  document.getElementById('demoOverlay')?.classList.remove('hidden');
  document.addEventListener('pointerdown', _handleDemoInteraction, { capture: true });
  document.addEventListener('keydown', _handleDemoInteraction, { capture: true });
}

function _handleDemoInteraction() {
  _stopAfkDemo();
}

function _stopAfkDemo() {
  if (!_afkDemoActive) return;
  _afkDemoActive = false;
  clearTimeout(_afkTimer);
  document.removeEventListener('pointerdown', _handleDemoInteraction, { capture: true });
  document.removeEventListener('keydown', _handleDemoInteraction, { capture: true });
  document.getElementById('demoOverlay')?.classList.add('hidden');
  if (G) G.gamePhase = 'gameover';
  clearTurnTimer();
  showScreen('menu');
}

function newGame(config) {
  _lastGameConfig = { ...config };
  clearTimeout(_winAutoRedirect);
  document.getElementById('win-overlay')?.classList.add('hidden');
  const { numPlayers, vsAI, direction, names } = config;
  const deck = shuffle(createDeck());
  let pos = 0;
  const players = [];

  for (let i = 0; i < numPlayers; i++) {
    const blind = deck.slice(pos, pos + 3); pos += 3;
    const dealt = deck.slice(pos, pos + 6); pos += 6;
    players.push({
      id: i,
      name: names[i] || `Player ${i + 1}`,
      blind,
      faceUp: [],
      hand: dealt,
      isAI: vsAI && i > 0,
      phase: 'hand',
      finished: false,
    });
  }

  G = {
    players,
    playDeck: deck.slice(pos),
    burnDeck: [],      // active play pile
    burnPile: [],      // cards removed by 10, four-of-a-kind, or 3s
    direction,
    currentIdx: 0,
    gamePhase: 'setup',  // setup | playing | gameover
    setupIdx: 0,
    req: { mustPlayLower: false, minValue: null, afterReset: false },
    winner: null,
    firstCardPlayed: false,
    startingValue: null,
    selected: new Set(),
    log: [],
    message: '',
    placements: [],
    transitioning: false,
    drinkingMode: config.drinkingMode || false,
    isSpudEscape: false,
    stats: { startTime: null, turns: 0, burns: 0 },
    turnPlays: 0,
  };
  G.players.forEach(p => { p.stats = { played: 0, pickups: 0, actions: 0 }; });
}

// ============================================================
// REQUIREMENTS HELPERS
// ============================================================
function getEffectiveTopValue() {
  for (let i = G.burnDeck.length - 1; i >= 0; i--)
    if (G.burnDeck[i].value !== '5') return G.burnDeck[i].value;
  return null;
}

function canPlay(card) {
  // Game start: player must play the card that determined who goes first
  if (!G.firstCardPlayed && G.gamePhase === 'playing' && G.startingValue) {
    const p = G.players[G.currentIdx];
    const src = activeSource(p);
    const avail = src === 'hand' ? p.hand : (src === 'faceup' ? p.faceUp : null);
    if (avail && avail.some(c => c.value === G.startingValue) && card.value !== G.startingValue) return false;
  }
  if (isAction(card.value)) return true;
  if (G.req.afterReset) return true;
  if (G.req.mustPlayLower) return card.value === '4' || card.value === '6';
  if (G.req.minValue === null) return true;
  return getRank(card.value) >= getRank(G.req.minValue);
}

function applyRequirementAfterPlay(value) {
  if (value === '2') {
    G.req = { mustPlayLower: false, minValue: null, afterReset: true };
  } else if (value === '7') {
    G.req = { mustPlayLower: true, minValue: null, afterReset: false };
  } else if (value === '5') {
    // Mirror: inherit current state, update minValue to reflected top
    const eff = getEffectiveTopValue();
    if (eff === '7') {
      G.req = { mustPlayLower: true, minValue: null, afterReset: false };
    } else if (eff && !isAction(eff)) {
      G.req = { mustPlayLower: false, minValue: eff, afterReset: false };
    }
    // else: keep current req (e.g. mirror on action with no number below)
  } else if (value === '3') {
    // swap — requirement unchanged for next player
  } else if (value === '10') {
    // burn — handled separately
  } else {
    // normal number card
    G.req = { mustPlayLower: false, minValue: value, afterReset: false };
  }
}

function checkFourOfAKind() {
  const deck = G.burnDeck;
  if (deck.length < 4) return false;
  const top4 = deck.slice(-4);
  // Special case: all 4 are 5s → burn
  if (top4.every(c => c.value === '5')) return true;
  // If any 5 is among the top 4, 5 breaks the streak — no burn
  if (top4.some(c => c.value === '5')) return false;
  // All 4 same non-action value → burn
  const v = top4[0].value;
  return !isAction(v) && top4.every(c => c.value === v);
}

// ============================================================
// DRAW / PICKUP
// ============================================================
function drawToThree(player) {
  while (player.hand.length < 3 && G.playDeck.length > 0)
    player.hand.push(G.playDeck.pop());
  refreshPhase(player);
}

function pickUpBurnPile(player) {
  player.hand.push(...G.burnDeck);
  G.burnDeck = [];
  G.req = { mustPlayLower: false, minValue: null, afterReset: false };
  refreshPhase(player);
  addLog(t('log.picks_up_pile', {name: player.name, n: player.hand.length}));
  showDrinkPrompt('pickup', player.name);
}

function doBurn(playerContinues) {
  G.burnPile.push(...G.burnDeck);
  G.burnDeck = [];
  G.req = { mustPlayLower: false, minValue: null, afterReset: false };
  G.stats.burns += 1;
  addLog(t('log.burn'));
  if (playerContinues) {
    drawToThree(curPlayer());
  }
}

function refreshPhase(p) {
  if (p.hand.length > 0) p.phase = 'hand';
  else if (p.faceUp.length > 0) p.phase = 'faceup';
  else if (p.blind.length > 0) p.phase = 'blind';
  else p.phase = 'done';
}

// ============================================================
// SETUP PHASE
// ============================================================
function setupSelectCard(fromArea, idx) {
  const p = G.players[G.setupIdx];
  if (fromArea === 'hand') {
    if (p.faceUp.length < 3) {
      const [card] = p.hand.splice(idx, 1);
      p.faceUp.push(card);
    }
  } else {
    const [card] = p.faceUp.splice(idx, 1);
    p.hand.push(card);
  }
  renderSetup();
}

function confirmSetup() {
  const p = G.players[G.setupIdx];
  if (p.faceUp.length !== 3) { showMsg(t('setup.pick_3')); return; }

  if (ONLINE.active) {
    const { db, ref, set: fbSet } = fb();
    fbSet(ref(db, `rooms/${ONLINE.roomCode}/faceUpConfirm/${ONLINE.myIdx}`), {
      faceUp: p.faceUp, hand: p.hand,
    });
    showToast(t('setup.locked'));
    document.getElementById('btnConfirmSetup').disabled = true;
    return;
  }

  G.setupIdx++;
  if (G.setupIdx >= G.players.length) {
    G.gamePhase = 'playing';
    G.currentIdx = determineStarter();
    addLog(t('log.goes_first', {name: curPlayer().name}));
    applyDesign(G_DESIGN);
    showScreen('game');
    renderGame();
    scheduleAI();
    if (!localStorage.getItem('lr_tutorial_done') && !_afkDemoActive) setTimeout(startTutorial, 700);
  } else {
    if (!G.players[G.setupIdx].isAI) {
      showPassScreen(G.players[G.setupIdx].name, () => { showScreen('setup'); renderSetup(); });
    } else {
      aiDoSetup();
    }
  }
}

function aiDoSetup() {
  const p = G.players[G.setupIdx];
  // AI picks 3 highest-rank number cards to show face-up; keep action cards hidden
  const sorted = [...p.hand].sort((a, b) => {
    const ra = getRank(a.value), rb = getRank(b.value);
    if (ra === -1 && rb === -1) return 0;
    if (ra === -1) return -1;
    if (rb === -1) return 1;
    return rb - ra;
  });
  p.faceUp = sorted.slice(0, 3);
  p.hand = sorted.slice(3);
  G.setupIdx++;
  if (G.setupIdx >= G.players.length) {
    G.gamePhase = 'playing';
    G.currentIdx = determineStarter();
    addLog(t('log.goes_first', {name: curPlayer().name}));
    applyDesign(G_DESIGN);
    showScreen('game');
    renderGame();
    scheduleAI();
    if (!localStorage.getItem('lr_tutorial_done') && !_afkDemoActive) setTimeout(startTutorial, 700);
  } else {
    if (!G.players[G.setupIdx].isAI) {
      showPassScreen(G.players[G.setupIdx].name, () => { showScreen('setup'); renderSetup(); });
    } else {
      aiDoSetup();
    }
  }
}

function determineStarter() {
  for (const tv of NUMBER_HIERARCHY) {
    for (let i = 0; i < G.players.length; i++) {
      if (G.players[i].hand.some(c => c.value === tv)) {
        G.startingValue = tv;
        return i;
      }
    }
  }
  G.startingValue = null;
  return 0;
}

// ============================================================
// CORE TURN LOGIC
// ============================================================
function curPlayer() { return G.players[G.currentIdx]; }

function activeSource(p) {
  if (p.hand.length > 0) return 'hand';
  if (p.faceUp.length > 0) return 'faceup';
  return 'blind';
}

function playableIndices(p) {
  const src = activeSource(p);
  if (src === 'blind') return p.blind.map((_, i) => i);
  const cards = src === 'hand' ? p.hand : p.faceUp;
  return cards.reduce((a, c, i) => { if (canPlay(c)) a.push(i); return a; }, []);
}

// Called when user clicks Play
function onPlayClicked() {
  if (ONLINE.active && !ONLINE.isHost) {
    if (G.gamePhase !== 'playing' || G.currentIdx !== ONLINE.myIdx) return;
    submitOnlineAction('play', { selected: [...G.selected] });
    return;
  }
  if (G.gamePhase !== 'playing') return;
  const p = curPlayer();
  const src = activeSource(p);

  if (src === 'blind') {
    // Must pick exactly one blind card
    if (G.selected.size !== 1) { showMsg(t('game.pick_blind')); return; }
    const idx = [...G.selected][0];
    playBlindCard(idx);
    return;
  }

  if (G.selected.size === 0) { showMsg(t('game.tap_to_select')); return; }

  const cards = src === 'hand' ? p.hand : p.faceUp;
  const indices = [...G.selected].sort((a, b) => b - a);
  const played = indices.map(i => cards[i]);

  // All selected must be same value
  if (played.length > 1 && !played.every(c => c.value === played[0].value)) {
    showMsg(t('game.same_value_only')); return;
  }

  // Must be playable
  if (!canPlay(played[0])) {
    showMsg(t('game.cant_play')); return;
  }

  const v = played[0].value;

  // Remove from source
  if (!G.firstCardPlayed) G.stats.startTime = Date.now();
  G.firstCardPlayed = true;
  G.turnPlays += 1;
  _lastPlayedCard = played[0];
  indices.forEach(i => cards.splice(i, 1));
  p.stats.played += played.length;
  if (isAction(v)) p.stats.actions += played.length;
  // 3s go straight to the burn pile; everything else goes to the play pile
  if (v === '3') {
    played.forEach(c => G.burnPile.push(c));
  } else {
    played.forEach(c => G.burnDeck.push(c));
  }
  G.selected.clear();

  addLog(t('log.plays', {name: p.name, cards: played.map(c => c.value + c.suit).join(' ')}));

  if (v === '3') {
    showActionReveal(played[0], () => {
      for (let i = 0; i < played.length; i++) {
        if (G.playDeck.length > 0) p.hand.push(G.playDeck.pop());
      }
      refreshPhase(p);
      if (checkFinished(p)) return;
      renderGame();
      scheduleAI();
    });
    return;
  }

  resolvePlay(v);
}

function playBlindCard(idx) {
  const p = curPlayer();
  const card = p.blind.splice(idx, 1)[0];
  _lastPlayedCard = card;
  G.selected.clear();
  G.turnPlays += 1;
  p.stats.played += 1;
  if (isAction(card.value)) p.stats.actions += 1;
  addLog(t('log.blind_flip', {name: p.name, card: card.value + card.suit}));

  showBlindReveal(card, () => {
    // Blind 3: burn it, player gets another flip
    if (card.value === '3') {
      G.burnPile.push(card);
      addLog(t('log.blind_3'));
      refreshPhase(p);
      if (checkFinished(p)) return;
      showMsg(t('game.blind_3_msg'));
      renderGame();
      scheduleAI();
      return;
    }

    G.burnDeck.push(card);

    if (!canPlay(card)) {
      showMsg(t('game.blind_cant_play', {card: card.value + card.suit}));
      pickUpBurnPile(p);
      refreshPhase(p);
      delayedNextTurn();
      return;
    }
    resolvePlay(card.value, true);
  });
}

function _positionRevealOnPile(overlay) {
  const game = document.getElementById('screen-game');
  if (!game || !overlay) return;
  // Always center in the game container — avoids clipping near edges on small screens
  overlay.style.left = (game.offsetWidth  / 2) + 'px';
  overlay.style.top  = (game.offsetHeight / 2) + 'px';
}

function showBlindReveal(card, callback) {
  const overlay = document.getElementById('blindReveal');
  const cardEl  = document.getElementById('blindRevealCard');
  if (!overlay || !cardEl) { callback(); return; }

  cardEl.innerHTML = '';
  const el = makeCard(card, null, false, false, false);
  el.style.cssText = 'width:110px;height:160px;font-size:1.2rem;cursor:default;';
  el.style.setProperty('--card-mid-size', '3.5rem');
  el.classList.add('flip-3d');
  const scene = document.createElement('div');
  scene.className = 'flip-scene';
  scene.appendChild(el);
  cardEl.appendChild(scene);

  if (ONLINE.active && ONLINE.isHost) _pushReveal('blind', card);

  _positionRevealOnPile(overlay);
  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.add('hidden');
    callback();
  }, 3200);
}

function showActionReveal(card, callback) {
  const overlay  = document.getElementById('actionReveal');
  const cardEl   = document.getElementById('actionRevealCard');
  const effectEl = document.getElementById('actionRevealEffect');
  const labelEl  = document.getElementById('actionRevealLabel');
  if (!overlay || !cardEl) { callback(); return; }

  cardEl.innerHTML = '';
  const el = makeCard(card, null, false, false, false);
  el.style.cssText = 'width:110px;height:160px;font-size:1.2rem;cursor:default;';
  el.style.setProperty('--card-mid-size', '3rem');
  // Swap emoji for SVG icon in the reveal overlay only
  if (getActionSVG(card.value)) {
    const midEl = el.querySelector('.card-mid');
    if (midEl) { midEl.innerHTML = getActionSVG(card.value); midEl.classList.add('card-mid-svg'); }
  }
  el.classList.add('flip-3d');
  const scene = document.createElement('div');
  scene.className = 'flip-scene';
  scene.appendChild(el);
  cardEl.appendChild(scene);

  if (labelEl) {
    const name = G.players[G.currentIdx]?.name || 'Player';
    labelEl.textContent = t('game.player_plays', {name});
  }
  if (effectEl) effectEl.textContent = ACTION_EFFECTS[card.value] || '';

  if (ONLINE.active && ONLINE.isHost) _pushReveal('action', card);

  _positionRevealOnPile(overlay);
  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.add('hidden');
    callback();
  }, 3200);
}

function resolvePlay(value, fromBlind = false) {
  const p = curPlayer();
  const topCard = G.burnDeck[G.burnDeck.length - 1];

  if (!fromBlind && ACTION_VALUES.has(value) && topCard) {
    showActionReveal(topCard, () => _doResolve(value, p));
  } else {
    _doResolve(value, p);
  }
}

function _doResolve(value, p) {
  if (value === '10') {
    G.selected.clear();
    doBurn(false);
    drawToThree(p);
    refreshPhase(p);
    showDrinkPrompt('bomb');
    if (checkFinished(p)) return;
    renderGame();
    scheduleAI();
    return;
  }

  if (checkFourOfAKind()) {
    const topVal = G.burnDeck[G.burnDeck.length - 1]?.value;
    G.selected.clear();
    doBurn(false);
    drawToThree(p);
    refreshPhase(p);
    addLog(t('log.four_of_a_kind'));
    showDrinkPrompt('quad');
    if (topVal === '8' || topVal === '9') triggerMegaBurn();
    if (checkFinished(p)) return;
    renderGame();
    scheduleAI();
    return;
  }

  applyRequirementAfterPlay(value);
  drawToThree(p);
  refreshPhase(p);

  if (checkFinished(p)) return;
  delayedNextTurn();
}

// Called when user clicks Pick Up
function onPickUpClicked() {
  if (ONLINE.active && !ONLINE.isHost) {
    if (G.gamePhase !== 'playing' || G.currentIdx !== ONLINE.myIdx) return;
    submitOnlineAction('pickup', {});
    return;
  }
  if (G.gamePhase !== 'playing') return;
  const p = curPlayer();

  if (activeSource(p) === 'faceup') {
    // Pick up face-up cards + burn pile
    p.hand.push(...p.faceUp, ...G.burnDeck);
    p.faceUp = [];
    G.burnDeck = [];
    G.req = { mustPlayLower: false, minValue: null, afterReset: false };
    addLog(t('log.picks_up_faceup', {name: p.name}));
    p.stats.pickups += 1;
    refreshPhase(p);
  } else {
    if (G.burnDeck.length === 0) { showMsg(t('game.burn_empty')); return; }
    p.stats.pickups += 1;
    pickUpBurnPile(p);
  }

  G.selected.clear();
  delayedNextTurn();
}


function checkFinished(p) {
  refreshPhase(p);
  if (p.phase !== 'done') return false;

  p.finished = true;
  const medals = ['🥇', '🥈', '🥉', '🏅'];
  const place = G.placements.length + 1;
  G.placements.push({ player: p, place, isLoser: false });
  addLog(t('log.finishes', {medal: medals[place - 1] || '🏅', name: p.name, place}));

  const activePlayers = G.players.filter(pl => !pl.finished);

  // Rule: human wins and only CPUs remain — end immediately, don't let CPUs play each other
  if (!ONLINE.active && !p.isAI && activePlayers.length >= 2 && activePlayers.every(pl => pl.isAI)) {
    const sorted = [...activePlayers].sort((a, b) =>
      (a.hand.length + a.faceDown.length) - (b.hand.length + b.faceDown.length)
    );
    let nextPlace = G.placements.length + 1;
    sorted.forEach((cpu, i) => {
      cpu.finished = true;
      G.placements.push({ player: cpu, place: nextPlace + i, isLoser: i === sorted.length - 1 });
    });
    G.gamePhase = 'gameover';
    clearTurnTimer();
    renderGame();
    const escapedCard = _lastPlayedCard;
    G.isSpudEscape = _SPUD_VALS.has(escapedCard?.value);
    showEscapeOverlay(p, escapedCard, [], true, () => showResultsOverlay());
    return true;
  }

  if (activePlayers.length <= 1) {
    if (activePlayers.length === 1) {
      const loser = activePlayers[0];
      loser.finished = true;
      G.placements.push({ player: loser, place: G.players.length, isLoser: true });
      addLog(t('log.loser', {name: loser.name}));
    }
    G.gamePhase = 'gameover';
    clearTurnTimer();
    renderGame();
    const escapedCard = _lastPlayedCard;
    G.isSpudEscape = _SPUD_VALS.has(escapedCard?.value);
    const loserNames = G.placements.filter(e => e.isLoser || !e.player.finished).map(e => e.player.name);
    const stillIn = G.players.filter(pl => pl !== p).map(pl => pl.name);
    const loserEntry = G.placements.find(e => e.isLoser);
    showEscapeOverlay(p, escapedCard, stillIn, true, () => {
      if (loserEntry) {
        showDrinkPrompt(G.isSpudEscape ? 'spud' : 'loser', loserEntry.player.name, () => showResultsOverlay());
      } else {
        showResultsOverlay();
      }
    });
    return true;
  }

  const escapedCard = _lastPlayedCard;
  const stillIn = activePlayers.filter(pl => pl !== p).map(pl => pl.name);
  showEscapeOverlay(p, escapedCard, stillIn, false, () => delayedNextTurn());
  return true;
}

function nextTurn() {
  G.selected.clear();
  if (G.req.afterReset) {
    G.req = { mustPlayLower: false, minValue: null, afterReset: false };
  }
  const n = G.players.length;
  let tries = 0;
  do {
    G.currentIdx = ((G.currentIdx + G.direction) % n + n) % n;
    tries++;
  } while (G.players[G.currentIdx].finished && tries < n);

  const p = curPlayer();
  refreshPhase(p);

  if (!p.isAI) {
    const activeHumans = G.players.filter(pl => !pl.isAI && !pl.finished);
    if (activeHumans.length > 1 && !ONLINE.active) {
      showPassScreen(p.name, () => { showScreen('game'); renderGame(); startTurnTimer(); });
    } else {
      renderGame();
      startTurnTimer();
    }
  } else {
    clearTurnTimer();
    renderGame();
    scheduleAI();
  }
}

function delayedNextTurn(ms = 700) {
  _tapCooldown = false;
  clearTurnTimer();
  G.stats.turns += 1;
  G.turnPlays = 0;
  G.transitioning = true;
  renderGame();
  setTimeout(() => {
    G.transitioning = false;
    nextTurn();
  }, ms);
}

// ============================================================
// AI
// ============================================================
function scheduleAI() {
  if (G.gamePhase !== 'playing') return;
  if (!curPlayer().isAI) return;
  setTimeout(aiTurn, _watchedDemoActive ? 1800 : (_afkDemoActive ? 2500 : 900));
}

function aiGetIQ() {
  if (_afkDemoActive || _watchedDemoActive) return 5;
  const lb = getLB();
  // Adapt to the strongest human in the room
  const humans = G.players.filter(pl => !pl.isAI);
  const maxWins = humans.reduce((max, h) => Math.max(max, lb[h.name]?.wins || 0), 0);
  return Math.min(5, Math.floor(maxWins / 50) + 1);
}

function aiTurn() {
  if (G.gamePhase !== 'playing' || !curPlayer().isAI) return;
  const p   = curPlayer();
  const src = activeSource(p);
  const iq  = aiGetIQ();

  if (src === 'blind') { G.selected = new Set([0]); onPlayClicked(); return; }

  const playable = playableIndices(p);
  if (playable.length === 0) { onPickUpClicked(); return; }

  const cards = src === 'hand' ? p.hand : p.faceUp;
  const groups = {};
  playable.forEach(i => { const v = cards[i].value; (groups[v] = groups[v] || []).push(i); });

  const hasRegular = Object.keys(groups).some(v => !isAction(v));

  // IQ 4+: conserve action card pairs in hand — play one at a time, keep the rest as future threats
  const pickAll = v => { G.selected = new Set(groups[v]); onPlayClicked(); };
  const pickOne = v => { G.selected = new Set([groups[v][0]]); onPlayClicked(); };
  const pick    = v => (iq >= 4 && isAction(v) && src === 'hand') ? pickOne(v) : pickAll(v);

  // ── IQ 1 & 2: mostly play smart, but slip up occasionally ──
  // IQ 1 = 30% mistake rate, IQ 2 = 15% — feels tipsy, not lobotomised
  // Mistakes are bad TIMING on regular cards only — never randomly discard action cards
  if (iq <= 2) {
    const mistakeRate = iq === 1 ? 0.30 : 0.15;
    if (Math.random() < mistakeRate) {
      const regularPlayable = playable.filter(i => !isAction(cards[i].value));
      const pool = regularPlayable.length > 0 ? regularPlayable : playable.filter(i => cards[i].value !== '10');
      const fallback = pool.length > 0 ? pool : playable;
      G.selected = new Set([fallback[Math.floor(Math.random() * fallback.length)]]);
      onPlayClicked();
      return;
    }
    // On non-mistake turns, fall through to full strategy below
  }

  // ── IQ 3+: shared board state ──
  const pileSize       = G.burnDeck.length;
  const topVal         = getEffectiveTopValue();
  const topRank        = topVal ? getRank(topVal) : -1;
  const pileIsBuilding = pileSize >= 3;

  // ── IQ 3: Aware — 4-of-a-kind, basic 7 timing, plays lowest regular card ──
  if (iq === 3) {
    for (const [v, idxs] of Object.entries(groups)) {
      if (isAction(v)) continue;
      const onPile = G.burnDeck.slice().reverse().reduce((c, card) => {
        const eff = card.value === '5' ? getEffectiveTopValue() : card.value;
        return (eff === v && c < 4) ? c + 1 : (eff !== v ? 0 : c);
      }, 0);
      if (idxs.length + onPile >= 4) { G.selected = new Set(idxs); onPlayClicked(); return; }
    }
    if (groups['7'] && pileIsBuilding && topRank >= 2) { pickAll('7'); return; }
    if (hasRegular) {
      let loR = Infinity, loV = null;
      for (const v of Object.keys(groups)) {
        if (isAction(v)) continue;
        if (getRank(v) < loR) { loR = getRank(v); loV = v; }
      }
      if (loV) { pickAll(loV); return; }
    }
    if (groups['2'] && !hasRegular) { pickAll('2'); return; }
    for (const v of ['3', '2', '7', '5', '10']) { if (groups[v]) { pickAll(v); return; } }
    onPickUpClicked();
    return;
  }

  // ── IQ 4+: Strategic + Guerilla — pile building, action conservation ──

  // Guerilla intel: full scouting at IQ 5, simplified at IQ 4
  let sevenTrapReady = false;
  if (iq >= 5) {
    const memory           = G.burnDeck.slice(-5);
    const recentLows       = memory.filter(c => c.value === '4' || c.value === '6').length;
    const opponents        = G.players.filter(pl => pl !== p && !pl.finished);
    const oppHasLowFaceUp  = opponents.some(op => op.faceUp.some(c => c.value === '4' || c.value === '6'));
    const oppAllHighFaceUp = opponents.length > 0 &&
      opponents.every(op => op.faceUp.length > 0 && op.faceUp.every(c => !isAction(c.value) && getRank(c.value) >= 2));
    const score = (topRank >= 3 ? 3 : topRank >= 1 ? 1 : 0) +
      (pileIsBuilding ? 2 : 0) + (oppAllHighFaceUp ? 2 : 0) +
      (!oppHasLowFaceUp ? 1 : 0) + (recentLows >= 2 ? 1 : 0);
    sevenTrapReady = groups['7'] && score >= 4;
  } else {
    // IQ 4: simpler trap — just needs a built pile and a high top
    sevenTrapReady = groups['7'] && pileIsBuilding && topRank >= 2;
  }

  // 1. 4-of-a-kind (incidental burn, extra turn)
  for (const [v, idxs] of Object.entries(groups)) {
    if (isAction(v)) continue;
    const onPile = G.burnDeck.slice().reverse().reduce((c, card) => {
      const eff = card.value === '5' ? getEffectiveTopValue() : card.value;
      return (eff === v && c < 4) ? c + 1 : (eff !== v ? 0 : c);
    }, 0);
    if (idxs.length + onPile >= 4) { G.selected = new Set(idxs); onPlayClicked(); return; }
  }

  // 2. 7 trap — spring it on a building pile
  if (sevenTrapReady) { pick('7'); return; }

  // 3. Regular cards — play HIGHEST to spike pile top, maximise pickup pressure
  if (hasRegular) {
    let hiR = -Infinity, hiV = null;
    for (const v of Object.keys(groups)) {
      if (isAction(v)) continue;
      if (getRank(v) > hiR) { hiR = getRank(v); hiV = v; }
    }
    if (hiV) { pick(hiV); return; }
  }

  // 4. 3 (Gift) — keep the turn, pile keeps growing
  if (groups['3']) { pick('3'); return; }

  // 5. 7 fallback — pile is building even if trap score wasn't met
  if (groups['7'] && pileIsBuilding) { pick('7'); return; }

  // 6. 2 (Reset) — emergency: stuck and would have to pick up
  if (groups['2']) { pick('2'); return; }

  // 7. 7 absolute fallback
  if (groups['7']) { pick('7'); return; }

  // 8. 5 (Ghost) — last resort before the bomb; don't waste it on number cards
  if (groups['5']) { pick('5'); return; }

  // 9. 10 — ABSOLUTE LAST RESORT, never proactively burn the pile
  if (groups['10']) { pick('10'); return; }

  onPickUpClicked();
}

// AI setup
function aiDoSetupForCurrentIdx() { aiDoSetup(); }

// ============================================================
// LOG & MESSAGES
// ============================================================
function addLog(msg) {
  G.log.push(msg);
  if (G.log.length > 30) G.log.shift();
}
function showMsg(msg) {
  G.message = msg;
  renderGame();
  setTimeout(() => { if (G.message === msg) { G.message = ''; renderGame(); } }, 3000);
}

// ============================================================
// SCREEN MANAGEMENT
// ============================================================
function showScreen(name) {
  if (name !== 'leaderboard') stopListenLeaderboard();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');
  document.body.classList.toggle('game-active', name === 'game');
  document.getElementById('emojiPickerPanel')?.classList.add('hidden');
  // AFK demo management
  if (name === 'menu') {
    _addAfkListeners();
    _resetAfkTimer();
  } else {
    _removeAfkListeners();
    clearTimeout(_afkTimer);
  }
}

let passCallback = null;
function showPassScreen(playerName, cb) {
  passCallback = cb;
  document.getElementById('passTitle').textContent = t('pass.title', {name: playerName});
  document.getElementById('passName').textContent = playerName;
  showScreen('pass');
}

function makeCupHTML(place) {
  const c = [null,
    { fill: '#FFD700', dark: '#B8860B', rim: '#FFF176', glow: 'rgba(255,215,0,0.75)' },
    { fill: '#D8D8D8', dark: '#888',    rim: '#fff',    glow: 'rgba(210,210,210,0.65)' },
    { fill: '#CD7F32', dark: '#7B4A12', rim: '#E8A060', glow: 'rgba(205,127,50,0.65)' },
  ][place] || { fill: '#888', dark: '#555', rim: '#aaa', glow: 'rgba(128,128,128,0.4)' };
  return `<svg class="cup-svg" viewBox="0 0 80 92" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 12px ${c.glow})">
    <path d="M17,8 L63,8 L56,44 Q40,59 24,44 Z" fill="${c.fill}"/>
    <path d="M17,13 Q5,21 5,33 Q5,45 24,46" fill="none" stroke="${c.fill}" stroke-width="7" stroke-linecap="round"/>
    <path d="M63,13 Q75,21 75,33 Q75,45 56,46" fill="none" stroke="${c.fill}" stroke-width="7" stroke-linecap="round"/>
    <rect x="36" y="44" width="8" height="18" fill="${c.dark}"/>
    <rect x="23" y="62" width="34" height="8" rx="4" fill="${c.dark}"/>
    <path d="M23,62 L57,62" stroke="${c.rim}" stroke-width="1.5" opacity="0.5"/>
    <ellipse cx="31" cy="25" rx="4" ry="9" fill="rgba(255,255,255,0.38)" transform="rotate(-12,31,25)"/>
  </svg>`;
}

function makeDaggerHTML() {
  return `<svg class="dagger-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 10px rgba(180,0,0,0.7))">
    <polygon points="40,4 46,30 34,30" fill="#c0c0c0"/>
    <rect x="34" y="29" width="12" height="4" rx="1" fill="#8B0000"/>
    <rect x="24" y="31" width="32" height="5" rx="2.5" fill="#5a3a1a"/>
    <rect x="36" y="36" width="8" height="28" rx="3" fill="#8B4513"/>
    <rect x="37.5" y="36" width="2" height="28" rx="1" fill="#a0522d" opacity="0.5"/>
    <ellipse cx="26" cy="33" rx="5" ry="2.5" fill="#7a2a0a" transform="rotate(-5,26,33)"/>
    <ellipse cx="54" cy="33" rx="5" ry="2.5" fill="#7a2a0a" transform="rotate(5,54,33)"/>
    <path d="M34,12 Q40,8 46,12" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    <ellipse cx="55" cy="46" rx="6" ry="4" fill="#8B0000" opacity="0.8" transform="rotate(20,55,46)"/>
    <ellipse cx="62" cy="52" rx="4" ry="3" fill="#8B0000" opacity="0.6" transform="rotate(10,62,52)"/>
    <ellipse cx="50" cy="55" rx="3" ry="2" fill="#8B0000" opacity="0.5"/>
  </svg>`;
}

function makeRingHTML() {
  return `<svg class="ring-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 12px rgba(255,215,0,0.8))">
    <ellipse cx="40" cy="58" rx="20" ry="7" fill="#B8860B"/>
    <rect x="20" y="40" width="40" height="18" rx="2" fill="#B8860B"/>
    <ellipse cx="40" cy="40" rx="20" ry="7" fill="#FFD700"/>
    <ellipse cx="40" cy="40" rx="16" ry="5" fill="#B8860B"/>
    <ellipse cx="40" cy="40" rx="12" ry="3.5" fill="#FFD700" opacity="0.6"/>
    <polygon points="40,10 44,22 57,22 47,30 51,42 40,34 29,42 33,30 23,22 36,22" fill="#4FC3F7" opacity="0.9"/>
    <polygon points="40,14 43,23 52,23 45,28 48,37 40,32 32,37 35,28 28,23 37,23" fill="#B3E5FC"/>
    <ellipse cx="40" cy="22" rx="3" ry="3" fill="white" opacity="0.6"/>
  </svg>`;
}

function makePotatoHTML() {
  return `<svg class="potato-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="47" rx="27" ry="29" fill="#c89a6b" transform="rotate(-8,40,47)"/>
    <ellipse cx="40" cy="47" rx="25" ry="27" fill="#b88040" fill-opacity="0.18" transform="rotate(-8,40,47)"/>
    <circle cx="30" cy="40" r="4.5" fill="#1a1a1a"/>
    <circle cx="50" cy="42" r="4.5" fill="#1a1a1a"/>
    <circle cx="31.5" cy="38.5" r="1.8" fill="#fff"/>
    <circle cx="51.5" cy="40.5" r="1.8" fill="#fff"/>
    <path d="M25,32 Q30,27 35,32" stroke="#7a5020" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M46,34 Q50.5,32 55,34" stroke="#7a5020" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M28,54 Q36,62 50,52" stroke="#7a5020" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="20" cy="52" r="2.5" fill="#a07040" opacity="0.6"/>
    <circle cx="57" cy="57" r="3" fill="#a07040" opacity="0.5"/>
    <circle cx="34" cy="65" r="2" fill="#a07040" opacity="0.5"/>
    <path d="M33,18 Q36,5 40,13 Q43,3 47,13 Q50,6 53,18" fill="#3d7a34"/>
  </svg>`;
}

// ============================================================
// TURN TIMER
// ============================================================
let _turnTimerInterval = null;
let _turnTimerEnd = 0;
const TURN_SECONDS = 30;

function startTurnTimer() {
  clearTurnTimer();
  if (G?.gamePhase !== 'playing') return;
  _turnTimerEnd = Date.now() + TURN_SECONDS * 1000;
  _updateTimerDisplay(TURN_SECONDS);
  _turnTimerInterval = setInterval(() => {
    const remaining = Math.ceil((_turnTimerEnd - Date.now()) / 1000);
    _updateTimerDisplay(remaining);
    if (remaining <= 0) {
      clearTurnTimer();
      if (ONLINE.active && !ONLINE.isHost) {
        submitOnlineAction('timeout', {});
      } else {
        addLog(t('log.turn_timeout', {name: curPlayer().name}));
        delayedNextTurn(0);
      }
    }
  }, 500);
}

function clearTurnTimer() {
  clearInterval(_turnTimerInterval);
  _turnTimerInterval = null;
  _updateTimerDisplay(null);
}

function _updateTimerDisplay(secs) {
  const el = document.getElementById('turnTimer');
  if (!el) return;
  if (secs === null || secs <= 0) {
    el.textContent = '';
    el.className = 'turn-timer';
    return;
  }
  el.textContent = `${secs}s`;
  el.className = 'turn-timer' + (secs <= 10 ? ' timer-urgent' : '');
}

function showResultsOverlay() {
  const loserEntry = G.placements.find(e => e.isLoser);
  showShameOverlay(loserEntry, _doShowResultsOverlay);
}

function _doShowResultsOverlay() {
  // Update rematch streak
  const winner = G.placements.find(e => !e.isLoser && e.place === 1);
  const winnerName = winner ? winner.player.name : null;
  if (winnerName && winnerName === _rematchStreak.name) {
    _rematchStreak.count += 1;
  } else {
    _rematchStreak = { name: winnerName, count: 1 };
  }

  const podiumEl = document.getElementById('podiumList');
  podiumEl.innerHTML = '';

  G.placements.forEach((entry, i) => {
    const card = document.createElement('div');
    card.className = 'result-card' + (entry.isLoser ? ' result-loser' : '');
    const delay = `${i * 0.32}s`;
    card.style.animationDelay = delay;

    const iconHTML = entry.isLoser
      ? (G.isDuel ? makeDaggerHTML() : makePotatoHTML())
      : (G.isDuel ? makeRingHTML() : makeCupHTML(entry.place));
    const placeText = entry.isLoser
      ? (G.isDuel ? 'Defeated! ⚔️' : 'Last Round loser!')
      : (G.isDuel ? 'Duel Victor! 💍' : `${entry.place}${entry.place===1?'st':entry.place===2?'nd':entry.place===3?'rd':'th'} place`);

    const lb = getLB();
    const stats = lb[entry.player.name];
    const shameTag = entry.isLoser && stats?.losses
      ? `<div class="result-shame">${G.isSpudEscape ? '🥔 Spud loss' : '🥔'} #${stats.losses}</div>` : '';
    card.innerHTML = `<div class="result-icon">${iconHTML}</div>
      <div class="result-info">
        <div class="result-name">${entry.player.name}</div>
        <div class="result-place">${placeText}</div>
        ${shameTag}
      </div>`;
    podiumEl.appendChild(card);

    // Apply delay to the SVG animation too
    const svg = card.querySelector('.cup-svg, .potato-svg');
    if (svg) svg.style.animationDelay = delay;
  });

  // Rematch streak banner
  const streakBanner = document.getElementById('winStreakBanner');
  if (streakBanner) {
    if (_rematchStreak.count >= 2 && _rematchStreak.name) {
      const n = _rematchStreak.count;
      const fire = n >= 5 ? '🔥🔥🔥' : n >= 3 ? '🔥🔥' : '🔥';
      streakBanner.innerHTML = `${fire} <strong>${_rematchStreak.name}</strong> wins ${n} in a row! ${fire}`;
      streakBanner.classList.remove('hidden');
    } else {
      streakBanner.classList.add('hidden');
    }
  }

  updateLeaderboard(G.placements);

  // Reveal loser's unplayed blind cards
  const container = document.getElementById('winBlindCards');
  container.innerHTML = '';
  const loserEntry = G?.placements?.find(e => e.isLoser);
  if (loserEntry) {
    const loser = loserEntry.player;
    if (loser.blind.length > 0) {
      const label = document.createElement('div');
      label.className = 'win-loser-label';
      label.textContent = `${loser.name}'s unplayed blind cards:`;
      container.appendChild(label);
      const row = document.createElement('div');
      row.className = 'blind-cards-row';
      loser.blind.forEach(c => {
        const el = makeCard(c, null, false, false, false);
        el.style.width = '40px'; el.style.height = '58px'; el.style.fontSize = '0.7rem';
        row.appendChild(el);
      });
      container.appendChild(row);
    }
  }

  // Build action buttons based on mode
  const btns = document.getElementById('winButtons');
  btns.innerHTML = '';
  if (_watchedDemoActive) {
    const playBtn = document.createElement('button');
    playBtn.className = 'btn-main';
    playBtn.textContent = '▶ Play Now — It\'s Free!';
    playBtn.onclick = () => { _stopWatchedDemo(); playAsGuest(); };
    btns.appendChild(playBtn);
    const watchBtn = document.createElement('button');
    watchBtn.className = 'btn-main btn-outline';
    watchBtn.textContent = '🎬 Watch Again';
    watchBtn.onclick = () => { _stopWatchedDemo(); setTimeout(startWatchedDemo, 400); };
    btns.appendChild(watchBtn);
  } else if (ONLINE.active) {
    if (ONLINE.isHost) {
      const startBtn = document.createElement('button');
      startBtn.className = 'btn-main';
      startBtn.id = 'btnRoomRematch';
      startBtn.textContent = t('game.start_next');
      startBtn.onclick = onRoomRematch;
      btns.appendChild(startBtn);
      _listenRoomRematchReady();
    } else {
      const stayBtn = document.createElement('button');
      stayBtn.className = 'btn-main';
      stayBtn.id = 'btnRoomStay';
      stayBtn.textContent = t('game.stay_btn');
      stayBtn.onclick = onRoomStay;
      btns.appendChild(stayBtn);
    }
    const leaveBtn = document.createElement('button');
    leaveBtn.className = 'btn-main btn-outline';
    leaveBtn.textContent = t('game.leave_room');
    leaveBtn.onclick = onLeaveRoomFromWin;
    btns.appendChild(leaveBtn);
  } else {
    const againBtn = document.createElement('button');
    againBtn.className = 'btn-main';
    againBtn.textContent = t('game.play_again');
    againBtn.onclick = onPlayAgainSame;
    btns.appendChild(againBtn);
    const menuBtn = document.createElement('button');
    menuBtn.className = 'btn-main btn-outline';
    menuBtn.textContent = t('game.new_game');
    menuBtn.onclick = onPlayAgain;
    btns.appendChild(menuBtn);
  }

  const shareBtn = document.createElement('button');
  shareBtn.className = 'btn-main btn-share-win';
  shareBtn.textContent = '🍺 Tell a friend';
  shareBtn.onclick = shareGame;
  btns.appendChild(shareBtn);

  const fbkBtn = document.createElement('button');
  fbkBtn.className = 'btn-main btn-outline btn-feedback-win';
  fbkBtn.textContent = '💬 Leave Feedback';
  fbkBtn.onclick = () => showFeedbackModal('post-game');
  btns.appendChild(fbkBtn);

  if (IS_WEB) {
    const appBtn = document.createElement('button');
    appBtn.className = 'btn-main btn-get-app-win';
    appBtn.textContent = '📱 Get the Full App';
    appBtn.onclick = () => window.open('https://ko-fi.com/s/c2ac966720', '_blank');
    btns.appendChild(appBtn);
  }

  // Build post-game stat card
  const statEl = document.getElementById('winStatCard');
  if (statEl && G.stats) {
    const dur = G.stats.startTime ? Math.round((Date.now() - G.stats.startTime) / 1000) : 0;
    const mm = Math.floor(dur / 60), ss = String(dur % 60).padStart(2, '0');
    const durStr = dur > 0 ? `${mm}:${ss}` : '—';

    const playerRows = G.placements.map(e => {
      const p = e.player;
      const s = p.stats || { played: 0, pickups: 0, actions: 0 };
      const medal = e.isLoser ? '🥔' : (e.place === 1 ? '🥇' : e.place === 2 ? '🥈' : '🥉');
      return `<div class="stat-row">
        <span class="stat-row-name">${medal} ${p.name}</span>
        <span class="stat-row-val" title="Cards played">🃏 ${s.played}</span>
        <span class="stat-row-val" title="Pickups">📥 ${s.pickups}</span>
        <span class="stat-row-val" title="Action cards">⚡ ${s.actions}</span>
      </div>`;
    }).join('');

    statEl.innerHTML = `<div class="stat-card-inner">
      <div class="stat-headline">
        <span>⏱ ${durStr}</span>
        <span>🔥 ${G.stats.burns} burn${G.stats.burns !== 1 ? 's' : ''}</span>
        <span>🔄 ${G.stats.turns} turns</span>
      </div>
      <div class="stat-players">${playerRows}</div>
    </div>`;
    statEl.classList.remove('hidden');
  }

  document.getElementById('win-overlay').classList.remove('hidden');

  _winAutoRedirect = setTimeout(() => {
    document.getElementById('win-overlay').classList.add('hidden');
    if (ONLINE.active) leaveRoom(); else showScreen('menu');
  }, 30000);
}

function onPlayAgain() {
  clearTimeout(_winAutoRedirect);
  _rematchStreak = { name: null, count: 0 };
  document.getElementById('win-overlay').classList.add('hidden');
  showScreen('menu');
}

function onPlayAgainSame() {
  clearTimeout(_winAutoRedirect);
  document.getElementById('win-overlay').classList.add('hidden');
  if (!_lastGameConfig) { showScreen('menu'); return; }
  newGame(_lastGameConfig);
  G.setupIdx = 0;
  G.gamePhase = 'setup';
  // Skip AI players straight to their auto-setup
  while (G.players[G.setupIdx]?.isAI) aiDoSetup();
  if (G.setupIdx < G.players.length) {
    showScreen('setup');
    renderSetup();
  } else {
    G.gamePhase = 'playing';
    G.currentIdx = determineStarter();
    addLog(t('log.goes_first', {name: curPlayer().name}));
    showScreen('game');
    renderGame();
    scheduleAI();
  }
}

// Non-host signals they want to stay for another round
function onRoomStay() {
  if (!fbReady()) return;
  const { db, ref, set: fbSet } = fb();
  fbSet(ref(db, `rooms/${ONLINE.roomCode}/rematch/${ONLINE.myIdx}`), { name: ONLINE.myName, ready: true });
  const btn = document.getElementById('btnRoomStay');
  if (btn) { btn.textContent = t('game.waiting_host'); btn.disabled = true; }
}

// Host starts next round with whoever is ready (missing players become AI)
async function onRoomRematch() {
  clearTimeout(_winAutoRedirect);
  document.getElementById('win-overlay').classList.add('hidden');
  if (!fbReady()) return;
  const { db, ref, get: fbGet, update: fbUp, remove: fbRm } = fb();
  const code = ONLINE.roomCode;

  const snap = await fbGet(ref(db, `rooms/${code}/rematch`));
  const readyMap = snap.val() || {};

  // Build names: keep ready players by index, keep original name for absent ones
  const prevNames = _lastGameConfig?.names || G.players.map(p => p.name);
  const names = prevNames.map((name, i) => {
    if (i === ONLINE.myIdx) return ONLINE.myName;
    return readyMap[i]?.ready ? readyMap[i].name : name;
  });
  const numP = names.length;

  // Mark absent players as AI in config
  const vsAIFlags = names.map((n, i) => i !== ONLINE.myIdx && !readyMap[i]?.ready);

  await fbRm(ref(db, `rooms/${code}/rematch`));

  // Rebuild game — same flow as startOnlineGame but we already have names
  newGame({ numPlayers: numP, vsAI: false, direction: _lastGameConfig?.direction || 1, names });
  // Force AI flag for absent players
  vsAIFlags.forEach((isAI, i) => { G.players[i].isAI = isAI; });
  G.setupIdx = ONLINE.myIdx;
  G.gamePhase = 'setup';

  await fbRm(ref(db, `rooms/${code}/faceUpConfirm`));
  await fbUp(ref(db, `rooms/${code}`), { status: 'playing', gameState: serializeGameState() });

  listenForActions(code);

  // Listen for setup confirms (same as startOnlineGame)
  if (ONLINE.unsubSetup) ONLINE.unsubSetup();
  const { onValue: fbOn } = fb();
  ONLINE.unsubSetup = fbOn(ref(db, `rooms/${code}/faceUpConfirm`), async confSnap => {
    const confirms = confSnap.val() || {};
    const humanCount = G.players.filter(p => !p.isAI).length;
    if (Object.keys(confirms).length < humanCount) return;
    Object.entries(confirms).forEach(([idxStr, data]) => {
      const idx = parseInt(idxStr);
      G.players[idx].faceUp = data.faceUp;
      G.players[idx].hand = data.hand;
      G.players[idx].phase = 'hand';
    });
    G.gamePhase = 'playing';
    G.currentIdx = determineStarter();
    addLog(t('log.goes_first', {name: curPlayer().name}));
    if (ONLINE.unsubSetup) { ONLINE.unsubSetup(); ONLINE.unsubSetup = null; }
    await fbUp(ref(db, `rooms/${code}`), { gameState: serializeGameState() });
    showScreen('game');
    renderGame();
    if (G.currentIdx !== ONLINE.myIdx) scheduleAI();
  });

  showScreen('setup');
  renderSetup();
}

function onLeaveRoomFromWin() {
  clearTimeout(_winAutoRedirect);
  document.getElementById('win-overlay').classList.add('hidden');
  leaveRoom();
}

// Host listens to ready signals and updates button label
function _listenRoomRematchReady() {
  if (!fbReady() || !ONLINE.isHost) return;
  const { db, ref, onValue: fbOn } = fb();
  const code = ONLINE.roomCode;
  const totalHumans = G.players.filter(p => !p.isAI).length;
  const unsub = fbOn(ref(db, `rooms/${code}/rematch`), snap => {
    const readyCount = snap.exists() ? Object.values(snap.val()).filter(v => v.ready).length : 0;
    const btn = document.getElementById('btnRoomRematch');
    if (!btn) { unsub(); return; }
    // Host is always ready; count = readyCount + 1 (for host), capped at totalHumans
    const total = Math.min(readyCount + 1, totalHumans);
    btn.textContent = total > 1 ? t('win.next_round', {ready: total, total: totalHumans}) : t('win.next_round_simple');
  });
}

// ============================================================
// RENDERING
// ============================================================
function makeCard(card, onClick, selectable, selected, unplayable) {
  const el = document.createElement('div');
  el.className = 'card' + (suitColor(card.suit) === 'red' ? ' red' : ' black');
  if (isAction(card.value)) el.classList.add('action-card');
  if (card.value === '8' || card.value === '9') el.classList.add('spud-card');
  if (selected) el.classList.add('selected');
  if (unplayable) el.classList.add('unplayable');

  const midIcon = CARD_PICTOGRAM[card.value] || card.suit;

  el.innerHTML = `
    <div class="card-top">${card.value}<br>${card.suit}</div>
    <div class="card-mid">${midIcon}</div>
    <div class="card-bot">${card.value}<br>${card.suit}</div>`;

  if (onClick) el.addEventListener('click', onClick);
  return el;
}

function makeCardBack() {
  const el = document.createElement('div');
  el.className = 'card-back back-' + G_DESIGN;
  return el;
}

function renderSetup() {
  const p = G.players[G.setupIdx];
  document.getElementById('setupTitle').textContent = t('setup.choose_title', {name: p.name});
  document.getElementById('faceUpCount').textContent = p.faceUp.length;

  const handEl = document.getElementById('setupHand');
  const fuEl = document.getElementById('setupFaceUp');
  handEl.innerHTML = '';
  fuEl.innerHTML = '';

  p.hand.forEach((card, i) => {
    handEl.appendChild(makeCard(card, () => { setupSelectCard('hand', i); }, true, false, false));
  });
  p.faceUp.forEach((card, i) => {
    fuEl.appendChild(makeCard(card, () => { setupSelectCard('faceup', i); }, true, false, false));
  });

  const btn = document.getElementById('btnConfirmSetup');
  btn.textContent = p.faceUp.length === 3
    ? t('setup.confirm') : t('setup.confirm_count', {n: p.faceUp.length});
  btn.disabled = p.faceUp.length !== 3;
}

const _IQ_LABELS = ['', 'Pub Rookie', 'Regular', 'Local Champ', 'Landlord', 'Pub Legend'];

function updateAIIQBadge() {
  const badge = document.getElementById('aiIQBadge');
  if (!badge) return;
  const hasAI = G && G.players.some(pl => pl.isAI);
  if (!hasAI || ONLINE.active) { badge.classList.add('hidden'); return; }
  const iq = aiGetIQ();
  const dots = Array.from({length: 5}, (_, i) =>
    `<span class="${i < iq ? 'iq-dot-on' : 'iq-dot-off'}">●</span>`
  ).join('');
  badge.innerHTML = `🤖 <span class="iq-dots">${dots}</span> <span class="iq-label">${_IQ_LABELS[iq]}</span>`;
  badge.classList.remove('hidden');
}

function updateStreakBadge() {
  const badge = document.getElementById('streakBadge');
  if (!badge) return;
  const n = G && G.turnPlays || 0;
  if (n < 2) { badge.classList.add('hidden'); return; }
  const flames = n >= 5 ? '🔥🔥🔥' : n >= 4 ? '🔥🔥' : '🔥';
  const label = n >= 5 ? 'On Fire!' : n >= 4 ? 'Hot Streak!' : 'Again!';
  const html = `${flames} <span class="streak-count">×${n}</span> <span class="streak-label">${label}</span>`;
  const wasHidden = badge.classList.contains('hidden');
  const changed = badge.innerHTML !== html;
  if (wasHidden || changed) {
    badge.innerHTML = html;
    if (wasHidden) badge.classList.remove('hidden');
  }
}

function renderGame() {
  const p = ONLINE.active ? G.players[ONLINE.myIdx] : curPlayer();
  const src = activeSource(p);
  updateAIIQBadge();
  updateStreakBadge();

  // Apply current design to draw pile
  const deckEl = document.getElementById('playDeckDisplay');
  if (deckEl) deckEl.className = 'pile-visual deck-back back-' + G_DESIGN;

  // --- Top players ---
  const topEl = document.getElementById('topPlayers');
  topEl.innerHTML = '';
  G.players.forEach((pl, i) => {
    if (ONLINE.active ? i === ONLINE.myIdx : i === G.currentIdx) return;
    const block = document.createElement('div');

    if (pl.finished) {
      const plEntry = G.placements.find(e => e.player.id === pl.id);
      const icons = ['🥇', '🥈', '🥉', '🏅'];
      const icon = plEntry?.isLoser ? '🥔' : (icons[(plEntry?.place || 1) - 1] || '🏅');
      const placeText = plEntry?.isLoser ? 'Loser!' : `${plEntry?.place}${plEntry?.place===1?'st':plEntry?.place===2?'nd':plEntry?.place===3?'rd':'th'}`;
      block.className = 'opponent-block opponent-finished';
      block.innerHTML = `<div class="opponent-name">${pl.name}</div><div class="finished-badge">${icon} ${placeText}</div>`;
      topEl.appendChild(block);
      return;
    }

    block.className = 'opponent-block';
    const handCount = pl.hand.length;
    const phaseLabel = pl.phase === 'hand' ? t('game.phase_hand', {n: handCount}) :
                       pl.phase === 'faceup' ? t('game.phase_faceup', {n: pl.faceUp.length}) :
                       pl.phase === 'blind' ? t('game.phase_blind', {n: pl.blind.length}) : t('game.phase_done');

    let cardsHTML = '';
    pl.blind.forEach(() => { cardsHTML += `<div class="mini-card blind-slot"></div>`; });
    pl.faceUp.forEach(c => {
      const col = suitColor(c.suit);
      cardsHTML += `<div class="mini-card face-up ${col}">${c.value}${c.suit}</div>`;
    });
    for (let h = 0; h < pl.hand.length; h++)
      cardsHTML += `<div class="mini-card"></div>`;

    block.innerHTML = `
      <div class="opponent-header">
        ${avatarHTML(pl.name, 'sm')}
        <div class="opponent-meta">
          <div class="opponent-name">${pl.name}</div>
          <div class="opponent-phase">${phaseLabel}</div>
        </div>
      </div>
      <div class="opponent-row">${cardsHTML}</div>`;
    topEl.appendChild(block);
  });

  // --- Play pile ghost cards (angled stack effect) ---
  const ghostEl = document.getElementById('pileGhosts');
  if (ghostEl) {
    ghostEl.innerHTML = '';
    const count = G.burnDeck.length;
    if (count > 1) {
      const angles = [-6, 4, -3, 7, -5];
      const offsets = [{x:3,y:-2},{x:-4,y:2},{x:2,y:-3},{x:-3,y:1},{x:4,y:-1}];
      const show = Math.min(count - 1, 5);
      for (let gi = 0; gi < show; gi++) {
        const g = document.createElement('div');
        g.className = 'pile-ghost';
        const a = angles[gi % angles.length];
        const o = offsets[gi % offsets.length];
        g.style.transform = `translate(${o.x}px,${o.y}px) rotate(${a}deg)`;
        g.style.zIndex = String(-show + gi);
        ghostEl.appendChild(g);
      }
    }
  }

  // --- Center ---
  const bdEl = document.getElementById('burnDeckDisplay');
  bdEl.className = 'play-pile-card';
  if (G.burnDeck.length === 0) {
    bdEl.classList.add('burn-empty');
    bdEl.innerHTML = `<span class="play-pile-empty-text">Empty</span>`;
  } else {
    const top = G.burnDeck[G.burnDeck.length - 1];
    const col = suitColor(top.suit);
    bdEl.classList.add('burn-card', col);
    bdEl.innerHTML = `
      <span class="burn-top-small">${top.value}<br>${top.suit}</span>
      <span class="burn-top-icon">${CARD_PICTOGRAM[top.value] || top.suit}</span>
      <span class="play-pile-count">${G.burnDeck.length}</span>`;
  }
  document.getElementById('playDeckCount').textContent = G.playDeck.length;

  // Burn pile (10s / four-of-a-kind)
  const burnPileEl = document.getElementById('burnPileDisplay');
  if (burnPileEl) {
    burnPileEl.className = 'pile-visual';
    if (G.burnPile.length === 0) {
      burnPileEl.classList.add('side-pile-empty');
      burnPileEl.innerHTML = `<span style="font-size:0.65rem;color:rgba(255,255,255,0.3)">0</span>`;
    } else {
      const top = G.burnPile[G.burnPile.length - 1];
      burnPileEl.classList.add('side-pile-card', suitColor(top.suit) === 'red' ? 'red' : 'black');
      burnPileEl.innerHTML = `<span class="side-card-icon">${CARD_PICTOGRAM[top.value] || top.suit}</span><span style="font-size:0.55rem;opacity:0.6;margin-top:2px">${G.burnPile.length}</span>`;
    }
  }

  // Requirement info
  const reqEl = document.getElementById('requirementInfo');
  const reqText = G.req.mustPlayLower ? t('game.req_lower')
    : G.req.afterReset ? t('game.req_reset')
    : G.req.minValue   ? t('game.req_min', {val: G.req.minValue})
    : '';
  if (!reqText) {
    reqEl.innerHTML = '';
  } else {
    const [l1, l2] = reqText.split('\n');
    reqEl.innerHTML = l2
      ? `<span class="req-line1">${l1}</span><span class="req-line2">${l2}</span>`
      : `<span class="req-line1">${l1}</span>`;
  }

  const tooltip = document.getElementById('playPileTooltip');
  if (tooltip) tooltip.classList.toggle('hidden', !G.req.afterReset);

  document.getElementById('turnInfo').textContent = t('game.turns_turn', {name: curPlayer().name});
  document.getElementById('gameMessage').textContent = G.message;

  // --- Bottom player ---
  document.getElementById('bottomPlayerName').textContent = p.name;
  const avArea = document.getElementById('bottomAvatarArea');
  if (avArea) avArea.innerHTML = avatarHTML(p.name, 'md');
  document.getElementById('phaseIndicator').textContent = (ONLINE.active && G.currentIdx !== ONLINE.myIdx)
    ? t('game.waiting_for', {name: curPlayer().name})
    : src === 'hand' ? t('game.playing_hand')
    : src === 'faceup' ? t('game.playing_faceup')
    : t('game.playing_blind');

  const handLabel = document.getElementById('handLabel');
  if (handLabel) {
    const count = p.hand.length;
    if (src === 'hand') {
      handLabel.textContent = t('game.hand_label', {n: count, s: count !== 1 ? 's' : ''});
    } else if (src === 'faceup') {
      handLabel.textContent = t('game.faceup_label', {n: p.faceUp.length});
    } else if (src === 'blind') {
      handLabel.textContent = t('game.blind_label');
    } else {
      handLabel.textContent = t('game.hand_label_empty');
    }
  }

  // Blind cards
  const blindEl = document.getElementById('myBlind');
  blindEl.innerHTML = '';
  p.blind.forEach((_, i) => {
    const el = document.createElement('div');
    el.className = 'card-back';
    el.style.width = '38px'; el.style.height = '54px'; el.style.borderRadius = '6px';
    el.style.cursor = src === 'blind' ? 'pointer' : 'default';
    if (src === 'blind') {
      el.addEventListener('click', () => { G.selected = new Set([i]); renderGame(); });
      if (G.selected.has(i)) el.style.outline = '3px solid #f0c040';
    }
    blindEl.appendChild(el);
  });

  // Face-up cards (small zone, always visible)
  const fuEl = document.getElementById('myFaceUp');
  fuEl.innerHTML = '';
  p.faceUp.forEach((card, i) => {
    const isPlayable = src === 'faceup' && canPlay(card);
    const unplay = src === 'faceup' && !canPlay(card);
    const sel = src === 'faceup' && G.selected.has(i);
    const el = makeCard(
      card,
      src === 'faceup' && !p.isAI ? () => onCardTap(i, 'faceup') : null,
      src === 'faceup', sel, unplay
    );
    el.style.width = '40px'; el.style.height = '58px';
    fuEl.appendChild(el);
  });

  // Hand
  const handEl = document.getElementById('myHand');
  handEl.innerHTML = '';

  document.getElementById('actionButtons').classList.remove('hidden');

  if (p.isAI && (_afkDemoActive || _watchedDemoActive) && src === 'hand') {
    // Demo mode: reveal the current AI's hand so the audience can follow along
    p.hand.forEach((card, i) => {
      const el = makeCard(card, null, true, false, false);
      el.style.opacity = '0.92';
      handEl.appendChild(el);
    });
  } else if (p.isAI) {
    handEl.innerHTML = `<div style="color:#aed6b0;font-size:0.85rem;padding:20px">${t('game.computer_thinking')}</div>`;
  } else if (src === 'hand') {
    // Compute value groups for highlight colors
    const groups = {};
    p.hand.forEach((c, i) => { if (canPlay(c)) { (groups[c.value] = groups[c.value] || []).push(i); } });
    const groupColors = ['group-0','group-1','group-2','group-3'];
    let colorIdx = 0;
    const cardGroup = {};
    Object.values(groups).forEach(indices => {
      if (indices.length > 1) { indices.forEach(i => { cardGroup[i] = groupColors[colorIdx % 4]; }); colorIdx++; }
    });

    p.hand.forEach((card, i) => {
      const sel = G.selected.has(i);
      const unplay = !canPlay(card);
      const el = makeCard(card, () => onCardTap(i, 'hand'), true, sel, unplay);
      if (cardGroup[i]) el.classList.add(cardGroup[i]);
      handEl.appendChild(el);
    });
  } else if (src === 'faceup') {
    // Show face-up cards in the hand zone too so they're easy to tap
    const groups = {};
    p.faceUp.forEach((c, i) => { if (canPlay(c)) { (groups[c.value] = groups[c.value] || []).push(i); } });
    const groupColors = ['group-0','group-1','group-2','group-3'];
    let colorIdx = 0;
    const cardGroup = {};
    Object.values(groups).forEach(indices => {
      if (indices.length > 1) { indices.forEach(i => { cardGroup[i] = groupColors[colorIdx % 4]; }); colorIdx++; }
    });

    p.faceUp.forEach((card, i) => {
      const sel = G.selected.has(i);
      const unplay = !canPlay(card);
      const el = makeCard(card, () => onCardTap(i, 'faceup'), true, sel, unplay);
      if (cardGroup[i]) el.classList.add(cardGroup[i]);
      handEl.appendChild(el);
    });
  } else if (src === 'blind') {
    p.blind.forEach((_, i) => {
      const el = document.createElement('div');
      el.className = 'card-back hand-blind-card' + (G.selected.has(i) ? ' hand-blind-selected' : '');
      el.addEventListener('click', () => onCardTap(i, 'blind'));
      handEl.appendChild(el);
    });
  } else {
    handEl.innerHTML = `<div style="color:#aed6b0;font-size:0.85rem;padding:20px">${t('game.hand_empty')}</div>`;
  }

  // Multi-row hand when >5 cards
  handEl.classList.toggle('hand-multirow', handEl.children.length > 5);

  // Sort button — shown when player has a hand to sort
  const btnSort = document.getElementById('btnSort');
  if (btnSort) btnSort.classList.toggle('hidden', src !== 'hand' || p.isAI || p.hand.length < 2);

  // Action buttons state
  const btnPlay = document.getElementById('btnPlay');
  const btnPlayAll = document.getElementById('btnPlayAll');
  const btnPickup = document.getElementById('btnPickUp');
  const selCount = G.selected.size;
  const isMyTurn = !ONLINE.active || G.currentIdx === ONLINE.myIdx;
  btnPlay.disabled = G.transitioning || !isMyTurn || (src !== 'blind' && selCount === 0) || p.isAI;
  btnPlay.textContent = selCount >= 1 ? t('game.play_n_btn', {n: selCount}) : t('game.play_btn');
  btnPickup.disabled = G.transitioning || !isMyTurn || p.isAI;

  // "Play All N" button: show when there are more same-value cards than currently selected
  if (btnPlayAll) {
    const cards2 = src === 'hand' ? p.hand : (src === 'faceup' ? p.faceUp : []);
    if (selCount >= 1 && !p.isAI) {
      const selIdx = [...G.selected][0];
      const selVal = cards2[selIdx]?.value;
      const allSameVal = selVal && [...G.selected].every(i => cards2[i]?.value === selVal);
      const groupSize = allSameVal ? cards2.filter(c => c.value === selVal && canPlay(c)).length : 0;
      if (groupSize > selCount) {
        btnPlayAll.classList.remove('hidden');
        btnPlayAll.textContent = t('game.play_all_btn', {n: groupSize});
        btnPlayAll.onclick = () => {
          const allIdx = cards2.reduce((acc,c,i) => { if(c.value===selVal&&canPlay(c)) acc.push(i); return acc; }, []);
          G.selected = new Set(allIdx);
          onPlayClicked();
        };
      } else {
        btnPlayAll.classList.add('hidden');
      }
    } else {
      btnPlayAll.classList.add('hidden');
    }
  }

  // Log — show last 7 entries in sidebar
  const logEl = document.getElementById('logEntries');
  logEl.innerHTML = G.log.slice(-20).map(l => `<div>${l}</div>`).join('');

  // Highlight if it's the current player's turn among opponents
  document.querySelectorAll('.opponent-block').forEach(b => b.classList.remove('active-turn'));
  if (ONLINE.active) updateOnlineStatus();
  if (ONLINE.active && ONLINE.isHost && G.gamePhase !== 'setup') syncGameState();
}

// ============================================================
// SORT HAND
// ============================================================
function onSortHand() {
  const p = ONLINE.active ? G.players[ONLINE.myIdx] : curPlayer();
  if (p.hand.length < 2) return;
  p.hand.sort((a, b) => ALL_VALUES.indexOf(a.value) - ALL_VALUES.indexOf(b.value));
  G.selected.clear();
  renderGame();
}

// ============================================================
// PILE PREVIEW
// ============================================================
let _previewTimer = null;

function onPileClick(type) {
  if (!G || G.gamePhase === 'setup') return;
  const cards = type === 'play' ? G.burnDeck : G.burnPile;
  const title = type === 'play' ? t('game.play_pile_title') : t('game.burn_pile_title');
  const panel = document.getElementById('pilePreview');
  const titleEl = document.getElementById('pilePreviewTitle');
  const cardsEl = document.getElementById('pilePreviewCards');

  if (!panel) return;
  if (cards.length === 0) { showMsg(t('game.pile_empty', {title})); return; }

  titleEl.textContent = t('game.pile_last', {title, n: Math.min(5, cards.length)});
  cardsEl.innerHTML = '';
  const last5 = cards.slice(-5).reverse();
  last5.forEach(c => {
    const el = makeCard(c, null, false, false, false);
    el.style.flexShrink = '0';
    cardsEl.appendChild(el);
  });

  panel.classList.remove('hidden');
  panel.classList.add('slide-in');
  if (_previewTimer) clearTimeout(_previewTimer);
  _previewTimer = setTimeout(() => {
    panel.classList.add('hidden');
    panel.classList.remove('slide-in');
  }, 2000);
}

// ============================================================
// MEGA BURN (4 burnt potatoes)
// ============================================================
function triggerMegaBurn() {
  const el = document.getElementById('megaBurn');
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('mega-burn-active');
  setTimeout(() => {
    el.classList.add('hidden');
    el.classList.remove('mega-burn-active');
  }, 2200);
}

// ============================================================
// RULES PANEL
// ============================================================
function toggleRules() {
  const panel = document.getElementById('rulesPanel');
  if (panel) panel.classList.toggle('hidden');
}

function toggleSelect(idx) {
  if (G.selected.has(idx)) G.selected.delete(idx);
  else G.selected.add(idx);
  renderGame();
}

// Tap-to-play: single tap plays unique cards; duplicate values auto-select group then play on second tap
let _tapCooldown = false;

function onCardTap(idx, sourceType) {
  if (G.gamePhase !== 'playing') return;
  if (G.transitioning || _tapCooldown) return;
  if (ONLINE.active && G.currentIdx !== ONLINE.myIdx) return;
  const p = curPlayer();
  if (p.isAI) return;

  const src = activeSource(p);

  // Blind cards: select then play
  if (src === 'blind') {
    _tapCooldown = true; setTimeout(() => { _tapCooldown = false; }, 900);
    G.selected = new Set([idx]);
    onPlayClicked();
    return;
  }

  // Only respond to correct zone
  if (src !== sourceType) return;

  const cards = src === 'hand' ? p.hand : p.faceUp;
  const card = cards[idx];

  if (!canPlay(card)) {
    showMsg(t('game.cant_play'));
    return;
  }

  // Find all same-value playable cards in the same source
  const sameGroup = cards.reduce((acc, c, i) => {
    if (c.value === card.value && canPlay(c)) acc.push(i);
    return acc;
  }, []);

  if (sameGroup.length === 1) {
    // Unique value — play immediately
    _tapCooldown = true; setTimeout(() => { _tapCooldown = false; }, 900);
    G.selected = new Set([idx]);
    onPlayClicked();
  } else {
    // Group of 2+ — multi-select model
    if (G.selected.has(idx)) {
      if (G.selected.size === 1) {
        // Only card selected — second tap plays it
        onPlayClicked();
      } else {
        // Deselect this one from the group
        G.selected.delete(idx);
        renderGame();
      }
    } else {
      // Check if tapping a different value — replace selection
      const selArr = [...G.selected];
      const hasDiffValue = selArr.some(i => cards[i] && cards[i].value !== card.value);
      if (hasDiffValue) {
        G.selected = new Set([idx]);
      } else {
        // Same value — accumulate selection
        G.selected.add(idx);
      }
      renderGame();
    }
  }
}

// ============================================================
// MENU INIT
// ============================================================
let menuConfig = { numPlayers: 2, vsAI: false, direction: 1, drinkingMode: false, onlineDrinkingMode: false };

function toggleDrinkingMode() {
  menuConfig.drinkingMode = !menuConfig.drinkingMode;
  const btn = document.getElementById('drinkingModeToggle');
  if (btn) {
    btn.textContent = menuConfig.drinkingMode ? '🍺 Drinking Mode: ON' : '🍺 Drinking Mode: OFF';
    btn.classList.toggle('toggle-btn-on', menuConfig.drinkingMode);
  }
}
function toggleOnlineDrinkingMode() {
  menuConfig.onlineDrinkingMode = !menuConfig.onlineDrinkingMode;
  const btn = document.getElementById('onlineDrinkingToggle');
  if (btn) {
    btn.textContent = menuConfig.onlineDrinkingMode ? '🍺 Drinking Mode: ON' : '🍺 Drinking Mode: OFF';
    btn.classList.toggle('toggle-btn-on', menuConfig.onlineDrinkingMode);
  }
}

function initMenu() {
  // Num players
  document.getElementById('numPlayersGroup').querySelectorAll('.pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('numPlayersGroup').querySelectorAll('.pick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      menuConfig.numPlayers = parseInt(btn.dataset.val);
      rebuildNameInputs();
    });
  });

  // Mode
  document.getElementById('modeGroup').querySelectorAll('.pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('modeGroup').querySelectorAll('.pick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      menuConfig.vsAI = btn.dataset.val === 'ai';
      rebuildNameInputs();
    });
  });

  document.getElementById('btnStartGame').addEventListener('click', startGame);
  document.getElementById('btnConfirmSetup').addEventListener('click', confirmSetup);
  document.getElementById('btnPassReady').addEventListener('click', () => {
    if (passCallback) { passCallback(); passCallback = null; }
  });

  if (IS_WEB) {
    document.querySelector('.btn-leaderboard')?.classList.add('hidden');
    document.querySelector('.btn-online')?.classList.add('hidden');
    document.querySelector('.btn-switch-account')?.classList.add('hidden');
  }

  rebuildNameInputs();
}

function rebuildNameInputs() {
  const container = document.getElementById('playerNameInputs');
  container.innerHTML = '';
  const total = menuConfig.numPlayers;
  const aiMode = menuConfig.vsAI;
  for (let i = 0; i < total; i++) {
    const placeholder = i === 0 ? 'Player 1 (You)' : aiMode ? `Computer ${i}` : `Player ${i + 1}`;

    const row = document.createElement('div');
    row.className = 'name-input-row';

    const avWrap = document.createElement('div');
    avWrap.className = 'avatar-wrap avatar-sm league-rookie';
    avWrap.title = 'Pick avatar';
    const avInner = document.createElement('div');
    avInner.className = 'avatar-inner';
    avInner.textContent = '🎲';
    avWrap.appendChild(avInner);

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.dataset.slot = i;
    inp.placeholder = placeholder;
    inp.maxLength = 16;
    if (aiMode && i > 0) inp.disabled = true;

    const syncAvatar = () => {
      const name = inp.value.trim() || placeholder;
      avInner.textContent = getAvatar(name);
      const lb = getLB();
      const wins = lb[name]?.wins || 0;
      const league = getLeague(wins);
      avWrap.className = `avatar-wrap avatar-sm league-${league.id}`;
    };

    if (i === 0 && isRegistered()) {
      const myName = localStorage.getItem('lr_my_name');
      inp.value = myName;
      inp.disabled = true;
      avInner.textContent = getAvatar(myName);
      const wins = getLB()[myName]?.wins || 0;
      avWrap.className = `avatar-wrap avatar-sm league-${getLeague(wins).id}`;
      avWrap.title = 'Profile locked';
    } else {
      const vBadge = document.createElement('span');
      vBadge.className = 'visitor-badge';
      vBadge.textContent = 'VISITOR';
      avWrap.appendChild(vBadge);
      inp.addEventListener('input', () => {
        syncAvatar();
        if (i === 0) { renderDesignPicker(); setMyName(inp.value.trim() || placeholder); }
      });
      if (!(aiMode && i > 0)) {
        avWrap.style.cursor = 'pointer';
        avWrap.addEventListener('click', e => openAvatarPicker(e,
          () => inp.value.trim() || placeholder,
          em => { avInner.textContent = em; if (i === 0) renderDesignPicker(); }
        ));
      }
      syncAvatar();
    }

    row.appendChild(avWrap);
    row.appendChild(inp);
    container.appendChild(row);
  }
  renderDesignPicker();
}

function startGame() {
  const inputs = document.getElementById('playerNameInputs').querySelectorAll('input');

  // Validate: all human slots must have a name
  for (let i = 0; i < inputs.length; i++) {
    if (menuConfig.vsAI && i > 0) continue;
    if (!inputs[i].value.trim()) {
      inputs[i].focus();
      inputs[i].classList.add('input-error');
      setTimeout(() => inputs[i].classList.remove('input-error'), 1400);
      showToast(t('menu.enter_name_for', {n: i + 1}));
      return;
    }
  }

  const names = Array.from(inputs).map((inp, i) => {
    if (menuConfig.vsAI && i > 0) return `CPU ${i}`;
    return inp.value.trim();
  });

  newGame({
    numPlayers: menuConfig.numPlayers,
    vsAI: menuConfig.vsAI,
    direction: menuConfig.direction,
    names,
    drinkingMode: menuConfig.drinkingMode,
  });

  // First human setup
  if (!G.players[0].isAI) {
    showScreen('setup');
    renderSetup();
  } else {
    aiDoSetup();
  }
}

// ============================================================
// TUTORIAL
// ============================================================
const TUTORIAL_STEPS = [
  { target: null, placement: 'center', title: 'Welcome to Last Round! 🍺',
    text: 'The LAST player still holding cards is the loser. Empty your hand, face-up cards, and blind cards to escape. Let\'s learn the table!' },
  { target: '#topPlayers', title: 'Your opponents',
    text: 'Your rivals sit up here. You can see how many cards each player holds — watch who\'s getting dangerously close to empty!' },
  { target: '#playDeckDisplay', title: 'Draw pile',
    text: 'After each play you automatically draw back up to 3 cards. Once this runs out, no more refills — you\'re on your own.' },
  { target: '#burnDeckDisplay', title: 'Play pile',
    text: 'The main event. You must play equal or higher value than the top card. Tap it to peek at the last 5 cards played.' },
  { target: '#burnPileDisplay', title: 'Burned pile',
    text: 'Cards permanently removed: 💣 Bombs (10s), four-of-a-kind triggers, and all 🎁 Gifts (3s). Tap to peek at what\'s gone.' },
  { target: '#myHand', title: 'Your hand',
    text: 'Tap a card to select it. Cards of the same value glow together — tap multiple to select several and play them all at once!' },
  { target: '.bottom-zones', placement: 'above', title: 'Your table cards',
    text: 'Face-up cards (everyone sees them) are played when your hand is empty. Blind cards come last — you flip them one at a time into the unknown.' },
  { target: '#actionButtons', placement: 'above', title: 'Action buttons',
    text: '▶ Play your selected cards. ⬆ Pick Up takes the entire pile into your hand when you\'re stuck. ⇅ Sort tidies your hand by value.' },
  { target: '#gameMessage', title: 'Game messages',
    text: 'Critical info appears here: action card effects, current requirements (must play higher / lower), and warnings.' },
  { target: '#rulesToggle', title: 'The Rules Scroll 📖',
    text: 'Tap any time to open the full rules reference. Every card\'s power is listed there. It sits right below the draw deck.' },
  { target: null, placement: 'center', title: 'Action cards cheat sheet ⚡',
    text: '🍺 2 = Fresh Pint (anything goes next)\n🎯 3 = Bull\'s Eye (draw a card, keep your turn)\n🔔 7 = Last Orders (next must play 4 or 6)\n💥 10 = Keg Blast (pile burns, play again)\n🪞 5 = Bar Mirror (copies the card below it)' },
  { target: null, placement: 'center', title: 'You\'re ready! 🎉', isLast: true,
    text: 'First out isn\'t the winner — they\'re the HERO who escaped! The last one holding cards buys the next round. Good luck! 🍺' },
];

let _tutStep = 0;
let _tutEls = [];

function startTutorial() {
  _tutStep = 0;
  _tutEls = [];
  _showTutStep(0);
}

function _showTutStep(i) {
  const step = TUTORIAL_STEPS[i];
  const overlay = document.getElementById('tutorialOverlay');
  const card = document.getElementById('tutorialCard');
  if (!overlay || !card) return;

  // Clear previous highlights
  _tutEls.forEach(e => {
    e.el.classList.remove('tut-highlight');
    e.el.style.position = e.pos;
    e.el.style.zIndex = e.z;
  });
  _tutEls = [];

  document.getElementById('tutorialTitle').textContent = t(`tut.${i}.title`);
  document.getElementById('tutorialText').textContent = t(`tut.${i}.text`);
  document.getElementById('tutorialProgress').textContent = t('tut.progress', {n: i + 1, total: TUTORIAL_STEPS.length});
  document.getElementById('tutorialNextBtn').textContent = (step.isLast || i === TUTORIAL_STEPS.length - 1)
    ? t('tut.lets_play') : t('tut.next');

  overlay.classList.remove('hidden');

  if (step.target) {
    const target = document.querySelector(step.target);
    if (target) {
      const saveAndLift = (el, z) => {
        const e = { el, pos: el.style.position, z: el.style.zIndex };
        _tutEls.push(e);
        if (!el.style.position || getComputedStyle(el).position === 'static') el.style.position = 'relative';
        el.style.zIndex = String(z);
        return e;
      };
      saveAndLift(target, 202);
      target.classList.add('tut-highlight');
      let par = target.parentElement;
      let d = 0;
      while (par && par !== document.body && d++ < 4) {
        const cs = getComputedStyle(par);
        if (cs.position !== 'static') saveAndLift(par, 201);
        par = par.parentElement;
      }
    }
  }

  // Default: CSS-centered within game-main (overlay is inset:0 inside it)
  card.style.cssText = 'width:min(284px,calc(100% - 24px));top:50%;left:50%;transform:translate(-50%,-50%);position:absolute;';

  // If there's a target, check overlap after layout and shift if needed
  if (step.target) {
    requestAnimationFrame(() => {
      const main = document.querySelector('.game-main');
      if (!main) return;
      const mRect = main.getBoundingClientRect();
      const cRect = card.getBoundingClientRect();
      const target = document.querySelector(step.target);
      if (!target) return;
      const tRect = target.getBoundingClientRect();
      const tTop = tRect.top    - mRect.top;
      const tBot = tRect.bottom - mRect.top;
      const cTop = cRect.top    - mRect.top;
      const cBot = cRect.bottom - mRect.top;
      const ch   = cRect.height;
      const cw   = cRect.width;
      const pad  = 10;

      const overlapsV = cBot > tTop - 12 && cTop < tBot + 12;
      if (!overlapsV) return; // no clash, stay centered

      let top;
      const spaceBelow = mRect.height - tBot - ch - pad * 2;
      const spaceAbove = tTop - ch - pad * 2;
      if (spaceBelow >= 0) {
        top = tBot + 14;
      } else if (spaceAbove >= 0) {
        top = tTop - ch - 14;
      } else {
        return; // no room either side, keep centered
      }
      top  = Math.max(pad, Math.min(top, mRect.height - ch - pad));
      const left = Math.max(pad, Math.min((mRect.width - cw) / 2, mRect.width - cw - pad));
      card.style.cssText = `width:${cw}px;top:${top}px;left:${left}px;transform:none;position:absolute;`;
    });
  }
}

function nextTutorialStep() {
  _tutStep++;
  if (_tutStep >= TUTORIAL_STEPS.length) endTutorial();
  else _showTutStep(_tutStep);
}

function endTutorial() {
  const overlay = document.getElementById('tutorialOverlay');
  if (overlay) overlay.classList.add('hidden');
  localStorage.setItem('lr_tutorial_done', '1');
  if (localStorage.getItem('lr_my_name')) saveProfile(getName(), { tutorialDone: true });
  _tutEls.forEach(e => {
    e.el.classList.remove('tut-highlight');
    e.el.style.position = e.pos;
    e.el.style.zIndex = e.z;
  });
  _tutEls = [];
  showScreen('menu');
}

function startMenuTutorial() {
  // Start a quick 2-player vs AI game silently just to show the game screen
  newGame({ numPlayers: 2, vsAI: true, direction: 1, names: ['You', 'CPU 1'] });
  // Auto-complete AI setup
  G.players.forEach(p => {
    const sorted = [...p.hand].sort((a, b) => getRank(b.value) - getRank(a.value));
    p.faceUp = sorted.slice(0, 3);
    p.hand = sorted.slice(3);
  });
  G.setupIdx = G.players.length;
  G.gamePhase = 'playing';
  G.currentIdx = determineStarter();
  applyDesign(G_DESIGN);
  showScreen('game');
  renderGame();
  setTimeout(startTutorial, 400);
}

// ============================================================
// SEASON / BRAWL SYSTEM
// ============================================================
const BRAWL_WORDS_A = ['Bitter','Rotten','Cursed','Smoky','Loaded','Blind','Stale','Last','Dark','Foamy','Sour','Cold','Wild','Rusted','Wicked'];
const BRAWL_WORDS_B = ['Pint','Barrel','Draught','Call','Ace','Joker','Flush','Potato','Round','Spade','Skull','Deal','Wager','Stack','Bluff'];
const BRAWL_DURATION_MS = 90 * 24 * 60 * 60 * 1000;

function getBrawlName(num) {
  const n = num - 1;
  return `The ${BRAWL_WORDS_A[n % BRAWL_WORDS_A.length]} ${BRAWL_WORDS_B[Math.floor(n / BRAWL_WORDS_A.length) % BRAWL_WORDS_B.length]}`;
}

function getBrawlMeta() {
  try { return JSON.parse(localStorage.getItem('lr_brawl_meta') || 'null'); }
  catch { return null; }
}
function saveBrawlMeta(data) {
  localStorage.setItem('lr_brawl_meta', JSON.stringify(data));
  if (fbReady()) {
    const { db, ref, set: fbSet } = fb();
    fbSet(ref(db, 'season/meta'), data).catch(() => {});
  }
}

function getBrawlArchive() {
  try { return JSON.parse(localStorage.getItem('lr_brawl_archive') || '[]'); }
  catch { return []; }
}
function saveBrawlArchive(data) {
  localStorage.setItem('lr_brawl_archive', JSON.stringify(data));
  if (fbReady()) {
    const { db, ref, set: fbSet } = fb();
    const obj = {};
    data.forEach(s => { obj[s.number] = s; });
    fbSet(ref(db, 'season/archive'), obj).catch(() => {});
  }
}

function checkSeasonRollover() {
  let meta = getBrawlMeta();
  if (!meta) {
    saveBrawlMeta({ number: 1, name: getBrawlName(1), startDate: Date.now() });
    return;
  }
  if (Date.now() - meta.startDate >= BRAWL_DURATION_MS) {
    doSeasonRollover(meta);
  }
}

function doSeasonRollover(meta) {
  const lb = getLB();
  const top3 = Object.entries(lb)
    .map(([name, s]) => ({ name, wins: s.wins, avatar: getAvatar(name) }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 3)
    .map((p, i) => ({ place: i + 1, ...p }));
  const archive = getBrawlArchive();
  archive.unshift({ number: meta.number, name: meta.name, startDate: meta.startDate, endDate: Date.now(), top3 });
  saveBrawlArchive(archive);
  localStorage.removeItem('lr_leaderboard');
  if (fbReady()) { const { db, ref, remove: fbRm } = fb(); fbRm(ref(db, 'leaderboard')).catch(() => {}); }
  const newNum = meta.number + 1;
  saveBrawlMeta({ number: newNum, name: getBrawlName(newNum), startDate: Date.now() });
}

// ============================================================
// FIREBASE SYNC
// ============================================================
async function syncFromFirebase() {
  if (!fbReady()) return;
  const { db, ref, get: fbGet } = fb();
  try {
    const [lbSnap, profSnap, metaSnap, archSnap] = await Promise.all([
      fbGet(ref(db, 'leaderboard')),
      fbGet(ref(db, 'profiles')),
      fbGet(ref(db, 'season/meta')),
      fbGet(ref(db, 'season/archive')),
    ]);

    if (lbSnap.exists()) {
      const fbLb = {};
      Object.values(lbSnap.val()).forEach(e => { if (e.name) fbLb[e.name] = e; });
      localStorage.setItem('lr_leaderboard', JSON.stringify(fbLb));
    } else {
      // No Firebase data yet — push local data up if it exists
      const local = getLB();
      if (Object.keys(local).length > 0) saveLB(local);
    }

    if (profSnap.exists()) {
      const fbProf = {};
      Object.values(profSnap.val()).forEach(p => { if (p.name) fbProf[p.name] = p; });
      const merged = { ...JSON.parse(localStorage.getItem('lr_profiles') || '{}'), ...fbProf };
      localStorage.setItem('lr_profiles', JSON.stringify(merged));
    }

    if (metaSnap.exists()) {
      localStorage.setItem('lr_brawl_meta', JSON.stringify(metaSnap.val()));
    } else {
      const local = getBrawlMeta();
      if (local) saveBrawlMeta(local);
    }

    if (archSnap.exists()) {
      const arr = Object.values(archSnap.val()).sort((a, b) => b.number - a.number);
      localStorage.setItem('lr_brawl_archive', JSON.stringify(arr));
    }

    // Re-run rollover check with fresh authoritative data
    checkSeasonRollover();

  } catch (e) { console.warn('Firebase sync error:', e); }
}

function initFirebaseSync() {
  if (!fbReady()) { setTimeout(initFirebaseSync, 1000); return; }
  syncFromFirebase();
  startConnectionMonitor();
}

let _lbUnsubscribe = null;

function listenLeaderboard() {
  if (!fbReady()) return;
  if (_lbUnsubscribe) { _lbUnsubscribe(); _lbUnsubscribe = null; }
  const { db, ref, onValue: fbOn } = fb();
  _lbUnsubscribe = fbOn(ref(db, 'leaderboard'), snap => {
    if (!snap.exists()) return;
    const fbLb = {};
    Object.values(snap.val()).forEach(e => { if (e.name) fbLb[e.name] = e; });
    localStorage.setItem('lr_leaderboard', JSON.stringify(fbLb));
    if (document.getElementById('screen-leaderboard')?.classList.contains('active')) {
      renderLeaderboard();
    }
  });
}

function stopListenLeaderboard() {
  if (_lbUnsubscribe) { _lbUnsubscribe(); _lbUnsubscribe = null; }
}

// ============================================================
// LEADERBOARD (localStorage)
// ============================================================
function getLB() {
  try { return JSON.parse(localStorage.getItem('lr_leaderboard') || '{}'); }
  catch { return {}; }
}
function saveLB(data) {
  localStorage.setItem('lr_leaderboard', JSON.stringify(data));
  if (fbReady()) {
    const { db, ref, set: fbSet } = fb();
    const fbData = {};
    Object.entries(data).forEach(([name, stats]) => {
      fbData[fbSafe(name)] = { ...stats, name };
    });
    fbSet(ref(db, 'leaderboard'), fbData).catch(() => {});
  }
}

function updateLeaderboard(placements) {
  const lb = getLB();
  placements.forEach(entry => {
    if (entry.player.isAI) return;
    const name = entry.player.name;
    if (!lb[name]) lb[name] = { games: 0, wins: 0, second: 0, third: 0, losses: 0, duelWins: 0, duelLosses: 0, spudLosses: 0 };
    lb[name].duelWins = lb[name].duelWins || 0;
    lb[name].duelLosses = lb[name].duelLosses || 0;
    lb[name].spudLosses = lb[name].spudLosses || 0;
    lb[name].games++;
    if (entry.place === 1) lb[name].wins++;
    else if (entry.place === 2) lb[name].second++;
    else if (entry.place === 3) lb[name].third++;
    if (entry.isLoser) {
      lb[name].losses++;
      if (G.isSpudEscape) lb[name].spudLosses++;
    }
    if (G.isDuel) {
      if (entry.place === 1) lb[name].duelWins++;
      if (entry.isLoser) lb[name].duelLosses++;
    }
    const profile = getProfile(name);
    if (profile) saveProfile(name, { wins: lb[name].wins, games: lb[name].games });
  });
  saveLB(lb);
}

function renderLeaderboard() {
  const meta = getBrawlMeta() || { number: 1, name: getBrawlName(1), startDate: Date.now() };
  const daysLeft = Math.max(0, Math.ceil((BRAWL_DURATION_MS - (Date.now() - meta.startDate)) / 86400000));

  const nameEl = document.getElementById('brawlName');
  const daysEl = document.getElementById('brawlDays');
  if (nameEl) nameEl.textContent = meta.name;
  if (daysEl) daysEl.textContent = `Season ${meta.number} · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;

  const lb = getLB();
  const entries = Object.entries(lb)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.wins - a.wins || b.second - a.second || b.third - a.third);

  const el = document.getElementById('leaderboardEntries');
  if (!el) return;

  if (entries.length === 0) {
    el.innerHTML = '<div class="lb-empty">No games recorded this brawl yet.<br>Start playing to fill the board!</div>';
    return;
  }

  const myName = localStorage.getItem('lr_my_name') || '';
  el.innerHTML = '';
  entries.forEach((e, i) => {
    const league = getLeague(e.wins);
    const row = document.createElement('div');
    row.className = 'lb-row' + (i === 0 ? ' lb-gold' : i === 1 ? ' lb-silver' : i === 2 ? ' lb-bronze' : '');
    const rankHTML = i < 3
      ? `<div class="lb-cup">${makeCupHTML(i + 1)}</div>`
      : `<div class="lb-cup lb-num">${i + 1}</div>`;
    const safeN = e.name.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    const safeAv = getAvatar(e.name).replace(/'/g, '&#39;');
    const duelBtn = fbReady() && e.name !== myName
      ? `<button class="lb-duel-btn" onclick="openDuelChallengePrompt('${safeN}','${safeAv}')" title="Challenge to a Duel">⚔️</button>`
      : '';
    row.innerHTML = `${rankHTML}
      ${avatarHTML(e.name, 'md')}
      <div class="lb-name-col">
        <div class="lb-name">${e.name}</div>
        <div class="lb-league-badge" style="color:${league.color}">${league.icon} ${league.name}</div>
      </div>
      <div class="lb-stats">
        <span class="lb-wins">🏆 ${e.wins}</span>
        <span class="lb-games">${e.games} played · ${e.losses} 🥔</span>
      </div>
      ${duelBtn}`;
    el.appendChild(row);
  });
}

function renderHoF() {
  const archive = getBrawlArchive();
  const el = document.getElementById('hofEntries');
  if (!el) return;

  if (archive.length === 0) {
    el.innerHTML = '<div class="lb-empty">No completed seasons yet.<br>First brawl ends in 90 days!</div>';
    return;
  }

  const medals = ['🥇','🥈','🥉'];
  el.innerHTML = '';
  archive.forEach(season => {
    const start = new Date(season.startDate).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    const end   = new Date(season.endDate  ).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    const top3HTML = season.top3.length > 0
      ? season.top3.map(p => `<div class="hof-player">
          <span class="hof-medal">${medals[p.place - 1] || ''}</span>
          <span class="hof-av">${p.avatar || '🎲'}</span>
          <span class="hof-pname">${p.name}</span>
          <span class="hof-pwins">🏆 ${p.wins}</span>
        </div>`).join('')
      : '<div class="hof-empty-season">No games played this season</div>';
    const card = document.createElement('div');
    card.className = 'hof-season-card';
    card.innerHTML = `
      <div class="hof-season-header">
        <span class="hof-season-name">${season.name}</span>
        <span class="hof-season-dates">S${season.number} · ${start} – ${end}</span>
      </div>
      <div class="hof-players">${top3HTML}</div>`;
    el.appendChild(card);
  });
}

function showLbTab(tab) {
  ['brawl', 'hof', 'spudd', 'ring', 'scarred'].forEach(t => {
    const entries = document.getElementById(t === 'brawl' ? 'leaderboardEntries' : t + 'Entries');
    const btn = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (entries) entries.classList.toggle('hidden', t !== tab);
    if (btn) btn.classList.toggle('lb-tab-active', t === tab);
  });
  if (tab === 'hof') renderHoF();
  if (tab === 'spudd') renderSpuddKings();
  if (tab === 'ring') renderRingBearers();
  if (tab === 'scarred') renderTheScarred();
}

function renderSpuddKings() {
  const lb = getLB();
  const entries = Object.entries(lb)
    .map(([name, s]) => ({ name, ...s }))
    .filter(e => (e.losses || 0) > 0)
    .sort((a, b) => (b.losses || 0) - (a.losses || 0) || (b.games || 0) - (a.games || 0));

  const el = document.getElementById('spuddEntries');
  if (!el) return;
  if (entries.length === 0) {
    el.innerHTML = '<div class="lb-empty">No one has been spudded yet!<br>The potato throne sits empty 🥔</div>';
    return;
  }

  const crownIcons = ['🎩🥔', '🥔🥔', '🥔'];
  const crownTitles = ['The Spudd King', 'Royal Spud', 'Court Potato'];
  el.innerHTML = '';
  entries.forEach((e, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row' + (i === 0 ? ' lb-spudd-first' : '');
    const rankHTML = i < 3
      ? `<div class="lb-cup lb-spudd-crown">${crownIcons[i]}</div>`
      : `<div class="lb-cup lb-num">${i + 1}</div>`;
    const title = i < 3 ? crownTitles[i] : 'Spud in Training';
    row.innerHTML = `${rankHTML}
      ${avatarHTML(e.name, 'md')}
      <div class="lb-name-col">
        <div class="lb-name">${e.name}</div>
        <div class="lb-league-badge" style="color:#c8a060">${title}</div>
      </div>
      <div class="lb-stats">
        <span class="lb-wins" style="color:#c8803a">${e.losses || 0} 🥔</span>
        <span class="lb-games">${e.games || 0} played</span>
      </div>`;
    el.appendChild(row);
  });
}

function renderRingBearers() {
  const lb = getLB();
  const entries = Object.entries(lb)
    .map(([name, s]) => ({ name, ...s }))
    .filter(e => (e.duelWins || 0) > 0)
    .sort((a, b) => (b.duelWins || 0) - (a.duelWins || 0));

  const el = document.getElementById('ringEntries');
  if (!el) return;
  if (entries.length === 0) {
    el.innerHTML = '<div class="lb-empty">No duels won yet.<br>Step onto the field! ⚔️</div>';
    return;
  }

  const ringTitles = ['The Undefeated', 'Blade Dancer', 'Iron Challenger'];
  el.innerHTML = '';
  entries.forEach((e, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row' + (i === 0 ? ' lb-gold' : i === 1 ? ' lb-silver' : i === 2 ? ' lb-bronze' : '');
    const rankHTML = i < 3
      ? `<div class="lb-cup">${makeRingHTML()}</div>`
      : `<div class="lb-cup lb-num">${i + 1}</div>`;
    const title = i < 3 ? ringTitles[i] : 'Ring Seeker';
    row.innerHTML = `${rankHTML}
      ${avatarHTML(e.name, 'md')}
      <div class="lb-name-col">
        <div class="lb-name">${e.name}</div>
        <div class="lb-league-badge" style="color:#b8a060">${title}</div>
      </div>
      <div class="lb-stats">
        <span class="lb-wins">${e.duelWins || 0} 💍</span>
        <span class="lb-games">${e.duelLosses || 0} lost</span>
      </div>`;
    el.appendChild(row);
  });
}

function renderTheScarred() {
  const lb = getLB();
  const entries = Object.entries(lb)
    .map(([name, s]) => ({ name, ...s }))
    .filter(e => (e.duelLosses || 0) > 0)
    .sort((a, b) => (b.duelLosses || 0) - (a.duelLosses || 0));

  const el = document.getElementById('scarredEntries');
  if (!el) return;
  if (entries.length === 0) {
    el.innerHTML = '<div class="lb-empty">No battle scars yet.<br>Everyone leaves unbloodied 🗡️</div>';
    return;
  }

  const scarredTitles = ['Chief Blade Catcher', 'Veteran of Defeats', 'Scar Collector'];
  el.innerHTML = '';
  entries.forEach((e, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row' + (i === 0 ? ' lb-scarred-first' : '');
    const rankHTML = i < 3
      ? `<div class="lb-cup lb-scarred-rank">${i === 0 ? '🗡️🩸' : i === 1 ? '🗡️' : '🩹'}</div>`
      : `<div class="lb-cup lb-num">${i + 1}</div>`;
    const title = i < 3 ? scarredTitles[i] : 'Dagger Enthusiast';
    row.innerHTML = `${rankHTML}
      ${avatarHTML(e.name, 'md')}
      <div class="lb-name-col">
        <div class="lb-name">${e.name}</div>
        <div class="lb-league-badge" style="color:#a06060">${title}</div>
      </div>
      <div class="lb-stats">
        <span class="lb-wins" style="color:#d06060">${e.duelLosses || 0} 🗡️</span>
        <span class="lb-games">${e.duelWins || 0} won</span>
      </div>`;
    el.appendChild(row);
  });
}

function showLeaderboard() {
  renderLeaderboard();
  showLbTab('brawl');
  showScreen('leaderboard');
  listenLeaderboard();
}

function clearLeaderboard() {
  if (confirm('Reset current brawl standings?\nSeason archive is preserved.')) {
    localStorage.removeItem('lr_leaderboard');
    renderLeaderboard();
  }
}

// ============================================================
// AUTH SYSTEM
// ============================================================
let _authUser = null;
let _authCreateAvatar = null;
let _authCreateStep = 1;
let _googlePendingUser = null;
let _authFlowManual = false; // true when registerWithGoogle/Email is handling auth itself

const ONE_MONTH_MS  = 30  * 24 * 60 * 60 * 1000;
const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

function initAuth() {
  if (!window._fbAuth) { setTimeout(initAuth, 300); return; }
  const { auth, onAuthStateChanged, signInAnonymously } = window._fbAuth;

  onAuthStateChanged(auth, async user => {
    _authUser = user;
    window._fbUid = user?.uid;

    if (user && !user.isAnonymous) {
      if (IS_WEB) {
        await window._fbAuth.signOut(window._fbAuth.auth);
      } else if (!_authFlowManual) {
        await handleRegisteredUserLogin(user);
      }
    } else if (!user) {
      try {
        const cred = await signInAnonymously(auth);
        window._fbUid = cred.user.uid;
      } catch {
        window._fbUid = 'local-' + Math.random().toString(36).slice(2);
      }
    }
    // Anonymous user: landing screen stays visible, Firebase ops now work
  });
}

function _isInActiveGame() {
  return ['screen-setup', 'screen-pass', 'screen-game'].some(
    id => document.getElementById(id)?.classList.contains('active')
  );
}

async function handleRegisteredUserLogin(user) {
  let waited = 0;
  while (!window._fb && waited < 3000) { await new Promise(r => setTimeout(r, 200)); waited += 200; }
  if (!window._fb) {
    if (!_isInActiveGame()) showScreen('landing');
    showToast(t('auth.connection_issue'));
    return;
  }
  try {
    const { db, ref, get: fbGet, update: fbUp, remove: fbRm } = fb();

    const mapSnap = await fbGet(ref(db, `authMap/${user.uid}`));
    if (!mapSnap.exists()) {
      _googlePendingUser = user;
      _showAuthCompleteProfile();
      return;
    }

    const profileKey = mapSnap.val();
    const profSnap = await fbGet(ref(db, `profiles/${profileKey}`));
    if (!profSnap.exists()) {
      await window._fbAuth.signOut(window._fbAuth.auth);
      showScreen('landing');
      showToast(t('auth.profile_not_found'));
      return;
    }

    const profile = profSnap.val();
    const now = Date.now();

    if (profile.lastSeen && now - profile.lastSeen > SIX_MONTHS_MS) {
      await Promise.all([
        fbRm(ref(db, `profiles/${profileKey}`)),
        fbRm(ref(db, `authMap/${user.uid}`)),
        fbRm(ref(db, `leaderboard/${profileKey}`)),
      ]).catch(() => {});
      await window._fbAuth.signOut(window._fbAuth.auth);
      localStorage.removeItem('lr_my_name');
      localStorage.removeItem('lr_registered');
      showScreen('landing');
      showToast(t('auth.account_removed'));
      return;
    }

    if (profile.lastSeen && now - profile.lastSeen > ONE_MONTH_MS) {
      await window._fbAuth.signOut(window._fbAuth.auth);
      localStorage.removeItem('lr_my_name');
      localStorage.removeItem('lr_registered');
      showScreen('landing');
      showToast(t('auth.session_expired'));
      return;
    }

    fbUp(ref(db, `profiles/${profileKey}`), { lastSeen: now }).catch(() => {});

    const localProfiles = JSON.parse(localStorage.getItem('lr_profiles') || '{}');
    localProfiles[profile.name] = profile;
    localStorage.setItem('lr_profiles', JSON.stringify(localProfiles));
    localStorage.setItem('lr_my_name', profile.name);
    localStorage.setItem('lr_registered', 'true');
    if (profile.tutorialDone) localStorage.setItem('lr_tutorial_done', '1');

    document.getElementById('authCreatePanel')?.classList.add('hidden');
    document.getElementById('authLoginPanel')?.classList.add('hidden');
    if (!_isInActiveGame()) showScreen('menu');
    applyLockedProfile();
    listenForDuelChallenge();
    initFirebaseSync();

  } catch (err) {
    console.error('Login error:', err);
    if (!_isInActiveGame()) {
      showScreen('landing');
      showToast('Sign-in failed. Please try again.');
    }
  }
}

function initWebLanding() {
  const actions = document.querySelector('.landing-actions');
  if (!actions) return;
  actions.innerHTML = `
    <button class="landing-btn landing-btn-guest" onclick="playAsGuest()">
      <span class="landing-btn-icon">🎲</span>
      <div class="landing-btn-text">
        <div class="landing-btn-title">Try the Game</div>
        <div class="landing-btn-sub">Play now — no account needed</div>
      </div>
      <span class="landing-btn-arrow">›</span>
    </button>
    <button class="landing-btn landing-btn-register" onclick="window.open('https://ko-fi.com/s/c2ac966720','_blank')">
      <span class="landing-btn-icon">📱</span>
      <div class="landing-btn-text">
        <div class="landing-btn-title">Get the Full App</div>
        <div class="landing-btn-sub">Support the game · get the APK · from $2</div>
      </div>
      <span class="landing-btn-arrow">›</span>
    </button>
    <button class="landing-btn landing-btn-demo" onclick="startDemoTour()">
      <span class="landing-btn-icon">🎬</span>
      <div class="landing-btn-text">
        <div class="landing-btn-title">Watch How to Play</div>
        <div class="landing-btn-sub">A quick tour of every part of the game</div>
      </div>
      <span class="landing-btn-arrow">›</span>
    </button>`;
}

function showGetAppPrompt() {
  const existing = document.getElementById('getAppModal');
  if (existing) { existing.classList.remove('hidden'); return; }

  const modal = document.createElement('div');
  modal.id = 'getAppModal';
  modal.className = 'get-app-modal';
  modal.innerHTML = `
    <div class="get-app-box">
      <div class="get-app-icon">🍺📱</div>
      <div class="get-app-title">Get Last Round</div>
      <div class="get-app-sub">The full app gives you:</div>
      <ul class="get-app-perks">
        <li>🏅 Personal profile &amp; leaderboard</li>
        <li>🌐 Online multiplayer &amp; duels</li>
        <li>📊 Full stats &amp; win history</li>
        <li>🎨 Exclusive table designs</li>
      </ul>
      <div class="get-app-sub get-app-coming">Coming soon to app stores — stay tuned!</div>
      <button class="btn-main" onclick="document.getElementById('getAppModal').classList.add('hidden')">Got it 🍺</button>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
  document.body.appendChild(modal);
}

async function playAsGuest() {
  try {
    const { auth, signInAnonymously } = window._fbAuth;
    const result = await signInAnonymously(auth);
    window._fbUid = result.user.uid;
    _authUser = result.user;
    localStorage.setItem('lr_guest_mode', 'true');
    localStorage.removeItem('lr_registered');
    localStorage.removeItem('lr_my_name');
    showScreen('menu');
    initMenu();
    initFirebaseSync();
  } catch (err) {
    console.error('Guest sign-in failed:', err);
    alert('Could not start guest session. Please try again.');
  }
}

function getRoomPath(code) {
  return localStorage.getItem('lr_guest_mode') === 'true' ? `guests/${code}` : `rooms/${code}`;
}

async function switchAccount() {
  try {
    if (window._fbAuth?.auth) {
      await window._fbAuth.signOut(window._fbAuth.auth);
    }
  } catch { /* ignore */ }
  localStorage.removeItem('lr_registered');
  localStorage.removeItem('lr_my_name');
  showScreen('landing');
}

function goBackFromMenu() {
  const isRegistered = localStorage.getItem('lr_registered') === 'true';
  if (isRegistered) {
    showScreen('landing');
  } else {
    showScreen('landing');
  }
}

function abandonGame() {
  if (_watchedDemoActive) { _stopWatchedDemo(); return; }
  if (ONLINE.active) {
    leaveRoom();
  } else {
    G.gamePhase = 'gameover';
    showScreen('menu');
  }
}

function leaveGame() {
  if (_watchedDemoActive) { _stopWatchedDemo(); return; }
  if (ONLINE.active) {
    leaveRoom();
  } else {
    G.gamePhase = 'gameover';
    showScreen('menu');
  }
}

// ---- Create Account ----

function showAuthCreate() {
  _authCreateStep = 1;
  _authCreateAvatar = null;
  _googlePendingUser = null;
  document.getElementById('authCreateTitle').textContent = 'Create Your Account';
  document.getElementById('authCreateSubtitle').textContent = 'Choose your pub identity';
  document.getElementById('authCreateStep1').classList.remove('hidden');
  document.getElementById('authCreateStep2').classList.add('hidden');
  document.getElementById('authCreateError').classList.add('hidden');
  document.getElementById('authCreateNameInput').value = '';
  document.getElementById('authCreateAvatarPreview').textContent = '🎲';
  const grid = document.getElementById('authCreateAvatarGrid');
  if (grid) grid.innerHTML = AVATAR_EMOJIS.map(em =>
    `<button class="reg-av-btn" onclick="selectAuthCreateAvatar('${em}')">${em}</button>`
  ).join('');
  document.getElementById('authCreatePanel').classList.remove('hidden');
}

function hideAuthCreate() {
  document.getElementById('authCreatePanel').classList.add('hidden');
}

function authCreateBackToStep1() {
  _authCreateStep = 1;
  document.getElementById('authCreateStep1').classList.remove('hidden');
  document.getElementById('authCreateStep2').classList.add('hidden');
  document.getElementById('authCreateError').classList.add('hidden');
}

function selectAuthCreateAvatar(em) {
  _authCreateAvatar = em;
  document.getElementById('authCreateAvatarPreview').textContent = em;
  document.querySelectorAll('#authCreateAvatarGrid .reg-av-btn')
    .forEach(b => b.classList.toggle('reg-av-active', b.textContent === em));
}

async function authCreateNext() {
  const name = document.getElementById('authCreateNameInput').value.trim();
  const errEl = document.getElementById('authCreateError');
  errEl.classList.add('hidden');

  if (name.length < 2) { errEl.textContent = 'Name must be at least 2 characters'; errEl.classList.remove('hidden'); return; }
  if (!_authCreateAvatar) { errEl.textContent = 'Please choose an avatar first'; errEl.classList.remove('hidden'); return; }

  if (fbReady()) {
    try {
      const { db, ref, get: fbGet } = fb();
      const snap = await fbGet(ref(db, `profiles/${fbSafe(name)}`));
      if (snap.exists()) { errEl.textContent = 'That name is already taken — choose another'; errEl.classList.remove('hidden'); return; }
    } catch {}
  }

  if (_googlePendingUser) {
    await completeRegistration(_googlePendingUser.uid, name, _authCreateAvatar, 'google');
    _googlePendingUser = null;
    return;
  }

  _authCreateStep = 2;
  document.getElementById('authCreateStep1').classList.add('hidden');
  document.getElementById('authCreateStep2').classList.remove('hidden');
  document.getElementById('authCreateStep2Av').textContent = _authCreateAvatar;
  document.getElementById('authCreateStep2Name').textContent = name;
  document.getElementById('authCreateEmailInput').value = '';
  document.getElementById('authCreatePasswordInput').value = '';
  document.getElementById('authCreateError2').classList.add('hidden');
}

async function registerWithGoogle() {
  const name = document.getElementById('authCreateStep2Name').textContent;
  const errEl = document.getElementById('authCreateError2');
  errEl.classList.add('hidden');
  _authFlowManual = true;
  try {
    let result;
    const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    if (isNative) {
      const FirebaseAuthentication = window.Capacitor.Plugins.FirebaseAuthentication;
      const nativeResult = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
      if (!nativeResult?.credential?.idToken) throw new Error('No idToken returned from Google Sign-In');
      const { auth, signInWithCredential, GoogleAuthProvider } = window._fbAuth;
      const credential = GoogleAuthProvider.credential(nativeResult.credential.idToken);
      result = await signInWithCredential(auth, credential);
    } else {
      const { auth, signInWithPopup, googleProvider } = window._fbAuth;
      result = await signInWithPopup(auth, googleProvider);
    }
    const user = result.user;
    window._fbUid = user.uid;
    _authUser = user;
    if (fbReady()) {
      const { db, ref, get: fbGet } = fb();
      const existing = await fbGet(ref(db, `authMap/${user.uid}`));
      if (existing.exists()) {
        await handleRegisteredUserLogin(user);
        return;
      }
    }
    await completeRegistration(user.uid, name, _authCreateAvatar, 'google');
  } catch (err) {
    const msg = err.message || '';
    errEl.textContent = (err.code === 'auth/popup-closed-by-user' || msg.includes('cancel') || msg.includes('Cancel')) ? 'Sign-in cancelled.' : `Google sign-in failed: ${msg || err.code || 'unknown'}`;
    errEl.classList.remove('hidden');
  } finally {
    _authFlowManual = false;
  }
}

async function registerWithEmail() {
  const name = document.getElementById('authCreateStep2Name').textContent;
  const email = document.getElementById('authCreateEmailInput').value.trim();
  const password = document.getElementById('authCreatePasswordInput').value;
  const errEl = document.getElementById('authCreateError2');
  errEl.classList.add('hidden');

  if (!email || !email.includes('@')) { errEl.textContent = 'Enter a valid email address'; errEl.classList.remove('hidden'); return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters'; errEl.classList.remove('hidden'); return; }

  _authFlowManual = true;
  try {
    const { auth, createUserWithEmailAndPassword } = window._fbAuth;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    window._fbUid = cred.user.uid;
    _authUser = cred.user;
    await completeRegistration(cred.user.uid, name, _authCreateAvatar, 'email');
  } catch (err) {
    let msg = 'Registration failed. Try again.';
    if (err.code === 'auth/email-already-in-use') msg = 'Email already in use — sign in instead.';
    else if (err.code === 'auth/weak-password') msg = 'Password is too weak (min 6 chars).';
    else if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  } finally {
    _authFlowManual = false;
  }
}

async function completeRegistration(uid, name, avatar, authType) {
  // Wait for Firebase to be ready (up to 3s) before writing
  let waited = 0;
  while (!window._fb && waited < 3000) { await new Promise(r => setTimeout(r, 200)); waited += 200; }
  if (!window._fb) throw new Error('Firebase not available');

  const { db, ref, set: fbSet, update: fbUp } = fb();
  const profileKey = fbSafe(name);
  if (!profileKey) throw new Error('Profile name is required');
  const now = Date.now();
  const profile = { name, avatar, registered: true, authType, uid, lastSeen: now };

  await Promise.all([
    fbSet(ref(db, `profiles/${profileKey}`), profile),
    fbSet(ref(db, `authMap/${uid}`), profileKey),
  ]);

  const localProfiles = JSON.parse(localStorage.getItem('lr_profiles') || '{}');
  localProfiles[name] = profile;
  localStorage.setItem('lr_profiles', JSON.stringify(localProfiles));
  localStorage.setItem('lr_my_name', name);
  localStorage.setItem('lr_registered', 'true');

  hideAuthCreate();
  showScreen('menu');
  applyLockedProfile();
  listenForDuelChallenge();
  initFirebaseSync();
  showToast(t('auth.welcome_toast', {name}));
}

// ---- Login ----

function showAuthLogin() {
  if (_authUser && !_authUser.isAnonymous) {
    handleRegisteredUserLogin(_authUser);
    return;
  }
  document.getElementById('authLoginError').classList.add('hidden');
  document.getElementById('authLoginEmailInput').value = '';
  document.getElementById('authLoginPasswordInput').value = '';
  document.getElementById('authLoginPanel').classList.remove('hidden');
}

function hideAuthLogin() {
  document.getElementById('authLoginPanel').classList.add('hidden');
}

async function loginWithGoogle() {
  const errEl = document.getElementById('authLoginError');
  errEl.classList.add('hidden');
  try {
    const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    console.log('[Auth] isNative:', isNative, 'Capacitor:', !!window.Capacitor);
    if (isNative) {
      const FirebaseAuthentication = window.Capacitor.Plugins.FirebaseAuthentication;
      console.log('[Auth] FirebaseAuthentication plugin:', !!FirebaseAuthentication);
      const nativeResult = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
      console.log('[Auth] nativeResult:', JSON.stringify(nativeResult));
      if (!nativeResult?.credential?.idToken) throw new Error('No idToken returned from Google Sign-In');
      const { auth, signInWithCredential, GoogleAuthProvider } = window._fbAuth;
      const credential = GoogleAuthProvider.credential(nativeResult.credential.idToken);
      await signInWithCredential(auth, credential);
    } else {
      const { auth, signInWithPopup, googleProvider } = window._fbAuth;
      await signInWithPopup(auth, googleProvider);
    }
    // onAuthStateChanged fires → handleRegisteredUserLogin
  } catch (err) {
    console.error('[Auth] Google sign-in error:', err.code, err.message, err);
    const msg = err.message || '';
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request' || msg.includes('cancel') || msg.includes('Cancel')) {
      errEl.textContent = 'Sign-in cancelled.';
    } else if (err.code === 'auth/popup-blocked') {
      errEl.textContent = 'Popup blocked. Please allow popups for this site and try again.';
    } else {
      errEl.textContent = `Sign-in failed: ${msg || err.code || 'unknown'}`;
    }
    errEl.classList.remove('hidden');
  }
}

async function loginWithEmail() {
  const email = document.getElementById('authLoginEmailInput').value.trim();
  const password = document.getElementById('authLoginPasswordInput').value;
  const errEl = document.getElementById('authLoginError');
  errEl.classList.add('hidden');

  if (!email || !password) { errEl.textContent = 'Enter your email and password'; errEl.classList.remove('hidden'); return; }
  try {
    const { auth, signInWithEmailAndPassword } = window._fbAuth;
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged fires
  } catch (err) {
    let msg = 'Sign-in failed. Check your details and try again.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Incorrect email or password.';
    else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }
}

// Called when a Google user signs in but has no profile yet
function _showAuthCompleteProfile() {
  showAuthCreate();
  document.getElementById('authCreateTitle').textContent = 'One More Step';
  document.getElementById('authCreateSubtitle').textContent = 'Pick a name and avatar for Last Round';
  if (_googlePendingUser?.displayName) {
    document.getElementById('authCreateNameInput').value = _googlePendingUser.displayName.slice(0, 16);
  }
}

// ---- Terms ----
function showTerms() { document.getElementById('termsPanel').classList.remove('hidden'); }
function hideTerms() { document.getElementById('termsPanel').classList.add('hidden'); }

// ============================================================
// REGISTRATION
// ============================================================
let _regAvatar = null;

function isRegistered() {
  return localStorage.getItem('lr_registered') === 'true' && !!localStorage.getItem('lr_my_name');
}

function initRegistration() {
  if (isRegistered()) { applyLockedProfile(); return; }
  const grid = document.getElementById('regAvatarGrid');
  if (grid) {
    grid.innerHTML = AVATAR_EMOJIS.map(em =>
      `<button class="reg-av-btn" onclick="selectRegAvatar('${em}')">${em}</button>`
    ).join('');
  }
  document.getElementById('registrationPanel')?.classList.remove('hidden');
}

function selectRegAvatar(em) {
  _regAvatar = em;
  document.getElementById('regAvatarPreview').textContent = em;
  document.querySelectorAll('.reg-av-btn').forEach(b => b.classList.toggle('reg-av-active', b.textContent === em));
}

async function submitRegistration() {
  const name = document.getElementById('regNameInput').value.trim();
  const errEl = document.getElementById('regError');
  errEl.classList.add('hidden');

  if (name.length < 2) {
    errEl.textContent = 'Name must be at least 2 characters'; errEl.classList.remove('hidden'); return;
  }
  if (!_regAvatar) {
    errEl.textContent = 'Pick an avatar first!'; errEl.classList.remove('hidden'); return;
  }

  // Uniqueness check against Firebase
  if (fbReady()) {
    try {
      const { db, ref, get: fbGet } = fb();
      const snap = await fbGet(ref(db, `profiles/${fbSafe(name)}`));
      if (snap.exists()) {
        errEl.textContent = 'Name already taken — choose another'; errEl.classList.remove('hidden'); return;
      }
    } catch {}
  }

  localStorage.setItem('lr_my_name', name);
  localStorage.setItem('lr_registered', 'true');
  saveProfile(name, { avatar: _regAvatar, name, registered: true });
  document.getElementById('registrationPanel').classList.add('hidden');
  applyLockedProfile();
  listenForDuelChallenge();
  showToast(t('auth.welcome_locked', {name}));
}

function applyLockedProfile() {
  const name = localStorage.getItem('lr_my_name');
  if (!name) return;
  const avatar = getAvatar(name);
  const onlineInput = document.getElementById('onlinePlayerName');
  if (onlineInput) { onlineInput.value = name; onlineInput.disabled = true; }
  const onlineAvBtn = document.getElementById('onlineAvatarBtn');
  if (onlineAvBtn) {
    onlineAvBtn.querySelector('.avatar-inner').textContent = avatar;
    onlineAvBtn.style.cursor = 'default';
    onlineAvBtn.setAttribute('onclick', '');
  }
  rebuildNameInputs();
}

// ============================================================
// ADMIN SYSTEM
// ============================================================
let _adminAuthed = false;
let _adminSetupPin = '';

async function adminHash(pin) {
  const enc = new TextEncoder().encode('lr:' + pin);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getAdminHash() { return localStorage.getItem('lr_admin_hash'); }

function openAdminGate(mode) {
  const noPin = !getAdminHash();
  const resolvedMode = mode || (noPin ? 'setup' : 'login');
  _adminSetupPin = '';
  const titles = { setup: 'Create Admin PIN', login: 'Admin Access', change: 'New Admin PIN' };
  const subs   = { setup: 'Choose a PIN (min 4 characters)', login: 'Enter your PIN to continue', change: 'Enter new PIN (min 4 characters)' };
  document.getElementById('adminGateTitle').textContent = titles[resolvedMode];
  document.getElementById('adminGateSub').textContent   = subs[resolvedMode];
  document.getElementById('adminPinInput').value = '';
  document.getElementById('adminPinError').classList.add('hidden');
  document.getElementById('adminGatePanel').dataset.mode = resolvedMode;
  document.getElementById('adminGatePanel').classList.remove('hidden');
  setTimeout(() => document.getElementById('adminPinInput')?.focus(), 80);
}

function closeAdminGate() {
  document.getElementById('adminGatePanel').classList.add('hidden');
  _adminSetupPin = '';
}

async function submitAdminPin() {
  const pinEl = document.getElementById('adminPinInput');
  const pin = pinEl.value;
  const errEl = document.getElementById('adminPinError');
  errEl.classList.add('hidden');

  if (!pin || pin.length < 4) {
    errEl.textContent = 'PIN must be at least 4 characters'; errEl.classList.remove('hidden'); return;
  }

  const mode = document.getElementById('adminGatePanel').dataset.mode;

  if (mode === 'login') {
    const hash = await adminHash(pin);
    if (hash === getAdminHash()) {
      closeAdminGate(); _adminAuthed = true; openAdminPanel();
    } else {
      errEl.textContent = 'Incorrect PIN'; errEl.classList.remove('hidden'); pinEl.value = '';
    }
    return;
  }

  // setup / change: two-step confirm
  if (!_adminSetupPin) {
    _adminSetupPin = pin;
    document.getElementById('adminGateTitle').textContent = 'Confirm PIN';
    document.getElementById('adminGateSub').textContent   = 'Re-enter the same PIN';
    pinEl.value = ''; return;
  }

  if (pin !== _adminSetupPin) {
    _adminSetupPin = '';
    errEl.textContent = 'PINs do not match — start again'; errEl.classList.remove('hidden');
    const titles = { setup: 'Create Admin PIN', change: 'New Admin PIN' };
    const subs   = { setup: 'Choose a PIN (min 4 characters)', change: 'Enter new PIN (min 4 characters)' };
    document.getElementById('adminGateTitle').textContent = titles[mode];
    document.getElementById('adminGateSub').textContent   = subs[mode];
    pinEl.value = ''; return;
  }

  const hash = await adminHash(pin);
  localStorage.setItem('lr_admin_hash', hash);
  closeAdminGate();
  if (mode === 'setup') {
    _adminAuthed = true; openAdminPanel();
    showToast('Admin PIN created. Welcome!');
  } else {
    openAdminPanel();
    showToast('Admin PIN updated.');
  }
}

function openAdminPanel() {
  if (!_adminAuthed) { openAdminGate(); return; }
  document.getElementById('adminPanel').classList.remove('hidden');
}

function closeAdminPanel() {
  document.getElementById('adminPanel').classList.add('hidden');
}

function adminLogout() {
  _adminAuthed = false; closeAdminPanel();
  showToast('Admin session ended.');
}

function adminResetBrawl() {
  if (!_adminAuthed) return;
  if (!confirm('Reset current brawl standings?\nSeason archive is preserved.')) return;
  localStorage.removeItem('lr_leaderboard');
  renderLeaderboard(); closeAdminPanel();
  showToast('✅ Brawl standings reset.');
}

function adminForceRollover() {
  if (!_adminAuthed) return;
  if (!confirm('Force season rollover now?\nArchives the current brawl and starts the next season.')) return;
  const meta = getBrawlMeta();
  if (meta) doSeasonRollover(meta); else checkSeasonRollover();
  renderLeaderboard(); closeAdminPanel();
  showToast('✅ Season rolled over — new brawl started.');
}

function adminClearAllData() {
  if (!_adminAuthed) return;
  if (!confirm('⚠️ Delete ALL game data?\nThis removes all profiles, stats, and season history.\nThis CANNOT be undone.')) return;
  ['lr_leaderboard','lr_profiles','lr_brawl_archive','lr_brawl_meta','lr_admin_hash','lr_registered','lr_my_name'].forEach(k => localStorage.removeItem(k));
  _adminAuthed = false;
  checkSeasonRollover(); renderLeaderboard();
  closeAdminPanel();
  showScreen('menu');
  initRegistration();
  showToast('✅ All data cleared.');
}

function adminChangePin() {
  if (!_adminAuthed) return;
  closeAdminPanel(); openAdminGate('change');
}

// ============================================================
// DUEL SYSTEM
// ============================================================
function fbSafe(str) { return (str || '').replace(/[.#$/[\]]/g, '_'); }

let _duelIncoming = null;
let _duelListenerOff = null;
let _duelTarget = null;

function setMyName(name) {
  if (!name) return;
  if (!isRegistered()) localStorage.setItem('lr_my_name', name);
  listenForDuelChallenge();
}

function listenForDuelChallenge() {
  if (!fbReady()) { setTimeout(listenForDuelChallenge, 2000); return; }
  const myName = localStorage.getItem('lr_my_name');
  if (!myName) return;
  if (_duelListenerOff) { _duelListenerOff(); _duelListenerOff = null; }
  const { db, ref, onValue: fbOn, remove: fbRm } = fb();
  const key = fbSafe(myName);
  _duelListenerOff = fbOn(ref(db, `challenges/${key}`), snap => {
    if (!snap.exists()) { hideDuelIncoming(); return; }
    const data = snap.val();
    if (!data || data.from === myName || Date.now() - data.at > 600000) {
      fbRm(ref(db, `challenges/${key}`));
      return;
    }
    _duelIncoming = { ...data, challengeKey: key };
    showDuelIncoming(data);
  });
}

function showDuelIncoming(data) {
  const panel = document.getElementById('duelIncomingPanel');
  if (!panel) return;
  if (!_duelIncoming) _duelIncoming = data; // guard: ensure _duelIncoming is always set when panel is visible
  document.getElementById('duelFromAv').textContent = data.fromAvatar || '🎲';
  document.getElementById('duelFromName').textContent = data.from;
  panel.classList.remove('hidden');
}

function hideDuelIncoming() {
  document.getElementById('duelIncomingPanel')?.classList.add('hidden');
  _duelIncoming = null;
}

async function acceptDuel() {
  if (!_duelIncoming) { showToast('No pending challenge — try again.'); return; }
  if (!fbReady()) { showToast('Not connected to server — try again in a moment.'); return; }
  const data = _duelIncoming;
  hideDuelIncoming();
  const myName = localStorage.getItem('lr_my_name') || 'Player';
  const { db, ref, get: fbGet, update: fbUp, remove: fbRm } = fb();
  fbRm(ref(db, `challenges/${data.challengeKey}`));
  const code = data.roomCode;
  try {
    const snap = await fbGet(ref(db, `rooms/${code}`));
    if (!snap.exists()) { showToast('Room no longer available.'); return; }
    const room = snap.val();
    if (room.status !== 'lobby') { showToast('Duel already started.'); return; }
    const taken = Object.keys(room.players || {}).map(Number);
    const myIdx = Math.max(...taken) + 1;
    const avatar = getAvatar(myName);
    await fbUp(ref(db, `rooms/${code}/players/${myIdx}`), {
      name: myName, uid: window._fbUid, avatar, connected: true, lastSeen: Date.now()
    });
    Object.assign(ONLINE, { active: true, isHost: false, roomCode: code, myIdx, myName, numPlayers: 2 });
    document.getElementById('lobbyCode').textContent = code;
    showScreen('lobby');
    listenLobby(code);
    showToast('⚔️ Duel accepted! Step into the arena.');
  } catch (e) { showToast('Failed to join duel: ' + e.message); }
}

function denyDuel() {
  if (!_duelIncoming) return;
  const key = _duelIncoming.challengeKey;
  hideDuelIncoming();
  if (fbReady()) {
    const { db, ref, remove: fbRm } = fb();
    fbRm(ref(db, `challenges/${key}`));
  }
  showToast('Duel declined.');
}

function openDuelChallengePrompt(targetName, targetAvatar) {
  if (!fbReady()) { showToast('Online connection required to duel.'); return; }
  _duelTarget = { name: targetName, avatar: targetAvatar };
  document.getElementById('duelTargetAvEl').textContent = targetAvatar;
  document.getElementById('duelTargetNameEl').textContent = targetName;
  document.getElementById('duelMyNameInput').value = localStorage.getItem('lr_my_name') || '';
  document.getElementById('duelSendPanel').classList.remove('hidden');
}

function closeDuelSendPanel() {
  document.getElementById('duelSendPanel').classList.add('hidden');
  _duelTarget = null;
}

async function sendDuelChallenge() {
  if (!_duelTarget || !fbReady()) return;
  const myName = document.getElementById('duelMyNameInput').value.trim();
  if (!myName) { showToast('Enter your name first!'); return; }
  setMyName(myName);
  const { db, ref, set: fbSet, onDisconnect: fbOnDc } = fb();
  const code = generateRoomCode(myName);
  const uid = window._fbUid;
  const avatar = getAvatar(myName);
  try {
    await fbSet(ref(db, `rooms/${code}`), {
      status: 'lobby',
      config: { numPlayers: 2, direction: 1, design: getBestDesign() },
      players: { 0: { name: myName, uid, avatar, connected: true, lastSeen: Date.now() } },
      createdAt: Date.now(),
      duel: true,
    });
    fbOnDc(ref(db, `rooms/${code}`)).remove();
    await fbSet(ref(db, `challenges/${fbSafe(_duelTarget.name)}`), {
      from: myName, fromAvatar: avatar, to: _duelTarget.name, roomCode: code, at: Date.now(),
    });
    closeDuelSendPanel();
    Object.assign(ONLINE, { active: true, isHost: true, roomCode: code, myIdx: 0, myName, numPlayers: 2 });
    document.getElementById('lobbyCode').textContent = code;
    showScreen('lobby');
    listenLobby(code);
    showToast(`⚔️ Challenge sent! Waiting for ${_duelTarget.name}…`);
  } catch (e) { showToast('Failed to send challenge: ' + e.message); }
}

// ============================================================
// EMOJI REACTIONS
// ============================================================
const GAME_EMOJIS = [
  '🥔','💀','😈','😏','🤡','🫵','👀',   // taunting
  '🤣','😭','🤬','😤','🤦','🤯','😴',   // emotional
  '🔥','💣','🌀','🍺','⚡',             // game-themed
  '🏆','👑','💅','🎉','🤙',             // victory/gloating
];

function buildEmojiPicker() {
  const panel = document.getElementById('emojiPickerPanel');
  if (!panel || panel.children.length > 0) return;
  GAME_EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.title = emoji;
    btn.onclick = (e) => { e.stopPropagation(); sendReaction(emoji); };
    panel.appendChild(btn);
  });
  buildCannedReactions(panel);
}

function toggleEmojiPicker(e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById('emojiPickerPanel');
  if (!panel) return;
  buildEmojiPicker();
  const wasHidden = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !wasHidden);
}

function sendReaction(emoji) {
  document.getElementById('emojiPickerPanel')?.classList.add('hidden');
  const name = ONLINE.active ? ONLINE.myName : (G ? curPlayer()?.name : 'Player');
  showReaction(emoji, name);
  if (ONLINE.active && fbReady()) {
    const { db, ref, set: fbSet } = fb();
    fbSet(ref(db, `rooms/${ONLINE.roomCode}/reaction`), {
      emoji, name, uid: window._fbUid, ts: Date.now(),
    });
  }
}

let _reactionTimer = null;
function showReaction(emoji, playerName) {
  const display = document.getElementById('reactionDisplay');
  const emojiEl = document.getElementById('reactionEmoji');
  const nameEl  = document.getElementById('reactionName');
  if (!display || !emojiEl || !nameEl) return;

  emojiEl.textContent = emoji;
  nameEl.textContent  = playerName || '';
  display.classList.toggle('reaction-is-text', emoji.length > 4);

  clearTimeout(_reactionTimer);
  display.classList.remove('hidden', 'reaction-exit');
  void display.offsetWidth; // force reflow to restart animation
  display.classList.add('reaction-enter');

  _reactionTimer = setTimeout(() => {
    display.classList.remove('reaction-enter');
    display.classList.add('reaction-exit');
    setTimeout(() => { display.classList.add('hidden'); display.classList.remove('reaction-exit'); }, 380);
  }, 2400);
}

function listenReactions(code) {
  const { db, ref, onValue: fbOn } = fb();
  let _lastTs = 0;
  fbOn(ref(db, `rooms/${code}/reaction`), snap => {
    if (!snap.exists()) return;
    const r = snap.val();
    if (!r || r.ts <= _lastTs || r.uid === window._fbUid) return;
    _lastTs = r.ts;
    if (Date.now() - r.ts < 6000) showReaction(r.emoji, r.name);
  });
}

// ============================================================
// ONLINE MULTIPLAYER (Firebase)
// ============================================================
const ONLINE = {
  active: false, isHost: false, roomCode: null,
  myIdx: 0, myName: '', numPlayers: 2,
  unsubLobby: null, unsubGame: null, unsubAction: null, unsubReveal: null, unsubSetup: null, heartbeatTimer: null,
};

function fb() { return window._fb || null; }
function fbReady() { return !!(window._fb && window._fbUid !== undefined); }

function generateRoomCode(hostName) {
  const venues = ['PUB','BAR','TAP','INN','KEG','LOCAL','CELLAR','TAVERN'];
  const venue = venues[Math.floor(Math.random() * venues.length)];
  const num = String(10 + Math.floor(Math.random() * 90));
  if (hostName) {
    // Sanitize: keep letters only, uppercase, max 8 chars, strip apostrophes etc.
    const safe = hostName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 8);
    if (safe.length >= 2) return `${safe}S-${venue}-${num}`;
  }
  const words = ['BEER','PINT','STOUT','LAGER','MEAD','BREW','DRAFT','HOPS'];
  return words[Math.floor(Math.random() * words.length)] + num;
}

function showOnlineMenu() {
  if (!fbReady()) { showToast('Connecting to server… try again in a moment.'); return; }
  const el = document.getElementById('onlinePlayerName');
  if (isRegistered()) {
    const name = localStorage.getItem('lr_my_name');
    if (el) { el.value = name; el.disabled = true; }
  } else {
    const p1 = document.querySelector('#playerNameInputs input')?.value?.trim() || '';
    if (el) { el.value = p1; el.disabled = false; }
  }
  document.getElementById('joinCodeSection')?.classList.add('hidden');
  document.getElementById('joinError')?.classList.add('hidden');
  showScreen('online');
}

function onlineShowJoin() {
  document.getElementById('joinCodeSection')?.classList.remove('hidden');
  document.getElementById('onlineJoinCodeField')?.focus();
}

async function createRoom() {
  if (!fbReady()) { showToast('Not connected — try again.'); return; }
  const name = document.getElementById('onlinePlayerName')?.value?.trim() || 'Player 1';
  setMyName(name);
  const numPlayers = parseInt(document.querySelector('#onlineNumPlayersGroup .pick-btn.active')?.dataset?.val || '2');
  const { db, ref, set: fbSet, onDisconnect: fbOnDc } = fb();
  const uid = window._fbUid;
  const code = generateRoomCode(name);
  const roomPath = getRoomPath(code);
  try {
    const avatar = getAvatar(name);
    await fbSet(ref(db, roomPath), {
      status: 'lobby',
      config: { numPlayers, direction: 1, design: getBestDesign(), drinkingMode: menuConfig.onlineDrinkingMode || false },
      players: { 0: { name, uid, avatar, connected: true, lastSeen: Date.now() } },
      createdAt: Date.now(),
    });
    fbOnDc(ref(db, roomPath)).remove();
    Object.assign(ONLINE, { active: true, isHost: true, roomCode: code, myIdx: 0, myName: name, numPlayers, isGuest: localStorage.getItem('lr_guest_mode') === 'true' });
    document.getElementById('lobbyCode').textContent = code;
    showScreen('lobby');
    listenLobby(code);
  } catch (e) { showToast('Failed to create room: ' + e.message); }
}

async function joinRoom() {
  if (!fbReady()) { showToast('Not connected.'); return; }
  const name = document.getElementById('onlinePlayerName')?.value?.trim() || ('Guest' + Math.floor(Math.random() * 99));
  setMyName(name);
  const code = document.getElementById('onlineJoinCodeField')?.value?.trim().toUpperCase();
  if (!code) return;
  const { db, ref, get: fbGet, update: fbUp, onDisconnect: fbOnDc } = fb();
  const roomPath = getRoomPath(code);
  try {
    const snap = await fbGet(ref(db, roomPath));
    if (!snap.exists()) { setJoinError('Room not found'); return; }
    const room = snap.val();
    if (room.status !== 'lobby') { setJoinError('Game already in progress'); return; }
    const taken = Object.keys(room.players || {}).map(Number);
    if (taken.length >= room.config.numPlayers) { setJoinError('Room is full'); return; }
    const myIdx = Math.max(...taken) + 1;
    const avatar = getAvatar(name);
    await fbUp(ref(db, `${roomPath}/players/${myIdx}`), { name, uid: window._fbUid, avatar, connected: true, lastSeen: Date.now() });
    fbOnDc(ref(db, `${roomPath}/players/${myIdx}/connected`)).set(false);
    Object.assign(ONLINE, { active: true, isHost: false, roomCode: code, myIdx, myName: name, numPlayers: room.config.numPlayers, isGuest: localStorage.getItem('lr_guest_mode') === 'true' });
    document.getElementById('lobbyCode').textContent = code;
    showScreen('lobby');
    listenLobby(code);
  } catch (e) { setJoinError('Error: ' + e.message); }
}

function setJoinError(msg) {
  const el = document.getElementById('joinError');
  if (el) { el.textContent = '⚠ ' + msg; el.classList.remove('hidden'); }
}

function listenLobby(code) {
  const { db, ref, onValue: fbOn } = fb();
  const roomPath = getRoomPath(code);
  if (ONLINE.unsubLobby) ONLINE.unsubLobby();
  ONLINE.unsubLobby = fbOn(ref(db, roomPath), snap => {
    if (!snap.exists()) { leaveRoom(); return; }
    const room = snap.val();
    renderLobby(room);
    if (room.status === 'playing' && !ONLINE.isHost) {
      if (ONLINE.unsubLobby) { ONLINE.unsubLobby(); ONLINE.unsubLobby = null; }
      startAsClient(room);
    }
  });
}

function renderLobby(room) {
  const list = document.getElementById('lobbyPlayerList');
  if (!list) return;
  const numP = room.config?.numPlayers || 2;
  list.innerHTML = '';
  for (let i = 0; i < numP; i++) {
    const p = room.players?.[i];
    const li = document.createElement('div');
    li.className = 'lobby-slot' + (p ? ' lobby-slot-filled' : '');
    li.innerHTML = p
      ? `${avatarHTML(p.name, 'sm')}
         <span class="ls-name">${p.name}${i === ONLINE.myIdx ? ' <em>(you)</em>' : ''}</span>
         <span class="ls-ready">✓</span>`
      : `<span class="ls-icon">⌛</span><span class="ls-name">Waiting for player...</span>`;
    list.appendChild(li);
  }
  const filled = Object.keys(room.players || {}).length;

  // Duel rooms auto-start the moment both players are present
  if (room.duel && filled >= 2 && ONLINE.isHost) {
    startOnlineGame();
    return;
  }

  const btn = document.getElementById('lobbyStartBtn');
  if (btn) {
    btn.style.display = ONLINE.isHost && !room.duel ? 'block' : 'none';
    if (ONLINE.isHost && !room.duel) {
      btn.disabled = filled < 2;
      btn.textContent = filled < 2 ? '⌛ Waiting for players...' : `▶ Start (${filled} players)`;
    }
  }
  const waitMsg = document.getElementById('lobbyWaitMsg');
  if (waitMsg) waitMsg.style.display = ONLINE.isHost ? 'none' : 'block';
}

async function startOnlineGame() {
  if (!ONLINE.isHost) return;
  const { db, ref, get: fbGet, update: fbUp, onValue: fbOn, remove: fbRm } = fb();
  const code = ONLINE.roomCode;
  const snap = await fbGet(ref(db, `rooms/${code}`));
  const room = snap.val();
  const numP = room.config.numPlayers;
  const names = Array.from({ length: numP }, (_, i) => room.players?.[i]?.name || `Player ${i + 1}`);

  newGame({ numPlayers: numP, vsAI: false, direction: room.config.direction || 1, names, drinkingMode: room.config.drinkingMode || false });
  G.setupIdx = 0;
  G.gamePhase = 'setup';
  G.isDuel = !!room.duel;
  applyDesign(room.config.design || 'classic');

  // Clear any stale face-up confirmations
  await fbRm(ref(db, `rooms/${code}/faceUpConfirm`));
  await fbUp(ref(db, `rooms/${code}`), { status: 'playing', gameState: serializeGameState() });

  listenForActions(code);
  listenReactions(code);
  startHeartbeat(code);

  // Host sets up their own player first
  G.setupIdx = ONLINE.myIdx;
  showScreen('setup');
  renderSetup();

  // Listen for all players to submit their face-up picks
  ONLINE.unsubSetup = fbOn(ref(db, `rooms/${code}/faceUpConfirm`), async snap => {
    const confirms = snap.val() || {};
    const humanCount = G.players.filter(p => !p.isAI).length;
    if (Object.keys(confirms).length < humanCount) return;

    // All humans confirmed — merge picks
    Object.entries(confirms).forEach(([idxStr, data]) => {
      const idx = parseInt(idxStr);
      G.players[idx].faceUp = data.faceUp;
      G.players[idx].hand = data.hand;
      G.players[idx].phase = 'hand';
    });
    G.gamePhase = 'playing';
    G.currentIdx = determineStarter();
    addLog(t('log.goes_first', {name: curPlayer().name}));
    if (ONLINE.unsubSetup) { ONLINE.unsubSetup(); ONLINE.unsubSetup = null; }
    await fbUp(ref(db, `rooms/${code}`), { gameState: serializeGameState() });
    showScreen('game');
    renderGame();
    if (G.currentIdx !== ONLINE.myIdx) scheduleAI();
  });
}

function _pushReveal(type, card) {
  if (!ONLINE.active || !ONLINE.isHost || !fbReady()) return;
  const { db, ref, set: fbSet } = fb();
  fbSet(ref(db, `rooms/${ONLINE.roomCode}/reveal`), { type, card, ts: Date.now() });
}

function startAsClient(room) {
  const { db, ref, onValue: fbOn } = fb();
  const code = ONLINE.roomCode;
  listenReactions(code);

  // Reveal overlay listener (action/blind card effects from host)
  ONLINE.unsubReveal = fbOn(ref(db, `rooms/${code}/reveal`), snap => {
    if (!snap.exists()) return;
    const rev = snap.val();
    if (!rev || Date.now() - rev.ts > 5000) return;
    if (rev.type === 'blind') showBlindReveal(rev.card, () => {});
    else if (rev.type === 'action') showActionReveal(rev.card, () => {});
    else if (rev.type === 'escape') {
      const d = rev.data;
      const isSpud = _SPUD_VALS.has(d.card?.value);
      const duration = isSpud ? 7500 : 5000;
      _showEscapeOverlayUI(d.winnerAvatar, d.winnerName, d.card, d.msg, isSpud, duration, () => {});
    }
  });

  let _prevTurnIdx = null;
  ONLINE.unsubGame = fbOn(ref(db, `rooms/${code}/gameState`), snap => {
    if (!snap.exists()) return;
    const wasOver = G?.gamePhase === 'gameover';
    G = deserializeGameState(snap.val());
    applyDesign(room.config?.design || 'classic');
    if (G.gamePhase === 'setup') {
      clearTimeout(_winAutoRedirect);
      document.getElementById('win-overlay')?.classList.add('hidden');
      G.setupIdx = ONLINE.myIdx;
      if (!document.getElementById('screen-setup')?.classList.contains('active')) showScreen('setup');
      renderSetup();
      return;
    }
    if (!document.getElementById('screen-game')?.classList.contains('active')) showScreen('game');
    renderGame();
    if (G.gamePhase === 'playing') {
      if (G.currentIdx === ONLINE.myIdx && G.currentIdx !== _prevTurnIdx) startTurnTimer();
      else if (G.currentIdx !== ONLINE.myIdx) clearTurnTimer();
    }
    _prevTurnIdx = G.currentIdx;
    if (G.gamePhase === 'gameover' && !wasOver) setTimeout(() => showResultsOverlay(), 1400);
  });
  startHeartbeat(code);
}

function listenForActions(code) {
  const { db, ref, onValue: fbOn, remove: fbRm } = fb();
  if (ONLINE.unsubAction) ONLINE.unsubAction();
  ONLINE.unsubAction = fbOn(ref(db, `rooms/${code}/pendingAction`), snap => {
    if (!snap.exists() || !G) return;
    const action = snap.val();
    if (action && action.playerIdx !== ONLINE.myIdx && action.playerIdx === G.currentIdx) {
      fbRm(ref(db, `rooms/${code}/pendingAction`));
      applyRemoteAction(action);
    }
  });
}

function applyRemoteAction(action) {
  if (!G || G.gamePhase !== 'playing') return;
  if (action.type === 'play') {
    G.selected = new Set(action.selected || []);
    onPlayClicked();
  } else if (action.type === 'pickup') {
    onPickUpClicked();
  } else if (action.type === 'timeout') {
    addLog(`⏱ ${curPlayer().name}'s turn timed out — skipped!`);
    delayedNextTurn(0);
  }
}

function submitOnlineAction(type, data) {
  if (!ONLINE.active || ONLINE.isHost) return;
  const { db, ref, set: fbSet } = fb();
  fbSet(ref(db, `rooms/${ONLINE.roomCode}/pendingAction`), {
    playerIdx: ONLINE.myIdx, type, ...data, timestamp: Date.now(),
  });
}

function syncGameState() {
  if (!ONLINE.active || !ONLINE.isHost || !G) return;
  const { db, ref, update: fbUp } = fb();
  fbUp(ref(db, `rooms/${ONLINE.roomCode}`), { gameState: serializeGameState() });
}

function serializeGameState() {
  return JSON.stringify({
    players: G.players,
    playDeck: G.playDeck,
    burnDeck: G.burnDeck,
    burnPile: G.burnPile,
    direction: G.direction,
    currentIdx: G.currentIdx,
    gamePhase: G.gamePhase,
    setupIdx: G.setupIdx,
    req: G.req,
    firstCardPlayed: G.firstCardPlayed,
    startingValue: G.startingValue,
    selected: [...G.selected],
    placements: G.placements.map(p => ({
      playerIdx: G.players.findIndex(pl => pl === p.player),
      place: p.place, isLoser: p.isLoser,
    })),
    winner: G.winner,
    message: G.message,
    isDuel: G.isDuel || false,
    drinkingMode: G.drinkingMode || false,
    isSpudEscape: G.isSpudEscape || false,
    log: (G.log || []).slice(-30),
  });
}

function deserializeGameState(json) {
  try {
    const d = JSON.parse(json);
    d.selected = new Set(d.selected || []);
    d.placements = (d.placements || []).map(p => ({
      player: d.players[p.playerIdx], place: p.place, isLoser: p.isLoser,
    }));
    return d;
  } catch (e) { console.error('Deserialize error:', e); return G; }
}

function startHeartbeat(code) {
  if (ONLINE.heartbeatTimer) clearInterval(ONLINE.heartbeatTimer);
  const { db, ref, update: fbUp } = fb();
  ONLINE.heartbeatTimer = setInterval(() => {
    fbUp(ref(db, `rooms/${code}/players/${ONLINE.myIdx}`), { lastSeen: Date.now(), connected: true });
    if (ONLINE.isHost) checkDisconnects(code);
  }, 5000);
}

let _connectionMonitorStarted = false;
function startConnectionMonitor() {
  if (_connectionMonitorStarted || !fbReady()) return;
  _connectionMonitorStarted = true;
  const { db, ref, onValue: fbOn } = fb();
  fbOn(ref(db, '.info/connected'), snap => {
    const connected = snap.val() === true;
    const banner = document.getElementById('reconnectBanner');
    if (!banner) return;
    if (connected) {
      banner.classList.add('hidden');
      // Re-punch heartbeat immediately so teammates see us back
      if (ONLINE.active && ONLINE.roomCode) {
        const { db: d, ref: r, update: fbUp } = fb();
        fbUp(r(d, `rooms/${ONLINE.roomCode}/players/${ONLINE.myIdx}`), { lastSeen: Date.now(), connected: true });
      }
    } else {
      // Only show the banner when we're inside an active game
      if (ONLINE.active) banner.classList.remove('hidden');
    }
  });
}

function checkDisconnects(code) {
  const { db, ref, get: fbGet } = fb();
  fbGet(ref(db, `rooms/${code}/players`)).then(snap => {
    if (!snap.exists() || !G) return;
    let changed = false;
    const now = Date.now();
    Object.entries(snap.val()).forEach(([idxStr, p]) => {
      const idx = Number(idxStr);
      if (idx === ONLINE.myIdx) return;
      const age = now - p.lastSeen;
      if (G.players[idx]?.isAI && age < 10000) {
        // Player reconnected — restore human control
        G.players[idx].isAI = false;
        addLog(t('log.reconnected', {name: G.players[idx].name}));
        changed = true;
      } else if (!G.players[idx]?.isAI && age > 30000) {
        // Player gone for 30s — hand to AI
        G.players[idx].isAI = true;
        addLog(t('log.disconnected', {name: G.players[idx].name}));
        changed = true;
        if (G.currentIdx === idx) scheduleAI();
      }
    });
    if (changed) syncGameState();
  });
}

// ============================================================
// DRINKING MODE
// ============================================================
const _DRINK_MSGS = {
  pickup:  ['Take a sip! 🍺', '{name} picks up — drink up!'],
  bomb:    ['EVERYONE DRINKS! 💣', 'The pile burns… so does your glass.'],
  quad:    ['EVERYONE DRINKS! 🍀', 'Four of a kind — that\'s a round!'],
  loser:   ['BUY THE ROUND! 🍻', '{name} is getting everyone a drink.'],
  spud:    ['TWO FINGERS! 🥔', 'Losing to a spud? That\'s a double.'],
};

let _drinkTimer = null;
function showDrinkPrompt(type, name, onDone) {
  if (!G?.drinkingMode) { onDone?.(); return; }
  const [title, sub] = _DRINK_MSGS[type] || ['Drink! 🍺', ''];
  const fill = s => s.replace(/{name}/g, name || 'Someone');
  const overlay = document.getElementById('drinkOverlay');
  const titleEl = document.getElementById('drinkTitle');
  const subEl   = document.getElementById('drinkSub');
  if (!overlay || !titleEl || !subEl) { onDone?.(); return; }
  titleEl.textContent = fill(title);
  subEl.textContent   = fill(sub);
  clearTimeout(_drinkTimer);
  overlay.classList.remove('hidden');
  void overlay.offsetWidth;
  overlay.classList.add('drink-in');
  _drinkTimer = setTimeout(() => {
    overlay.classList.remove('drink-in');
    overlay.classList.add('hidden');
    onDone?.();
  }, 3200);
}

// ============================================================
// SHAME OVERLAY
// ============================================================
const _SHAME_LINES = [
  'You\'re buying the round.',
  'The cards have spoken. Brutally.',
  'You had ONE job.',
  'Everyone else is already at the bar.',
  'History will not remember this kindly.',
  'Not great. Not terrible. Actually quite terrible.',
  'The universe is, as always, beautifully unfair.',
  'Longest game of your life. From your end.',
  'Thanks for keeping the chair warm.',
];

let _shameTimer = null;
function showShameOverlay(loserEntry, cb) {
  if (!loserEntry) { cb(); return; }
  const player = loserEntry.player;
  const avatar = document.getElementById('shameAvatar');
  const nameEl = document.getElementById('shameName');
  const subEl  = document.getElementById('shameSubtitle');
  const overlay = document.getElementById('shameOverlay');
  if (!overlay || !avatar || !nameEl || !subEl) { cb(); return; }

  avatar.textContent = getAvatar(player.name);
  nameEl.textContent = player.name;
  const line = _SHAME_LINES[Math.floor(Math.random() * _SHAME_LINES.length)];
  subEl.textContent = G.drinkingMode ? 'You\'re buying the round. 🍻' : line;

  overlay.classList.remove('hidden');
  overlay.onclick = () => { clearTimeout(_shameTimer); _closeShameOverlay(cb); };

  _shameTimer = setTimeout(() => _closeShameOverlay(cb), 3500);
}
function _closeShameOverlay(cb) {
  const overlay = document.getElementById('shameOverlay');
  if (overlay) overlay.classList.add('hidden');
  cb();
}

// ============================================================
// CANNED REACTIONS
// ============================================================
const _CANNED = ['Come on!! 😤', 'Really?! 🙄', 'No way! 😱', 'Brutal 💀', '🥔 Potato'];

function buildCannedReactions(panel) {
  const row = document.createElement('div');
  row.className = 'canned-row';
  _CANNED.forEach(phrase => {
    const btn = document.createElement('button');
    btn.className = 'canned-btn';
    btn.textContent = phrase;
    btn.onclick = (e) => { e.stopPropagation(); sendReaction(phrase); };
    row.appendChild(btn);
  });
  panel.appendChild(row);
}

function updateOnlineStatus() {
  const badge = document.getElementById('onlineStatusBadge');
  if (!badge || !ONLINE.active || !G) return;
  badge.classList.remove('hidden', 'my-turn-badge');
  const isMyTurn = G.currentIdx === ONLINE.myIdx;
  if (isMyTurn) badge.classList.add('my-turn-badge');
  badge.textContent = isMyTurn ? t('game.your_turn') : t('game.turns_turn', {name: curPlayer().name});
}

function leaveRoom() {
  document.getElementById('reconnectBanner')?.classList.add('hidden');
  if (ONLINE.unsubLobby) ONLINE.unsubLobby();
  if (ONLINE.unsubGame) ONLINE.unsubGame();
  if (ONLINE.unsubAction) ONLINE.unsubAction();
  if (ONLINE.unsubReveal) ONLINE.unsubReveal();
  if (ONLINE.unsubSetup) ONLINE.unsubSetup();
  clearTurnTimer();
  if (ONLINE.heartbeatTimer) clearInterval(ONLINE.heartbeatTimer);
  if (ONLINE.roomCode && fbReady()) {
    const { db, ref, remove: fbRm, update: fbUp } = fb();
    if (ONLINE.isHost) {
      fbRm(ref(db, `rooms/${ONLINE.roomCode}`));
    } else {
      fbUp(ref(db, `rooms/${ONLINE.roomCode}/players/${ONLINE.myIdx}`), { connected: false });
    }
  }
  Object.assign(ONLINE, {
    active: false, isHost: false, roomCode: null, myIdx: 0,
    unsubLobby: null, unsubGame: null, unsubAction: null, unsubReveal: null, unsubSetup: null, heartbeatTimer: null,
  });
  showScreen('menu');
}

function copyRoomCode() {
  const code = document.getElementById('lobbyCode')?.textContent;
  if (!code) return;
  navigator.clipboard?.writeText(code).then(() => {
    const btn = document.getElementById('copyCodeBtn');
    if (btn) { const orig = btn.textContent; btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = orig, 2000); }
  });
}

function shareGame() {
  const url = 'https://last-round-card-game.web.app/';
  const text = 'Last one holding cards buys the round! 🍺 Free browser card game — no download needed.';
  const title = 'Last Round 🍺 — The Pub Card Game';
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast('🍺 Link copied! Share it with your pub crew.');
    }).catch(() => {
      showToast('👉 ' + url);
    });
  }
}

function showToast(msg, duration = 2800) {
  let t = document.getElementById('gameToast');
  if (!t) {
    t = document.createElement('div'); t.id = 'gameToast';
    t.className = 'game-toast'; document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.remove('toast-hide'); t.classList.add('toast-show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.classList.remove('toast-show'); t.classList.add('toast-hide'); }, duration);
}

// ============================================================
// ESCAPE OVERLAY
// ============================================================
const _SPUD_VALS = new Set(['8', '9']);

const _ESC_GENERIC = [
  "{winner} has left the building. The rest of you — enjoy the view.",
  "Clean getaway. Nobody saw that coming. Except {winner}.",
  "Freedom tastes like not having to buy the next round. Ask {winner}.",
  "And just like that, {winner} becomes everyone's least favourite person. Congrats.",
  "While you lot were strategising, {winner} was already putting on their coat.",
  "{winner} didn't win. Everyone else just lost harder.",
  "Not bad for someone who looked completely lost five minutes ago, {winner}.",
  "The table has spoken. {winner} out. You've got this. You really don't.",
  "{winner} has escaped. This is your future, {loser}. Study it carefully.",
  "Exit stage left: {winner}. Remaining cast: still holding cards, still suffering.",
];

const _ESC_NAMED = [
  "{winner} would like to dedicate this escape to {loser}, who provided excellent inspiration on what NOT to do.",
  "Dear {loser}: this is a sign. Not a good one.",
  "The gap between {winner} and {loser} right now is mostly dignity.",
  "{winner} escapes. {loser} remains. The universe is, as always, beautifully unfair.",
  "Security footage shows {winner} walking out with a smile while {loser} stares at their cards for the seventeenth time.",
  "{loser} — still here? Still. Here.",
  "Scientists confirm {loser} will be holding cards for the foreseeable future. {winner} is already at the bar.",
  "Attention {loser}: {winner} says thanks for the distraction. Worked perfectly.",
  "Every choice {loser} has made today has led to this moment of watching {winner} walk away.",
];

const _ESC_SPUD = [
  "A {val}. {winner} just escaped with a {val}.\nA POTATO.\nThe audacity. The disrespect. The absolute cheek.",
  "🥔 SPUD ESCAPE 🥔\n{winner} played a {val} — the most unremarkable card in existence — and somehow that was enough.\n{loser} is still here. Holding actual cards. Like an idiot.",
  "History books will not record this moment.\nBut {loser} will. Oh, they will.\n{winner} just escaped with a {val}. A NINE. Incredible.",
  "A {val}. Not a bomb. Not a 2.\nA plain, boring {val}.\n{winner}, you absolute potato. You absolute LEGEND.",
  "The audacity of {winner} — winning with a {val} while {loser} sits there holding cards that should actually win games.\nUnbelievable scenes.",
  "Somewhere right now {loser} is questioning every choice that led to this moment.\nThe answer is the {val}.\nIt's always the {val}.",
  "🥔 A SPUD. {winner} played a SPUD and walked out the door.\n{loser}, I'm so sorry. I'm not even a little bit sorry.\nAbsolutely extraordinary.",
];

function _pickEscapeMsg(winner, card, losers) {
  const isSpud = _SPUD_VALS.has(card?.value);
  const loser = losers.length > 0 ? losers[Math.floor(Math.random() * losers.length)] : null;
  const val = card?.value || '?';

  const fill = s => s
    .replace(/{winner}/g, winner)
    .replace(/{loser}/g, loser || 'everyone')
    .replace(/{val}/g, val);

  if (isSpud) {
    return fill(_ESC_SPUD[Math.floor(Math.random() * _ESC_SPUD.length)]);
  }
  // 50/50 generic vs named (named only if we have a loser name)
  if (loser && Math.random() < 0.5) {
    return fill(_ESC_NAMED[Math.floor(Math.random() * _ESC_NAMED.length)]);
  }
  return fill(_ESC_GENERIC[Math.floor(Math.random() * _ESC_GENERIC.length)]);
}

let _escapeOverlayTimer = null;

function showEscapeOverlay(player, card, losers, isGameOver, then) {
  // Skip in AFK demo mode (watched demo shows the overlay)
  if (_afkDemoActive && !_watchedDemoActive) { then(); return; }

  const isSpud = _SPUD_VALS.has(card?.value);
  const duration = isSpud ? 7500 : 5000;
  const msg = _pickEscapeMsg(player.name, card, losers);
  const avatar = player.avatar || '🃏';

  // Broadcast to online clients
  if (ONLINE.active && ONLINE.isHost) {
    _pushEscapeReveal({ winnerName: player.name, winnerAvatar: avatar, card, losers, isSpud, msg });
  }

  _showEscapeOverlayUI(avatar, player.name, card, msg, isSpud, duration, then);
}

function _showEscapeOverlayUI(avatar, winnerName, card, msg, isSpud, duration, then) {
  const overlay = document.getElementById('escapeOverlay');
  if (!overlay) { then(); return; }

  clearTimeout(_escapeOverlayTimer);

  // Set content
  overlay.querySelector('.escape-avatar').textContent = avatar;
  overlay.querySelector('.escape-winner-name').textContent = winnerName + ' escaped!';
  overlay.querySelector('.escape-msg').textContent = msg;

  // Card display
  const cardWrap = overlay.querySelector('.escape-card-wrap');
  cardWrap.innerHTML = '';
  if (card) {
    const el = makeCard(card, null, false, false, false);
    el.style.cssText = 'width:130px;height:182px;font-size:1.4rem;cursor:default;transform:rotate(-4deg);';
    el.style.setProperty('--card-mid-size', '4rem');
    cardWrap.appendChild(el);
  }

  // Spud vs regular styling
  overlay.classList.toggle('escape-spud', isSpud);
  overlay.classList.remove('hidden');
  overlay.classList.add('escape-in');

  // Particle burst
  overlay.querySelectorAll('.escape-particle').forEach(p => p.remove());
  const particleColor = isSpud ? '#d4a030' : '#f0c040';
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'escape-particle';
    p.style.cssText = `--angle:${i * (360/14)}deg;--dist:${75 + Math.random() * 90}px;--delay:${i * 0.03}s;--color:${particleColor};`;
    overlay.appendChild(p);
  }

  const finish = () => {
    clearTimeout(_escapeOverlayTimer);
    overlay.classList.remove('escape-in');
    overlay.classList.add('hidden');
    overlay.removeEventListener('pointerdown', skipHandler);
    then();
  };

  const skipHandler = () => finish();
  overlay.addEventListener('pointerdown', skipHandler, { once: true });
  _escapeOverlayTimer = setTimeout(finish, duration);
}

function _pushEscapeReveal(data) {
  if (!ONLINE.active || !ONLINE.isHost || !fbReady()) return;
  const { db, ref, set: fbSet } = fb();
  fbSet(ref(db, `rooms/${ONLINE.roomCode}/reveal`), { type: 'escape', data, ts: Date.now() });
}

// ============================================================
// LANGUAGE PICKER
// ============================================================
function openLangPicker() {
  const modal = document.getElementById('langPickerModal');
  if (!modal) return;
  const current = localStorage.getItem('lr_lang') || 'en';
  modal.querySelectorAll('.lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === current);
  });
  modal.classList.remove('hidden');
}

function closeLangPicker() {
  document.getElementById('langPickerModal')?.classList.add('hidden');
}

// ============================================================
// DESIGN MODE (dev tool — long-press logo or Ctrl+Shift+D)
// ============================================================
let _designActive = false;
let _designCleanup = [];
let _designMoved   = []; // tracks all moved elements for copy

const _DM_PALETTE = ['#e74c3c','#3498db','#2ecc71','#e67e22','#9b59b6','#1abc9c','#e91e63','#00bcd4','#f39c12','#8bc34a','#ff5722','#607d8b','#795548','#ff9800','#34495e'];
const _DM_SKIP_TAGS = new Set(['button','span','input','label','svg','path','circle','i']);

function toggleDesignMode() {
  _designActive ? _exitDesignMode() : _enterDesignMode();
}

function _enterDesignMode() {
  _designActive = true;
  _designMoved  = [];
  showToast('🎨 Design Mode ON — drag any coloured handle', 3000);

  const panel = document.createElement('div');
  panel.id = 'designPanel';
  panel.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:rgba(0,0,0,0.88);color:#fff;padding:12px 14px;border-radius:10px;font-size:11px;font-family:monospace;min-width:230px;pointer-events:all;max-height:80vh;overflow-y:auto;';
  panel.innerHTML = `
    <div style="font-weight:bold;font-size:13px;margin-bottom:8px">🎨 Design Mode</div>
    <div id="dmCoords" style="line-height:1.9;margin-bottom:10px;font-size:10px">Drag coloured handles to reposition any box</div>
    <div style="display:flex;gap:6px">
      <button id="dmCopy" style="flex:1;padding:5px;cursor:pointer;border-radius:6px;border:none;background:#27ae60;color:#fff;font-size:11px">📋 Copy positions</button>
      <button id="dmExit" style="flex:1;padding:5px;cursor:pointer;border-radius:6px;border:none;background:#c0392b;color:#fff;font-size:11px">✕ Exit</button>
    </div>`;
  document.body.appendChild(panel);
  panel.querySelector('#dmExit').onclick = _exitDesignMode;
  panel.querySelector('#dmCopy').onclick = _copyDesignPositions;
  _designCleanup.push(() => panel.remove());

  // Discover every visible box with an id inside the game screen
  const screen = document.getElementById('screen-game');
  if (!screen) return;
  const targets = [...screen.querySelectorAll('[id]')].filter(el => {
    if (_DM_SKIP_TAGS.has(el.tagName.toLowerCase())) return false;
    if (el.classList.contains('hidden')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 50 && r.height > 24;
  });

  targets.forEach((el, idx) => {
    const color = _DM_PALETTE[idx % _DM_PALETTE.length];
    const label = el.id;
    const cs = getComputedStyle(el);
    const origTransform = el.style.transform || '';
    const origPosition  = el.style.position  || '';
    const origWidth     = el.style.width     || '';
    const origHeight    = el.style.height    || '';
    let dx = 0, dy = 0;

    if (cs.position === 'static') el.style.position = 'relative';

    // ── Drag handle (top bar) ──
    const handle = document.createElement('div');
    handle.className = 'dm-handle';
    handle.style.cssText = `position:absolute;top:0;left:0;right:16px;height:20px;background:${color};color:#fff;font-size:10px;font-weight:bold;display:flex;align-items:center;padding:0 6px;gap:4px;cursor:grab;z-index:9999;border-radius:3px 3px 0 0;user-select:none;white-space:nowrap;overflow:hidden;`;
    handle.innerHTML = `<span>⠿</span><span>#${label}</span>`;

    // ── Outline ──
    const outline = document.createElement('div');
    outline.className = 'dm-outline';
    outline.style.cssText = `position:absolute;inset:0;outline:2px dashed ${color};outline-offset:-1px;pointer-events:none;z-index:9998;border-radius:3px;`;

    // ── Resize grips: SE corner (W+H), E edge (W only), S edge (H only) ──
    const mkGrip = (cssExtra, cursor) => {
      const g = document.createElement('div');
      g.style.cssText = `position:absolute;background:${color};z-index:9999;cursor:${cursor};${cssExtra}`;
      el.appendChild(g);
      return g;
    };
    const gripSE = mkGrip('bottom:0;right:0;width:14px;height:14px;border-radius:3px 0 3px 0;', 'se-resize');
    const gripE  = mkGrip('top:20px;right:0;width:7px;bottom:14px;opacity:0.7;', 'e-resize');
    const gripS  = mkGrip('bottom:0;left:0;height:7px;right:14px;opacity:0.7;', 's-resize');

    el.appendChild(handle);
    el.appendChild(outline);

    const getEntry = () => {
      if (!_designMoved.find(m => m.id === el.id)) _designMoved.push({ id: el.id, color, dx: 0, dy: 0, w: null, h: null });
      return _designMoved.find(m => m.id === el.id);
    };

    const updateCoords = () => {
      document.getElementById('dmCoords').innerHTML = _designMoved.map(m => {
        const te = document.getElementById(m.id);
        if (!te) return '';
        const r = te.getBoundingClientRect();
        return `<span style="color:${m.color}">■ #${m.id}</span><br>` +
          `  pos offset: ${m.dx>=0?'+':''}${m.dx}px, ${m.dy>=0?'+':''}${m.dy}px<br>` +
          `  size: ${Math.round(r.width)}×${Math.round(r.height)}px`;
      }).join('<br>') || 'Drag handles to move · drag corner/edges to resize';
    };

    // Drag to move
    let dragging = false, startX, startY, startDx, startDy;
    handle.addEventListener('pointerdown', e => {
      dragging = true; startX = e.clientX; startY = e.clientY; startDx = dx; startDy = dy;
      handle.style.cursor = 'grabbing'; handle.setPointerCapture(e.pointerId);
      e.stopPropagation(); e.preventDefault();
    });
    handle.addEventListener('pointermove', e => {
      if (!dragging) return;
      dx = startDx + (e.clientX - startX); dy = startDy + (e.clientY - startY);
      el.style.transform = `translate(${dx}px,${dy}px)`;
      const entry = getEntry(); entry.dx = Math.round(dx); entry.dy = Math.round(dy);
      updateCoords();
    });
    handle.addEventListener('pointerup', () => { dragging = false; handle.style.cursor = 'grab'; });

    // Resize SE (width + height)
    let resizing = false, resStartX, resStartY, resStartW, resStartH;
    const startResize = (e, grip) => {
      resizing = true;
      const r = el.getBoundingClientRect();
      resStartX = e.clientX; resStartY = e.clientY;
      resStartW = r.width; resStartH = r.height;
      grip.setPointerCapture(e.pointerId);
      e.stopPropagation(); e.preventDefault();
    };
    gripSE.addEventListener('pointerdown', e => startResize(e, gripSE));
    gripSE.addEventListener('pointermove', e => {
      if (!resizing) return;
      el.style.width  = Math.max(60, resStartW + (e.clientX - resStartX)) + 'px';
      el.style.height = Math.max(30, resStartH + (e.clientY - resStartY)) + 'px';
      const entry = getEntry(); entry.w = Math.round(parseFloat(el.style.width)); entry.h = Math.round(parseFloat(el.style.height));
      updateCoords();
    });
    gripSE.addEventListener('pointerup', () => { resizing = false; });

    // Resize E (width only)
    let resizingE = false;
    gripE.addEventListener('pointerdown', e => { resizingE = true; const r = el.getBoundingClientRect(); resStartX = e.clientX; resStartW = r.width; gripE.setPointerCapture(e.pointerId); e.stopPropagation(); e.preventDefault(); });
    gripE.addEventListener('pointermove', e => {
      if (!resizingE) return;
      el.style.width = Math.max(60, resStartW + (e.clientX - resStartX)) + 'px';
      const entry = getEntry(); entry.w = Math.round(parseFloat(el.style.width));
      updateCoords();
    });
    gripE.addEventListener('pointerup', () => { resizingE = false; });

    // Resize S (height only)
    let resizingS = false;
    gripS.addEventListener('pointerdown', e => { resizingS = true; const r = el.getBoundingClientRect(); resStartY = e.clientY; resStartH = r.height; gripS.setPointerCapture(e.pointerId); e.stopPropagation(); e.preventDefault(); });
    gripS.addEventListener('pointermove', e => {
      if (!resizingS) return;
      el.style.height = Math.max(30, resStartH + (e.clientY - resStartY)) + 'px';
      const entry = getEntry(); entry.h = Math.round(parseFloat(el.style.height));
      updateCoords();
    });
    gripS.addEventListener('pointerup', () => { resizingS = false; });

    _designCleanup.push(() => {
      handle.remove(); outline.remove(); gripSE.remove(); gripE.remove(); gripS.remove();
      el.style.transform = origTransform; el.style.position = origPosition;
      el.style.width = origWidth; el.style.height = origHeight;
    });
  });
}

function _exitDesignMode() {
  _designActive = false;
  _designCleanup.forEach(fn => fn());
  _designCleanup = [];
  _designMoved   = [];
  showToast('🎨 Design Mode OFF');
}

function _copyDesignPositions() {
  if (!_designMoved.length) { showToast('Nothing changed yet — move or resize elements first'); return; }
  const lines = ['/* Design mode snapshot */'];
  _designMoved.forEach(({ id, dx, dy, w, h }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const parts = [];
    if (dx || dy) parts.push(`translate(${dx>=0?'+':''}${dx}px, ${dy>=0?'+':''}${dy}px)`);
    if (w)        parts.push(`width: ${w}px`);
    if (h)        parts.push(`height: ${h}px`);
    lines.push(`#${id} { ${parts.join('; ')} }  /* final: x:${Math.round(r.left)} y:${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}px */`);
  });
  navigator.clipboard.writeText(lines.join('\n'))
    .then(() => showToast('📋 Copied to clipboard!'))
    .catch(() => showToast(lines.join(' | ')));
}

// ============================================================
// OTA UPDATE CHECK (APK only)
// ============================================================
async function checkForUpdate() {
  try {
    const res = await fetch('https://last-round-card-game.web.app/version.json?_=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    if (!data.version || !data.url) return;
    const toNum = v => v.split('.').map(Number).reduce((a, b, i) => a + b * Math.pow(100, 2 - i), 0);
    if (toNum(data.version) <= toNum(GAME_VERSION)) return;
    _showUpdatePrompt(data.version, data.url);
  } catch (e) { /* no internet or server error — fail silently */ }
}

function _showUpdatePrompt(version, url) {
  const existing = document.getElementById('updatePromptModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'updatePromptModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:rgba(12,26,12,0.97);border:2px solid rgba(240,192,64,0.5);border-radius:18px;padding:28px 24px;max-width:300px;width:88%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.85)">
      <div style="font-size:2.8rem;margin-bottom:10px">🍺</div>
      <div style="font-size:1.2rem;font-weight:900;color:#f0c040;margin-bottom:8px">Update Available</div>
      <div style="font-size:0.85rem;color:#aed6b0;line-height:1.55;margin-bottom:22px">Version ${version} is ready.<br>New fixes &amp; improvements!</div>
      <button onclick="window.open('${url}','_system');document.getElementById('updatePromptModal').remove()"
        style="width:100%;padding:13px;background:linear-gradient(135deg,#b8920e,#f0c040);color:#1a0e00;font-weight:900;font-size:1rem;border:none;border-radius:10px;cursor:pointer;margin-bottom:10px;letter-spacing:0.03em">
        ⬇ Update Now
      </button>
      <button onclick="document.getElementById('updatePromptModal').remove()"
        style="width:100%;padding:10px;background:transparent;color:rgba(255,255,255,0.35);font-size:0.82rem;border:1px solid rgba(255,255,255,0.12);border-radius:10px;cursor:pointer">
        Maybe Later
      </button>
    </div>`;
  document.body.appendChild(modal);
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize error monitoring (must be first)
  if (typeof ErrorMonitor !== 'undefined') {
    ErrorMonitor.init();
  }
  if (typeof initLang === 'function') initLang();
  checkSeasonRollover();
  initMenu();
  if (IS_WEB) initWebLanding();
  showScreen('landing');
  initAuth();
  if (!IS_WEB) setTimeout(checkForUpdate, 3000);
  document.addEventListener('click', () => {
    document.getElementById('emojiPickerPanel')?.classList.add('hidden');
  });

  // Design mode: long-press the landing logo (1.5 s) or Ctrl+Shift+D
  let _logoPressTimer = null;
  const logo = document.getElementById('landingLogo');
  if (logo) {
    logo.addEventListener('pointerdown', () => { _logoPressTimer = setTimeout(toggleDesignMode, 1500); });
    logo.addEventListener('pointerup',   () => clearTimeout(_logoPressTimer));
    logo.addEventListener('pointerleave',() => clearTimeout(_logoPressTimer));
  }
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') { e.preventDefault(); toggleDesignMode(); }
  });
});

window.addEventListener('beforeunload', () => {
  const lb = getLB();
  const visitors = Object.keys(lb).filter(name => !isRegisteredPlayer(name));
  if (!visitors.length) return;
  visitors.forEach(name => delete lb[name]);
  localStorage.setItem('lr_leaderboard', JSON.stringify(lb));
  if (fbReady()) {
    const { db, ref: fbRef, remove: fbRm } = fb();
    visitors.forEach(name => fbRm(fbRef(db, `leaderboard/${fbSafe(name)}`)));
  }
});

// ===== FEEDBACK =====
let _feedbackContext = 'menu';

function showFeedbackModal(context) {
  _feedbackContext = context || 'menu';
  const modal = document.getElementById('feedbackModal');
  document.getElementById('feedbackText').value = '';
  document.getElementById('feedbackChar').textContent = '0 / 500';
  document.getElementById('feedbackThanks').classList.add('hidden');
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  modal.classList.remove('hidden');
  setTimeout(() => document.getElementById('feedbackText').focus(), 120);
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal').classList.add('hidden');
}

function selectMood(btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('feedbackText');
  if (ta) ta.addEventListener('input', () => {
    document.getElementById('feedbackChar').textContent = `${ta.value.length} / 500`;
  });
});

async function submitFeedback() {
  const mood = document.querySelector('.mood-btn.selected')?.dataset.mood || null;
  const text = document.getElementById('feedbackText').value.trim();
  if (!mood && !text) { closeFeedbackModal(); return; }

  const entry = {
    ts: Date.now(),
    mood,
    text: text || null,
    context: _feedbackContext,
    lang: window._currentLang || 'en',
    gameMode: G ? (ONLINE?.active ? 'online' : (G.players.some(p => p.isAI) ? 'ai' : 'local')) : null,
    players: G ? G.players.length : null,
  };

  if (fbReady()) {
    try {
      const { db, ref: fbRef, push: fbPush } = fb();
      await fbPush(fbRef(db, 'feedback'), entry);
    } catch (e) { /* fail silently — feedback is best-effort */ }
  }

  // Also keep a local rolling log for offline sessions
  try {
    const stored = JSON.parse(localStorage.getItem('lr_feedback') || '[]');
    stored.push(entry);
    if (stored.length > 20) stored.splice(0, stored.length - 20);
    localStorage.setItem('lr_feedback', JSON.stringify(stored));
  } catch (e) {}

  document.getElementById('feedbackThanks').classList.remove('hidden');
  document.querySelector('.feedback-btns').style.display = 'none';
  setTimeout(closeFeedbackModal, 2200);
  // Restore buttons for next open
  setTimeout(() => { document.querySelector('.feedback-btns').style.display = ''; }, 2500);
}

// ===== WATCHED DEMO =====
let _watchedDemoActive = false;

function startWatchedDemo() {
  closeDemoTour();
  _watchedDemoActive = true;
  _afkDemoActive = true;

  newGame({ numPlayers: 2, vsAI: true, direction: 1, names: ['Barfly', 'Paddy'] });
  G.players[0].isAI = true;
  G.setupIdx = 0;
  G.gamePhase = 'setup';

  const hint = document.querySelector('#demoOverlay .demo-hint');
  if (hint) hint.textContent = '← Leave anytime to exit';
  document.getElementById('demoOverlay')?.classList.remove('hidden');

  _watchedDemoAnimateSetup(0, () => {
    _watchedDemoAnimateSetup(1, () => {
      G.gamePhase = 'playing';
      G.currentIdx = determineStarter();
      addLog(t('log.goes_first', { name: curPlayer().name }));
      applyDesign(G_DESIGN);
      showScreen('game');
      renderGame();
      scheduleAI();
    });
  });
}

function _watchedDemoAnimateSetup(idx, onDone) {
  G.setupIdx = idx;
  showScreen('setup');
  renderSetup();

  const p = G.players[idx];
  const sorted = [...p.hand].sort((a, b) => {
    const ra = getRank(a.value), rb = getRank(b.value);
    if (ra === -1 && rb === -1) return 0;
    if (ra === -1) return -1;
    if (rb === -1) return 1;
    return rb - ra;
  });

  function pickCard(n) {
    if (n >= 3) {
      setTimeout(onDone, 900);
      return;
    }
    setTimeout(() => {
      const handIdx = p.hand.indexOf(sorted[n]);
      if (handIdx !== -1) setupSelectCard('hand', handIdx);
      pickCard(n + 1);
    }, 750);
  }

  setTimeout(() => pickCard(0), 700);
}

function _stopWatchedDemo() {
  if (!_watchedDemoActive) return;
  _watchedDemoActive = false;
  _afkDemoActive = false;
  document.getElementById('demoOverlay')?.classList.add('hidden');
  const hint = document.querySelector('#demoOverlay .demo-hint');
  if (hint) { hint.removeAttribute('data-i18n'); hint.textContent = 'Tap anywhere to play'; }
  if (G) G.gamePhase = 'gameover';
  clearTurnTimer();
  showScreen('landing');
}

// ===== DEMO TOUR =====
const DEMO_TOUR_SLIDES = [
  {
    title: 'The Setup',
    visual: `<div style="display:flex;flex-direction:column;align-items:center;gap:8px">
      <div style="font-size:0.7rem;color:rgba(255,255,255,0.4);letter-spacing:0.06em">BLIND &nbsp;·&nbsp; FACE-UP &nbsp;·&nbsp; HAND</div>
      <div class="demo-card-row">
        <div class="demo-card back"></div><div class="demo-card back"></div><div class="demo-card back"></div>
        <span style="color:rgba(255,255,255,0.2);margin:0 3px">|</span>
        <div class="demo-card">J<span style="font-size:0.55rem">♠</span></div>
        <div class="demo-card red">Q<span style="font-size:0.55rem">♥</span></div>
        <div class="demo-card">A<span style="font-size:0.55rem">♣</span></div>
        <span style="color:rgba(255,255,255,0.2);margin:0 3px">|</span>
        <div class="demo-card red">7<span style="font-size:0.55rem">♦</span></div>
        <div class="demo-card">9<span style="font-size:0.55rem">♠</span></div>
        <div class="demo-card red">K<span style="font-size:0.55rem">♥</span></div>
      </div>
    </div>`,
    body: 'Every player gets <strong>3 blind cards</strong> face-down, <strong>3 face-up cards</strong> the table can see, and <strong>3 cards in hand</strong>. Before the game starts, you swap cards from hand to upgrade your face-ups. Choose wisely!'
  },
  {
    title: 'Playing From Hand ✋',
    visual: `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <div style="font-size:0.7rem;color:rgba(255,255,255,0.4)">PLAY PILE</div>
      <div class="demo-card" style="width:44px;height:62px;font-size:1.05rem">7<span style="font-size:0.6rem">♠</span></div>
      <div style="font-size:0.7rem;color:#aed6b0">↓ must play equal or higher</div>
      <div class="demo-card-row">
        <div class="demo-card" style="outline:2px solid #f0c040;outline-offset:3px">8<span style="font-size:0.55rem">♣</span></div>
        <div class="demo-card red">J<span style="font-size:0.55rem">♦</span></div>
        <div class="demo-card">A<span style="font-size:0.55rem">♠</span></div>
      </div>
    </div>`,
    body: 'On your turn, play a card from hand that <strong>matches or beats</strong> the top pile card. Tap a card to select it, then hit <strong>▶ Play</strong>. Can\'t beat the pile? Hit <strong>⬆ Pick Up</strong> to take the whole pile into your hand.'
  },
  {
    title: 'The Play Pile 🎴',
    visual: `<div style="display:flex;align-items:flex-end;justify-content:center;gap:0">
      <div class="demo-card" style="transform:rotate(-9deg);margin-right:-16px;opacity:0.5">5<span style="font-size:0.55rem">♠</span></div>
      <div class="demo-card red" style="transform:rotate(-3deg);margin-right:-16px;opacity:0.75">J<span style="font-size:0.55rem">♥</span></div>
      <div class="demo-card" style="transform:rotate(5deg);z-index:2;box-shadow:0 5px 14px rgba(0,0,0,0.6)">A<span style="font-size:0.55rem">♣</span></div>
    </div>`,
    body: 'Cards stack up here each turn. The <strong>top card sets the rule</strong> — equal or higher to play on it. Tap the pile to <strong>peek</strong> at the last 5 cards. Special cards can <strong>burn the pile</strong> and reset it completely — more on those next!'
  },
  {
    title: 'Action Cards ⚡',
    visual: `<div class="demo-card-row" style="gap:10px">
      <div style="text-align:center"><div class="demo-card special">2</div><div style="font-size:0.58rem;margin-top:4px;color:#aed6b0">🍺 Reset</div></div>
      <div style="text-align:center"><div class="demo-card special">3</div><div style="font-size:0.58rem;margin-top:4px;color:#aed6b0">🎯 Again</div></div>
      <div style="text-align:center"><div class="demo-card special">7</div><div style="font-size:0.58rem;margin-top:4px;color:#aed6b0">🔔 Go Low</div></div>
      <div style="text-align:center"><div class="demo-card burn">10</div><div style="font-size:0.58rem;margin-top:4px;color:#f08080">💥 Burn!</div></div>
      <div style="text-align:center"><div class="demo-card special">5</div><div style="font-size:0.58rem;margin-top:4px;color:#aed6b0">🪞 Mirror</div></div>
    </div>`,
    body: '<strong>2</strong> resets — next player plays anything. <strong>3</strong> lets you draw and play again. <strong>7</strong> forces the next player to go <em>lower</em>. <strong>10</strong> blows up the entire pile and you play again. <strong>5</strong> copies the card below it.'
  },
  {
    title: 'Four of a Kind 🔥',
    visual: `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <div class="demo-card-row">
        <div class="demo-card burn">K</div><div class="demo-card burn">K</div>
        <div class="demo-card burn">K</div><div class="demo-card burn">K</div>
      </div>
      <div style="font-size:1.3rem;letter-spacing:4px">🔥 BURN! 🔥</div>
    </div>`,
    body: 'Get <strong>four of the same card</strong> on the pile top — all at once or built across turns — and the pile burns instantly. You play again from an empty board. Four 8s or 9s (the 🥔 spuds) triggers a <strong>MEGA BURN</strong> with maximum chaos.'
  },
  {
    title: 'Face-Up → Blind 🂠',
    visual: `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <div style="display:flex;gap:16px;align-items:flex-start">
        <div style="text-align:center">
          <div style="font-size:0.62rem;color:rgba(255,255,255,0.4);margin-bottom:4px">FACE-UP</div>
          <div class="demo-card-row"><div class="demo-card">J<span style="font-size:0.5rem">♠</span></div><div class="demo-card red">A<span style="font-size:0.5rem">♥</span></div><div class="demo-card">K<span style="font-size:0.5rem">♣</span></div></div>
        </div>
        <div style="text-align:center">
          <div style="font-size:0.62rem;color:rgba(255,255,255,0.4);margin-bottom:4px">BLIND</div>
          <div class="demo-card-row"><div class="demo-card back"></div><div class="demo-card back"></div><div class="demo-card back"></div></div>
        </div>
      </div>
      <div style="font-size:0.7rem;color:#aed6b0">hand empty → face-up → blind</div>
    </div>`,
    body: 'Once your <strong>hand is empty</strong>, play your face-up cards next — everyone can see them. When those are gone, flip <strong>blind cards</strong> one at a time. If the blind card can\'t be played, you pick up the whole pile. Tension guaranteed!'
  },
  {
    title: 'Online · Leagues · Brawls 🌐',
    visual: `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <div style="display:flex;gap:8px;font-size:1.5rem">🏅🥈🥇👑💎🍺</div>
      <div style="display:flex;gap:6px;align-items:center">
        <div style="background:rgba(74,158,92,0.18);border:1px solid #4a9e5c;border-radius:8px;padding:5px 14px;font-size:0.8rem;font-weight:700;letter-spacing:0.1em">BEER42</div>
        <span style="font-size:0.72rem;color:#aed6b0">← share room code</span>
      </div>
    </div>`,
    body: 'Create a room, share the code and <strong>play online</strong> with anyone worldwide. Win games to climb <strong>6 league tiers</strong> — Rookie to Pub Legend. Seasonal <strong>90-day Brawls</strong> reset the board and crown a new champion. Challenge rivals to <strong>duels</strong> for extra glory.'
  },
  {
    title: 'Last One Holding Cards… 🍺',
    visual: `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <div style="font-size:2.8rem">🏆</div>
      <div style="font-size:0.85rem;color:#f0c040;font-weight:800;letter-spacing:0.06em">LAST ROUND!</div>
      <div style="font-size:0.72rem;color:#aed6b0;text-align:center;line-height:1.5">First to empty all cards wins.<br>Last one still holding? Buys the round! 🍺</div>
    </div>`,
    body: 'Empty your hand, face-up cards, and blind cards before everyone else to <strong>win</strong>. The last player still holding cards is the loser — in Drinking Mode, they take a sip! Play free in the browser or grab the <strong>Android app</strong> to take it anywhere.'
  }
];

let _demoTourStep = 0;

function startDemoTour() {
  _demoTourStep = 0;
  _renderDemoTourSlide();
  document.getElementById('demoTourOverlay').classList.remove('hidden');
  // swipe support
  _demoTourInitSwipe();
}

function closeDemoTour() {
  document.getElementById('demoTourOverlay').classList.add('hidden');
}

function demoTourStep(dir) {
  const total = DEMO_TOUR_SLIDES.length;
  _demoTourStep = Math.max(0, Math.min(total - 1, _demoTourStep + dir));
  _renderDemoTourSlide();
}

function _renderDemoTourSlide() {
  const slide = DEMO_TOUR_SLIDES[_demoTourStep];
  const total = DEMO_TOUR_SLIDES.length;
  const isLast = _demoTourStep === total - 1;

  document.getElementById('demoTourVisual').innerHTML = slide.visual;
  document.getElementById('demoTourTitle').textContent = slide.title;
  document.getElementById('demoTourBody').innerHTML = slide.body;
  document.getElementById('demoTourCounter').textContent = `${_demoTourStep + 1} / ${total}`;

  document.getElementById('demoTourDots').innerHTML = DEMO_TOUR_SLIDES
    .map((_, i) => `<div class="demo-dot${i === _demoTourStep ? ' active' : ''}"></div>`)
    .join('');

  document.getElementById('demoTourPrev').disabled = _demoTourStep === 0;

  const nextBtn = document.getElementById('demoTourNext');
  nextBtn.disabled = false;
  if (isLast) {
    nextBtn.textContent = '▶ Watch a Game';
    nextBtn.onclick = startWatchedDemo;
  } else {
    nextBtn.textContent = '→';
    nextBtn.onclick = () => demoTourStep(1);
  }
}

let _demoSwipeStartX = 0;
function _demoTourInitSwipe() {
  const panel = document.querySelector('.demo-tour-panel');
  if (!panel || panel._swipeReady) return;
  panel._swipeReady = true;
  panel.addEventListener('touchstart', e => { _demoSwipeStartX = e.touches[0].clientX; }, { passive: true });
  panel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - _demoSwipeStartX;
    if (Math.abs(dx) > 40) demoTourStep(dx < 0 ? 1 : -1);
  }, { passive: true });
}
