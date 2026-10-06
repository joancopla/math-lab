/* Pràctica d'un apartat en un nivell concret. */
(function (ML) {
  'use strict';

  ML.views = ML.views || {};

  ML.views.practice = (root, topicId, skillId, level) => {
    const t = ML.topics.get(topicId);
    const skill = ML.topics.skill(topicId, skillId);
    if (!t || !skill || level < 1 || level > 3) return ML.views.notFound(root);

    const STAR = ML.storage.STAR_RUN;
    const session = { tries: 0, ok: 0, run: 0 };
    let lastPrompt = '';

    root.innerHTML = `
      ${ML.ui.crumbs([['Inici', '#/'], [t.title, `#/tema/${t.id}`], [skill.title]])}
      <header class="practice-head">
        <h1>${skill.title}</h1>
        <div class="lvl-tabs" role="tablist" aria-label="Nivell">
          ${[1, 2, 3].map((l) => `<a role="tab" href="#/tema/${t.id}/practica/${skill.id}/${l}"
              class="${l === level ? 'is-on' : ''}" aria-selected="${l === level}">Nivell ${l}</a>`).join('')}
        </div>
      </header>
      ${skill.levels ? `<p class="level-desc">${skill.levels[level - 1]}</p>` : ''}

      <details class="theory">
        <summary>📘 Recorda</summary>
        <div class="theory-body">${skill.theory || ''}</div>
      </details>

      <div class="session-bar">
        <span class="js-score">Encerts: 0 de 0</span>
        <span class="js-run">🔥 Ratxa: 0</span>
        <span class="js-star"></span>
      </div>
      <div class="banner" hidden></div>
      <div class="ex-host"></div>`;

    const host = root.querySelector('.ex-host');
    const banner = root.querySelector('.banner');

    function renderStar() {
      const ls = ML.storage.level(t.id, skill.id, level);
      const el = root.querySelector('.js-star');
      if (ls.bestRun >= STAR) {
        el.innerHTML = '⭐ Estrella aconseguida';
        el.className = 'js-star star-done';
      } else {
        const dots = Array.from({ length: STAR }, (_, i) => `<i class="${i < ls.run ? 'on' : ''}"></i>`).join('');
        el.innerHTML = `Estrella: <span class="dots" aria-label="${ls.run} de ${STAR} encerts seguits">${dots}</span>`;
        el.className = 'js-star';
      }
    }

    function renderSession() {
      root.querySelector('.js-score').textContent = `Encerts: ${session.ok} de ${session.tries}`;
      root.querySelector('.js-run').textContent = `🔥 Ratxa: ${session.run}`;
      renderStar();
    }

    function onFirstAnswer({ correct, errorId }) {
      const before = ML.storage.level(t.id, skill.id, level).bestRun;
      const ls = ML.storage.recordAnswer({
        topic: t.id, skill: skill.id, level, correct, errorId, points: correct ? 10 * level : 0,
      });
      session.tries++;
      if (correct) {
        session.ok++;
        session.run++;
      } else {
        session.run = 0;
      }
      renderSession();
      if (before < STAR && ls.bestRun >= STAR) {
        banner.hidden = false;
        banner.innerHTML = `
          <span class="banner-big">⭐</span>
          <div><b>Has guanyat l'estrella del nivell ${level}!</b>
          <p>${STAR} encerts seguits. ${level < 3 ? 'Ja estàs a punt per al nivell següent.' : 'Has dominat aquest apartat!'}</p></div>
          ${level < 3 ? `<a class="btn btn-primary btn-small" href="#/tema/${t.id}/practica/${skill.id}/${level + 1}">Nivell ${level + 1} →</a>` : ''}`;
      }
    }

    function next() {
      let ex;
      for (let i = 0; i < 8; i++) {
        ex = skill.generate(level);
        if (ex.prompt !== lastPrompt) break;
      }
      lastPrompt = ex.prompt;
      ML.mountExercise(host, ex, { topic: t.id, mode: 'practice', onFirstAnswer, onNext: next });
    }

    renderSession();
    next();
  };
})(window.MathLab);
