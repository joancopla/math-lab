/* Pàgina de progrés: estadístiques, estrelles, rècords i errors més freqüents. */
(function (ML) {
  'use strict';

  const U = ML.utils;
  ML.views = ML.views || {};

  ML.views.progress = (root) => {
    const s = ML.storage.get();
    const pct = s.totals.tries ? Math.round((100 * s.totals.ok) / s.totals.tries) : 0;
    // Errors dels temes del curs actual.
    const errs = ML.storage.topErrors(null, 100).filter((e) => {
      const t = ML.topics.get(e.topic);
      return t && t.course === ML.topics.course();
    }).slice(0, 6);
    const exams = ML.storage.exams();

    root.innerHTML = `
      ${ML.ui.crumbs([['Inici', '#/'], ['Progrés']])}
      <h1>El meu progrés <span class="muted">· ${ML.topics.courseInfo().label}</span></h1>

      <form class="name-form js-name">
        <label for="name-edit">Nom</label>
        <input id="name-edit" type="text" maxlength="30" value="${U.esc(s.name)}" placeholder="El teu nom">
        <button class="btn btn-small">Desa</button>
      </form>

      <div class="end-stats">
        <div class="stat"><span class="stat-big">🔥 ${ML.storage.dayStreak()}</span><span>dies seguits (rècord: ${s.days.best})</span></div>
        <div class="stat"><span class="stat-big">${s.totals.ok}/${s.totals.tries}</span><span>encerts al primer intent (${pct}%)</span></div>
        <div class="stat"><span class="stat-big">${U.fmt(s.points)}</span><span>punts</span></div>
      </div>

      ${ML.topics.available().map((t) => {
        const ch = s.challenge[t.id];
        return `
          <h2 class="section-title">${t.title}</h2>
          <div class="table-wrap">
            <table class="progress-table">
              <thead><tr><th>Apartat</th><th>Nivell 1</th><th>Nivell 2</th><th>Nivell 3</th></tr></thead>
              <tbody>
                ${t.skills.map((sk) => `
                  <tr>
                    <th scope="row"><a href="#/tema/${t.id}/practica/${sk.id}/${ML.storage.recommendedLevel(t.id, sk.id)}">${sk.title}</a></th>
                    ${[1, 2, 3].map((l) => {
                      const ls = ML.storage.level(t.id, sk.id, l);
                      const star = ls.bestRun >= ML.storage.STAR_RUN;
                      return `<td class="${star ? 'has-star' : ''}">${star ? '⭐' : '☆'}
                        <small>${ls.tries ? `${ls.ok}/${ls.tries}` : '—'}</small></td>`;
                    }).join('')}
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <p class="record">🏆 Mode repte: ${ch ? `rècord de ${ch.best} punts i ratxa màxima de ${ch.bestStreak}, en ${ch.played} ${ch.played === 1 ? 'partida' : 'partides'}` : 'encara no hi has jugat'}</p>`;
      }).join('')}

      <h2 class="section-title">Exàmens sorpresa</h2>
      ${exams.length ? `
        <div class="exam-history">${exams.slice(-10).reverse().map((x) => {
          const g = Math.round((x.ok / x.n) * 100) / 10;
          const [y, m, d] = x.date.split('-');
          const tt = x.topic && ML.topics.get(x.topic);
          return `<span class="exam-chip ${g >= 5 ? 'is-pass' : 'is-fail'}"><b>${U.fmt(g)}</b><small>${tt ? tt.title : 'Barrejat'}</small><small>${d}/${m}/${y}</small></span>`;
        }).join('')}</div>` : '<p class="muted">Encara no n\'has fet cap.</p>'}
      <p><a class="btn btn-3d btn-blue" href="#/examen">📝 Fes un examen sorpresa</a></p>

      <h2 class="section-title">Errors que més repeteixo</h2>
      ${errs.length ? `<div class="mistakes">${errs.map((e) => {
        const info = ML.topics.errorInfo(e.topic, e.id);
        return `
          <article class="mistake">
            <p class="mistake-title">${info.title} <span class="count">${e.count} ${e.count === 1 ? 'vegada' : 'vegades'}</span></p>
            <p>${info.explain}</p>
          </article>`;
      }).join('')}</div>` : '<p class="muted">Encara no hi ha errors registrats. Som-hi!</p>'}

      <div class="danger-zone">
        <button class="btn btn-ghost btn-small js-reset">Esborra tot el progrés</button>
      </div>`;

    root.querySelector('.js-name').addEventListener('submit', (e) => {
      e.preventDefault();
      ML.storage.setName(root.querySelector('#name-edit').value);
      ML.app.render();
    });
    root.querySelector('.js-reset').addEventListener('click', () => {
      if (window.confirm('Segur que vols esborrar tot el progrés? No es pot desfer.')) {
        ML.storage.reset();
        ML.app.render();
      }
    });
  };
})(window.MathLab);
