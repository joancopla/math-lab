/* Visualització: sumar i restar enters com a desplaçaments a la recta numèrica. */
window.MathLab = window.MathLab || {};
window.MathLab.enters = window.MathLab.enters || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const f = U.fmt;
  const NS = 'http://www.w3.org/2000/svg';
  const R = 20; // la recta va de −R a R
  const W = 840;
  const X = (n) => 20 + ((n + R) * (W - 40)) / (2 * R);

  function el(tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function mount(container) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let a = -3;
    let b = 5;
    let op = '+';

    container.innerHTML = `
      <div class="viz">
        <div class="viz-controls">
          <label class="slider"><span>Comences a: <b class="js-a"></b></span><input type="range" min="-10" max="10" class="js-ra" aria-label="Nombre de partida"></label>
          <div class="seg" role="tablist" aria-label="Operació">
            <button type="button" data-op="+" role="tab">Suma +</button>
            <button type="button" data-op="−" role="tab">Resta −</button>
          </div>
          <label class="slider"><span>Nombre: <b class="js-b"></b></span><input type="range" min="-10" max="10" class="js-rb" aria-label="Segon nombre"></label>
        </div>
        <div class="viz-stage nl-stage">
          <svg class="nl-svg" viewBox="0 0 ${W} 160" role="img" aria-label="Recta numèrica"></svg>
        </div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);
    const svg = $('.nl-svg');

    function arrow(from, to, y, cls, label) {
      const g = el('g', { class: `nl-move ${cls}` });
      if (from === to) {
        g.appendChild(el('circle', { cx: X(from), cy: y, r: 5 }));
      } else {
        const dir = to > from ? 1 : -1;
        g.appendChild(el('path', { d: `M${X(from)} ${y} L${X(to) - dir * 9} ${y}`, class: 'nl-shaft' }));
        g.appendChild(el('path', { d: `M${X(to)} ${y} L${X(to) - dir * 12} ${y - 7} L${X(to) - dir * 12} ${y + 7} Z`, class: 'nl-head' }));
      }
      g.appendChild(el('text', { x: (X(from) + X(to)) / 2, y: y - 10, class: 'nl-label' }, label));
      return g;
    }

    function render(animate) {
      const step = op === '+' ? b : -b; // restar b és sumar −b
      const res = a + step;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const axisY = 128;
      svg.appendChild(el('line', { x1: X(-R) - 10, y1: axisY, x2: X(R) + 10, y2: axisY, class: 'nl-axis' }));
      for (let n = -R; n <= R; n++) {
        const big = n % 5 === 0;
        svg.appendChild(el('line', { x1: X(n), y1: axisY - (big ? 9 : 5), x2: X(n), y2: axisY + (big ? 9 : 5), class: `nl-tick${n === 0 ? ' is-zero' : ''}` }));
        if (big || n === a || n === res) {
          svg.appendChild(el('text', { x: X(n), y: axisY + 28, class: `nl-num${n === res ? ' is-res' : ''}${n < 0 ? ' is-neg' : ''}` }, f(n)));
        }
      }
      svg.appendChild(arrow(0, a, 92, 'is-first', f(a)));
      const second = arrow(a, res, 56, 'is-second', `${op} ${b < 0 ? `(${f(b)})` : b}`);
      svg.appendChild(second);
      svg.appendChild(el('circle', { cx: X(res), cy: axisY, r: 8, class: 'nl-dot' }));
      if (animate && !reduce && second.animate) {
        second.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'ease-out' });
      }

      $('.js-a').textContent = f(a);
      $('.js-b').textContent = f(b);
      $('.js-ra').value = a;
      $('.js-rb').value = b;
      container.querySelectorAll('.seg button').forEach((x) => {
        const on = x.dataset.op === op;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-selected', on);
      });

      const bTxt = b < 0 ? `(${f(b)})` : String(b);
      const dir = step > 0 ? 'cap a la <b>dreta</b>' : step < 0 ? 'cap a l\'<b>esquerra</b>' : 'gens';
      let explain;
      if (op === '+') {
        explain = b === 0 ? 'Sumar 0 no mou res.'
          : `Sumar ${b > 0 ? 'un positiu' : 'un negatiu'} és moure's ${dir}: ${Math.abs(b)} ${Math.abs(b) === 1 ? 'pas' : 'passos'}.`;
      } else {
        explain = b === 0 ? 'Restar 0 no mou res.'
          : `<b>Restar és sumar l'oposat</b>: ${f(a)} − ${bTxt} = ${f(a)} + ${step < 0 ? `(${f(step)})` : step}. Per tant, ens movem ${dir}.${b < 0 ? ' Per això restar un negatiu fa augmentar!' : ''}`;
      }
      $('.viz-info').innerHTML = `<p class="viz-formula">${f(a)} ${op} ${bTxt} = ${f(res)}</p><p>${explain}</p>`;
    }

    $('.js-ra').addEventListener('input', (e) => { a = Number(e.target.value); render(false); });
    $('.js-rb').addEventListener('input', (e) => { b = Number(e.target.value); render(false); });
    container.querySelectorAll('.seg button').forEach((x) => x.addEventListener('click', () => { op = x.dataset.op; render(true); }));
    render(false);
  }

  ML.enters.recta = { mount };
})(window.MathLab);
