/* Visualització «Producte i quocient, pas a pas»: l'explicació avança amb «Següent» i cada pas s'anima.
   Producte: els factors es despleguen i es compten (3 + 4 = 7). Quocient: es ratllen per parelles i es
   compten els que queden (5 − 3 = 2). Al final, «Recorda» i l'error típic (catàleg d'errors del tema).
   Un pas = quins elements es veuen (data-from / data-to / data-gone-from) + l'animació d'entrada quan s'hi
   arriba endavant (Web Animations API). Enrere no s'anima: es dibuixa l'estat. Amb prefers-reduced-motion,
   cap animació. No toca el DOM en carregar-se (el test executa aquest fitxer). */
window.MathLab = window.MathLab || {};
window.MathLab.potencies = window.MathLab.potencies || {};

(function (ML) {
  'use strict';

  const H = ML.utils.pw;
  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // entrades: arrenquen ràpid i aterren suau

  // Factors «2 · 2 · …»: cada 2 en un .pap-f; amb `cut`, cadascun dins d'un .pap-cut amb la seva ratlla.
  const twos = (n, cut) => Array.from({ length: n }, (_, i) => {
    const f = cut ? '<span class="pap-cut"><span class="pap-f">2</span><span class="pap-slash"></span></span>' : '<span class="pap-f">2</span>';
    return f + (i < n - 1 ? '<span class="pap-op">·</span>' : '');
  }).join('');

  const brace = (from, to, label) => {
    const range = `data-from="${from}"${to === undefined ? '' : ` data-to="${to}"`}`;
    return `<span class="pap-brace" ${range}></span><span class="pap-blabel" ${range}>${label}</span>`;
  };

  const recorda = (from, text, formula) => `
    <section class="panel tip-card pap-note" data-from="${from}">
      <span class="tip-icon"><span aria-hidden="true" class="ico">auto_awesome</span></span>
      <div><h3>Recorda</h3><div class="theory-body"><p>${text}</p><div class="formula">${formula}</div></div></div>
    </section>`;

  const compte = (from, text) => `<p class="warn pap-note" data-from="${from}"><b>Compte!</b> ${text}</p>`;

  const TEMES = {
    producte: {
      tab: 'Producte',
      escena: `
        <div class="pap-math pap-big" data-from="0">${H(2, 3)}<span class="pap-op">·</span>${H(2, 4)}</div>
        <div class="pap-math pap-mid pap-row" data-from="1">
          <span class="pap-grp" id="pap-p-all">
            <span class="pap-grp">${twos(3)}${brace(1, 1, '3 vegades')}</span><span class="pap-op">·</span><span class="pap-grp">${twos(4)}${brace(1, 1, '4 vegades')}</span>
            ${brace(2, undefined, '3 + 4 = 7 vegades')}
          </span>
        </div>
        <div class="pap-math pap-big" data-from="3">${H(2, '3+4')}<span class="pap-op">=</span>${H(2, 7)}</div>`,
      passos: [
        `Volem escriure ${H(2, 3)} · ${H(2, 4)} com <b>una sola potència</b>.`,
        `Cada potència és una multiplicació de factors iguals: ${H(2, 3)} són <b>tres</b> 2, i ${H(2, 4)}, <b>quatre</b>.`,
        'Ara és una sola multiplicació: el 2 hi surt <b>3 + 4 = 7</b> vegades.',
        `Per tant, ${H(2, 3)} · ${H(2, 4)} = ${H(2, 7)}.`,
        'Això passa sempre que les bases són iguals.',
        'I l\'error més típic…',
      ],
      notes: recorda(4, 'Per multiplicar potències de la <b>mateixa base</b>, es deixa la base i se <b>sumen</b> els exponents.', `${H('a', 'm')} · ${H('a', 'n')} = ${H('a', 'm+n')}`)
        + compte(5, `${H(2, 3)} · ${H(2, 4)} no és ${H(2, 12)}: els exponents se sumen, no es multipliquen.`),
      entra: {
        1: (r) => volen(r, r.querySelector('.pap-big'), r.querySelectorAll('.pap-row .pap-f')),
        2: (r) => r.querySelectorAll('#pap-p-all > .pap-brace, #pap-p-all > .pap-blabel').forEach((el) => fade(el)),
        3: (r) => puja(r.querySelectorAll('.pap-big')[1]),
        4: (r) => puja(r.querySelector('.tip-card')),
        5: (r) => puja(r.querySelector('.warn')),
      },
    },

    quocient: {
      tab: 'Quocient',
      escena: `
        <div class="pap-math pap-big" data-from="0">${H(2, 5)}<span class="pap-op">:</span>${H(2, 3)}</div>
        <div class="pap-math pap-mid pap-row" data-from="1">
          <span class="pap-frac">
            <span class="pap-num">
              <span class="pap-gone" data-gone-from="3">${twos(3, true)}<span class="pap-op">·</span></span><span class="pap-grp" id="pap-q-rem">${twos(2)}${brace(3, undefined, '5 − 3 = 2 vegades')}</span>
            </span>
            <span class="pap-bar" data-gone-from="3"></span>
            <span class="pap-den" data-gone-from="3">${twos(3, true)}</span>
          </span>
        </div>
        <div class="pap-math pap-big" data-from="4">${H(2, '5−3')}<span class="pap-op">=</span>${H(2, 2)}</div>`,
      passos: [
        `Volem escriure ${H(2, 5)} : ${H(2, 3)} com <b>una sola potència</b>.`,
        'Ho escrivim com una fracció i despleguem les potències: <b>cinc</b> 2 a dalt i <b>tres</b> a baix.',
        'Cada 2 de baix se simplifica amb un 2 de dalt.',
        'En queden <b>dos</b>: 5 − 3 = 2.',
        `Per tant, ${H(2, 5)} : ${H(2, 3)} = ${H(2, 2)}.`,
        'Això passa sempre que les bases són iguals (i no són 0).',
        'I l\'error més típic…',
      ],
      notes: recorda(5, 'Per dividir potències de la <b>mateixa base</b>, es deixa la base i es <b>resten</b> els exponents.', `${H('a', 'm')} : ${H('a', 'n')} = ${H('a', 'm−n')}`)
        + compte(6, `${H(2, 6)} : ${H(2, 3)} no és ${H(2, 2)}: els exponents es resten, no es divideixen.`),
      flip: { 3: '#pap-q-rem' }, // pas on els 2 que queden canvien de lloc: s'anima amb FLIP
      estat: (r, n) => r.querySelectorAll('.pap-cut').forEach((c) => c.classList.toggle('is-cut', n >= 2)),
      entra: {
        1: (r) => {
          const big = r.querySelector('.pap-big');
          volen(r, big, r.querySelectorAll('.pap-num .pap-f'));
          volen(r, big, r.querySelectorAll('.pap-den .pap-f'), 120);
          anima(r.querySelector('.pap-bar'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { delay: 100 });
        },
        2: (r) => {
          // Per parelles: el 1r de dalt amb el 1r de baix, i així.
          const dalt = r.querySelectorAll('.pap-num .pap-cut');
          const baix = r.querySelectorAll('.pap-den .pap-cut');
          [0, 1, 2].forEach((i) => [dalt[i], baix[i]].forEach((c) => {
            anima(c.querySelector('.pap-slash'), [{ transform: 'rotate(-55deg) scaleX(0)' }, { transform: 'rotate(-55deg) scaleX(1)' }], { duration: 300, delay: 120 + i * 320 });
            anima(c.querySelector('.pap-f'), [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0.28 }], { duration: 900, delay: 120 + i * 320, easing: 'linear' });
          }));
        },
        3: (r) => r.querySelectorAll('#pap-q-rem > .pap-brace, #pap-q-rem > .pap-blabel').forEach((el) => fade(el, 350)),
        4: (r) => puja(r.querySelectorAll('.pap-big')[1]),
        5: (r) => puja(r.querySelector('.tip-card')),
        6: (r) => puja(r.querySelector('.warn')),
      },
    },
  };

  // ── Animacions (cap si l'usuari prefereix menys moviment) ─────────────────────
  const quiet = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anima = (el, frames, opts) => (el && !quiet() ? el.animate(frames, { duration: 450, easing: EASE, fill: 'backwards', ...opts }) : null);
  const puja = (el) => anima(el, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 500 });
  const fade = (el, delay = 0) => anima(el, [{ opacity: 0 }, { opacity: 1 }], { delay });

  // Els factors surten volant de la potència de dalt fins al seu lloc, escalonats.
  function volen(root, from, factors, delay = 0) {
    if (quiet()) return;
    const o = from.getBoundingClientRect();
    factors.forEach((f, i) => {
      const r = f.getBoundingClientRect();
      const dx = o.left + o.width / 2 - (r.left + r.width / 2);
      const dy = o.top + o.height / 2 - (r.top + r.height / 2);
      f.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.6)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 520, delay: delay + i * 55, easing: EASE, fill: 'backwards' });
    });
    root.querySelectorAll('.pap-row .pap-op').forEach((op) => anima(op, [{ opacity: 0 }, { opacity: 1 }], { delay: delay + 250 }));
  }

  // ── Muntatge ─────────────────────────────────────────────────────────────────
  /** opts.tema: 'producte' (per defecte), 'quocient' o 'resum'. Retorna la funció de neteja. */
  function mount(container, opts = {}) {
    container.innerHTML = `
      <div class="seg pap-tabs" role="tablist" aria-label="Apartat">
        <button type="button" role="tab" data-tema="producte">Producte</button>
        <button type="button" role="tab" data-tema="quocient">Quocient</button>
        <button type="button" role="tab" data-tema="resum">Resum</button>
      </div>
      <div class="pap-body"></div>`;
    const body = container.querySelector('.pap-body');
    let tema = 'producte';
    let pas = 0;

    function obre(t) {
      tema = TEMES[t] || t === 'resum' ? t : 'producte';
      pas = 0;
      container.querySelectorAll('.pap-tabs button').forEach((b) => {
        const on = b.dataset.tema === tema;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', String(on));
      });
      if (tema === 'resum') return resum();
      const T = TEMES[tema];
      body.innerHTML = `
        <div class="panel pap-stage">${T.escena}</div>
        <p class="pap-text" aria-live="polite"></p>
        <div class="pap-notes">${T.notes}</div>
        <div class="pap-controls">
          <button type="button" class="btn js-prev"><span aria-hidden="true" class="ico">arrow_back</span>Anterior</button>
          <div class="pap-dots" aria-hidden="true">${T.passos.map(() => '<i></i>').join('')}</div>
          <button type="button" class="btn btn-3d btn-blue js-next"></button>
        </div>`;
      body.querySelector('.js-prev').onclick = () => va(pas - 1);
      body.querySelector('.js-next').onclick = () => (pas < T.passos.length - 1 ? va(pas + 1) : obre(tema === 'producte' ? 'quocient' : 'resum'));
      dibuixa(0, false);
    }

    function dibuixa(n, endavant) {
      const T = TEMES[tema];
      const flipEl = endavant && T.flip && T.flip[n] ? body.querySelector(T.flip[n]) : null;
      const abans = flipEl && flipEl.getBoundingClientRect();

      body.querySelectorAll('[data-from]').forEach((el) => {
        const from = Number(el.dataset.from);
        const to = el.dataset.to === undefined ? Infinity : Number(el.dataset.to);
        el.hidden = n < from || n > to;
      });
      body.querySelectorAll('[data-gone-from]').forEach((el) => { el.hidden = n >= Number(el.dataset.goneFrom); });
      if (T.estat) T.estat(body, n);

      if (flipEl && !quiet()) { // FLIP: des de la posició d'abans fins a la nova
        const ara = flipEl.getBoundingClientRect();
        flipEl.animate([{ transform: `translate(${abans.left - ara.left}px, ${abans.top - ara.top}px)` }, { transform: 'none' }], { duration: 500, easing: EASE });
      }
      if (endavant && T.entra[n]) T.entra[n](body);

      const last = T.passos.length - 1;
      body.querySelector('.pap-text').innerHTML = T.passos[n];
      body.querySelector('.js-prev').disabled = n === 0;
      const label = n < last ? 'Següent' : tema === 'producte' ? 'Dividir' : 'Resum'; // curts: al mòbil «Ara, dividir» es partia
      body.querySelector('.js-next').innerHTML = `${label}<span aria-hidden="true" class="ico">arrow_forward</span>`;
      body.querySelectorAll('.pap-dots i').forEach((d, i) => { d.className = i < n ? 'is-done' : i === n ? 'is-now' : ''; });
      if (endavant) puja(body.querySelector('.pap-text'));
    }

    function va(n) {
      if (n < 0 || n >= TEMES[tema].passos.length) return;
      const endavant = n === pas + 1;
      pas = n;
      dibuixa(n, endavant);
    }

    function resum() {
      body.innerHTML = `
        <div class="pap-sum">
          <section class="panel"><h3>Multiplicar</h3><div class="formula">${H('a', 'm')} · ${H('a', 'n')} = ${H('a', 'm+n')}</div><p>Es deixa la base i se <b>sumen</b> els exponents.</p></section>
          <section class="panel"><h3>Dividir</h3><div class="formula">${H('a', 'm')} : ${H('a', 'n')} = ${H('a', 'm−n')}</div><p>Es deixa la base i es <b>resten</b> els exponents (a ≠ 0).</p></section>
        </div>
        <div class="pap-controls"><span></span><button type="button" class="btn btn-3d btn-blue js-again"><span aria-hidden="true" class="ico">replay</span>Torna a començar</button></div>`;
      body.querySelectorAll('.pap-sum .panel').forEach((c, i) => anima(c, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { delay: i * 120, duration: 500 }));
      body.querySelector('.js-again').onclick = () => obre('producte');
    }

    const tecla = (e) => {
      if (tema === 'resum' || e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') body.querySelector('.js-next').click();
      if (e.key === 'ArrowLeft') va(pas - 1);
    };
    container.querySelectorAll('.pap-tabs button').forEach((b) => { b.onclick = () => obre(b.dataset.tema); });
    document.addEventListener('keydown', tecla);
    obre(opts.tema || 'producte');
    return () => document.removeEventListener('keydown', tecla);
  }

  ML.potencies.pasAPas = { mount };
})(window.MathLab);
