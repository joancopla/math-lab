/* Visualització: barres de fraccions. Fraccions equivalents (la mateixa part pintada, trossos diferents)
 * i comparació de dues fraccions.
 */
window.MathLab = window.MathLab || {};
window.MathLab.fraccions = window.MathLab.fraccions || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const F = (n, d) => U.frac(String(n), String(d));

  /** Barra dividida en `den` trossos, amb `on` trossos pintats (pot passar d'una barra si on > den). */
  function bar(on, den, cls = 'on') {
    const cells = Array.from({ length: den }, (_, i) => `<span class="fb-cell${i < on ? ` ${cls}` : ''}"></span>`).join('');
    return `<span class="fb-bar" aria-hidden="true">${cells}</span>`;
  }
  const row = (label, html, extra = '') => `<div class="fb-row ${extra}"><span class="fb-label">${label}</span>${html}</div>`;

  function mount(container) {
    const M = ML.fraccions.math;
    let mode = 'eq';
    let n = 2;
    let d = 3;
    let n2 = 3;
    let d2 = 5;

    container.innerHTML = `
      <div class="viz">
        <div class="viz-controls">
          <div class="seg" role="tablist" aria-label="Mode">
            <button type="button" data-mode="eq" role="tab">Equivalents</button>
            <button type="button" data-mode="cmp" role="tab">Compara</button>
          </div>
          <label class="slider"><span>Numerador: <b class="js-n"></b></span><input type="range" min="0" max="12" class="js-rn" aria-label="Numerador"></label>
          <label class="slider"><span>Denominador: <b class="js-d"></b></span><input type="range" min="1" max="12" class="js-rd" aria-label="Denominador"></label>
          <label class="slider js-second"><span>Segona: <b class="js-n2"></b></span><input type="range" min="0" max="12" class="js-rn2" aria-label="Numerador de la segona fracció"></label>
          <label class="slider js-second"><span>sobre <b class="js-d2"></b></span><input type="range" min="1" max="12" class="js-rd2" aria-label="Denominador de la segona fracció"></label>
        </div>
        <div class="viz-stage fb-stage"></div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);

    function render() {
      if (n > d) n = d;
      if (n2 > d2) n2 = d2;
      const stage = $('.fb-stage');
      let rows = '';
      let info = '';
      if (mode === 'eq') {
        rows += row(F(n, d), bar(n, d), 'is-main');
        const g = M.gcd(n, d) || d;
        if (g > 1 && n > 0) rows += row(F(n / g, d / g), bar(n / g, d / g, 'on2'), 'is-simple');
        for (let k = 2; k <= 4 && d * k <= 24; k++) rows += row(F(n * k, d * k), bar(n * k, d * k));
        info = n === 0
          ? '<p>Amb el numerador 0 no hi ha cap tros pintat: la fracció val 0.</p>'
          : `<p>Totes les barres tenen pintada <b>la mateixa part</b>: són fraccions equivalents. Si partim cada tros en 2, en 3 o en 4, hi ha més trossos, però més petits.</p>
             <p>${g > 1 ? `La barra lila és la fracció <b>irreductible</b>: ${F(n, d)} = ${F(n / g, d / g)} (dividint per ${g}).` : `${F(n, d)} ja és irreductible: no es pot simplificar més.`}</p>`;
      } else {
        rows += row(F(n, d), bar(n, d));
        rows += row(F(n2, d2), bar(n2, d2, 'on2'));
        const L = d * d2 / M.gcd(d, d2);
        const a = n * (L / d);
        const b = n2 * (L / d2);
        const s = a < b ? '&lt;' : a > b ? '&gt;' : '=';
        info = `<p class="viz-formula">${F(n, d)} ${s} ${F(n2, d2)}</p>
                <p>Mira quina barra té més part pintada. Amb denominador comú ${L}: ${F(a, L)} ${s} ${F(b, L)}.${d === d2 ? '' : n === n2 && n > 0 ? ' Amb el mateix numerador, és més gran la de denominador més petit: els trossos són més grans.' : ''}</p>`;
      }
      stage.innerHTML = `<div class="fb-rows">${rows}</div>`;
      $('.viz-info').innerHTML = info;
      $('.js-n').textContent = n;
      $('.js-d').textContent = d;
      $('.js-n2').textContent = n2;
      $('.js-d2').textContent = d2;
      $('.js-rn').max = d;
      $('.js-rn').value = n;
      $('.js-rd').value = d;
      $('.js-rn2').max = d2;
      $('.js-rn2').value = n2;
      $('.js-rd2').value = d2;
      container.querySelectorAll('.js-second').forEach((x) => { x.hidden = mode !== 'cmp'; });
      container.querySelectorAll('.seg button').forEach((x) => {
        const on = x.dataset.mode === mode;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-selected', on);
      });
    }

    $('.js-rn').addEventListener('input', (e) => { n = Number(e.target.value); render(); });
    $('.js-rd').addEventListener('input', (e) => { d = Number(e.target.value); render(); });
    $('.js-rn2').addEventListener('input', (e) => { n2 = Number(e.target.value); render(); });
    $('.js-rd2').addEventListener('input', (e) => { d2 = Number(e.target.value); render(); });
    container.querySelectorAll('.seg button').forEach((x) => x.addEventListener('click', () => { mode = x.dataset.mode; render(); }));
    render();
  }

  ML.fraccions.barres = { mount };
})(window.MathLab);
