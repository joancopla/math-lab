/* Pràctica d'un apartat en un nivell concret, en rondes de 10 exercicis.
 * Capçalera de «missió» amb el camí cap a l'estrella i l'objectiu d'avui; a l'esquerra l'exercici
 * i a la dreta el feedback i la teoria. En acabar la ronda, un resum.
 */
(function (ML) {
  'use strict';

  const U = ML.utils;
  ML.views = ML.views || {};

  ML.views.practice = (root, topicId, skillId, level) => {
    const t = ML.topics.get(topicId);
    const skill = ML.topics.skill(topicId, skillId);
    if (!t || !skill || level < 1 || level > 3) return ML.views.notFound(root);

    const STAR = ML.storage.STAR_RUN;
    const SESSION = ML.storage.SESSION;
    let session;
    let lastPrompt = '';

    function newSession() {
      session = { current: 0, tries: 0, ok: 0, run: 0, bestRun: 0, points: 0, errors: {}, starEarned: false, goalReached: false };
    }

    function layout() {
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
                <span class="tag tag-daily js-daily"></span>
              </div>
              <h1>${skill.title} ${skill.rule ? `<span class="rule-pill">${skill.rule}</span>` : ''}</h1>
              ${skill.levels ? `<p class="level-desc">${skill.levels[level - 1]}</p>` : ''}
            </div>
            <div class="goal goal-gold">
              <span aria-hidden="true" class="ico fill">military_tech</span>
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
        <div class="banner js-banner" hidden></div>
        <div class="play-area"></div>`;
    }

    function playArea() {
      root.querySelector('.play-area').innerHTML = `
        <div class="play-grid">
          <section class="ex-host"></section>
          <aside class="play-side">
            <div class="fb-host" aria-live="polite"></div>
            ${skill.theory ? `
              <section class="panel tip-card">
                <span class="tip-icon"><span aria-hidden="true" class="ico">auto_awesome</span></span>
                <div>
                  <h3>Recorda</h3>
                  <div class="theory-body">${skill.theory}</div>
                </div>
              </section>` : ''}
          </aside>
        </div>`;
    }

    function renderProgress() {
      const ls = ML.storage.level(t.id, skill.id, level);
      const earned = ls.bestRun >= STAR;
      const run = Math.min(ls.run, STAR);
      const today = ML.storage.today();
      root.querySelector('.js-goal').textContent = earned ? 'Aconseguida!' : `${run} de ${STAR} seguits`;
      const daily = root.querySelector('.js-daily');
      daily.innerHTML = today.met
        ? '<span aria-hidden="true" class="ico fill">local_fire_department</span>Objectiu d\'avui complert'
        : `<span aria-hidden="true" class="ico fill">local_fire_department</span>Avui: ${today.done} de ${today.goal}`;
      daily.classList.toggle('is-met', today.met);
      root.querySelector('.js-session').textContent = `Exercici ${session.current} de ${SESSION}`;
      root.querySelector('.js-star-msg').innerHTML = earned
        ? '<span aria-hidden="true" class="ico fill">star</span>Ja tens l\'estrella d\'aquest nivell'
        : run === STAR - 1 ? '<span aria-hidden="true" class="ico fill">emoji_events</span>Un encert més i guanyes l\'estrella!' : '';
      root.querySelector('.js-segments').innerHTML = Array.from({ length: STAR }, (_, i) => {
        const cls = earned || i < run ? 'is-done' : i === run ? 'is-next' : '';
        return `<i class="${cls}"></i>`;
      }).join('');
    }

    function showBanner(html) {
      const banner = root.querySelector('.js-banner');
      banner.hidden = false;
      banner.innerHTML = html;
      return banner;
    }

    /** Proposta 5: el nom es demana després del primer encert, no abans de començar. */
    function askName() {
      const banner = showBanner(`
        <span class="banner-big">👋</span>
        <form class="banner-form js-name">
          <label for="ask-name"><b>Molt bé!</b> Com et dius?</label>
          <div class="banner-form-row">
            <input id="ask-name" type="text" maxlength="30" autocomplete="off" placeholder="El teu nom">
            <button class="btn btn-3d btn-blue btn-small">Desa</button>
            <button type="button" class="btn btn-link js-skip">Ara no</button>
          </div>
        </form>`);
      const form = banner.querySelector('.js-name');
      const close = () => { banner.hidden = true; banner.innerHTML = ''; };
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = form.querySelector('input').value.trim();
        if (!v) return;
        ML.storage.setName(v);
        ML.storage.setAskedName();
        close();
        ML.celebrate.toast(`Hola, ${U.esc(v)}! 👋`);
      });
      banner.querySelector('.js-skip').addEventListener('click', () => {
        ML.storage.setAskedName();
        close();
      });
    }

    function onFirstAnswer({ correct, errorId }) {
      const before = ML.storage.level(t.id, skill.id, level).bestRun;
      const points = correct ? 10 * level : 0;
      const ls = ML.storage.recordAnswer({ topic: t.id, skill: skill.id, level, correct, errorId, points });
      session.tries++;
      if (correct) {
        session.ok++;
        session.run++;
        session.bestRun = Math.max(session.bestRun, session.run);
        session.points += points;
      } else {
        session.run = 0;
        if (errorId && errorId !== 'altre') session.errors[errorId] = (session.errors[errorId] || 0) + 1;
      }
      renderProgress();

      const st = ML.storage.get();
      if (before < STAR && ls.bestRun >= STAR) {
        session.starEarned = true;
        ML.celebrate.confetti();
        showBanner(`
          <span class="banner-big star-pop">⭐</span>
          <div><b>Has guanyat l'estrella del nivell ${level}!</b>
          <p>${STAR} encerts seguits. ${level < 3 ? 'Ja estàs a punt per al nivell següent.' : 'Has dominat aquest apartat!'}</p></div>
          ${level < 3 ? `<a class="btn btn-3d btn-blue" href="#/tema/${t.id}/practica/${skill.id}/${level + 1}">Passa al nivell ${level + 1}</a>` : ''}`);
      } else if (correct && !st.name && !st.askedName) {
        askName();
      }
      if (ls.goalReached) {
        session.goalReached = true;
        ML.celebrate.confetti(50);
        const streak = ML.storage.dayStreak();
        ML.celebrate.toast(`🔥 Objectiu d'avui complert! ${streak > 1 ? `Ratxa de ${streak} dies.` : 'Has començat una ratxa.'}`, { kind: 'gold', ms: 3600 });
      }
    }

    function next() {
      if (session.tries >= SESSION) return summary();
      session.current = session.tries + 1;
      playArea();
      renderProgress();
      let ex;
      for (let i = 0; i < 8; i++) {
        ex = skill.generate(level);
        if (ex.prompt !== lastPrompt) break;
      }
      lastPrompt = ex.prompt;
      ML.mountExercise(root.querySelector('.ex-host'), ex, {
        topic: t.id,
        mode: 'practice',
        onFirstAnswer,
        onNext: next,
        feedbackHost: root.querySelector('.fb-host'),
        rule: skill.rule,
        nextLabel: session.tries === SESSION - 1 ? 'Veure el resum' : 'Següent',
      });
    }

    /** Proposta 1: final de ronda amb resum i la propera passa clara. */
    function summary() {
      const today = ML.storage.today();
      const streak = ML.storage.dayStreak();
      const ls = ML.storage.level(t.id, skill.id, level);
      const hasStar = ls.bestRun >= STAR;
      const great = session.ok >= SESSION - 2;
      if (great) ML.celebrate.confetti(great && session.ok === SESSION ? 90 : 50);
      const errs = Object.entries(session.errors).sort((a, b) => b[1] - a[1]);
      const headline = session.ok === SESSION ? 'Ronda perfecta!' : great ? 'Molt bona ronda!' : session.ok >= SESSION / 2 ? 'Ronda acabada!' : 'Ronda acabada. Seguim practicant!';
      const emoji = session.ok === SESSION ? '🏆' : great ? '🎉' : session.ok >= SESSION / 2 ? '💪' : '🌱';

      root.querySelector('.js-banner').hidden = true;
      root.querySelector('.play-area').innerHTML = `
        <section class="panel summary">
          <div class="summary-emoji">${emoji}</div>
          <h2>${headline}</h2>
          <div class="end-stats">
            <div class="stat"><span class="stat-big">${session.ok}/${session.tries}</span><span>encerts</span></div>
            <div class="stat"><span class="stat-big">🔥 ${session.bestRun}</span><span>millor ratxa de la ronda</span></div>
            <div class="stat"><span class="stat-big">+${session.points}</span><span>punts</span></div>
          </div>
          <div class="summary-goal ${today.met ? 'is-met' : ''}">
            <span aria-hidden="true" class="ico fill">local_fire_department</span>
            <span>${today.met
              ? `Objectiu d'avui complert. ${streak > 1 ? `Portes ${streak} dies seguits!` : 'Torna demà per allargar la ratxa!'}`
              : `Avui portes ${today.done} de ${today.goal} exercicis. Fes-ne ${today.goal - today.done} més per complir l'objectiu.`}</span>
          </div>
          ${errs.length ? `
            <div class="summary-errors">
              <h3>Per repassar</h3>
              ${errs.map(([id, n]) => {
                const info = ML.topics.errorInfo(t.id, id);
                return `<p><b>${info.title}</b>${n > 1 ? ` <span class="muted">(${n} vegades)</span>` : ''}<br><span class="muted">${info.explain}</span></p>`;
              }).join('')}
            </div>` : ''}
          <div class="end-actions">
            ${hasStar && level < 3
              ? `<a class="btn btn-3d btn-blue btn-xl" href="#/tema/${t.id}/practica/${skill.id}/${level + 1}">Passa al nivell ${level + 1}</a>
                 <button type="button" class="btn js-again">Una altra ronda</button>`
              : '<button type="button" class="btn btn-3d btn-blue btn-xl js-again">Una altra ronda</button>'}
            <a class="btn" href="#/">Torna a l'inici</a>
          </div>
        </section>`;
      root.querySelector('.js-again').addEventListener('click', () => {
        newSession();
        next();
      });
      root.querySelector('.summary h2').focus?.();
    }

    newSession();
    layout();
    next();
  };
})(window.MathLab);
