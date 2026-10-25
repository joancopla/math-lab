/* Pinta un exercici (de qualsevol tema), recull la resposta, la corregeix i mostra el feedback.
 *
 * ML.mountExercise(container, ex, {
 *   topic,                 // id del tema (per al catàleg d'errors)
 *   mode,                  // 'practice' (permet reintentar i pistes) | 'challenge' (un sol intent)
 *   onFirstAnswer(result), // es crida una vegada amb { correct, errorId }
 *   onNext(),              // l'alumna vol l'exercici següent
 *   feedbackHost?,         // element on pintar el feedback (p. ex. una columna lateral); per defecte, sota l'exercici
 *   rule?,                 // regla de l'apartat (HTML), es recorda quan hi ha un error
 *   nextLabel?,            // text del botó per passar a l'exercici següent
 * })
 */
(function (ML) {
  'use strict';

  const U = ML.utils;

  const PRAISE = ['Molt bé!', 'Perfecte!', 'Correcte!', 'Genial!', 'Ho has clavat!', 'Fantàstic!', 'Així es fa!'];
  const PRAISE_RETRY = ['Ara sí!', 'Aquesta vegada sí!', 'Molt bé, ho has corregit!'];

  function inputMarkup(ex) {
    const t = ex.input.type;
    if (t === 'number') {
      const input = `<input class="ans-number" type="text" inputmode="${ex.input.decimal ? 'decimal' : 'numeric'}" autocomplete="off" spellcheck="false"
                aria-label="La teva resposta${ex.input.unit ? ` (en ${ex.input.unit})` : ''}" placeholder="?">`;
      // Amb input.unit, la unitat de la resposta (m, kg, min…) es mostra al costat de la casella.
      const field = ex.input.unit ? `<span class="ans-with-unit">${input}<span class="ans-unit" aria-hidden="true">${ex.input.unit}</span></span>` : input;
      // Amb enters, un botó per canviar el signe: el teclat numèric del mòbil sovint no té el «−».
      return `<span class="ans-label"><span aria-hidden="true" class="ico">edit_note</span>La teva resposta:</span>
              ${ex.input.signed
                ? `<span class="ans-signed"><button type="button" class="btn-sign js-sign" aria-label="Canvia el signe (positiu o negatiu)">+/−</button>${field}</span>`
                : field}`;
    }
    if (t === 'power') {
      return `<span class="ans-label"><span aria-hidden="true" class="ico">edit_note</span>La teva potència:</span>
              <span class="ans-power">
                <span class="ans-field"><input class="ans-base" type="text" ${typeof ex.answer.base === 'number' ? 'inputmode="numeric"' : ''} autocomplete="off" spellcheck="false" aria-label="Base" placeholder="a"><span class="ans-badge">Base</span></span>
                <span class="ans-field is-exp"><input class="ans-exp" type="text" inputmode="numeric" autocomplete="off" aria-label="Exponent" placeholder="n"><span class="ans-badge">Exponent</span></span>
              </span>`;
    }
    if (t === 'fraction') {
      return `<span class="ans-label"><span aria-hidden="true" class="ico">edit_note</span>La teva fracció:</span>
              <span class="ans-frac">
                <input class="ans-num" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="Numerador (el de dalt)" placeholder="?">
                <span class="ans-frac-bar" aria-hidden="true"></span>
                <input class="ans-den" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="Denominador (el de baix)" placeholder="?">
              </span>`;
    }
    if (t === 'choice') {
      return `<div class="choices">${ex.input.options
        .map((o) => `<button type="button" class="choice" data-value="${U.esc(o.value)}">${o.label}</button>`)
        .join('')}</div>`;
    }
    return '';
  }

  ML.mountExercise = function (container, ex, opts) {
    const mode = opts.mode || 'practice';
    const type = ex.input.type;
    let attempts = 0;
    let done = false;

    container.innerHTML = `
      <div class="ex-card ${type === 'choice' ? 'is-choice' : ''}">
        <div class="ex-prompt">${ex.prompt}</div>
        <form class="ex-form" novalidate>
          <div class="ex-input">${inputMarkup(ex)}</div>
          <div class="ex-actions">
            ${type !== 'choice' ? '<button type="submit" class="btn btn-3d btn-blue btn-xl btn-grow"><span aria-hidden="true" class="ico fill">task_alt</span>Comprova<span class="hide-sm"> la resposta</span></button>' : ''}
            ${mode === 'practice' && ex.hint ? '<button type="button" class="btn btn-3d btn-yellow btn-xl js-hint"><span aria-hidden="true" class="ico fill">lightbulb</span>Una pista!</button>' : ''}
            ${mode === 'exam' ? '<button type="button" class="btn btn-ghost btn-xl js-skip">No ho sé</button>' : ''}
          </div>
          <p class="ex-warn" hidden>Escriu la teva resposta abans de comprovar.</p>
        </form>
        <div class="ex-hint" hidden></div>
        <div class="ex-feedback" aria-live="polite"></div>
      </div>`;

    const card = container.querySelector('.ex-card');
    const form = card.querySelector('.ex-form');
    const feedback = opts.feedbackHost || card.querySelector('.ex-feedback');
    if (opts.feedbackHost) opts.feedbackHost.innerHTML = '';
    const warn = card.querySelector('.ex-warn');
    const inputs = Array.from(form.querySelectorAll('input'));
    let choiceValue = null;

    // Potència: "^" o espai a la base salta a l'exponent.
    if (type === 'power') {
      const [base, exp] = inputs;
      base.addEventListener('keydown', (e) => {
        if (e.key === '^' || e.key === ' ') {
          e.preventDefault();
          exp.focus();
        }
      });
      exp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && exp.value === '') base.focus();
      });
    }

    // Fracció: "/" al numerador salta al denominador.
    if (type === 'fraction') {
      const [num, den] = inputs;
      num.addEventListener('keydown', (e) => {
        if (e.key === '/' || (e.key === 'Enter' && num.value.trim() && !den.value.trim())) {
          e.preventDefault();
          den.focus();
        }
      });
      den.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && den.value === '') num.focus();
      });
    }

    const signBtn = form.querySelector('.js-sign');
    if (signBtn) {
      signBtn.addEventListener('click', () => {
        const inp = inputs[0];
        const v = inp.value.trim();
        inp.value = /^[-−–]/.test(v) ? v.replace(/^[-−–]\s*/, '') : `−${v.replace(/^\+/, '')}`;
        inp.focus();
      });
    }

    if (type === 'choice') {
      form.querySelectorAll('.choice').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (done || btn.disabled) return;
          choiceValue = btn.dataset.value;
          submit();
        });
      });
    }

    const hintBtn = form.querySelector('.js-hint');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        const h = card.querySelector('.ex-hint');
        h.innerHTML = `<span aria-hidden="true" class="ico fill">lightbulb</span><span><b>Pista:</b> ${ex.hint}</span>`;
        h.hidden = false;
        hintBtn.disabled = true;
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submit();
    });

    // Examen: «No ho sé» compta com a resposta en blanc i passa a la pregunta següent.
    const skipBtn = form.querySelector('.js-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        if (done) return;
        done = true;
        if (opts.onFirstAnswer) opts.onFirstAnswer({ correct: false, errorId: null, msg: null, skipped: true });
        if (opts.onNext) opts.onNext();
      });
    }

    function readRaw() {
      if (type === 'number') return inputs[0].value;
      if (type === 'power') return { base: inputs[0].value, exp: inputs[1].value };
      if (type === 'fraction') return { num: inputs[0].value, den: inputs[1].value };
      return choiceValue;
    }

    /** Diu exactament què falta, en lloc d'un missatge genèric. */
    function invalidMessage() {
      if (type === 'number') {
        return inputs[0].value.trim() === ''
          ? 'Escriu la teva resposta abans de comprovar.'
          : `Escriu la resposta només amb xifres (per exemple, ${ex.input.decimal ? '3,25' : ex.input.signed ? '−12' : '125'}).`;
      }
      if (type === 'power') {
        if (inputs[0].value.trim() === '') return 'Falta la base: és el nombre gran de baix.';
        if (inputs[1].value.trim() === '') return "Falta l'exponent: és el nombre petit de dalt.";
        return "L'exponent s'ha d'escriure amb xifres.";
      }
      if (type === 'fraction') {
        if (inputs[0].value.trim() === '') return 'Falta el numerador: és el nombre de dalt.';
        if (inputs[1].value.trim() === '') return 'Falta el denominador: és el nombre de baix.';
        if (U.parseNumber(inputs[1].value) === 0) return 'El denominador no pot ser 0.';
        return 'Escriu el numerador i el denominador només amb xifres.';
      }
      return 'Tria una de les opcions.';
    }

    function setLocked(locked) {
      inputs.forEach((i) => (i.disabled = locked));
      if (signBtn) signBtn.disabled = locked;
      const sub = form.querySelector('[type="submit"]');
      if (sub) sub.disabled = locked;
    }

    function submit() {
      if (done) return;
      const res = ML.checker.evaluate(ex, readRaw());
      if (!res.valid) {
        warn.textContent = invalidMessage();
        warn.hidden = false;
        card.classList.remove('shake');
        void card.offsetWidth;
        card.classList.add('shake');
        return;
      }
      warn.hidden = true;
      attempts++;
      setLocked(true);
      // Examen: no es mostra si és correcte; es desa i es passa a la pregunta següent.
      if (mode === 'exam') {
        done = true;
        if (opts.onFirstAnswer) {
          opts.onFirstAnswer({ correct: res.correct, errorId: res.correct ? null : res.trap.id, msg: res.correct ? null : res.trap.msg, value: res.value });
        }
        if (opts.onNext) opts.onNext();
        return;
      }
      card.classList.toggle('is-right', res.correct);
      card.classList.toggle('is-wrong', !res.correct);
      if (type === 'choice') markChoices(res);
      if (res.correct) showCorrect();
      else showWrong(res.trap);
      // Després de pintar el feedback, perquè qui escolta pugui retocar-lo (p. ex. el botó final del repte).
      if (attempts === 1 && opts.onFirstAnswer) {
        opts.onFirstAnswer({
          correct: res.correct,
          errorId: res.correct ? null : res.trap.id,
          msg: res.correct ? null : res.trap.msg,
        });
      }
    }

    function markChoices(res) {
      form.querySelectorAll('.choice').forEach((b) => {
        if (b.dataset.value === choiceValue) b.classList.add(res.correct ? 'is-right' : 'is-wrong');
        if (res.correct || mode === 'challenge') {
          if (b.dataset.value === String(ex.answer)) b.classList.add('is-right');
        }
        b.disabled = true;
      });
    }

    function nextButton(label = opts.nextLabel || 'Següent') {
      return `<button type="button" class="btn btn-3d btn-green btn-xl btn-block js-next">${label}<span aria-hidden="true" class="ico">arrow_forward</span></button>`;
    }

    function wireNext() {
      const nb = feedback.querySelector('.js-next');
      if (nb) {
        nb.addEventListener('click', () => opts.onNext && opts.onNext());
        nb.focus({ preventScroll: true });
      }
      reveal();
    }

    /** A mòbil el feedback pot quedar fora de la pantalla: el portem a la vista. */
    function reveal() {
      const r = feedback.getBoundingClientRect();
      if (r.top < 60 || r.bottom > window.innerHeight) {
        feedback.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    function showCorrect() {
      done = true;
      const praise = U.pick(attempts === 1 ? PRAISE : PRAISE_RETRY);
      feedback.innerHTML = `
        <div class="fb fb-ok">
          <span class="fb-tag"><span aria-hidden="true" class="ico fill">stars</span>Resposta correcta</span>
          <div class="fb-hero">
            <span class="fb-icon"><span aria-hidden="true" class="ico fill">sentiment_very_satisfied</span></span>
            <h3 class="fb-title">${praise}</h3>
          </div>
          ${ex.solution ? `<div class="fb-solution">${ex.solution}</div>` : ''}
          <div class="fb-actions">${nextButton()}</div>
        </div>`;
      wireNext();
    }

    function showWrong(trap) {
      const info = ML.topics.errorInfo(opts.topic, trap.id);
      const known = trap.id !== 'altre';
      const canRetry = mode === 'practice';
      feedback.innerHTML = `
        <div class="fb fb-ko">
          <span class="fb-tag"><span aria-hidden="true" class="ico">psychology</span>${known ? 'Analitzem què ha passat' : 'Revisem-ho'}</span>
          <div class="fb-row">
            <span class="fb-icon"><span aria-hidden="true" class="ico">${known ? 'search' : 'close'}</span></span>
            <div>
              <h3 class="fb-title">${known ? info.title : 'No és correcte'}</h3>
              <p class="fb-msg">${trap.msg}</p>
            </div>
          </div>
          ${known && opts.rule ? `<div class="fb-rule"><span class="fb-rule-label"><span aria-hidden="true" class="ico">lightbulb_circle</span>Recorda la regla</span><span class="fb-rule-math">${opts.rule}</span></div>` : ''}
          <div class="fb-solution" ${canRetry ? 'hidden' : ''}><b>Solució:</b> ${ex.solution || ''}</div>
          <div class="fb-actions">
            ${canRetry
              ? `<button type="button" class="btn btn-3d btn-green btn-xl btn-block js-retry"><span aria-hidden="true" class="ico">replay</span>Torna-ho a provar</button>
                 <button type="button" class="btn btn-link js-show"><span aria-hidden="true" class="ico">visibility</span>Mostra la solució i continua</button>`
              : nextButton('Continua')}
          </div>
        </div>`;
      if (!canRetry) {
        done = true;
        wireNext();
        return;
      }
      const retry = feedback.querySelector('.js-retry');
      retry.focus({ preventScroll: true });
      reveal();
      retry.addEventListener('click', () => {
        feedback.innerHTML = '';
        card.classList.remove('is-wrong');
        setLocked(false);
        if (type === 'choice') {
          form.querySelectorAll('.choice').forEach((b) => {
            if (!b.classList.contains('is-wrong')) b.disabled = false;
          });
          choiceValue = null;
        } else {
          inputs.forEach((i) => (i.value = ''));
          inputs[0].focus();
        }
      });
      feedback.querySelector('.js-show').addEventListener('click', () => {
        done = true;
        if (type === 'choice') {
          form.querySelectorAll('.choice').forEach((b) => {
            if (b.dataset.value === String(ex.answer)) b.classList.add('is-right');
          });
        }
        feedback.querySelector('.fb-solution').hidden = false;
        feedback.querySelector('.fb-actions').innerHTML = nextButton();
        wireNext();
      });
    }

    if (inputs[0]) setTimeout(() => inputs[0].focus({ preventScroll: true }), 30);
  };
})(window.MathLab);
