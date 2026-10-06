/* Pantalla d'inici. */
(function (ML) {
  'use strict';

  const U = ML.utils;
  ML.views = ML.views || {};

  function totalStars() {
    return ML.topics.available().reduce((sum, t) =>
      sum + t.skills.reduce((s, sk) => s + ML.storage.stars(t.id, sk.id).filter(Boolean).length, 0), 0);
  }

  ML.views.home = (root) => {
    const s = ML.storage.get();
    const streak = ML.storage.dayStreak();
    const last = s.last && ML.topics.skill(s.last.topic, s.last.skill);

    root.innerHTML = `
      <section class="hero">
        <div class="hero-text">
          <h1>${s.name ? `Hola, ${U.esc(s.name)}!` : 'Hola!'} <span class="wave">👋</span></h1>
          <p class="lead">Tria un tema i practica al teu ritme. Quan t'equivoquis, et diré quin error has fet i com arreglar-lo.</p>
          ${s.name ? '' : `
            <form class="name-form js-name">
              <label for="name-in">Com et dius?</label>
              <input id="name-in" type="text" maxlength="30" autocomplete="off" placeholder="El teu nom">
              <button class="btn btn-primary btn-small">Som-hi!</button>
            </form>`}
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-big">🔥 ${streak}</span><span>${streak === 1 ? 'dia seguit' : 'dies seguits'}</span></div>
          <div class="stat"><span class="stat-big">⭐ ${totalStars()}</span><span>estrelles</span></div>
          <div class="stat"><span class="stat-big">${U.fmt(s.points)}</span><span>punts</span></div>
        </div>
      </section>

      ${last ? `
        <a class="continue-card" href="#/tema/${s.last.topic}/practica/${s.last.skill}/${s.last.level}">
          <span class="continue-label">Continua on ho vas deixar</span>
          <b>${last.title}</b> · Nivell ${s.last.level} <span class="arrow">→</span>
        </a>` : ''}

      <h2 class="section-title">Temes</h2>
      <div class="topic-grid">
        ${ML.topics.all().map((t) => t.comingSoon ? `
          <div class="topic-card is-soon" style="--topic:${t.color}">
            <div class="topic-icon">${t.icon}</div>
            <h3>${t.title}</h3>
            <p>${t.description}</p>
            <span class="badge">Aviat</span>
          </div>` : `
          <a class="topic-card" href="#/tema/${t.id}" style="--topic:${t.color}">
            <div class="topic-icon">${t.icon}</div>
            <h3>${t.title}</h3>
            <p>${t.description}</p>
            <span class="badge badge-go">${t.skills.length} apartats →</span>
          </a>`).join('')}
      </div>`;

    const form = root.querySelector('.js-name');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = form.querySelector('input').value.trim();
        if (!v) return;
        ML.storage.setName(v);
        ML.app.render();
      });
    }
  };
})(window.MathLab);
