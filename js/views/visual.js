/* Contenidor per a les visualitzacions interactives d'un tema. */
(function (ML) {
  'use strict';

  ML.views = ML.views || {};

  ML.views.visual = (root, topicId, visualId) => {
    const t = ML.topics.get(topicId);
    const v = t && t.visuals.find((x) => x.id === visualId);
    if (!v) return ML.views.notFound(root);

    root.innerHTML = `
      ${ML.ui.crumbs([['Inici', '#/'], [t.title, `#/tema/${t.id}`], [v.title]])}
      <h1>${v.title}</h1>
      <p class="lead">${v.description}</p>
      <div class="visual-host"></div>`;

    return v.mount(root.querySelector('.visual-host'));
  };
})(window.MathLab);
