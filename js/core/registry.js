/* Registre de temes. Cada tema és un mòdul independent que crida MathLab.topics.register(def).
 *
 * Contracte d'un tema (vegeu README.md per al detall):
 * {
 *   id, title, icon, color, description,
 *   comingSoon?: true,                 // es mostra a l'inici però no es pot obrir
 *   errors: { idError: { title, explain } },   // catàleg d'errors típics del tema
 *   skills: [{ id, title, summary, theory, levels?: [desc1, desc2, desc3], generate(level) -> exercici }],
 *   visuals?: [{ id, title, description, mount(container) -> cleanup? }],
 * }
 */
(function (ML) {
  'use strict';

  const list = [];

  ML.topics = {
    register(def) {
      if (!def || !def.id) throw new Error('Un tema necessita un id');
      if (list.some((t) => t.id === def.id)) throw new Error(`Tema duplicat: ${def.id}`);
      def.skills = def.skills || [];
      def.visuals = def.visuals || [];
      def.errors = def.errors || {};
      list.push(def);
      return def;
    },
    all: () => list.slice(),
    available: () => list.filter((t) => !t.comingSoon),
    get: (id) => list.find((t) => t.id === id) || null,
    skill: (topicId, skillId) => {
      const t = ML.topics.get(topicId);
      return t ? t.skills.find((s) => s.id === skillId) || null : null;
    },
    /** Títol i explicació d'un error (primer el catàleg del tema, després el general). */
    errorInfo: (topicId, errorId) => {
      const t = ML.topics.get(topicId);
      return (t && t.errors[errorId]) || ML.checker.coreErrors[errorId] || { title: errorId, explain: '' };
    },
  };
})(window.MathLab);
