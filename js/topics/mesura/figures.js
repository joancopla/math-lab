/* Visualització: àrees de les figures planes sobre una quadrícula (cada quadret és 1 cm²).
 * Amb els controls es canvien les mides i es veu d'on surt cada fórmula:
 * el triangle és la meitat d'un rectangle, el paral·lelogram es pot convertir en un rectangle, etc.
 */
window.MathLab = window.MathLab || {};
window.MathLab.mesura = window.MathLab.mesura || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const C = 24; // costat d'un quadret (px)
  const GW = 14; // quadrets d'amplada
  const GH = 8; // quadrets d'altura
  const PAD = 6;

  const SHAPES = [
    { id: 'rect', name: 'Rectangle', params: [['b', 'base', 1, 12, 6], ['h', 'altura', 1, 7, 4]] },
    { id: 'tri', name: 'Triangle', params: [['b', 'base', 2, 12, 8], ['h', 'altura', 1, 7, 5]] },
    { id: 'para', name: 'Paral·lelogram', params: [['b', 'base', 2, 10, 6], ['h', 'altura', 1, 7, 4]] },
    { id: 'rombe', name: 'Rombe', params: [['D', 'diagonal gran', 2, 12, 8], ['d', 'diagonal petita', 2, 7, 6]] },
    { id: 'trap', name: 'Trapezi', params: [['B', 'base gran', 3, 12, 9], ['b', 'base petita', 1, 11, 4], ['h', 'altura', 1, 7, 4]] },
    { id: 'cercle', name: 'Cercle', params: [['r', 'radi', 1, 3, 3]] },
  ];

  const P = (x, y) => `${(PAD + x * C).toFixed(1)},${(PAD + (GH - y) * C).toFixed(1)}`;
  const polyPts = (pts, cls) => `<polygon class="${cls}" points="${pts.map(([x, y]) => P(x, y)).join(' ')}"/>`;

  function grid() {
    let s = '';
    for (let i = 0; i <= GW; i++) s += `<line class="fg-grid" x1="${PAD + i * C}" y1="${PAD}" x2="${PAD + i * C}" y2="${PAD + GH * C}"/>`;
    for (let j = 0; j <= GH; j++) s += `<line class="fg-grid" x1="${PAD}" y1="${PAD + j * C}" x2="${PAD + GW * C}" y2="${PAD + j * C}"/>`;
    return s;
  }

  /** Dibuix, fórmula i explicació de cada figura. */
  function draw(id, v) {
    const f = U.fmt;
    switch (id) {
      case 'rect': {
        const { b, h } = v;
        return {
          svg: polyPts([[1, 0], [1 + b, 0], [1 + b, h], [1, h]], 'fg-shape'),
          formula: `A = base · altura = ${b} · ${h} = <b>${b * h} cm²</b>`,
          text: `Compta els quadrets: hi ha ${h} ${h === 1 ? 'fila' : 'files'} de ${b}. En total, ${b * h} quadrets d'1 cm².`,
        };
      }
      case 'tri': {
        const { b, h } = v;
        const ax = 1 + Math.round(b * 0.35);
        return {
          svg: polyPts([[1, 0], [1 + b, 0], [1 + b, h], [1, h]], 'fg-ghost') + polyPts([[1, 0], [1 + b, 0], [ax, h]], 'fg-shape')
            + `<line class="fg-height" x1="${PAD + ax * C}" y1="${PAD + GH * C}" x2="${PAD + ax * C}" y2="${PAD + (GH - h) * C}"/>`,
          formula: `A = base · altura : 2 = ${b} · ${h} : 2 = <b>${f((b * h) / 2)} cm²</b>`,
          text: `El triangle ocupa just la meitat del rectangle de punts (${b} · ${h} = ${b * h} cm²). Per això es divideix entre 2.`,
        };
      }
      case 'para': {
        const { b, h } = v;
        const o = Math.min(2, h);
        return {
          svg: polyPts([[1, 0], [1 + b, 0], [1 + b + o, h], [1 + o, h]], 'fg-shape')
            + polyPts([[1 + b, 0], [1 + b + o, 0], [1 + b + o, h]], 'fg-ghost') + polyPts([[1, 0], [1 + o, 0], [1 + o, h]], 'fg-cut'),
          formula: `A = base · altura = ${b} · ${h} = <b>${b * h} cm²</b>`,
          text: `Talla el triangle de l'esquerra i posa'l a la dreta (la part de punts): tens un rectangle de ${b} · ${h}. Compte: l'altura és la vertical, no el costat inclinat.`,
        };
      }
      case 'rombe': {
        const { D, d } = v;
        const cx = 1 + D / 2;
        const cy = d / 2;
        return {
          svg: polyPts([[1, 0], [1 + D, 0], [1 + D, d], [1, d]], 'fg-ghost') + polyPts([[1, cy], [cx, d], [1 + D, cy], [cx, 0]], 'fg-shape')
            + `<line class="fg-height" x1="${PAD + C}" y1="${PAD + (GH - cy) * C}" x2="${PAD + (1 + D) * C}" y2="${PAD + (GH - cy) * C}"/>`
            + `<line class="fg-height" x1="${PAD + cx * C}" y1="${PAD + GH * C}" x2="${PAD + cx * C}" y2="${PAD + (GH - d) * C}"/>`,
          formula: `A = D · d : 2 = ${D} · ${d} : 2 = <b>${f((D * d) / 2)} cm²</b>`,
          text: `Les diagonals fan un rectangle de ${D} · ${d} = ${D * d} cm². El rombe n'ocupa la meitat: els quatre triangles de fora són iguals que els de dins.`,
        };
      }
      case 'trap': {
        const { B, h } = v;
        const b = Math.min(v.b, B - 1);
        const x0 = 1 + Math.floor((B - b) / 2);
        return {
          svg: polyPts([[1, 0], [1 + B, 0], [x0 + b, h], [x0, h]], 'fg-shape')
            + `<line class="fg-height" x1="${PAD + x0 * C}" y1="${PAD + GH * C}" x2="${PAD + x0 * C}" y2="${PAD + (GH - h) * C}"/>`,
          formula: `A = (B + b) · h : 2 = (${B} + ${b}) · ${h} : 2 = <b>${f(((B + b) * h) / 2)} cm²</b>`,
          text: `Si en poses un altre de cap per avall al costat, tens un paral·lelogram de base ${B} + ${b} = ${B + b} i altura ${h}. El trapezi n'és la meitat.${v.b !== b ? ' (La base petita ha de ser més curta que la gran.)' : ''}`,
        };
      }
      default: {
        const { r } = v;
        const cx = 1 + 4;
        const cy = GH / 2;
        const A = Math.round(3.14 * r * r * 100) / 100;
        return {
          svg: `<rect class="fg-ghost" x="${PAD + (cx - r) * C}" y="${PAD + (GH - cy - r) * C}" width="${2 * r * C}" height="${2 * r * C}"/>`
            + `<rect class="fg-cut" x="${PAD + cx * C}" y="${PAD + (GH - cy - r) * C}" width="${r * C}" height="${r * C}"/>`
            + `<circle class="fg-shape" cx="${PAD + cx * C}" cy="${PAD + (GH - cy) * C}" r="${r * C}"/>`
            + `<line class="fg-height" x1="${PAD + cx * C}" y1="${PAD + (GH - cy) * C}" x2="${PAD + (cx + r) * C}" y2="${PAD + (GH - cy) * C}"/>`,
          formula: `A = 3,14 · r · r = 3,14 · ${r} · ${r} = <b>${f(A)} cm²</b>`,
          text: `El quadrat groc fa r · r = ${r * r} cm². El cercle n'ocupa una mica més de 3 (exactament 3,14 vegades). La vora fa 2 · 3,14 · ${r} = ${f(Math.round(6.28 * r * 100) / 100)} cm.`,
        };
      }
    }
  }

  function mount(container) {
    let shape = SHAPES[0];
    const vals = {};
    SHAPES.forEach((s) => { vals[s.id] = Object.fromEntries(s.params.map((p) => [p[0], p[4]])); });

    container.innerHTML = `
      <div class="viz">
        <div class="viz-buttons fg-shapes">
          ${SHAPES.map((s) => `<button type="button" class="btn btn-small" data-shape="${s.id}">${s.name}</button>`).join('')}
        </div>
        <div class="viz-stage fg-stage">
          <svg class="fg-svg" viewBox="0 0 ${GW * C + 2 * PAD} ${GH * C + 2 * PAD}" role="img" aria-label="Figura sobre una quadrícula de centímetres"></svg>
        </div>
        <div class="fg-sliders"></div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);

    function sliders() {
      $('.fg-sliders').innerHTML = shape.params.map(([k, label, lo, hi]) => `
        <label class="fg-slider">
          <span>${label}: <b class="js-v-${k}">${vals[shape.id][k]} cm</b></span>
          <input type="range" min="${lo}" max="${hi}" step="1" value="${vals[shape.id][k]}" data-k="${k}">
        </label>`).join('');
      container.querySelectorAll('.fg-sliders input').forEach((inp) => inp.addEventListener('input', () => {
        vals[shape.id][inp.dataset.k] = Number(inp.value);
        $(`.js-v-${inp.dataset.k}`).textContent = `${inp.value} cm`;
        render();
      }));
    }

    function render() {
      container.querySelectorAll('[data-shape]').forEach((b) => b.classList.toggle('is-on', b.dataset.shape === shape.id));
      const d = draw(shape.id, vals[shape.id]);
      $('.fg-svg').innerHTML = grid() + d.svg;
      $('.viz-info').innerHTML = `<p class="viz-formula">${d.formula}</p><p>${d.text}</p>`;
    }

    container.querySelectorAll('[data-shape]').forEach((b) => b.addEventListener('click', () => {
      shape = SHAPES.find((s) => s.id === b.dataset.shape);
      sliders();
      render();
    }));
    sliders();
    render();
  }

  ML.mesura.figures = { mount };
})(window.MathLab);
