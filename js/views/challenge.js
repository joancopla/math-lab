/* Mode repte: preguntes barrejades de tot el tema, 3 vides, dificultat adaptativa i ratxes. */
(function (ML) {
  'use strict';

  const U = ML.utils;
  ML.views = ML.views || {};

  const LIVES = 3;
  const LEVEL_UP_EVERY = 3; // encerts seguits per pujar de nivell i de multiplicador
  const MAX_MULT = 5;

  ML.views.challenge = (root, topicId) => {
    const t = ML.topics.get(topicId);
    if (!t || t.comingSoon) return ML.views.notFound(root);

    let g;
    let lastSkill = null;

    function intro() {
      const ch = ML.storage.get().challenge[t.id];
      root.innerHTML = `
        ${ML.ui.crumbs([['Inici', '#/'], [t.title, `#/tema/${t.id}`], ['Mode repte']])}
        <section class="challenge-intro">
          <div class="trophy">🏆</div>
          <h1>Mode repte: ${t.title}</h1>
          <ul class="rules">
            <li>❓ Preguntes barrejades de tots els apartats.</li>
            <li>❤️ Tens <b>${LIVES} vides</b>. Cada error en treu una.</li>
            <li>🔥 Cada ${LEVEL_UP_EVERY} encerts seguits, la dificultat puja i guanyes més punts.</li>
            <li>💥 Si falles, la ratxa torna a 0 (però veuràs l'explicació de l'error).</li>
          </ul>
          ${ch ? `<p class="record">Rècord: <b>${ch.best}</b> punts · Millor ratxa: <b>${ch.bestStreak}</b> · Partides: ${ch.played}</p>` : ''}
          <button class="btn btn-primary btn-big js-start">Comença!</button>
        </section>`;
      root.querySelector('.js-start').addEventListener('click', start);
      root.querySelector('.js-start').focus();
    }

    function start() {
      g = { lives: LIVES, score: 0, streak: 0, bestStreak: 0, level: 1, count: 0, ok: 0, mistakes: [] };
      root.innerHTML = `
        ${ML.ui.crumbs([['Inici', '#/'], [t.title, `#/tema/${t.id}`], ['Mode repte']])}
        <div class="hud">
          <span class="hud-lives" aria-label="Vides"></span>
          <span class="hud-streak"></span>
          <span class="hud-level"></span>
          <span class="hud-score"></span>
        </div>
        <div class="hud-skill"></div>
        <div class="ex-host"></div>`;
      next();
    }

    function hud(gain) {
      const mult = multiplier();
      root.querySelector('.hud-lives').innerHTML = Array.from({ length: LIVES }, (_, i) =>
        `<span class="${i < g.lives ? 'life' : 'life lost'}">❤️</span>`).join('');
      root.querySelector('.hud-streak').innerHTML = `🔥 ${g.streak}${mult > 1 ? ` <small>×${mult}</small>` : ''}`;
      root.querySelector('.hud-level').textContent = `Nivell ${g.level}`;
      const sc = root.querySelector('.hud-score');
      sc.innerHTML = `${U.fmt(g.score)} punts`;
      if (gain) {
        const pop = document.createElement('span');
        pop.className = 'pop';
        pop.textContent = `+${gain}`;
        sc.appendChild(pop);
      }
    }

    function multiplier() {
      return Math.min(MAX_MULT, 1 + Math.floor(g.streak / LEVEL_UP_EVERY));
    }

    function next() {
      if (g.lives <= 0) return end();
      let skill;
      do { skill = U.pick(t.skills); } while (t.skills.length > 1 && skill === lastSkill);
      lastSkill = skill;
      const level = g.level;
      g.count++;
      hud();
      root.querySelector('.hud-skill').textContent = `Pregunta ${g.count} · ${skill.title}`;
      const ex = skill.generate(level);

      ML.mountExercise(root.querySelector('.ex-host'), ex, {
        topic: t.id,
        mode: 'challenge',
        onFirstAnswer: ({ correct, errorId, msg }) => {
          ML.storage.recordAnswer({ topic: t.id, skill: skill.id, level, correct, errorId });
          let gain = 0;
          if (correct) {
            g.ok++;
            g.streak++;
            g.bestStreak = Math.max(g.bestStreak, g.streak);
            gain = 10 * level * multiplier();
            g.score += gain;
            if (g.streak % LEVEL_UP_EVERY === 0) g.level = Math.min(3, g.level + 1);
          } else {
            g.lives--;
            g.streak = 0;
            g.level = Math.max(1, g.level - 1);
            g.mistakes.push({ prompt: ex.prompt, errorId, msg, solution: ex.solution });
          }
          hud(gain);
          if (g.lives <= 0) {
            const nb = root.querySelector('.js-next');
            if (nb) nb.textContent = 'Veure resultats →';
          }
        },
        onNext: next,
      });
    }

    function end() {
      const res = ML.storage.recordChallenge(t.id, g.score, g.bestStreak);
      root.innerHTML = `
        ${ML.ui.crumbs([['Inici', '#/'], [t.title, `#/tema/${t.id}`], ['Mode repte']])}
        <section class="challenge-end">
          <h1>${res.record ? '🎉 Nou rècord!' : 'Partida acabada'}</h1>
          <div class="end-stats">
            <div class="stat"><span class="stat-big">${U.fmt(g.score)}</span><span>punts</span></div>
            <div class="stat"><span class="stat-big">🔥 ${g.bestStreak}</span><span>millor ratxa${res.streakRecord ? ' (rècord!)' : ''}</span></div>
            <div class="stat"><span class="stat-big">${g.ok}/${g.count}</span><span>encerts</span></div>
          </div>
          <p class="record">Rècord: ${res.best} punts · Millor ratxa: ${res.bestStreak}</p>
          <div class="end-actions">
            <button class="btn btn-primary js-again">Torna a jugar</button>
            <a class="btn btn-ghost" href="#/tema/${t.id}">Torna al tema</a>
          </div>
          ${g.mistakes.length ? `
            <h2 class="section-title">Repassa els errors</h2>
            <div class="mistakes">
              ${g.mistakes.map((m) => {
                const info = ML.topics.errorInfo(t.id, m.errorId);
                return `
                  <article class="mistake">
                    <div class="mistake-q">${m.prompt}</div>
                    <p class="mistake-title">🔎 ${m.errorId === 'altre' ? 'Error' : info.title}</p>
                    <p>${m.msg}</p>
                    <p class="mistake-sol"><b>Solució:</b> ${m.solution}</p>
                  </article>`;
              }).join('')}
            </div>` : ''}
        </section>`;
      root.querySelector('.js-again').addEventListener('click', start);
    }

    intro();
  };
})(window.MathLab);
