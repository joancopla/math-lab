/* Progrés desat a localStorage. Tot el que es desa passa per aquí. */
(function (ML) {
  'use strict';

  const U = ML.utils;
  const KEY = 'mathlab-1reso.v1';
  const STAR_RUN = 5; // encerts seguits en un nivell per guanyar-ne l'estrella

  const fresh = () => ({
    version: 1,
    name: '',
    points: 0,
    totals: { tries: 0, ok: 0 },
    days: { last: null, streak: 0, best: 0 },
    skills: {},     // "tema/habilitat" -> { levels: { 1: { tries, ok, run, bestRun } }, lastAt }
    errors: {},     // "tema:idError" -> recompte
    challenge: {},  // tema -> { best, bestStreak, played }
    last: null,     // última pràctica: { topic, skill, level }
  });

  let state = load();
  const listeners = new Set();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      const data = JSON.parse(raw);
      return Object.assign(fresh(), data);
    } catch (e) {
      return fresh();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* navegació privada o emmagatzematge ple: l'app continua funcionant sense desar */
    }
    listeners.forEach((fn) => fn(state));
  }

  function levelStats(topic, skill, level) {
    const k = `${topic}/${skill}`;
    const s = state.skills[k] || (state.skills[k] = { levels: {}, lastAt: null });
    return s.levels[level] || (s.levels[level] = { tries: 0, ok: 0, run: 0, bestRun: 0 });
  }

  /** Actualitza la ratxa de dies seguits practicant. */
  function touchDay() {
    const today = U.today();
    const d = state.days;
    if (d.last === today) return;
    d.streak = d.last && U.daysBetween(d.last, today) === 1 ? d.streak + 1 : 1;
    d.best = Math.max(d.best, d.streak);
    d.last = today;
    d.log = (d.log || []).concat(today).slice(-60);
  }

  ML.storage = {
    STAR_RUN,
    get: () => state,
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    setName(name) {
      state.name = String(name || '').trim().slice(0, 30);
      save();
    },

    /** Registra el primer intent d'un exercici. Retorna les estadístiques del nivell. */
    recordAnswer({ topic, skill, level, correct, errorId, points = 0 }) {
      touchDay();
      const ls = levelStats(topic, skill, level);
      ls.tries++;
      state.totals.tries++;
      if (correct) {
        ls.ok++;
        ls.run++;
        ls.bestRun = Math.max(ls.bestRun, ls.run);
        state.totals.ok++;
        state.points += points;
      } else {
        ls.run = 0;
        if (errorId) {
          const ek = `${topic}:${errorId}`;
          state.errors[ek] = (state.errors[ek] || 0) + 1;
        }
      }
      state.skills[`${topic}/${skill}`].lastAt = Date.now();
      state.last = { topic, skill, level };
      save();
      return ls;
    },

    /** Desa el resultat d'una partida del mode repte. Retorna si és rècord. */
    recordChallenge(topic, score, streak) {
      touchDay();
      const c = state.challenge[topic] || (state.challenge[topic] = { best: 0, bestStreak: 0, played: 0 });
      const record = score > c.best;
      const streakRecord = streak > c.bestStreak;
      c.played++;
      c.best = Math.max(c.best, score);
      c.bestStreak = Math.max(c.bestStreak, streak);
      state.points += score;
      save();
      return { record, streakRecord, best: c.best, bestStreak: c.bestStreak };
    },

    level(topic, skill, level) {
      const s = state.skills[`${topic}/${skill}`];
      return (s && s.levels[level]) || { tries: 0, ok: 0, run: 0, bestRun: 0 };
    },

    /** Estrelles d'una habilitat: una per nivell, quan s'hi han fet STAR_RUN encerts seguits. */
    stars(topic, skill) {
      return [1, 2, 3].map((l) => ML.storage.level(topic, skill, l).bestRun >= STAR_RUN);
    },

    /** Nivell recomanat: el primer sense estrella. */
    recommendedLevel(topic, skill) {
      const st = ML.storage.stars(topic, skill);
      const i = st.indexOf(false);
      return i === -1 ? 3 : i + 1;
    },

    /** Ratxa de dies (0 si s'ha trencat). */
    dayStreak() {
      const d = state.days;
      if (!d.last) return 0;
      return U.daysBetween(d.last, U.today()) <= 1 ? d.streak : 0;
    },

    /** Si s'ha practicat un dia concret (AAAA-MM-DD). */
    practicedOn(day) {
      return (state.days.log || []).includes(day) || state.days.last === day;
    },

    /** Estrelles aconseguides i possibles en tots els temes disponibles. */
    starTotals() {
      let got = 0;
      let total = 0;
      ML.topics.available().forEach((t) => t.skills.forEach((s) => {
        got += ML.storage.stars(t.id, s.id).filter(Boolean).length;
        total += 3;
      }));
      return { got, total };
    },

    topErrors(topic, n = 5) {
      return Object.entries(state.errors)
        .filter(([k]) => (!topic || k.startsWith(`${topic}:`)) && !k.endsWith(':altre'))
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([k, count]) => {
          const [t, id] = k.split(':');
          return { topic: t, id, count };
        });
    },

    reset() {
      const name = state.name;
      state = fresh();
      state.name = name;
      save();
    },
  };
})(window.MathLab);
