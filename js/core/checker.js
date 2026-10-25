/* Correcció de respostes i detecció d'errors típics.
 *
 * Un exercici declara:
 *   input:  { type: 'number', signed? } | { type: 'power' } | { type: 'fraction', anyForm? } | { type: 'choice', options: [{ value, label }] }
 *   answer: nombre | { base, exp } | { num, den } | valor de l'opció correcta
 *   Amb 'fraction' la resposta ha de ser exactament aquesta fracció (normalment, la irreductible);
 *   amb anyForm: true, també es dona per bona qualsevol fracció equivalent.
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
    fraccio_no_irreductible: { title: 'Fracció sense simplificar', explain: 'El valor és bo, però cal donar la fracció irreductible: divideix el numerador i el denominador pel seu mcd.' },
  };

  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  /** Dues fraccions tenen el mateix valor? */
  C.sameValue = (a, b) => a.num * b.den === b.num * a.den;

  /** Converteix l'entrada en brut en un valor comparable, o null si no és vàlida. */
  C.parse = (input, raw) => {
    switch (input.type) {
      case 'number': {
        // Amb decimals, el punt també és la coma decimal: «3.25» = 3,25 (no 325).
        const s = input.decimal && typeof raw === 'string' && !raw.includes(',') ? raw.replace(/\./g, ',') : raw;
        const n = U.parseNumber(s);
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
      case 'fraction': {
        if (!raw) return null;
        const n = U.parseNumber(raw.num);
        const d = U.parseNumber(raw.den);
        if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) return null;
        // El signe sempre al numerador; i res de −0.
        return d < 0 ? { num: -n || 0, den: -d } : { num: n || 0, den: d };
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
    if (type === 'fraction') return `${v.num}/${v.den}`;
    return String(v);
  };

  C.evaluate = (ex, raw) => {
    const type = ex.input.type;
    const value = C.parse(ex.input, raw);
    if (value === null) return { valid: false };

    const key = C.key(type, value);
    const answerKey = C.key(type, ex.answer);
    const anyForm = type === 'fraction' && ex.input.anyForm && C.sameValue(value, ex.answer);
    if (key === answerKey || anyForm || (ex.accept && ex.accept(value))) return { valid: true, correct: true, value };

    let trap = (ex.traps || []).find((t) => {
      if (t.match !== undefined) {
        const tk = C.key(type, t.match);
        return tk !== answerKey && tk === key;
      }
      return typeof t.test === 'function' && t.test(value);
    });
    if (!trap && type === 'power') trap = C.powerFallback(ex, value);
    if (!trap && type === 'fraction') trap = C.fractionFallback(ex, value);
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

  /** Diagnòstic genèric per a fraccions: el valor és bo però no és la irreductible. */
  C.fractionFallback = (ex, v) => {
    if (!C.sameValue(v, ex.answer)) return null;
    const g = gcd(v.num, v.den);
    return {
      id: 'fraccio_no_irreductible',
      msg: g > 1
        ? `El valor és correcte, però encara es pot simplificar: divideix el numerador i el denominador per ${g}. Et demanem la fracció <b>irreductible</b>.`
        : 'El valor és correcte, però et demanem la fracció d\'una altra manera. Llegeix bé l\'enunciat.',
    };
  };

  ML.checker = C;
})(window.MathLab);
