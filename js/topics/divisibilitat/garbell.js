/* Visualització: el garbell d'Eratòstenes (1–100), pas a pas. */
window.MathLab = window.MathLab || {};
window.MathLab.divisibilitat = window.MathLab.divisibilitat || {};

(function (ML) {
  'use strict';

  const SIEVE = [2, 3, 5, 7];
  const N = 100;

  function mount(container) {
    const M = ML.divisibilitat.math;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let step = 0; // 0: inici · 1: ratllem l'1 · 2..5: primers 2, 3, 5, 7 · 6: final
    let crossed = {}; // nombre → primer que l'ha ratllat (o 1)
    let primes = new Set();
    let timers = [];

    container.innerHTML = `
      <div class="viz">
        <div class="viz-buttons">
          <button type="button" class="btn btn-3d btn-blue js-next">Comença <span aria-hidden="true" class="ico">arrow_forward</span></button>
          <button type="button" class="btn btn-small btn-ghost js-reset"><span aria-hidden="true" class="ico">replay</span>Torna a començar</button>
        </div>
        <div class="viz-info sieve-info" aria-live="polite"></div>
        <div class="sieve" role="grid" aria-label="Nombres de l'1 al 100"></div>
        <p class="muted sieve-tip">Toca qualsevol nombre per veure'n els divisors.</p>
        <div class="sieve-detail" aria-live="polite"></div>
      </div>`;

    const $ = (s) => container.querySelector(s);
    const grid = $('.sieve');
    grid.innerHTML = Array.from({ length: N }, (_, i) => `<button type="button" class="sv" data-n="${i + 1}">${i + 1}</button>`).join('');
    const cell = (n) => grid.children[n - 1];

    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function paint(n) {
      const c = cell(n);
      c.className = 'sv';
      if (primes.has(n)) c.classList.add('is-prime');
      else if (crossed[n]) c.classList.add('is-out', `by-${crossed[n]}`);
    }
    const paintAll = () => { for (let n = 1; n <= N; n++) paint(n); };

    const TEXT = [
      'El <b>garbell d\'Eratòstenes</b> és un truc de fa més de 2000 anys per trobar els nombres primers: anem ratllant els múltiples i els que queden són primers.',
      'L\'<b>1</b> no és primer (només té un divisor), així que el ratllem primer de tot.',
      'El <b>2</b> és primer. Ratllem tots els seus múltiples: 4, 6, 8, 10… Cap d\'ells pot ser primer, perquè tots es poden dividir per 2.',
      'El primer nombre que no està ratllat és el <b>3</b>: és primer. Ratllem els seus múltiples (alguns, com el 6, ja ho estaven).',
      'El 4 ja està ratllat. El següent és el <b>5</b>: primer. Ratllem-ne els múltiples: tots acaben en 0 o en 5.',
      'El següent és el <b>7</b>. Ratllem els seus múltiples. El primer que encara no estava ratllat és el 49 = 7 · 7.',
      'Ja hem acabat! El següent primer seria l\'11, però 11 · 11 = 121 ja passa de 100: tots els seus múltiples més petits ja estan ratllats. <b>Els que queden són els 25 primers fins al 100.</b>',
    ];

    function render() {
      $('.sieve-info').innerHTML = `<p>${TEXT[step]}</p>${step === 6 ? `<p class="viz-formula sieve-list">${[...primes].sort((a, b) => a - b).join(', ')}</p>` : ''}`;
      const next = $('.js-next');
      next.hidden = step === 6;
      next.innerHTML = step === 0 ? 'Comença <span aria-hidden="true" class="ico">arrow_forward</span>'
        : `Següent pas <span aria-hidden="true" class="ico">arrow_forward</span>`;
    }

    function advance() {
      clearTimers();
      paintAll();
      step++;
      if (step === 1) {
        crossed[1] = 1;
        paint(1);
      } else if (step >= 2 && step <= 5) {
        const p = SIEVE[step - 2];
        primes.add(p);
        paint(p);
        const todo = [];
        for (let m = 2 * p; m <= N; m += p) if (!crossed[m]) todo.push(m);
        todo.forEach((m, i) => {
          const go = () => { crossed[m] = p; paint(m); cell(m).classList.add('pop'); };
          if (reduce) go();
          else timers.push(setTimeout(go, 60 * i));
        });
      } else if (step === 6) {
        for (let n = 2; n <= N; n++) if (!crossed[n]) primes.add(n);
        paintAll();
      }
      render();
    }

    function reset() {
      clearTimers();
      step = 0;
      crossed = {};
      primes = new Set();
      paintAll();
      render();
      $('.sieve-detail').innerHTML = '';
    }

    grid.addEventListener('click', (e) => {
      const b = e.target.closest('.sv');
      if (!b) return;
      const n = Number(b.dataset.n);
      const D = M.divisors(n);
      let what;
      if (n === 1) what = 'només té un divisor: no és ni primer ni compost.';
      else if (M.isPrime(n)) what = `té exactament dos divisors (1 i ${n}): és <b>primer</b>.`;
      else what = `té ${D.length} divisors: ${D.join(', ')}. És <b>compost</b>: ${n} = ${M.fHtml(M.factorize(n))}.`;
      $('.sieve-detail').innerHTML = `<p><b class="sieve-n">${n}</b> ${what}</p>`;
    });

    $('.js-next').addEventListener('click', advance);
    $('.js-reset').addEventListener('click', reset);
    reset();
    return clearTimers;
  }

  ML.divisibilitat.garbell = { mount };
})(window.MathLab);
