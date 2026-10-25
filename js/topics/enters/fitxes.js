/* Visualització: sumar enters amb fitxes. Cada fitxa + i cada fitxa − formen una parella que val 0. */
window.MathLab = window.MathLab || {};
window.MathLab.enters = window.MathLab.enters || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const f = U.fmt;

  function mount(container) {
    let a = 5;
    let b = -3;
    let joined = false;

    container.innerHTML = `
      <div class="viz">
        <div class="viz-controls">
          <label class="slider"><span>Primer nombre: <b class="js-a"></b></span><input type="range" min="-9" max="9" class="js-ra" aria-label="Primer nombre"></label>
          <label class="slider"><span>Segon nombre: <b class="js-b"></b></span><input type="range" min="-9" max="9" class="js-rb" aria-label="Segon nombre"></label>
          <div class="viz-buttons">
            <button type="button" class="btn btn-3d btn-blue js-join">Ajunta i anul·la parelles</button>
            <button type="button" class="btn btn-small btn-ghost js-rand">🎲 Uns altres nombres</button>
          </div>
        </div>
        <div class="viz-stage chips-stage"></div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);
    const chip = (sign, zero) => `<span class="ct ${sign > 0 ? 'ct-pos' : 'ct-neg'}${zero ? ' is-zero' : ''}" aria-hidden="true">${sign > 0 ? '+' : '−'}</span>`;
    const group = (n, zeroCount) => {
      const s = Math.sign(n);
      return Array.from({ length: Math.abs(n) }, (_, i) => chip(s, i < zeroCount)).join('');
    };

    function render() {
      const res = a + b;
      const pairs = (a < 0) !== (b < 0) ? Math.min(Math.abs(a), Math.abs(b)) : 0;
      const stage = $('.chips-stage');
      if (!joined) {
        stage.innerHTML = `
          <div class="ct-groups">
            <div class="ct-group"><span class="ct-cap">${f(a)}</span><div class="ct-row">${group(a, 0) || '<span class="muted">cap fitxa</span>'}</div></div>
            <div class="ct-plus">+</div>
            <div class="ct-group"><span class="ct-cap">${f(b)}</span><div class="ct-row">${group(b, 0) || '<span class="muted">cap fitxa</span>'}</div></div>
          </div>`;
      } else {
        stage.innerHTML = `
          <div class="ct-group"><span class="ct-cap">Totes juntes</span>
            <div class="ct-row">${group(a, pairs)}${group(b, pairs) || ''}</div></div>`;
      }
      $('.js-a').textContent = f(a);
      $('.js-b').textContent = f(b);
      $('.js-ra').value = a;
      $('.js-rb').value = b;
      $('.js-join').hidden = joined;

      const bTxt = b < 0 ? `(${f(b)})` : String(b);
      let msg;
      if (!joined) {
        msg = '<p>Cada fitxa <b class="txt-pos">+</b> val +1 i cada fitxa <b class="txt-neg">−</b> val −1. Una + i una − juntes valen 0: s\'anul·len.</p>';
      } else if (pairs === 0) {
        msg = `<p class="viz-formula">${f(a)} + ${bTxt} = ${f(res)}</p><p>Totes les fitxes són del mateix color: no s'anul·la cap parella. Només cal comptar-les: ${Math.abs(res)} fitxes ${res > 0 ? 'positives' : res < 0 ? 'negatives' : ''}.</p>`;
      } else {
        msg = `<p class="viz-formula">${f(a)} + ${bTxt} = ${f(res)}</p><p>S'anul·len <b>${pairs}</b> parelles (+ i −). ${res === 0 ? 'No en queda cap: el resultat és 0.' : `En queden <b>${Math.abs(res)}</b> de ${res > 0 ? 'positives' : 'negatives'}: el resultat és ${f(res)}.`} Per això, amb signes diferents, es resten els valors absoluts.</p>`;
      }
      $('.viz-info').innerHTML = msg;
    }

    const set = (na, nb) => { a = na; b = nb; joined = false; render(); };
    $('.js-ra').addEventListener('input', (e) => set(Number(e.target.value), b));
    $('.js-rb').addEventListener('input', (e) => set(a, Number(e.target.value)));
    $('.js-join').addEventListener('click', () => { joined = true; render(); });
    $('.js-rand').addEventListener('click', () => {
      let na;
      let nb;
      do { na = U.randInt(-9, 9); nb = U.randInt(-9, 9); } while (na === 0 || nb === 0 || (na > 0 && nb > 0));
      set(na, nb);
    });
    render();
  }

  ML.enters.fitxes = { mount };
})(window.MathLab);
