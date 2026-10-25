/* Visualització: sumar dues fraccions amb barres, pas a pas.
 * 1) Les dues fraccions, amb trossos de mida diferent. 2) Tallem en trossos iguals (denominador comú).
 * 3) Ajuntem els trossos pintats.
 */
window.MathLab = window.MathLab || {};
window.MathLab.fraccions = window.MathLab.fraccions || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const F = (n, d) => U.frac(String(n), String(d));
  const PAIRS = [[1, 2, 1, 3], [1, 2, 1, 4], [1, 3, 1, 4], [2, 3, 1, 4], [1, 4, 1, 6], [3, 4, 1, 6], [2, 5, 1, 2], [1, 3, 1, 6], [3, 5, 1, 4], [1, 6, 3, 4], [2, 3, 1, 2], [3, 4, 2, 3]];

  function mount(container) {
    const M = ML.fraccions.math;
    let [a, b, c, d] = PAIRS[0];
    let step = 0;

    container.innerHTML = `
      <div class="viz">
        <div class="viz-buttons">
          <button type="button" class="btn btn-3d btn-blue js-next">Següent pas <span aria-hidden="true" class="ico">arrow_forward</span></button>
          <button type="button" class="btn btn-small btn-ghost js-new">🎲 Unes altres fraccions</button>
        </div>
        <div class="viz-stage fb-stage"></div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);

    /** Barra de `den` trossos: els `on1` primers en blau i els `on2` següents en lila. */
    function bar(den, on1, on2 = 0) {
      return `<span class="fb-bar" aria-hidden="true">${Array.from({ length: den }, (_, i) => {
        const cls = i < on1 ? ' on' : i < on1 + on2 ? ' on2' : '';
        return `<span class="fb-cell${cls}"></span>`;
      }).join('')}</span>`;
    }
    const row = (label, html) => `<div class="fb-row"><span class="fb-label">${label}</span>${html}</div>`;

    function render() {
      const L = (b * d) / M.gcd(b, d);
      const A = a * (L / b);
      const C = c * (L / d);
      const S = A + C;
      const g = M.gcd(S, L);
      let rows;
      let info;
      if (step === 0) {
        rows = row(F(a, b), bar(b, a)) + row(F(c, d), bar(d, 0, c));
        info = `<p class="viz-formula">${F(a, b)} + ${F(c, d)} = ?</p><p>Els trossos de les dues barres <b>no són iguals</b>: no podem sumar-los directament. Per això ${F(a, b)} + ${F(c, d)} no és ${F(a + c, b + d)}.</p>`;
      } else if (step === 1) {
        rows = row(F(A, L), bar(L, A)) + row(F(C, L), bar(L, 0, C));
        info = `<p class="viz-formula">${F(a, b)} + ${F(c, d)} = ${F(A, L)} + ${F(C, L)}</p><p>Tallem totes dues barres en <b>${L}</b> trossos iguals (${L} és el mcm de ${b} i ${d}). La part pintada no canvia: ${F(a, b)} = ${F(A, L)} i ${F(c, d)} = ${F(C, L)}.</p>`;
      } else {
        const full = S > L;
        rows = full
          ? row(F(S, L), `<span class="fb-two">${bar(L, Math.min(A, L), Math.max(0, Math.min(C, L - A)))}${bar(L, Math.max(0, A - L), S - L - Math.max(0, A - L))}</span>`)
          : row(F(S, L), bar(L, A, C));
        info = `<p class="viz-formula">${F(A, L)} + ${F(C, L)} = ${F(S, L)}${g > 1 ? ` = ${F(S / g, L / g)}` : ''}</p><p>Ara els trossos són iguals i els podem ajuntar: ${A} + ${C} = ${S} trossos de ${L}.${full ? ' Passa d\'una barra sencera: el resultat és més gran que 1.' : ''}${g > 1 ? ` Simplificant, queda ${F(S / g, L / g)}.` : ''}</p>`;
      }
      $('.fb-stage').innerHTML = `<div class="fb-rows">${rows}</div>`;
      $('.viz-info').innerHTML = info;
      $('.js-next').hidden = step === 2;
    }

    $('.js-next').addEventListener('click', () => { step = Math.min(2, step + 1); render(); });
    $('.js-new').addEventListener('click', () => {
      const options = PAIRS.filter((p) => p.join() !== [a, b, c, d].join());
      [a, b, c, d] = U.pick(options);
      step = 0;
      render();
    });
    render();
  }

  ML.fraccions.suma = { mount };
})(window.MathLab);
