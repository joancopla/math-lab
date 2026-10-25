/* Pàgina d'un tema: apartats, nivells, visualitzacions i mode repte. */
(function (ML) {
  'use strict';

  ML.views = ML.views || {};

  ML.ui = ML.ui || {};
  ML.ui.stars = (arr) => `<span class="stars" aria-label="${arr.filter(Boolean).length} de 3 estrelles">${
    arr.map((on) => `<span class="${on ? 'on' : ''}">★</span>`).join('')}</span>`;
  ML.ui.crumbs = (items) => `<nav class="crumbs">${items
    .map(([label, href]) => (href ? `<a href="${href}">${label}</a>` : `<span>${label}</span>`))
    .join('<span class="sep">›</span>')}</nav>`;

  /** «Última nota: 7 · Millor: 8,5» dels exàmens d'aquest tema, o '' si no n'hi ha cap. */
  function examNote(topicId) {
    const past = (ML.storage.get().exams || []).filter((x) => x.topic === topicId);
    if (!past.length) return '';
    const g = (x) => ML.utils.fmt(Math.round((x.ok / x.n) * 100) / 10);
    const best = past.reduce((a, b) => (b.ok / b.n > a.ok / a.n ? b : a));
    return `Última nota: <b>${g(past[past.length - 1])}</b> · Millor: <b>${g(best)}</b>`;
  }

  ML.views.topic = (root, topicId) => {
    const t = ML.topics.get(topicId);
    if (!t || t.comingSoon) return ML.views.notFound(root);
    const ch = ML.storage.get().challenge[t.id];

    root.innerHTML = `
      ${ML.ui.crumbs([['Inici', '#/'], [t.title]])}
      <header class="topic-head" style="--topic:${t.color}">
        <div class="topic-icon big">${t.icon}</div>
        <div>
          <h1>${t.title}</h1>
          <p class="lead">${t.description}</p>
        </div>
      </header>

      <div class="action-grid">
        ${t.visuals.map((v) => `
          <a class="action-card" href="#/tema/${t.id}/visual/${v.id}">
            <span class="action-emoji">${v.emoji || '🧊'}</span>
            <div><h3>${v.title}</h3><p>${v.description}</p></div>
          </a>`).join('')}
        <a class="action-card is-challenge" href="#/repte/${t.id}">
          <span class="action-emoji">🏆</span>
          <div>
            <h3>Mode repte</h3>
            <p>${ch ? `El teu rècord: <b>${ch.best}</b> punts. Ratxa màxima: <b>${ch.bestStreak}</b>.` : 'Preguntes barrejades, 3 vides i ratxes. T\'hi atreveixes?'}</p>
          </div>
        </a>
        <a class="action-card" href="#/examen/${t.id}">
          <span class="action-emoji">📝</span>
          <div>
            <h3>Examen del tema</h3>
            <p>${examNote(t.id) || '10 preguntes de tots els apartats, sense pistes. Al final, la nota.'}</p>
          </div>
        </a>
      </div>

      <h2 class="section-title">Practica</h2>
      <div class="skill-list">
        ${t.skills.map((s, i) => {
          const stars = ML.storage.stars(t.id, s.id);
          const rec = ML.storage.recommendedLevel(t.id, s.id);
          return `
            <article class="skill-card">
              <div class="skill-info">
                <h3><span class="skill-num">${i + 1}</span> ${s.title}</h3>
                <p>${s.summary}</p>
                ${ML.ui.stars(stars)}
              </div>
              <div class="levels">
                ${[1, 2, 3].map((l) => `
                  <a class="lvl ${stars[l - 1] ? 'is-done' : ''} ${l === rec && !stars[l - 1] ? 'is-rec' : ''}"
                     href="#/tema/${t.id}/practica/${s.id}/${l}">
                    <b>Nivell ${l}${stars[l - 1] ? ' ★' : ''}</b>
                    <small>${(s.levels && s.levels[l - 1]) || ''}</small>
                  </a>`).join('')}
              </div>
            </article>`;
        }).join('')}
      </div>`;
  };

  ML.views.notFound = (root) => {
    root.innerHTML = `
      <div class="empty">
        <h1>Aquesta pàgina no existeix 🤔</h1>
        <p><a class="btn btn-primary" href="#/">Torna a l'inici</a></p>
      </div>`;
  };
})(window.MathLab);
