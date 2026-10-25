/* Arrencada i router (basat en el hash de l'URL, perquè funcioni obrint index.html directament). */
(function (ML) {
  'use strict';

  const U = ML.utils;
  const V = () => ML.views;

  const routes = [
    [/^\/?$/, (root) => V().home(root)],
    [/^\/tema\/([\w-]+)$/, (root, m) => V().topic(root, m[1])],
    [/^\/tema\/([\w-]+)\/practica\/([\w-]+)\/(\d)$/, (root, m) => V().practice(root, m[1], m[2], Number(m[3]))],
    [/^\/tema\/([\w-]+)\/visual\/([\w-]+)(?:\/([\w-]+))?$/, (root, m) => V().visual(root, m[1], m[2], m[3])], // m[3]: apartat opcional
    [/^\/repte\/([\w-]+)$/, (root, m) => V().challenge(root, m[1])],
    [/^\/progres$/, (root) => V().progress(root)],
    [/^\/examen(?:\/([\w-]+))?$/, (root, m) => V().exam(root, m[1])],
  ];

  let cleanup = null;

  function render() {
    const root = document.getElementById('app');
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
    const path = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
    // Un enllaç a un tema d'un altre curs (p. ex. #/tema/mesura des de 1r ESO) canvia el curs.
    const tm = path.match(/^\/(?:tema|repte|examen)\/([\w-]+)/);
    const linked = tm && ML.topics.get(tm[1]);
    if (linked) ML.storage.setCourse(linked.course);
    const route = routes.find(([re]) => re.test(path));
    root.innerHTML = '';
    cleanup = route ? route[1](root, path.match(route[0])) : V().notFound(root);
    window.scrollTo(0, 0);
    updateHeader();
  }

  function navSection(path) {
    if (path === '/' || path === '') return 'home';
    if (path.startsWith('/progres')) return 'progress';
    if (path.startsWith('/repte')) return 'challenge';
    if (path.includes('/visual/')) return 'visual';
    if (path.startsWith('/tema')) return 'topic';
    return '';
  }

  /** Els enllaços Tema / Visualitza / Repte del menú apunten al tema que s'està mirant (o a l'últim practicat). */
  function navTopic(path, s) {
    const m = path.match(/^\/(?:tema|repte|examen)\/([\w-]+)/);
    const pickTopic = (id) => {
      const t = id && ML.topics.get(id);
      return t && !t.comingSoon && t.course === ML.topics.course() ? t : null;
    };
    const t = pickTopic(m && m[1]) || pickTopic(s.last && s.last.topic) || ML.topics.available()[0];
    if (!t) return;
    const link = (nav) => document.querySelector(`.subnav a[data-nav="${nav}"]`);
    link('topic').href = `#/tema/${t.id}`;
    document.querySelector('.js-nav-topic').textContent = t.title;
    const vis = link('visual');
    vis.hidden = !t.visuals.length;
    if (t.visuals.length) vis.href = `#/tema/${t.id}/visual/${t.visuals[0].id}`;
    link('challenge').href = `#/repte/${t.id}`;
  }

  /** Selector de curs (1r ESO / 6è) de la capçalera, el títol de la pàgina i el peu. */
  function updateCourse() {
    const c = ML.topics.courseInfo();
    const box = document.querySelector('.js-course');
    if (box && !box.children.length) {
      box.innerHTML = ML.topics.courses.map((x) => `<button type="button" data-course="${x.id}">${x.label}</button>`).join('');
      box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-course]');
        if (!b || b.dataset.course === ML.topics.course()) return;
        ML.storage.setCourse(b.dataset.course);
        if (location.hash === '' || location.hash === '#/') render();
        else location.hash = '#/';
      });
    }
    if (box) {
      box.querySelectorAll('[data-course]').forEach((b) => {
        const on = b.dataset.course === c.id;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    document.title = `Math Lab ${c.label}`;
    const foot = document.querySelector('.js-footer');
    if (foot) foot.textContent = `Math Lab · ${c.name}`;
  }

  function updateHeader() {
    updateCourse();
    const s = ML.storage.get();
    const streak = ML.storage.dayStreak();
    const stars = ML.storage.starTotals();
    const set = (sel, value, title) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.querySelector('b').textContent = value;
      if (title) el.title = title;
    };
    set('.js-hdr-streak', streak, `${streak} ${streak === 1 ? 'dia seguit' : 'dies seguits'} complint l'objectiu`);
    document.querySelector('.js-hdr-streak small').textContent = streak === 1 ? 'dia' : 'dies';
    set('.js-hdr-stars', stars.got, `${stars.got} de ${stars.total} estrelles`);
    document.querySelector('.js-hdr-stars small').textContent = `/ ${stars.total}`;
    set('.js-hdr-points', U.fmt(s.points), `${U.fmt(s.points)} punts`);
    const av = document.querySelector('.js-hdr-avatar');
    if (av) av.textContent = s.name ? s.name.trim().charAt(0).toUpperCase() : '?';

    const path = decodeURIComponent(location.hash.replace(/^#/, ''));
    navTopic(path, s);
    const section = navSection(path);
    document.querySelectorAll('.subnav a').forEach((a) => {
      const on = a.dataset.nav === section;
      a.classList.toggle('is-on', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  ML.app = { render };

  ML.storage.onChange(updateHeader);
  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);
})(window.MathLab);
