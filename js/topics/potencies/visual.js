/* Visualització interactiva: potències com a longituds, àrees (quadrats) i volums (cubs). */
window.MathLab = window.MathLab || {};
window.MathLab.potencies = window.MathLab.potencies || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const H = U.pw;
  const NS = 'http://www.w3.org/2000/svg';

  const MAX = { 1: 12, 2: 12, 3: 8 };

  function svgEl(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // ── Dibuix ────────────────────────────────────────────────────────────────

  /** Fila de n quadrets (exponent 1). */
  function drawLine(svg, n, shown) {
    const cell = Math.min(40, 460 / n);
    const w = cell * n;
    svg.setAttribute('viewBox', `-4 -4 ${w + 8} ${cell + 8}`);
    for (let i = 0; i < n; i++) {
      svg.appendChild(svgEl('rect', {
        x: i * cell, y: 0, width: cell - 3, height: cell - 3, rx: 4,
        class: i < shown ? 'cell' : 'cell ghost',
      }));
    }
  }

  /** Quadrat n×n (exponent 2). Opcionalment, la «L» que el converteix en (n+1)². */
  function drawSquare(svg, n, rowsShown, growth) {
    const size = growth ? n + 1 : n;
    const cell = Math.min(40, 400 / size);
    const w = cell * size;
    svg.setAttribute('viewBox', `-4 -4 ${w + 8} ${w + 8}`);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isNew = growth && (r === n || c === n);
        let cls = 'cell';
        if (isNew) cls = 'cell accent';
        else if (r >= rowsShown) cls = 'cell ghost';
        svg.appendChild(svgEl('rect', { x: c * cell, y: r * cell, width: cell - 3, height: cell - 3, rx: 4, class: cls }));
      }
    }
  }

  /** Cub n×n×n en perspectiva isomètrica (exponent 3), amb `layers` capes construïdes. */
  function drawCube(svg, n, layers) {
    const s = Math.min(30, 210 / n);
    const cx = Math.cos(Math.PI / 6) * s;
    const cy = Math.sin(Math.PI / 6) * s;
    const P = (x, y, z) => [(x - y) * cx, (x + y) * cy - z * s];
    const poly = (pts, cls) => svg.appendChild(svgEl('polygon', {
      points: pts.map((p) => P(...p).map((v) => v.toFixed(1)).join(',')).join(' '),
      class: cls,
    }));

    // Marc del cub sencer (les capes que falten es veuen en "fantasma").
    const minX = -n * cx - 4;
    const maxX = n * cx + 4;
    const minY = -n * s - 4;
    const maxY = 2 * n * cy + 4;
    svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

    // Contorn fantasma del cub complet.
    poly([[0, 0, n], [n, 0, n], [n, n, n], [0, n, n]], 'face ghost');
    poly([[n, 0, 0], [n, n, 0], [n, n, n], [n, 0, n]], 'face ghost');
    poly([[0, n, 0], [n, n, 0], [n, n, n], [0, n, n]], 'face ghost');

    if (layers === 0) return;
    // Només dibuixem les cares visibles de la caixa n × n × layers (són les de fora).
    const top = layers;
    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        poly([[x, y, top], [x + 1, y, top], [x + 1, y + 1, top], [x, y + 1, top]], 'face top');
      }
    }
    for (let z = 0; z < top; z++) {
      for (let y = 0; y < n; y++) {
        poly([[n, y, z], [n, y + 1, z], [n, y + 1, z + 1], [n, y, z + 1]], 'face right');
      }
      for (let x = 0; x < n; x++) {
        poly([[x, n, z], [x + 1, n, z], [x + 1, n, z + 1], [x, n, z + 1]], 'face left');
      }
    }
  }

  // ── Component ─────────────────────────────────────────────────────────────

  function mount(container) {
    let exp = 2;
    let n = 4;
    let shown = n; // files (exp 2), capes (exp 3) o quadrets (exp 1) construïts
    let growth = false;
    let timer = null;
    let quiz = null; // { n, exp } quan l'alumna ha d'endevinar el total

    container.innerHTML = `
      <div class="viz">
        <div class="viz-controls">
          <div class="seg" role="tablist" aria-label="Exponent">
            <button type="button" data-exp="1" role="tab">Línia <small>n<sup>1</sup></small></button>
            <button type="button" data-exp="2" role="tab">Àrea <small>n<sup>2</sup></small></button>
            <button type="button" data-exp="3" role="tab">Volum <small>n<sup>3</sup></small></button>
          </div>
          <label class="slider">
            <span>Base: <b class="js-n"></b></span>
            <input type="range" min="1" max="10" step="1" class="js-range" aria-label="Base">
          </label>
          <div class="viz-buttons">
            <button type="button" class="btn btn-small js-build">▶ Construeix pas a pas</button>
            <button type="button" class="btn btn-small btn-ghost js-growth">➕ De n² a (n+1)²</button>
            <button type="button" class="btn btn-small btn-ghost js-quiz">🎯 Endevina</button>
          </div>
        </div>
        <div class="viz-stage">
          <svg class="viz-svg" role="img" aria-label="Representació de la potència"></svg>
        </div>
        <div class="viz-info" aria-live="polite"></div>
        <div class="viz-quiz" hidden>
          <form class="js-quiz-form">
            <label>Quants <span class="js-quiz-unit">quadrets</span> hi ha en total? <input type="text" inputmode="numeric" class="js-guess" autocomplete="off"></label>
            <button class="btn btn-small btn-primary">Comprova</button>
          </form>
          <p class="js-quiz-msg"></p>
        </div>
        <div class="viz-strip" aria-label="Taula de potències"></div>
      </div>`;

    const $ = (sel) => container.querySelector(sel);
    const svg = $('.viz-svg');
    const range = $('.js-range');

    function stopAnim() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function unitWord(count) {
      if (exp === 3) return count === 1 ? 'cubet' : 'cubets';
      return count === 1 ? 'quadret' : 'quadrets';
    }

    function info() {
      const total = n ** exp;
      if (quiz) {
        return `<p class="viz-formula">${H(n, exp)} = <span class="blank">?</span></p>
                <p>Compta-ho sense comptar un per un: fixa't en les files${exp === 3 ? ' i les capes' : ''}.</p>`;
      }
      if (exp === 1) {
        return `<p class="viz-formula">${H(n, 1)} = ${n}</p><p>Exponent 1: la base apareix una sola vegada. Una línia de ${n} ${unitWord(n)}.</p>`;
      }
      if (exp === 2) {
        if (growth) {
          const add = 2 * n + 1;
          return `<p class="viz-formula">${H(n + 1, 2)} = ${H(n, 2)} + ${add} = ${n * n} + ${add} = ${(n + 1) ** 2}</p>
                  <p>Per passar del quadrat de costat ${n} al de costat ${n + 1} afegim una «L» de <b>${add}</b> quadrets (${n} + ${n} + 1).
                  Fixa't que sempre és un nombre <b>senar</b>: 3, 5, 7, 9… Per això 1 + 3 + 5 + … sempre dona un quadrat perfecte!</p>`;
        }
        const rows = Array(Math.max(shown, 0)).fill(n).join(' + ') || '0';
        const built = shown * n;
        return `<p class="viz-formula">${H(n, 2)} = ${n} · ${n} = ${total}</p>
                <p>Un quadrat de costat ${n}: ${n} files de ${n} ${unitWord(n)}.${shown < n ? ` Ara en portem: ${rows} = <b>${built}</b>` : ''}</p>
                <p class="muted">Per això ${H(n, 2)} es llegeix «${n} al quadrat»: és l'<b>àrea</b> d'un quadrat.</p>`;
      }
      const layer = n * n;
      const built = shown * layer;
      return `<p class="viz-formula">${H(n, 3)} = ${n} · ${n} · ${n} = ${total}</p>
              <p>Un cub d'aresta ${n}: ${n} capes de ${n} · ${n} = ${layer} ${unitWord(layer)}.${shown < n ? ` Ara en portem ${shown}: ${Array(Math.max(shown, 0)).fill(layer).join(' + ') || '0'} = <b>${built}</b>` : ''}</p>
              <p class="muted">Per això ${H(n, 3)} es llegeix «${n} al cub»: és el <b>volum</b> d'un cub.</p>`;
    }

    function strip() {
      const max = MAX[exp] > 10 ? 10 : MAX[exp];
      let html = '';
      for (let i = 1; i <= max; i++) {
        html += `<button type="button" class="strip-item ${i === n ? 'is-on' : ''}" data-n="${i}">
                   <span>${H(i, exp)}</span><b>${quiz && i === n ? '?' : i ** exp}</b></button>`;
      }
      return html;
    }

    function render() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.classList.toggle('is-cube', exp === 3);
      if (exp === 1) drawLine(svg, n, shown);
      else if (exp === 2) drawSquare(svg, n, shown, growth && !quiz);
      else drawCube(svg, n, shown);

      $('.js-n').textContent = n;
      range.value = n;
      range.max = exp === 3 ? 8 : 10;
      container.querySelectorAll('.seg button').forEach((b) => {
        const on = Number(b.dataset.exp) === exp;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on);
      });
      const gBtn = $('.js-growth');
      gBtn.hidden = exp !== 2;
      gBtn.classList.toggle('is-on', growth);
      $('.viz-info').innerHTML = info();
      $('.viz-strip').innerHTML = strip();
      $('.viz-quiz').hidden = !quiz;
      $('.js-quiz-unit').textContent = exp === 3 ? 'cubets' : 'quadrets';
      container.querySelectorAll('.strip-item').forEach((b) => b.addEventListener('click', () => setN(Number(b.dataset.n))));
    }

    function setN(v) {
      stopAnim();
      quiz = null;
      n = Math.max(1, Math.min(exp === 3 ? 8 : 10, v));
      shown = n;
      render();
    }

    container.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => {
      stopAnim();
      quiz = null;
      exp = Number(b.dataset.exp);
      if (exp === 3 && n > 8) n = 8;
      shown = n;
      growth = false;
      render();
    }));

    range.addEventListener('input', () => setN(Number(range.value)));

    $('.js-build').addEventListener('click', () => {
      stopAnim();
      quiz = null;
      growth = false;
      shown = 0;
      render();
      timer = setInterval(() => {
        shown++;
        render();
        if (shown >= n) stopAnim();
      }, exp === 3 ? 700 : 450);
    });

    $('.js-growth').addEventListener('click', () => {
      stopAnim();
      quiz = null;
      growth = !growth;
      if (growth && n > 9) n = 9;
      shown = n;
      render();
    });

    $('.js-quiz').addEventListener('click', () => {
      stopAnim();
      growth = false;
      if (exp === 1) exp = 2;
      n = U.randInt(3, exp === 3 ? 6 : 9);
      shown = n;
      quiz = { n, exp };
      render();
      $('.js-quiz-msg').textContent = '';
      const g = $('.js-guess');
      g.value = '';
      g.focus();
    });

    $('.js-quiz-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!quiz) return;
      const guess = U.parseNumber($('.js-guess').value);
      const total = quiz.n ** quiz.exp;
      const msg = $('.js-quiz-msg');
      if (Number.isNaN(guess)) {
        msg.textContent = 'Escriu un nombre.';
      } else if (guess === total) {
        quiz = null;
        render();
        $('.viz-info').insertAdjacentHTML('afterbegin', `<p class="ok-banner">Correcte! ${H(n, exp)} = ${total} ✓</p>`);
      } else if (guess === n * exp) {
        msg.innerHTML = `Compte: has fet ${n} · ${exp}. Però hi ha ${exp === 3 ? `${n} capes de ${n} · ${n}` : `${n} files de ${n}`}. Torna-ho a provar!`;
      } else {
        msg.textContent = guess < total ? 'N\'hi ha més. Torna-ho a provar!' : 'N\'hi ha menys. Torna-ho a provar!';
      }
    });

    render();
    return stopAnim;
  }

  ML.potencies.visual = { mount };
})(window.MathLab);
