/* Pinta un exercici (de qualsevol tema), recull la resposta, la corregeix i mostra el feedback.
 *
 * ML.mountExercise(container, ex, {
 *   topic,                 // id del tema (per al catàleg d'errors)
 *   mode,                  // 'practice' (permet reintentar i pistes) | 'challenge' (un sol intent)
 *   onFirstAnswer(result), // es crida una vegada amb { correct, errorId }
 *   onNext(),              // l'alumna vol l'exercici següent
 *   feedbackHost?,         // element on pintar el feedback (p. ex. una columna lateral); per defecte, sota l'exercici
 *   rule?,                 // regla de l'apartat (HTML), es recorda quan hi ha un error
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
      return `<span class="ans-label"><span class="ico">edit_note</span>La teva resposta:</span>
              <input class="ans-number" type="text" inputmode="numeric" autocomplete="off" spellcheck="false"
                aria-label="La teva resposta" placeholder="?">`;
    }
    if (t === 'power') {
      return `<span class="ans-label"><span class="ico">edit_note</span>La teva potència:</span>
              <span class="ans-power">
                <span class="ans-field"><input class="ans-base" type="text" autocomplete="off" spellcheck="false" aria-label="Base" placeholder="a"><span class="ans-badge">Base</span></span>
                <span class="ans-field is-exp"><input class="ans-exp" type="text" inputmode="numeric" autocomplete="off" aria-label="Exponent" placeholder="n"><span class="ans-badge">Exponent</span></span>
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
            ${type !== 'choice' ? '<button type="submit" class="btn btn-3d btn-blue btn-xl btn-grow"><span class="ico fill">task_alt</span>Comprova la resposta</button>' : ''}
            ${mode === 'practice' && ex.hint ? '<button type="button" class="btn btn-3d btn-yellow btn-xl js-hint"><span class="ico fill">lightbulb</span>Una pista!</button>' : ''}
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
        h.innerHTML = `<span class="ico fill">lightbulb</span><span><b>Pista:</b> ${ex.hint}</span>`;
        h.hidden = false;
        hintBtn.disabled = true;
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submit();
    });

    function readRaw() {
      if (type === 'number') return inputs[0].value;
      if (type === 'power') return { base: inputs[0].value, exp: inputs[1].value };
      return choiceValue;
    }

    function setLocked(locked) {
      inputs.forEach((i) => (i.disabled = locked));
      const sub = form.querySelector('[type="submit"]');
      if (sub) sub.disabled = locked;
    }

    function submit() {
      if (done) return;
      const res = ML.checker.evaluate(ex, readRaw());
      if (!res.valid) {
        warn.hidden = false;
        card.classList.remove('shake');
        void card.offsetWidth;
        card.classList.add('shake');
        return;
      }
      warn.hidden = true;
      attempts++;
      setLocked(true);
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

    function nextButton(label = 'Següent') {
      return `<button type="button" class="btn btn-3d btn-green btn-xl btn-block js-next">${label}<span class="ico">arrow_forward</span></button>`;
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
          <span class="fb-tag"><span class="ico fill">stars</span>Resposta correcta</span>
          <div class="fb-hero">
            <span class="fb-icon"><span class="ico fill">sentiment_very_satisfied</span></span>
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
          <span class="fb-tag"><span class="ico">psychology</span>${known ? 'Analitzem què ha passat' : 'Revisem-ho'}</span>
          <div class="fb-row">
            <span class="fb-icon"><span class="ico">${known ? 'search' : 'close'}</span></span>
            <div>
              <h3 class="fb-title">${known ? info.title : 'No és correcte'}</h3>
              <p class="fb-msg">${trap.msg}</p>
            </div>
          </div>
          ${known && opts.rule ? `<div class="fb-rule"><span class="fb-rule-label"><span class="ico">lightbulb_circle</span>Recorda la regla</span><span class="fb-rule-math">${opts.rule}</span></div>` : ''}
          <div class="fb-solution" ${canRetry ? 'hidden' : ''}><b>Solució:</b> ${ex.solution || ''}</div>
          <div class="fb-actions">
            ${canRetry
              ? `<button type="button" class="btn btn-3d btn-green btn-xl btn-block js-retry"><span class="ico">replay</span>Torna-ho a provar</button>
                 <button type="button" class="btn btn-link js-show"><span class="ico">visibility</span>Mostra la solució i continua</button>`
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
