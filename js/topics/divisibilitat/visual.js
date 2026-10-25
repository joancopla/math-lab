/* Visualització: els divisors com a rectangles. Amb n quadrets, quins rectangles es poden fer?
 * Cada rectangle de a × b dona dos divisors (a i b). Un nombre primer només en fa un: 1 × n.
 */
window.MathLab = window.MathLab || {};
window.MathLab.divisibilitat = window.MathLab.divisibilitat || {};

(function (ML) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const MAX = 48;

  function svgEl(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function rectSvg(rows, cols, prime) {
    const cell = Math.max(6, Math.min(28, 300 / cols));
    const svg = svgEl('svg', { viewBox: `-2 -2 ${cols * cell + 4} ${rows * cell + 4}`, class: 'viz-svg rect-svg', 'aria-hidden': 'true' });
    svg.style.width = `${cols * cell + 4}px`;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        svg.appendChild(svgEl('rect', { x: c * cell, y: r * cell, width: cell - 2, height: cell - 2, rx: Math.min(4, cell / 5), class: prime ? 'cell accent' : 'cell' }));
      }
    }
    return svg;
  }

  function mount(container) {
    const M = ML.divisibilitat.math;
    let n = 12;

    container.innerHTML = `
      <div class="viz">
        <div class="viz-controls">
          <label class="slider">
            <span>Quadrets: <b class="js-n"></b></span>
            <input type="range" min="1" max="${MAX}" step="1" class="js-range" aria-label="Nombre de quadrets">
          </label>
          <div class="viz-buttons">
            <button type="button" class="btn btn-small btn-ghost js-prime">🎲 Un nombre primer</button>
            <button type="button" class="btn btn-small btn-ghost js-many">🎲 Un nombre amb molts divisors</button>
          </div>
        </div>
        <div class="viz-stage rect-stage"></div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);
    const range = $('.js-range');

    function render() {
      const D = M.divisors(n);
      const prime = M.isPrime(n);
      const stage = $('.rect-stage');
      stage.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'rect-list';
      D.filter((a) => a * a <= n).forEach((a) => {
        const fig = document.createElement('figure');
        fig.className = 'rect-fig';
        fig.appendChild(rectSvg(a, n / a, prime));
        const cap = document.createElement('figcaption');
        cap.textContent = `${a} × ${n / a}`;
        fig.appendChild(cap);
        wrap.appendChild(fig);
      });
      stage.appendChild(wrap);
      $('.js-n').textContent = n;
      range.value = n;

      let msg;
      if (n === 1) msg = 'Amb 1 quadret només es pot fer un rectangle, de 1 × 1. L\'1 només té un divisor: <b>no és ni primer ni compost</b>.';
      else if (prime) msg = `Amb ${n} quadrets només es pot fer una fila: 1 × ${n}. Només té dos divisors, l'1 i el ${n}: és un nombre <b>primer</b>.`;
      else msg = `Amb ${n} quadrets es poden fer ${D.filter((a) => a * a <= n).length} rectangles diferents. Els costats són els divisors: <b>${D.join(', ')}</b>. Com que en té més de dos, ${n} és <b>compost</b>.`;
      const sq = Number.isInteger(Math.sqrt(n)) && n > 1 ? ` Un dels rectangles és un quadrat (${Math.sqrt(n)} × ${Math.sqrt(n)}): per això ${n} té un nombre senar de divisors.` : '';
      $('.viz-info').innerHTML = `<p class="viz-formula">${n} = ${D.filter((a) => a * a <= n).map((a) => `${a} · ${n / a}`).join(' = ')}</p><p>${msg}${sq}</p>`;
    }

    const set = (v) => { n = Math.max(1, Math.min(MAX, v)); render(); };
    range.addEventListener('input', () => set(Number(range.value)));
    $('.js-prime').addEventListener('click', () => {
      const ps = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47].filter((p) => p !== n);
      set(ML.utils.pick(ps));
    });
    $('.js-many').addEventListener('click', () => set(ML.utils.pick([12, 18, 20, 24, 30, 36, 40, 42, 48].filter((x) => x !== n))));
    render();
  }

  ML.divisibilitat.visual = { mount };
})(window.MathLab);
