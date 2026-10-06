/* Pràctica d'un apartat en un nivell concret.
 * Capçalera de «missió» amb el camí cap a l'estrella; a l'esquerra l'exercici i a la dreta el feedback i la teoria.
 */
(function (ML) {
  'use strict';

  ML.views = ML.views || {};

  ML.views.practice = (root, topicId, skillId, level) => {
    const t = ML.topics.get(topicId);
    const skill = ML.topics.skill(topicId, skillId);
    if (!t || !skill || level < 1 || level > 3) return ML.views.notFound(root);

    const STAR = ML.storage.STAR_RUN;
    const session = { tries: 0, ok: 0 };
    let lastPrompt = '';

    root.innerHTML = `
      ${ML.ui.crumbs([['Inici', '#/'], [t.title, `#/tema/${t.id}`], [skill.title]])}
      <section class="panel mission">
        <div class="mission-top">
          <div>
            <div class="mission-tags">
              <span class="tag tag-purple">${t.title}</span>
              <nav class="lvl-tabs" aria-label="Nivell">
                ${[1, 2, 3].map((l) => `<a href="#/tema/${t.id}/practica/${skill.id}/${l}"
                    class="${l === level ? 'is-on' : ''}" ${l === level ? 'aria-current="page"' : ''}>Nivell ${l}</a>`).join('')}
              </nav>
            </div>
            <h1>${skill.title} ${skill.rule ? `<span class="rule-pill">${skill.rule}</span>` : ''}</h1>
            ${skill.levels ? `<p class="level-desc">${skill.levels[level - 1]}</p>` : ''}
          </div>
          <div class="goal goal-gold">
            <span class="ico fill">military_tech</span>
            <span><small>Objectiu: l'estrella</small><b class="js-goal"></b></span>
          </div>
        </div>
        <div class="mission-progress">
          <div class="mission-progress-label">
            <span class="js-session"></span>
            <span class="js-star-msg"></span>
          </div>
          <div class="segments js-segments" aria-hidden="true"></div>
        </div>
      </section>
      <div class="banner" hidden></div>

      <div class="play-grid">
        <section class="ex-host"></section>
        <aside class="play-side">
          <div class="fb-host" aria-live="polite"></div>
          ${skill.theory ? `
            <section class="panel tip-card">
              <span class="tip-icon"><span class="ico">auto_awesome</span></span>
              <div>
                <h3>Recorda</h3>
                <div class="theory-body">${skill.theory}</div>
              </div>
            </section>` : ''}
        </aside>
      </div>`;

    const host = root.querySelector('.ex-host');
    const fbHost = root.querySelector('.fb-host');
    const banner = root.querySelector('.banner');

    function renderProgress() {
      const ls = ML.storage.level(t.id, skill.id, level);
      const earned = ls.bestRun >= STAR;
      const run = Math.min(ls.run, STAR);
      root.querySelector('.js-goal').textContent = earned ? 'Aconseguida!' : `${run} de ${STAR} seguits`;
      root.querySelector('.js-session').textContent = session.tries
        ? `Avui: ${session.ok} de ${session.tries} encerts`
        : 'Encerta 5 exercicis seguits per guanyar l\'estrella del nivell.';
      root.querySelector('.js-star-msg').innerHTML = earned
        ? '<span class="ico fill">star</span>Ja tens l\'estrella d\'aquest nivell'
        : run === STAR - 1 ? '<span class="ico fill">emoji_events</span>Només en falta un!' : '';
      root.querySelector('.js-segments').innerHTML = Array.from({ length: STAR }, (_, i) => {
        const cls = earned || i < run ? 'is-done' : i === run ? 'is-next' : '';
        return `<i class="${cls}"></i>`;
      }).join('');
    }

    function onFirstAnswer({ correct, errorId }) {
      const before = ML.storage.level(t.id, skill.id, level).bestRun;
      const ls = ML.storage.recordAnswer({
        topic: t.id, skill: skill.id, level, correct, errorId, points: correct ? 10 * level : 0,
      });
      session.tries++;
      if (correct) session.ok++;
      renderProgress();
      if (before < STAR && ls.bestRun >= STAR) {
        banner.hidden = false;
        banner.innerHTML = `
          <span class="banner-big">⭐</span>
          <div><b>Has guanyat l'estrella del nivell ${level}!</b>
          <p>${STAR} encerts seguits. ${level < 3 ? 'Ja estàs a punt per al nivell següent.' : 'Has dominat aquest apartat!'}</p></div>
          ${level < 3 ? `<a class="btn btn-3d btn-blue" href="#/tema/${t.id}/practica/${skill.id}/${level + 1}">Passa al nivell ${level + 1}</a>` : ''}`;
      }
    }

    function next() {
      let ex;
      for (let i = 0; i < 8; i++) {
        ex = skill.generate(level);
        if (ex.prompt !== lastPrompt) break;
      }
      lastPrompt = ex.prompt;
      ML.mountExercise(host, ex, {
        topic: t.id, mode: 'practice', onFirstAnswer, onNext: next, feedbackHost: fbHost, rule: skill.rule,
      });
    }

    renderProgress();
    next();
  };
})(window.MathLab);
