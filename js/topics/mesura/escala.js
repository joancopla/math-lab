/* Visualització: l'escala de les unitats.
 * La mateixa quantitat escrita a cada graó (km, hm, dam, m…). En tocar un graó, s'explica el canvi:
 * cap avall es multiplica (·10, ·100 o ·1.000 a cada graó) i cap amunt es divideix.
 * Els valors es guarden com a xifres · 10^exponent per no tenir errors de coma flotant.
 */
window.MathLab = window.MathLab || {};
window.MathLab.mesura = window.MathLab.mesura || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const S = ML.mesura.scales;
  const MAGS = [
    { id: 'long', name: 'Longitud', M: S.LONG, p: 1, starts: [[35, -1, 0], [125, 0, 3], [48, 0, 5], [7, 0, 3]] },
    { id: 'massa', name: 'Massa', M: S.MASSA, p: 1, starts: [[25, -1, 0], [750, 0, 3], [3, 0, 0]] },
    { id: 'cap', name: 'Capacitat', M: S.CAP, p: 1, starts: [[15, -1, 3], [250, 0, 6], [2, 0, 3]] },
    { id: 'sup', name: 'Superfície', M: S.SUP, p: 2, starts: [[3, 0, 3], [25, -1, 4], [450, 0, 5]] },
    { id: 'vol', name: 'Volum', M: S.VOL, p: 3, starts: [[2, 0, 3], [15, -1, 4], [500, 0, 5]] },
  ];

  /** Escriu m · 10^e amb coma decimal i punt de milers (com U.fmt), o null si és massa llarg. */
  function show(m, e) {
    let s = String(m);
    let dec = '';
    if (e >= 0) s += '0'.repeat(e);
    else {
      const k = -e;
      if (s.length <= k) s = '0'.repeat(k - s.length + 1) + s;
      dec = s.slice(s.length - k).replace(/0+$/, '');
      s = s.slice(0, s.length - k);
    }
    if (s.length + dec.length > 12) return null;
    const ip = s.length > 4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s;
    return ip + (dec ? `,${dec}` : '');
  }

  function mount(container) {
    let mag = MAGS[0];
    let m;
    let e;
    let cur; // valor = m · 10^e en la unitat cur
    let prev = null;

    container.innerHTML = `
      <div class="viz">
        <div class="viz-buttons es-mags">
          ${MAGS.map((x) => `<button type="button" class="btn btn-small" data-mag="${x.id}">${x.name}</button>`).join('')}
        </div>
        <div class="viz-stage es-stage">
          <div class="es-stairs"></div>
          <p class="es-legend muted"></p>
        </div>
        <div class="viz-buttons"><button type="button" class="btn btn-small btn-ghost js-new">🎲 Un altre nombre</button></div>
        <div class="viz-info" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);
    const stairs = $('.es-stairs');
    const valueAt = (j) => show(m, e + (j - cur) * mag.p);

    function start(x) {
      [m, e, cur] = x;
      prev = null;
      render();
    }

    function render() {
      const F = U.fmt(10 ** mag.p);
      const units = mag.M.units;
      container.querySelectorAll('[data-mag]').forEach((b) => b.classList.toggle('is-on', b.dataset.mag === mag.id));
      stairs.innerHTML = units.map((u, j) => {
        const v = valueAt(j);
        return `
          <button type="button" class="es-step ${j === cur ? 'is-cur' : ''} ${j === prev ? 'is-prev' : ''}" style="--h:${100 - j * 11}%;--i:${j}" data-j="${j}"
                  aria-label="${v ? `${v} ${u}` : u}">
            <span class="es-val">${v || '…'}</span>
            <span class="es-unit">${u}</span>
          </button>`;
      }).join('');
      $('.es-legend').innerHTML = `Cada graó cap avall: <b>· ${F}</b>. Cada graó cap amunt: <b>: ${F}</b>. Toca un graó per canviar d'unitat.`;
      let msg;
      if (prev === null) {
        msg = `Tenim <b>${valueAt(cur)} ${units[cur]}</b>. A cada graó hi ha la mateixa quantitat, escrita en una altra unitat.`;
      } else {
        const n = Math.abs(cur - prev);
        const down = cur > prev;
        const fac = U.fmt(10 ** (mag.p * n));
        msg = `${valueAt(prev)} ${units[prev]} = <b>${valueAt(cur) || '…'} ${units[cur]}</b>. ${down ? 'Baixes' : 'Puges'} ${n} ${n === 1 ? 'graó' : 'graons'}: `
          + `${down ? 'multiplica' : 'divideix'} per ${Array(n).fill(F).join(' · ')}${n > 1 ? ` = ${fac}` : ''}. `
          + (down ? 'La unitat és més petita, per això el nombre es fa més gran.' : 'La unitat és més gran, per això el nombre es fa més petit.');
      }
      $('.viz-info').innerHTML = `<p class="viz-formula">${valueAt(cur) || '…'} ${units[cur]}</p><p>${msg}</p>`;
    }

    stairs.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-j]');
      if (!b) return;
      const j = Number(b.dataset.j);
      if (j === cur) return;
      // El valor es manté: només canvia la unitat de referència.
      e += (j - cur) * mag.p;
      prev = cur;
      cur = j;
      render();
    });
    container.querySelectorAll('[data-mag]').forEach((b) => b.addEventListener('click', () => {
      mag = MAGS.find((x) => x.id === b.dataset.mag);
      start(mag.starts[0]);
    }));
    $('.js-new').addEventListener('click', () => {
      const opts = mag.starts.filter((x) => !(x[0] === m && x[2] === cur));
      start(U.pick(opts));
    });
    start(mag.starts[0]);
  }

  ML.mesura.escala = { mount };
})(window.MathLab);
