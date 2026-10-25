/* Visualització: la quadrícula de centèsimes. Una unitat = 100 quadrets; una fila = 1 dècima.
 * Mode «Compara»: dues quadrícules, per veure que 0,5 és més gran que 0,45.
 */
window.MathLab = window.MathLab || {};
window.MathLab.decimals = window.MathLab.decimals || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const f = (c) => U.fmt(c / 100); // centèsimes → text amb coma
  const fx2 = (c) => (c / 100).toFixed(2).replace('.', ',');

  function grid(c, cls) {
    return `<div class="dq-grid" aria-hidden="true">${Array.from({ length: 100 }, (_, i) => {
      const on = i < c;
      return `<span class="dq-cell${on ? ` ${cls}` : ''}${on && Math.floor(i / 10) < Math.floor(c / 10) ? ' is-row' : ''}"></span>`;
    }).join('')}</div>`;
  }

  function mount(container) {
    let mode = 'one';
    let a = 37;
    let b = 45;

    container.innerHTML = `
      <div class="viz">
        <div class="viz-controls">
          <div class="seg" role="tablist" aria-label="Mode">
            <button type="button" data-mode="one" role="tab">Un nombre</button>
            <button type="button" data-mode="cmp" role="tab">Compara</button>
          </div>
          <label class="slider"><span>Nombre: <b class="js-a"></b></span><input type="range" min="0" max="100" class="js-ra" aria-label="Primer nombre, en centèsimes"></label>
          <label class="slider js-second"><span>Segon: <b class="js-b"></b></span><input type="range" min="0" max="100" class="js-rb" aria-label="Segon nombre, en centèsimes"></label>
        </div>
        <div class="viz-stage dq-stage"></div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);

    function render() {
      const stage = $('.dq-stage');
      if (mode === 'one') {
        stage.innerHTML = `<figure class="dq-fig">${grid(a, 'on')}<figcaption>${f(a)}</figcaption></figure>`;
        const d = Math.floor(a / 10);
        const c = a % 10;
        $('.viz-info').innerHTML = `<p class="viz-formula">${f(a)} = ${d} ${d === 1 ? 'dècima' : 'dècimes'} i ${c} ${c === 1 ? 'centèsima' : 'centèsimes'} = ${a} ${a === 1 ? 'centèsima' : 'centèsimes'}</p>
          <p>La quadrícula sencera és <b>1 unitat</b> i té 100 quadrets: cada quadret és <b>1 centèsima</b> (0,01) i cada fila sencera és <b>1 dècima</b> (0,1 = 10 centèsimes).${a % 10 === 0 && a > 0 && a < 100 ? ` Fixa't: ${f(a)} = ${fx2(a)}. El zero del final no canvia res.` : ''}</p>`;
      } else {
        const s = a < b ? '&lt;' : a > b ? '&gt;' : '=';
        stage.innerHTML = `<div class="dq-two">
          <figure class="dq-fig">${grid(a, 'on')}<figcaption>${f(a)}</figcaption></figure>
          <span class="dq-sym">${s}</span>
          <figure class="dq-fig">${grid(b, 'on2')}<figcaption>${f(b)}</figcaption></figure></div>`;
        $('.viz-info').innerHTML = `<p class="viz-formula">${f(a)} ${s} ${f(b)}</p>
          <p>Amb dos decimals: ${fx2(a)} ${s} ${fx2(b)}. Mira quina quadrícula té més quadrets pintats. ${String(a / 100).length !== String(b / 100).length ? 'Tenir més xifres decimals no vol dir ser més gran!' : ''}</p>`;
      }
      $('.js-a').textContent = f(a);
      $('.js-b').textContent = f(b);
      $('.js-ra').value = a;
      $('.js-rb').value = b;
      container.querySelectorAll('.js-second').forEach((x) => { x.hidden = mode !== 'cmp'; });
      container.querySelectorAll('.seg button').forEach((x) => {
        const on = x.dataset.mode === mode;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-selected', on);
      });
    }

    $('.js-ra').addEventListener('input', (e) => { a = Number(e.target.value); render(); });
    $('.js-rb').addEventListener('input', (e) => { b = Number(e.target.value); render(); });
    container.querySelectorAll('.seg button').forEach((x) => x.addEventListener('click', () => {
      mode = x.dataset.mode;
      if (mode === 'cmp') { a = 50; b = 45; }
      render();
    }));
    render();
  }

  ML.decimals.quadricula = { mount };
})(window.MathLab);
