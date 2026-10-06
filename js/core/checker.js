/* Correcció de respostes i detecció d'errors típics.
 *
 * Un exercici declara:
 *   input:  { type: 'number' } | { type: 'power' } | { type: 'choice', options: [{ value, label }] }
 *   answer: nombre | { base, exp } | valor de l'opció correcta
 *   traps:  [{ match?: valor, test?: (valor) => bool, id: 'idError', msg: 'html' }]
 *
 * Si la resposta és incorrecta, es busca el primer "parany" (trap) que hi encaixa:
 * així sabem QUIN error ha comès l'alumna i li podem explicar.
 */
(function (ML) {
  'use strict';

  const U = ML.utils;
  const C = {};

  C.coreErrors = {
    altre: { title: 'Altres errors', explain: 'Errors de càlcul o respostes que no encaixen amb cap error típic.' },
    forma_equivalent: { title: 'Valor correcte, forma incorrecta', explain: 'El valor és bo, però la resposta no té la forma que es demana (per exemple, una altra base).' },
    base_canviada: { title: 'Canviar la base', explain: 'En operar potències de la mateixa base, la base no canvia: només operem amb els exponents.' },
    exponent_incorrecte: { title: 'Exponent incorrecte', explain: 'La base és correcta, però l\'exponent no. Revisa quina operació cal fer amb els exponents.' },
  };

  /** Converteix l'entrada en brut en un valor comparable, o null si no és vàlida. */
  C.parse = (input, raw) => {
    switch (input.type) {
      case 'number': {
        const n = U.parseNumber(raw);
        return Number.isNaN(n) ? null : n;
      }
      case 'power': {
        if (!raw) return null;
        const b = String(raw.base == null ? '' : raw.base).trim().toLowerCase();
        const e = U.parseNumber(raw.exp);
        if (!b || Number.isNaN(e)) return null;
        const bn = U.parseNumber(b);
        return { base: Number.isNaN(bn) ? b : bn, exp: e };
      }
      case 'choice':
        return raw == null || raw === '' ? null : String(raw);
      default:
        throw new Error(`Tipus d'entrada desconegut: ${input.type}`);
    }
  };

  /** Clau de comparació d'un valor. */
  C.key = (type, v) => {
    if (v == null) return '';
    if (type === 'power') return `${v.base}^${v.exp}`;
    return String(v);
  };

  C.evaluate = (ex, raw) => {
    const type = ex.input.type;
    const value = C.parse(ex.input, raw);
    if (value === null) return { valid: false };

    const key = C.key(type, value);
    const answerKey = C.key(type, ex.answer);
    if (key === answerKey || (ex.accept && ex.accept(value))) return { valid: true, correct: true, value };

    let trap = (ex.traps || []).find((t) => {
      if (t.match !== undefined) {
        const tk = C.key(type, t.match);
        return tk !== answerKey && tk === key;
      }
      return typeof t.test === 'function' && t.test(value);
    });
    if (!trap && type === 'power') trap = C.powerFallback(ex, value);
    if (!trap) {
      trap = {
        id: 'altre',
        msg: ex.fallback || 'Aquesta resposta no és correcta. Mira la solució pas a pas per veure on t\'has equivocat.',
      };
    }
    return { valid: true, correct: false, value, trap };
  };

  /** Diagnòstic genèric per a respostes en forma de potència. */
  C.powerFallback = (ex, v) => {
    const a = ex.answer;
    if (typeof v.base === 'number' && typeof a.base === 'number' &&
        Math.pow(v.base, v.exp) === Math.pow(a.base, a.exp)) {
      return {
        id: 'forma_equivalent',
        msg: `Has trobat el valor correcte (${U.pw(v.base, v.exp)} = ${U.fmt(Math.pow(a.base, a.exp))}), però et demanem el resultat com una potència de base <b>${a.base}</b>.`,
      };
    }
    if (v.base !== a.base && v.exp === a.exp) {
      return {
        id: 'base_canviada',
        msg: `L'exponent és correcte, però la base ha de ser <b>${a.base}</b>. Quan operem potències de la mateixa base, la base es manté igual.`,
      };
    }
    if (v.base === a.base) {
      return {
        id: 'exponent_incorrecte',
        msg: `La base (${a.base}) és correcta, però l'exponent no. Revisa quina operació has de fer amb els exponents.`,
      };
    }
    return null;
  };

  ML.checker = C;
})(window.MathLab);
