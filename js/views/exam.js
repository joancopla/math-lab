/* Examen sorpresa: preguntes de tots els temes, triades entre els apartats que menys s'han practicat
 * i evitant enunciats que ja han sortit en exàmens anteriors. Sense pistes ni correcció fins al final;
 * en acabar, la nota sobre 10 i el repàs de cada pregunta.
 */
(function (ML) {
  'use strict';

  const U = ML.utils;
  ML.views = ML.views || {};

  const N = 10;

  /** Empremta curta d'un enunciat (per no repetir exercicis entre exàmens). */
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function gradeName(g) {
    if (g >= 9) return 'Excel·lent';
    if (g >= 7) return 'Notable';
    if (g >= 6) return 'Bé';
    if (g >= 5) return 'Suficient';
    return 'Insuficient';
  }

  /** Una resposta (de l'alumna o la correcta) en HTML, segons el tipus d'exercici. */
  function showValue(ex, v) {
    if (v == null) return '<i>en blanc</i>';
    switch (ex.input.type) {
      case 'fraction': return U.frac(U.fmt(v.num), U.fmt(v.den));
      case 'power': return U.pw(v.base, v.exp);
      case 'choice': {
        const o = ex.input.options.find((x) => x.value === String(v));
        return o ? o.label : '';
      }
      default: return U.fmt(v);
    }
  }

  /** Apartats d'un tema ordenats de menys a més practicats (els empats, a l'atzar). */
  const leastPracticed = (t) => U.shuffle(t.skills).sort((a, b) => ML.storage.skillTries(t.id, a.id) - ML.storage.skillTries(t.id, b.id));

  /** Tria les preguntes.
   *  - Barrejat: de cada tema, els apartats amb menys intents.
   *  - D'un sol tema: una pregunta de cada apartat (com en un examen de classe) i la resta, dels menys practicats. */
  function pickQuestions(topic) {
    const seen = ML.storage.examSeen();
    const picks = []; // [tema, apartat]
    if (topic) {
      const ranked = leastPracticed(topic);
      for (let k = 0; picks.length < N; k++) picks.push([topic, ranked[k % ranked.length]]);
    } else {
      const topics = ML.topics.available();
      const perTopic = Math.max(1, Math.round(N / topics.length));
      topics.forEach((t) => leastPracticed(t).slice(0, perTopic).forEach((s) => picks.push([t, s])));
    }
    const keys = new Set();
    const qs = picks.slice(0, N).map(([t, skill]) => {
      const level = ML.storage.recommendedLevel(t.id, skill.id);
      let ex;
      let key;
      for (let i = 0; i < 15; i++) {
        ex = skill.generate(level);
        key = hash(ex.prompt);
        if (!seen.has(key) && !keys.has(key)) break;
      }
      keys.add(key);
      return { topic: t, skill, level, ex, key };
    });
    // Un examen d'un tema segueix l'ordre dels apartats; el barrejat, a l'atzar.
    if (topic) {
      const order = topic.skills.map((s) => s.id);
      return qs.sort((a, b) => order.indexOf(a.skill.id) - order.indexOf(b.skill.id));
    }
    return U.shuffle(qs);
  }

  ML.views.exam = (root, topicId) => {
    const topic = topicId ? ML.topics.get(topicId) : null;
    if (topicId && (!topic || topic.comingSoon)) return ML.views.notFound(root);
    const title = topic ? `Examen de ${topic.title.toLowerCase()}` : 'Examen sorpresa';
    const crumbs = () => ML.ui.crumbs(topic ? [['Inici', '#/'], [topic.title, `#/tema/${topic.id}`], ['Examen']] : [['Inici', '#/'], ['Examen sorpresa']]);
    let qs;
    let i;

    function intro() {
      const past = (ML.storage.get().exams || []).filter((x) => (x.topic || null) === (topic ? topic.id : null));
      const last = past[past.length - 1];
      const best = past.reduce((m, x) => Math.max(m, x.ok / x.n), 0);
      root.innerHTML = `
        ${crumbs()}
        <section class="challenge-intro exam-intro">
          <div class="trophy">📝</div>
          <h1>${title}</h1>
          <ul class="rules">
            ${topic
              ? `<li>❓ <b>${N} preguntes</b> de tots els apartats del tema, com en un examen de classe.</li>
                 <li>🎯 Les preguntes que sobren surten dels apartats que <b>menys has practicat</b>.</li>`
              : `<li>❓ <b>${N} preguntes</b> de tots els temes, barrejades.</li>
                 <li>🎯 Surten sobretot dels apartats que <b>menys has practicat</b>, i no es repeteixen exercicis d'altres exàmens.</li>`}
            <li>🤫 Com en un examen de veritat: <b>sense pistes</b> i sense saber si està bé fins al final.</li>
            <li>🤷 Si no saps fer-ne una, toca <b>«No ho sé»</b> i passa a la següent.</li>
            <li>🏁 Al final tindràs la <b>nota</b> i la solució de cada pregunta.</li>
          </ul>
          ${last ? `<p class="record">Últim examen: <b>${U.fmt(Math.round((last.ok / last.n) * 100) / 10)}</b> · Millor nota: <b>${U.fmt(Math.round(best * 100) / 10)}</b></p>` : ''}
          <button class="btn btn-3d btn-blue btn-xl js-start">Comença l'examen</button>
          <div class="exam-other">
            <p class="muted">${topic ? 'O bé:' : 'O fes l\'examen d\'un sol tema:'}</p>
            <div class="exam-topics">
              ${topic ? '<a class="btn btn-small" href="#/examen">📝 Examen barrejat de tots els temes</a>' : ''}
              ${ML.topics.available().filter((t) => !topic || t.id !== topic.id).map((t) => `
                <a class="btn btn-small" href="#/examen/${t.id}"><span class="exam-topic-icon" style="--topic:${t.color}">${t.icon}</span>${t.title}</a>`).join('')}
            </div>
          </div>
        </section>`;
      root.querySelector('.js-start').addEventListener('click', start);
      root.querySelector('.js-start').focus();
    }

    function start() {
      qs = pickQuestions(topic);
      i = 0;
      root.innerHTML = `
        ${crumbs()}
        <div class="exam-head">
          <span class="tag tag-purple js-topic"></span>
          <b class="js-count"></b>
        </div>
        <div class="exam-bar" aria-hidden="true"><span class="js-bar"></span></div>
        <div class="ex-host"></div>`;
      show();
    }

    function show() {
      if (i >= qs.length) return end();
      const q = qs[i];
      root.querySelector('.js-topic').textContent = topic ? q.skill.title : `${q.topic.title} · ${q.skill.title}`;
      root.querySelector('.js-count').textContent = `Pregunta ${i + 1} de ${qs.length}`;
      root.querySelector('.js-bar').style.width = `${(100 * i) / qs.length}%`;
      ML.mountExercise(root.querySelector('.ex-host'), q.ex, {
        topic: q.topic.id,
        mode: 'exam',
        onFirstAnswer: (res) => {
          q.res = res;
          const rec = ML.storage.recordAnswer({
            topic: q.topic.id, skill: q.skill.id, level: q.level, correct: res.correct, errorId: res.errorId,
            points: res.correct ? 10 * q.level : 0, exam: true,
          });
          if (rec.goalReached) ML.celebrate.toast('🔥 Objectiu d\'avui complert!', { kind: 'gold' });
        },
        onNext: () => {
          i++;
          window.scrollTo(0, 0);
          show();
        },
      });
    }

    function end() {
      const ok = qs.filter((q) => q.res && q.res.correct).length;
      const grade = Math.round((ok / qs.length) * 100) / 10;
      const { prevBest } = ML.storage.recordExam(ok, qs.length, topic ? topic.id : null);
      ML.storage.markExamSeen(qs.map((q) => q.key));
      const better = prevBest > 0 && grade > prevBest;
      if (grade >= 9 || (better && grade >= 5)) ML.celebrate.confetti(90);
      const msg = grade >= 9 ? 'Ho domines!' : grade >= 7 ? 'Molt bona feina!' : grade >= 5 ? 'Aprovat! Repassa els errors i encara ho faràs millor.'
        : 'Aquest cop ha costat. Repassa les solucions i practica els apartats on t\'has equivocat.';
      root.innerHTML = `
        ${crumbs()}
        <section class="challenge-end exam-end">
          <p class="exam-grade-label">La teva nota</p>
          <div class="exam-grade ${grade >= 5 ? 'is-pass' : 'is-fail'}">${U.fmt(grade)}</div>
          <h1>${gradeName(grade)}</h1>
          <p class="record">${ok} de ${qs.length} correctes. ${msg}${better ? ' 🎉 És la teva millor nota!' : ''}</p>
          <div class="end-actions">
            <button class="btn btn-3d btn-blue js-again">Un altre examen</button>
            <a class="btn btn-ghost" href="${topic ? `#/tema/${topic.id}` : '#/'}">${topic ? 'Torna al tema' : 'Torna a l\'inici'}</a>
          </div>
          <h2 class="section-title">Repàs pregunta per pregunta</h2>
          <div class="exam-review">
            ${qs.map((q, k) => {
              const r = q.res || { correct: false, skipped: true };
              const info = r.errorId ? ML.topics.errorInfo(q.topic.id, r.errorId) : null;
              return `
                <article class="exam-item ${r.correct ? 'is-ok' : 'is-ko'}">
                  <p class="exam-item-head"><span class="exam-mark">${r.correct ? '✓' : '✗'}</span> ${k + 1}. ${topic ? q.skill.title : `${q.topic.title} · ${q.skill.title}`}</p>
                  <div class="mistake-q">${q.ex.prompt}</div>
                  <p><b>La teva resposta:</b> ${r.skipped ? '<i>«No ho sé»</i>' : showValue(q.ex, r.value)}</p>
                  ${r.correct ? '' : `
                    ${info && r.errorId !== 'altre' ? `<p class="mistake-title">Compte! ${info.title}</p>` : ''}
                    ${r.msg ? `<p>${r.msg}</p>` : ''}
                    <p class="mistake-sol"><b>Solució:</b> ${q.ex.solution || showValue(q.ex, q.ex.answer)}</p>
                    <p><a href="#/tema/${q.topic.id}/practica/${q.skill.id}/${q.level}">Practica aquest apartat →</a></p>`}
                </article>`;
            }).join('')}
          </div>
        </section>`;
      root.querySelector('.js-again').addEventListener('click', start);
    }

    intro();
  };
})(window.MathLab);
