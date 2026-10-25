/* Pantalla d'inici: banner amb l'apartat actual, camí d'apartats, ratxa setmanal, repte i temes. */
(function (ML) {
  'use strict';

  const U = ML.utils;
  ML.views = ML.views || {};

  const WEEK = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];

  function starCount(topicId, skillId) {
    return ML.storage.stars(topicId, skillId).filter(Boolean).length;
  }

  /** Apartat «actual»: el darrer practicat si no està acabat; si no, el primer sense les 3 estrelles. */
  function currentSkill(topic, s) {
    if (s.last && s.last.topic === topic.id && starCount(topic.id, s.last.skill) < 3) {
      return { skill: ML.topics.skill(topic.id, s.last.skill), level: s.last.level };
    }
    const sk = topic.skills.find((x) => starCount(topic.id, x.id) < 3) || topic.skills[0];
    return { skill: sk, level: ML.storage.recommendedLevel(topic.id, sk.id) };
  }

  const starsHtml = (n) => `<span class="mini-stars" aria-label="${n} de 3 estrelles">${
    [0, 1, 2].map((i) => `<span class="${i < n ? 'on' : ''}">★</span>`).join('')}</span>`;

  function hero(s, topic, cur) {
    const ls = ML.storage.level(topic.id, cur.skill.id, cur.level);
    const STAR = ML.storage.STAR_RUN;
    const run = Math.min(ls.run, STAR);
    const totals = ML.storage.starTotals();
    const started = s.totals.tries > 0;
    const intro = s.last
      ? `L'última vegada vas practicar <b>${ML.topics.skill(s.last.topic, s.last.skill).title.toLowerCase()}</b>. Continuem?`
      : 'Fes 10 exercicis cada dia al teu ritme. Quan t\'equivoquis, et diré quin error has fet i com arreglar-lo.';
    const today = ML.storage.today();
    const C = 2 * Math.PI * 26;
    const frac = Math.min(1, today.done / today.goal);
    const ring = `
      <div class="daily-ring ${today.met ? 'is-met' : ''}">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="26" class="ring-bg"/>
          <circle cx="32" cy="32" r="26" class="ring-fg" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}"/>
        </svg>
        <span class="ring-num">${today.met ? '✓' : `${today.done}<small>/${today.goal}</small>`}</span>
        <span class="ring-text"><b>Objectiu d'avui</b>${today.met
          ? 'Complert! La ratxa continua.'
          : today.done === 0 ? `${today.goal} exercicis per mantenir la ratxa` : `Te'n falten ${today.goal - today.done}`}</span>
      </div>`;
    return `
      <section class="hero-banner">
        <div class="hero-left">
          <h1>${s.name ? `Hola, ${U.esc(s.name)}!` : 'Hola!'} 👋</h1>
          <p class="hero-intro">${intro}</p>
          ${ring}
          ${started ? `
            <div class="hero-chips">
              <span><span aria-hidden="true" class="ico fill">check_circle</span>${s.totals.ok} encerts al primer intent</span>
              <span><span aria-hidden="true" class="ico fill">star</span>${totals.got} de ${totals.total} estrelles</span>
            </div>` : ''}
        </div>
        <div class="hero-card">
          <div class="hero-card-top">
            <div>
              <span class="tag">Nivell ${cur.level}</span>
              <h2>${cur.skill.title}</h2>
              ${cur.skill.rule ? `<p class="rule">${cur.skill.rule}</p>` : ''}
            </div>
            <span class="hero-card-icon"><span aria-hidden="true" class="ico fill">bolt</span></span>
          </div>
          <div class="meter">
            <div class="meter-label"><span>Cap a l'estrella</span><b>${run} de ${STAR} seguits</b></div>
            <div class="meter-track"><div class="meter-fill" style="width:${(100 * run) / STAR}%"></div></div>
          </div>
          <a class="btn btn-3d btn-blue btn-xl" href="#/tema/${topic.id}/practica/${cur.skill.id}/${cur.level}">
            ${started ? 'Continua' : 'Comença'} <span aria-hidden="true" class="ico fill">play_circle</span>
          </a>
        </div>
      </section>`;
  }

  function questMap(topic, cur) {
    const totals = topic.skills.reduce((n, sk) => n + starCount(topic.id, sk.id), 0);
    const nodes = topic.skills.map((sk, i) => {
      const n = starCount(topic.id, sk.id);
      const isCur = sk.id === cur.skill.id;
      const state = n === 3 ? 'done' : isCur ? 'current' : n > 0 ? 'partial' : 'todo';
      const icon = { done: 'check', current: 'play_arrow', partial: 'star', todo: '' }[state];
      const href = `#/tema/${topic.id}/practica/${sk.id}/${isCur ? cur.level : ML.storage.recommendedLevel(topic.id, sk.id)}`;
      return `
        <li class="quest quest-${state}">
          <a class="quest-node" href="${href}" aria-label="${U.esc(sk.title)}">
            ${icon ? `<span aria-hidden="true" class="ico fill">${icon}</span>` : `<span class="quest-num">${i + 1}</span>`}
          </a>
          <a class="quest-card" href="${href}">
            <span class="quest-head">
              <span class="quest-title">${i + 1}. ${sk.title}</span>
              ${isCur ? '<span class="pill-now">Ara</span>' : starsHtml(n)}
            </span>
            ${sk.rule ? `<span class="quest-rule">${sk.rule}</span>` : ''}
            ${isCur ? `<span class="quest-cta">Nivell ${cur.level} <span class="btn btn-3d btn-blue btn-small">Entra</span></span>` : ''}
          </a>
        </li>`;
    }).join('');
    return `
      <section class="panel quest-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow"><span class="dot"></span>${topic.title}</p>
            <h2>${topic.pathTitle || `El camí: ${topic.title}`}</h2>
          </div>
          <div class="goal"><span aria-hidden="true" class="ico fill">emoji_events</span><span><small>Objectiu</small><b>${totals} de ${topic.skills.length * 3} estrelles</b></span></div>
        </div>
        <ol class="quest-map">${nodes}</ol>
        <div class="panel-foot">
          <span>Cada estrella vol 5 encerts seguits en un nivell.</span>
          <a class="btn btn-3d btn-purple" href="#/tema/${topic.id}"><span aria-hidden="true" class="ico">menu_book</span>Tots els apartats</a>
        </div>
      </section>`;
  }

  function weekCard() {
    const streak = ML.storage.dayStreak();
    const today = new Date();
    const todayKey = U.today(today);
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const days = WEEK.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = U.today(d);
      const st = ML.storage.dayState(key);
      const isToday = key === todayKey;
      const cls = [isToday ? 'is-today' : '', st === 'done' ? 'is-done' : st === 'partial' ? 'is-partial' : key > todayKey ? 'is-future' : 'is-miss'].join(' ');
      const mark = st === 'done' ? '<span aria-hidden="true" class="ico">check</span>'
        : isToday ? '<span aria-hidden="true" class="ico fill">local_fire_department</span>' : '<i></i>';
      const what = st === 'done' ? 'objectiu complert' : st === 'partial' ? 'hi ha practicat, sense arribar a l\'objectiu' : key > todayKey ? 'encara no ha arribat' : 'no hi ha practicat';
      return `<li class="${cls}" aria-label="${label}: ${what}"><span>${label}</span>${mark}</li>`;
    }).join('');
    const goal = ML.storage.today();
    const msg = goal.met
      ? 'Objectiu d\'avui complert. Torna demà per allargar la ratxa!'
      : streak > 0 ? `Fes ${goal.goal - goal.done} exercicis més avui per no trencar la ratxa!`
        : `Completa ${goal.goal} exercicis avui per començar una ratxa.`;
    return `
      <section class="panel side-card">
        <div class="side-head">
          <span class="side-emoji">🔥</span>
          <div><h3>${streak} ${streak === 1 ? 'dia seguit' : 'dies seguits'}</h3><p>${msg}</p></div>
        </div>
        <ol class="week" aria-label="La teva setmana">${days}</ol>
      </section>`;
  }

  function challengeCard(topic) {
    const ch = ML.storage.get().challenge[topic.id];
    return `
      <section class="challenge-card">
        <div class="side-head">
          <span class="side-emoji white">🏆</span>
          <div><h3>Mode repte</h3><p>${ch
            ? `Rècord: ${ch.best} punts. Millor ratxa: ${ch.bestStreak} encerts.`
            : 'Preguntes barrejades i 3 vides. Fins on arribaràs?'}</p></div>
        </div>
        <a class="btn btn-3d btn-yellow btn-block" href="#/repte/${topic.id}"><span aria-hidden="true" class="ico fill">bolt</span>${ch ? 'Supera el rècord' : 'Accepta el repte'}</a>
      </section>`;
  }

  function visualCard(topic) {
    const v = topic.visuals[0];
    if (!v) return '';
    return `
      <a class="panel side-card visual-card" href="#/tema/${topic.id}/visual/${v.id}">
        <span class="side-emoji">${v.emoji || '🧊'}</span>
        <div><h3>${v.title}</h3><p>${v.description}</p></div>
      </a>`;
  }

  function worlds() {
    return `
      <section class="worlds">
        <h2>Els temes de 1r d'ESO</h2>
        <div class="world-grid">
          ${ML.topics.all().map((t) => {
            if (t.comingSoon) {
              return `
                <article class="world is-soon">
                  <span class="world-icon" style="--topic:${t.color}">${t.icon}</span>
                  <h3>${t.title}</h3>
                  <p>${t.description}</p>
                  <span class="btn btn-block btn-disabled" aria-disabled="true"><span aria-hidden="true" class="ico">lock</span>Aviat</span>
                </article>`;
            }
            const got = t.skills.reduce((n, sk) => n + starCount(t.id, sk.id), 0);
            const total = t.skills.length * 3;
            return `
              <article class="world is-active">
                <span class="world-icon" style="--topic:${t.color}">${t.icon}</span>
                <h3>${t.title}</h3>
                <p>${t.description}</p>
                <div class="world-stat"><span>⭐ ${got} de ${total} estrelles</span><b>${Math.round((100 * got) / total)}%</b></div>
                <a class="btn btn-3d btn-blue btn-block" href="#/tema/${t.id}">Entra</a>
              </article>`;
          }).join('')}
        </div>
      </section>`;
  }

  ML.views.home = (root) => {
    const s = ML.storage.get();
    // El tema de l'última pràctica; si no n'hi ha cap, el primer.
    const lastTopic = s.last && ML.topics.get(s.last.topic);
    const topic = lastTopic && !lastTopic.comingSoon ? lastTopic : ML.topics.available()[0];
    const cur = currentSkill(topic, s);

    root.innerHTML = `
      ${hero(s, topic, cur)}
      <div class="home-cols">
        ${questMap(topic, cur)}
        <div class="home-side">
          ${weekCard()}
          ${challengeCard(topic)}
          ${visualCard(topic)}
        </div>
      </div>
      ${worlds()}`;

  };
})(window.MathLab);
