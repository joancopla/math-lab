/* Registre de temes. Cada tema és un mòdul independent que crida MathLab.topics.register(def).
 *
 * Contracte d'un tema (vegeu README.md per al detall):
 * {
 *   id, title, icon, color, description,
 *   course?: '1eso' | '6e',          // curs (per defecte, 1r d'ESO)
 *   comingSoon?: true,                 // es mostra a l'inici però no es pot obrir
 *   errors: { idError: { title, explain } },   // catàleg d'errors típics del tema
 *   skills: [{ id, title, summary, theory, levels?: [desc1, desc2, desc3], generate(level) -> exercici }],
 *   visuals?: [{ id, title, description, mount(container) -> cleanup? }],
 * }
 */
(function (ML) {
  'use strict';

  const list = [];

  // Cursos de l'app. Cada tema en té un (per defecte, 1r d'ESO) i només es mostren els del curs triat.
  const COURSES = [
    { id: '1eso', label: '1r ESO', name: "1r d'ESO" },
    { id: '6e', label: '6è', name: '6è de primària' },
  ];
  let course = COURSES[0].id;
  const inCourse = (t) => t.course === course;

  ML.topics = {
    register(def) {
      if (!def || !def.id) throw new Error('Un tema necessita un id');
      if (list.some((t) => t.id === def.id)) throw new Error(`Tema duplicat: ${def.id}`);
      def.skills = def.skills || [];
      def.visuals = def.visuals || [];
      def.errors = def.errors || {};
      def.course = def.course || COURSES[0].id;
      list.push(def);
      return def;
    },
    courses: COURSES,
    /** Curs actual (id) i canvi de curs (el desa ML.storage.setCourse). */
    course: () => course,
    courseInfo: (id = course) => COURSES.find((c) => c.id === id) || COURSES[0],
    setCourse(id) {
      if (COURSES.some((c) => c.id === id)) course = id;
    },
    /** Temes del curs actual (all: també els «aviat»; available: només els que es poden obrir). */
    all: () => list.filter(inCourse),
    available: () => list.filter((t) => inCourse(t) && !t.comingSoon),
    /** Temes de tots els cursos (per a les proves). */
    everything: () => list.slice(),
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
