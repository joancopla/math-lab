/* Pinta un exercici (de qualsevol tema), recull la resposta, la corregeix i mostra el feedback.
 *
 * ML.mountExercise(container, ex, {
 *   topic,                 // id del tema (per al catàleg d'errors)
 *   mode,                  // 'practice' (permet reintentar i pistes) | 'challenge' (un sol intent)
 *   onFirstAnswer(result), // es crida una vegada amb { correct, errorId }
 *   onNext(),              // l'alumna vol l'exercici següent
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
      return `<input class="ans-number" type="text" inputmode="numeric" autocomplete="off" spellcheck="false"
                aria-label="La teva resposta" placeholder="?">`;
    }
    if (t === 'power') {
      return `<span class="ans-power" aria-label="Potència: escriu la base i l'exponent">
                <input class="ans-base" type="text" autocomplete="off" spellcheck="false" aria-label="Base" placeholder="base">
                <input class="ans-exp" type="text" inputmode="numeric" autocomplete="off" aria-label="Exponent" placeholder="exp">
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
            ${type !== 'choice' ? '<button type="submit" class="btn btn-primary">Comprova</button>' : ''}
            ${mode === 'practice' && ex.hint ? '<button type="button" class="btn btn-ghost js-hint">💡 Pista</button>' : ''}
          </div>
          <p class="ex-warn" hidden>Escriu la teva resposta abans de comprovar.</p>
        </form>
        <div class="ex-hint" hidden></div>
        <div class="ex-feedback" aria-live="polite"></div>
      </div>`;

    const card = container.querySelector('.ex-card');
    const form = card.querySelector('.ex-form');
    const feedback = card.querySelector('.ex-feedback');
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
        h.innerHTML = `<b>Pista:</b> ${ex.hint}`;
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

    function nextButton(label = 'Següent →') {
      return `<button type="button" class="btn btn-primary js-next">${label}</button>`;
    }

    function wireNext() {
      const nb = feedback.querySelector('.js-next');
      if (nb) {
        nb.addEventListener('click', () => opts.onNext && opts.onNext());
        nb.focus({ preventScroll: true });
      }
    }

    function showCorrect() {
      done = true;
      const praise = U.pick(attempts === 1 ? PRAISE : PRAISE_RETRY);
      feedback.innerHTML = `
        <div class="fb fb-ok">
          <div class="fb-title">✅ ${praise}</div>
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
          <div class="fb-title">${known ? '🔎 Error detectat: ' + info.title : '❌ No és correcte'}</div>
          <div class="fb-msg">${trap.msg}</div>
          <div class="fb-solution" ${canRetry ? 'hidden' : ''}><b>Solució:</b> ${ex.solution || ''}</div>
          <div class="fb-actions">
            ${canRetry
              ? `<button type="button" class="btn btn-primary js-retry">Torna-ho a provar</button>
                 <button type="button" class="btn btn-ghost js-show">Mostra la solució</button>`
              : nextButton('Continua →')}
          </div>
        </div>`;
      if (!canRetry) {
        done = true;
        wireNext();
        return;
      }
      const retry = feedback.querySelector('.js-retry');
      retry.focus({ preventScroll: true });
      retry.addEventListener('click', () => {
        feedback.innerHTML = '';
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
