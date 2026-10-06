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

  function updateHeader() {
    const s = ML.storage.get();
    const streak = ML.storage.dayStreak();
    const st = document.querySelector('.js-hdr-streak');
    const pt = document.querySelector('.js-hdr-points');
    if (st) {
      st.textContent = `🔥 ${streak}`;
      st.title = `${streak} ${streak === 1 ? 'dia seguit' : 'dies seguits'} practicant`;
    }
    if (pt) pt.textContent = `${U.fmt(s.points)} punts`;
  }

  ML.app = { render };

  ML.storage.onChange(updateHeader);
  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);
})(window.MathLab);
