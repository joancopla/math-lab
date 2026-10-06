/* Arrencada i router (basat en el hash de l'URL, perquè funcioni obrint index.html directament). */
(function (ML) {
  'use strict';

  const U = ML.utils;
  const V = () => ML.views;

  const routes = [
    [/^\/?$/, (root) => V().home(root)],
    [/^\/tema\/([\w-]+)$/, (root, m) => V().topic(root, m[1])],
    [/^\/tema\/([\w-]+)\/practica\/([\w-]+)\/(\d)$/, (root, m) => V().practice(root, m[1], m[2], Number(m[3]))],
    [/^\/tema\/([\w-]+)\/visual\/([\w-]+)$/, (root, m) => V().visual(root, m[1], m[2])],
    [/^\/repte\/([\w-]+)$/, (root, m) => V().challenge(root, m[1])],
    [/^\/progres$/, (root) => V().progress(root)],
  ];

  let cleanup = null;

  function render() {
    const root = document.getElementById('app');
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
    const path = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
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

  function updateHeader() {
    const s = ML.storage.get();
    const streak = ML.storage.dayStreak();
    const stars = ML.storage.starTotals();
    const set = (sel, value, title) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.querySelector('b').textContent = value;
      if (title) el.title = title;
    };
    set('.js-hdr-streak', streak, `${streak} ${streak === 1 ? 'dia seguit' : 'dies seguits'} practicant`);
    document.querySelector('.js-hdr-streak small').textContent = streak === 1 ? 'dia' : 'dies';
    set('.js-hdr-stars', stars.got, `${stars.got} de ${stars.total} estrelles`);
    document.querySelector('.js-hdr-stars small').textContent = `/ ${stars.total}`;
    set('.js-hdr-points', U.fmt(s.points), `${U.fmt(s.points)} punts`);
    const av = document.querySelector('.js-hdr-avatar');
    if (av) av.textContent = s.name ? s.name.trim().charAt(0).toUpperCase() : '?';

    const section = navSection(decodeURIComponent(location.hash.replace(/^#/, '')));
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
