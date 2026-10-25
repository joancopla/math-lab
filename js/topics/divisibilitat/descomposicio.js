/* Visualització: descomposició en factors primers amb la taula de divisions, pas a pas. */
window.MathLab = window.MathLab || {};
window.MathLab.divisibilitat = window.MathLab.divisibilitat || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const SAMPLES = [12, 18, 24, 36, 40, 45, 48, 60, 72, 84, 90, 96, 100, 120, 126, 150, 180, 210, 252, 360];

  function mount(container) {
    const M = ML.divisibilitat.math;
    let start = 60;
    let rows = []; // [{ n, p }]

    container.innerHTML = `
      <div class="viz">
        <div class="viz-controls">
          <form class="dec-form js-form">
            <label>Nombre: <input type="text" inputmode="numeric" class="js-num" autocomplete="off" aria-label="Nombre a descompondre"></label>
            <button class="btn btn-small">Fes-lo servir</button>
          </form>
          <div class="viz-buttons">
            <button type="button" class="btn btn-3d btn-blue js-step">Divideix <span aria-hidden="true" class="ico">arrow_forward</span></button>
            <button type="button" class="btn btn-small btn-ghost js-all">Fes-ho tot</button>
            <button type="button" class="btn btn-small btn-ghost js-rand">🎲 Un altre nombre</button>
          </div>
        </div>
        <div class="viz-stage dec-stage"><table class="dec-table" aria-label="Taula de divisions"><tbody></tbody></table></div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);
    const current = () => (rows.length ? rows[rows.length - 1].n / rows[rows.length - 1].p : start);
    const smallestPrime = (n) => M.factorize(n)[0][0];

    function render() {
      const cur = current();
      const done = cur === 1;
      $('.dec-table tbody').innerHTML = rows.map((r) => `<tr><td>${U.fmt(r.n)}</td><td class="dec-p">${r.p}</td></tr>`).join('')
        + `<tr class="${done ? 'is-one' : 'is-now'}"><td>${U.fmt(cur)}</td><td class="dec-p">${done ? '' : '?'}</td></tr>`;
      $('.js-step').hidden = done;
      $('.js-all').hidden = done;
      $('.js-num').value = start;
      let msg;
      if (start === 1) msg = '<p>L\'1 no té factors primers.</p>';
      else if (done) {
        const F = M.factorize(start);
        msg = `<p class="viz-formula">${U.fmt(start)} = ${M.fHtml(F)}</p><p>Hem arribat a 1. Els factors primers són els de la columna de la dreta: ${rows.map((r) => r.p).join(' · ')}. Agrupant els repetits en potències, tenim la <b>descomposició en factors primers</b>.</p>`;
      } else {
        const p = smallestPrime(cur);
        msg = rows.length === 0
          ? `<p>Escrivim el ${U.fmt(start)} a l'esquerra. Busquem el primer més petit que el divideix: prova amb 2, després 3, 5, 7…</p>`
          : `<p>${U.fmt(rows[rows.length - 1].n)} : ${rows[rows.length - 1].p} = ${U.fmt(cur)}. Ara busquem el primer més petit que divideix ${U.fmt(cur)}${p === cur ? ` (és el mateix ${cur}, perquè és primer)` : ''}.</p>`;
      }
      $('.viz-info').innerHTML = msg;
    }

    function stepOnce() {
      const cur = current();
      if (cur === 1) return;
      rows.push({ n: cur, p: smallestPrime(cur) });
    }

    function use(n) {
      start = n;
      rows = [];
      render();
    }

    $('.js-step').addEventListener('click', () => { stepOnce(); render(); });
    $('.js-all').addEventListener('click', () => { while (current() !== 1) stepOnce(); render(); });
    $('.js-rand').addEventListener('click', () => use(U.pick(SAMPLES.filter((x) => x !== start))));
    $('.js-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = U.parseNumber($('.js-num').value);
      if (Number.isInteger(v) && v >= 1 && v <= 100000) use(v);
      else $('.viz-info').innerHTML = '<p>Escriu un nombre natural entre 1 i 100.000.</p>';
    });
    render();
  }

  ML.divisibilitat.descomposicio = { mount };
})(window.MathLab);
