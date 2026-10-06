/* Math Lab 1r ESO — utilitats compartides per tots els temes. */
window.MathLab = window.MathLab || {};

(function (ML) {
  'use strict';

  const U = {};

  /** Enter aleatori entre min i max (tots dos inclosos). */
  U.randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  /** Element aleatori d'una llista. */
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /** Còpia barrejada d'una llista (Fisher–Yates). */
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /** Format de nombres en català: punt de milers a partir de 5 xifres. */
  U.fmt = (n) => {
    if (typeof n !== 'number') return String(n);
    const s = String(Math.abs(n));
    const grouped = s.length > 4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s;
    return (n < 0 ? '−' : '') + grouped;
  };

  /** Converteix el text que escriu l'alumna en un nombre (o NaN). Accepta "1.000", "1 000", "−3". */
  U.parseNumber = (str) => {
    let s = String(str == null ? '' : str).trim().replace(/\s+/g, '').replace(/[−–]/g, '-');
    if (s === '') return NaN;
    if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    s = s.replace(',', '.');
    if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
    return Number(s);
  };

  /** HTML d'una potència: base amb l'exponent en superíndex. */
  U.pw = (base, exp) => {
    const b = typeof base === 'number' ? U.fmt(base) : base;
    const e = typeof exp === 'number' ? U.fmt(exp) : exp;
    return `<span class="pw">${b}<sup>${e}</sup></span>`;
  };

  /** Producte repetit: "3 · 3 · 3". */
  U.repeat = (x, n, sep = ' · ') => Array(n).fill(typeof x === 'number' ? U.fmt(x) : x).join(sep);

  /** Fracció en vertical. */
  U.frac = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;

  U.MUL = ' · ';
  U.DIV = ' : ';

  U.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Data local en format AAAA-MM-DD. */
  U.today = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  /** Dies entre dues dates AAAA-MM-DD. */
  U.daysBetween = (a, b) => {
    const pa = a.split('-').map(Number);
    const pb = b.split('-').map(Number);
    const da = Date.UTC(pa[0], pa[1] - 1, pa[2]);
    const db = Date.UTC(pb[0], pb[1] - 1, pb[2]);
    return Math.round((db - da) / 86400000);
  };

  const WORDS = ['zero', 'u', 'dos', 'tres', 'quatre', 'cinc', 'sis', 'set', 'vuit', 'nou', 'deu',
    'onze', 'dotze', 'tretze', 'catorze', 'quinze', 'setze', 'disset', 'divuit', 'dinou', 'vint'];
  /** Nom d'un nombre petit en català. */
  U.numWord = (n) => WORDS[n] || String(n);

  /** Crea un element a partir d'HTML. */
  U.html = (markup) => {
    const t = document.createElement('template');
    t.innerHTML = markup.trim();
    return t.content.firstElementChild;
  };

  ML.utils = U;
})(window.MathLab);
