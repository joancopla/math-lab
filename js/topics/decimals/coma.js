/* Visualització: multiplicar i dividir per 10, 100 i 1.000 en una taula de valor de posició.
 * Les xifres es desplacen (la coma es queda quieta): ×10 → una columna cap a l'esquerra; :10 → cap a la dreta.
 */
window.MathLab = window.MathLab || {};
window.MathLab.decimals = window.MathLab.decimals || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const COLS = [3, 2, 1, 0, -1, -2, -3]; // exponents: milers … mil·lèsimes
  const NAMES = { 3: 'UM', 2: 'C', 1: 'D', 0: 'U', '-1': 'd', '-2': 'c', '-3': 'm' };
  const TITLES = { 3: 'unitats de miler', 2: 'centenes', 1: 'desenes', 0: 'unitats', '-1': 'dècimes', '-2': 'centèsimes', '-3': 'mil·lèsimes' };
  const START = [[35, -1], [275, -2], [4, -1], [123, -1], [8, -2], [65, 0], [1, 0]];
  const W = 52; // amplada d'una columna (px)

  function mount(container) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let [M, e] = START[0]; // valor = M · 10^e (M sense zeros al final)
    let last = '';

    container.innerHTML = `
      <div class="viz">
        <div class="viz-buttons dc-ops">
          <button type="button" class="btn btn-small" data-k="1">· 10</button>
          <button type="button" class="btn btn-small" data-k="2">· 100</button>
          <button type="button" class="btn btn-small" data-k="3">· 1.000</button>
          <button type="button" class="btn btn-small" data-k="-1">: 10</button>
          <button type="button" class="btn btn-small" data-k="-2">: 100</button>
          <button type="button" class="btn btn-small" data-k="-3">: 1.000</button>
          <button type="button" class="btn btn-small btn-ghost js-new">🎲 Un altre nombre</button>
        </div>
        <div class="viz-stage dc-stage">
          <div class="dc-table" style="--w:${W}px">
            <div class="dc-head">${COLS.map((c) => `<span title="${TITLES[c]}">${NAMES[c]}</span>`).join('')}</div>
            <div class="dc-body"><span class="dc-comma" aria-hidden="true">,</span></div>
          </div>
        </div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);
    const body = $('.dc-body');
    const digits = () => String(M).split('');
    const value = () => Math.round(M * 10 ** (e + 6)) / 1e6;
    const top = () => e + digits().length - 1;
    const x = (exp) => (3 - exp) * W + (exp < 0 ? 14 : 0); // espai per a la coma

    function render(animate) {
      body.querySelectorAll('.dc-d').forEach((n) => n.remove());
      const ds = digits();
      const used = new Set();
      ds.forEach((d, i) => {
        const exp = top() - i;
        used.add(exp);
        const el = document.createElement('span');
        el.className = 'dc-d';
        el.textContent = d;
        el.dataset.i = i;
        el.style.left = `${x(exp)}px`;
        body.appendChild(el);
      });
      // Zeros que fan falta: entre la coma i les xifres, i a les unitats si el nombre és més petit que 1.
      const lo = Math.min(e, 0);
      const hi = Math.max(top(), 0);
      for (let exp = hi; exp >= lo; exp--) {
        if (used.has(exp) || (exp < 0 && exp < e)) continue;
        const z = document.createElement('span');
        z.className = 'dc-d is-zero';
        z.textContent = '0';
        z.style.left = `${x(exp)}px`;
        body.appendChild(z);
      }
      if (animate && !reduce && last) {
        const k = Number(last);
        body.querySelectorAll('.dc-d:not(.is-zero)').forEach((el) => {
          if (el.animate) el.animate([{ transform: `translateX(${k * W + (Math.sign(k) * 0)}px)` }, { transform: 'none' }], { duration: 600, easing: 'ease-in-out' });
        });
      }
      const k = Number(last);
      const v = value();
      const msg = !last ? 'Tria una operació. Fixa\'t que la coma no es mou: són les xifres les que canvien de columna.'
        : k > 0 ? `Multiplicar per ${U.fmt(10 ** k)} fa el nombre ${U.fmt(10 ** k)} vegades més gran: cada xifra passa ${k} ${k === 1 ? 'columna' : 'columnes'} cap a l'esquerra. És com moure la coma ${k} ${k === 1 ? 'posició' : 'posicions'} cap a la <b>dreta</b>.`
          : `Dividir per ${U.fmt(10 ** -k)} fa el nombre més petit: cada xifra passa ${-k} ${k === -1 ? 'columna' : 'columnes'} cap a la dreta. És com moure la coma ${-k} ${k === -1 ? 'posició' : 'posicions'} cap a l'<b>esquerra</b>. Si falten xifres, hi posem zeros.`;
      $('.viz-info').innerHTML = `<p class="viz-formula">${U.fmt(v)}</p><p>${msg}</p>`;
      container.querySelectorAll('.dc-ops [data-k]').forEach((b) => {
        const kk = Number(b.dataset.k);
        b.disabled = top() + kk > 3 || e + kk < -3;
      });
    }

    function apply(k) {
      e += k;
      last = String(k);
      render(true);
    }

    container.querySelectorAll('.dc-ops [data-k]').forEach((b) => b.addEventListener('click', () => apply(Number(b.dataset.k))));
    $('.js-new').addEventListener('click', () => {
      const opts = START.filter(([m, ex]) => m !== M || ex !== e);
      [M, e] = U.pick(opts);
      last = '';
      render(false);
    });
    $('.dc-comma').style.left = `${x(0) + W - 2}px`;
    render(false);
  }

  ML.decimals.coma = { mount };
})(window.MathLab);
