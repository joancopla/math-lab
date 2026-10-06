/* Generadors d'exercicis de potències.
 * Cada generador retorna un exercici amb el contracte descrit a js/core/checker.js.
 * Els "traps" són les respostes incorrectes previsibles, amb l'error que delaten i l'explicació.
 */
window.MathLab = window.MathLab || {};
window.MathLab.potencies = window.MathLab.potencies || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const { randInt, pick } = U;
  const H = U.pw;
  const f = U.fmt;
  const BLANK = '<span class="blank">?</span>';

  // ── Constructors d'exercicis ────────────────────────────────────────────────

  const pw = (base, exp) => ({ base, exp });
  const t = (match, id, msg) => ({ match, id, msg });
  const Q = (text, math) => `<p class="q-text">${text}</p><div class="q-math">${math}</div>`;

  const numEx = (o) => Object.assign({ input: { type: 'number' } }, o);
  const powEx = (o) => Object.assign({ input: { type: 'power' } }, o);

  /** Opcions: [{ label, correct?, id?, msg? }]. Les incorrectes amb id es converteixen en traps. */
  function choiceEx({ prompt, options, hint, solution, shuffle = true }) {
    const seen = new Set();
    const unique = options.filter((o) => {
      if (seen.has(o.label)) return false;
      seen.add(o.label);
      return true;
    });
    const ordered = (shuffle ? U.shuffle(unique) : unique).map((o, i) => Object.assign({}, o, { value: 'abcdef'[i] }));
    return {
      input: { type: 'choice', options: ordered.map(({ value, label }) => ({ value, label })) },
      answer: ordered.find((o) => o.correct).value,
      traps: ordered.filter((o) => !o.correct && o.id).map((o) => t(o.value, o.id, o.msg)),
      prompt,
      hint,
      solution,
    };
  }

  const isSquare = (n) => n >= 0 && Number.isInteger(Math.sqrt(n));
  const cbrtInt = (n) => Math.round(Math.cbrt(n));
  const isCube = (n) => n >= 0 && cbrtInt(n) ** 3 === n;

  /** Potència envoltada de parèntesis i elevada: (base)^exp, per a potències de potències. */
  const Hp = (inner, exp) => H(`(${inner})`, exp);

  /** Base sense exponent si l'exponent és 1 (per treballar l'"exponent amagat"). */
  const Hb = (base, e) => (e === 1 ? String(base) : H(base, e));

  /** Multiplicacions parcials: "3 · 3 = 9 → 9 · 3 = 27". */
  function chain(b, n) {
    const parts = [];
    let acc = b;
    for (let i = 2; i <= n; i++) {
      parts.push(`${f(acc)} · ${f(b)} = ${f(acc * b)}`);
      acc *= b;
    }
    return parts.join(' → ');
  }

  function readPow(b, n) {
    const w = U.numWord;
    if (n === 2) return `${w(b)} al quadrat`;
    if (n === 3) return `${w(b)} al cub`;
    return `${w(b)} elevat a ${w(n)}`;
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function betweenSquares(N) {
    const r = Math.floor(Math.sqrt(N));
    return `${H(r, 2)} = ${f(r * r)} i ${H(r + 1, 2)} = ${f((r + 1) ** 2)}: el ${f(N)} queda entre els dos, i entre dos quadrats consecutius no n'hi ha cap altre.`;
  }
  function betweenCubes(N) {
    const r = Math.floor(Math.cbrt(N) + 1e-9);
    return `${H(r, 3)} = ${f(r ** 3)} i ${H(r + 1, 3)} = ${f((r + 1) ** 3)}: el ${f(N)} queda entre els dos.`;
  }

  // ── 1. Notació ─────────────────────────────────────────────────────────────

  function prodAPot(level) {
    const b = level === 1 ? randInt(2, 9) : randInt(2, 15);
    let n = level === 1 ? randInt(2, 5) : randInt(4, 9);
    if (n === b) n++;
    return powEx({
      prompt: Q('Escriu aquest producte en forma de potència:', U.repeat(b, n)),
      answer: pw(b, n),
      traps: [
        t(pw(n, b), 'base_exponent_girats', `Has girat la base i l'exponent. La <b>base</b> és el nombre que es repeteix (${b}) i l'<b>exponent</b> és quantes vegades es repeteix (${n}).`),
        t(pw(b, n - 1), 'factors_mal_comptats', `Torna a comptar els factors: el ${b} hi surt <b>${n}</b> vegades, no ${n - 1}.`),
        t(pw(b, n + 1), 'factors_mal_comptats', `Torna a comptar els factors: el ${b} hi surt <b>${n}</b> vegades, no ${n + 1}.`),
      ],
      hint: 'Quin nombre es repeteix? Aquesta és la base. Quantes vegades hi surt? Aquest és l\'exponent.',
      solution: `El ${b} apareix ${n} vegades com a factor: ${U.repeat(b, n)} = ${H(b, n)}`,
    });
  }

  function identifica() {
    const b = randInt(2, 15);
    let n = randInt(2, 9);
    if (n === b) n++;
    const askBase = Math.random() < 0.5;
    return numEx({
      prompt: Q(`En aquesta potència, quin nombre és ${askBase ? 'la <b>base</b>' : 'l\'<b>exponent</b>'}?`, H(b, n)),
      answer: askBase ? b : n,
      traps: [
        t(askBase ? n : b, 'base_exponent_girats', askBase
          ? `Aquest és l'exponent (el nombre petit de dalt). La base és el nombre gran de baix: <b>${b}</b>.`
          : `Aquesta és la base (el nombre gran de baix). L'exponent és el nombre petit de dalt: <b>${n}</b>.`),
        t(b ** n, 'altre', `No cal calcular la potència! Només et demanem ${askBase ? 'quina és la base' : 'quin és l\'exponent'}.`),
      ],
      hint: 'La base és el nombre gran; l\'exponent és el nombre petit que hi ha a dalt a la dreta.',
      solution: `A ${H(b, n)}, la base és <b>${b}</b> i l'exponent és <b>${n}</b>: el ${b} apareix ${n} vegades com a factor.`,
    });
  }

  function potAProd() {
    const b = randInt(2, 9);
    let n = randInt(3, 6);
    if (n === b) n = n === 6 ? 5 : n + 1;
    return choiceEx({
      prompt: Q('Quina expressió és igual a aquesta potència?', H(b, n)),
      options: [
        { label: U.repeat(b, n), correct: true },
        { label: `${b} · ${n}`, id: 'base_per_exponent', msg: `${H(b, n)} no vol dir ${b} · ${n}. L'exponent indica quantes vegades apareix la base com a factor: ${U.repeat(b, n)}.` },
        { label: U.repeat(n, b), id: 'base_exponent_girats', msg: `Aquí el ${n} es repeteix ${b} vegades: això seria ${H(n, b)}. A ${H(b, n)}, és la base (${b}) la que es repeteix ${n} vegades.` },
        { label: U.repeat(b, n, ' + '), id: 'suma_en_lloc_de_producte', msg: `Això és una suma repetida, i val ${b} · ${n} = ${b * n}. En una potència, la base es <b>multiplica</b> per ella mateixa, no se suma.` },
      ],
      hint: `L'exponent ${n} et diu quantes vegades has d'escriure el ${b} multiplicant.`,
      solution: `${H(b, n)} = ${U.repeat(b, n)} = ${f(b ** n)}`,
    });
  }

  function sumaOProd() {
    const b = randInt(2, 9);
    let n = randInt(3, 6);
    if (n === b) n = n === 6 ? 5 : n + 1;
    const sum = U.repeat(b, n, ' + ');
    const msgPot = `Una potència és una <b>multiplicació</b> repetida, no una suma. Sumar ${n} vegades el ${b} és multiplicar: ${b} · ${n} = ${b * n}.`;
    return choiceEx({
      prompt: Q('Com es pot escriure de manera més curta aquesta suma?', sum),
      options: [
        { label: `${b} · ${n}`, correct: true },
        { label: H(b, n), id: 'suma_en_lloc_de_producte', msg: `${H(b, n)} vol dir ${U.repeat(b, n)}. ${msgPot}` },
        { label: H(n, b), id: 'suma_en_lloc_de_producte', msg: msgPot },
        { label: `${b} + ${n}`, id: 'altre', msg: `${b} + ${n} = ${b + n}, però la suma val ${b * n}. Sumar ${n} vegades el ${b} és multiplicar ${b} · ${n}.` },
      ],
      hint: 'Sumar diverses vegades el mateix nombre és multiplicar.',
      solution: `${sum} = ${b} · ${n} = ${b * n}. Les potències serveixen per a les <b>multiplicacions</b> repetides, no per a les sumes.`,
    });
  }

  function paraules() {
    const n = pick([2, 3, 4, 5, 6, 7, 8]);
    let b = randInt(2, 12);
    if (b === n) b = b === 12 ? 11 : b + 1;
    const text = readPow(b, n);
    const traps = [
      t(pw(n, b), 'base_exponent_girats', `Has girat la base i l'exponent. El primer nombre que es diu (${b}) és la base; l'exponent és ${n}.`),
    ];
    if (n === 2) traps.push(t(pw(b, 3), 'cub_vs_quadrat', '«Al quadrat» vol dir exponent 2. «Al cub» és exponent 3.'));
    if (n === 3) traps.push(t(pw(b, 2), 'cub_vs_quadrat', '«Al cub» vol dir exponent 3. «Al quadrat» és exponent 2.'));
    return powEx({
      prompt: Q('Escriu en forma de potència:', `«${cap(text)}»`),
      answer: pw(b, n),
      traps,
      hint: 'Primer es diu la base i després l\'exponent. «Al quadrat» = exponent 2; «al cub» = exponent 3.',
      solution: `«${cap(text)}» = ${H(b, n)}`,
    });
  }

  function llegir() {
    const n = pick([2, 3, 4, 5, 6]);
    let b = randInt(2, 10);
    if (b === n) b++;
    const w = U.numWord;
    const options = [
      { label: cap(readPow(b, n)), correct: true },
      { label: cap(readPow(n, b)), id: 'base_exponent_girats', msg: `Has girat la base i l'exponent: primer es llegeix la base (${b}) i després l'exponent (${n}).` },
      { label: cap(`${w(b)} per ${w(n)}`), id: 'base_per_exponent', msg: `«${cap(w(b))} per ${w(n)}» és ${b} · ${n}. Una potència no és una multiplicació de la base per l'exponent.` },
    ];
    if (n === 2) options.push({ label: cap(`${w(b)} al cub`), id: 'cub_vs_quadrat', msg: '«Al cub» és exponent 3. Amb exponent 2 es diu «al quadrat».' });
    if (n === 3) options.push({ label: cap(`${w(b)} al quadrat`), id: 'cub_vs_quadrat', msg: '«Al quadrat» és exponent 2. Amb exponent 3 es diu «al cub».' });
    return choiceEx({
      prompt: Q('Com es llegeix aquesta potència?', H(b, n)),
      options,
      hint: 'Es diu primer la base. Exponent 2: «al quadrat». Exponent 3: «al cub». Altres: «elevat a…».',
      solution: `${H(b, n)} es llegeix «${readPow(b, n)}».`,
    });
  }

  function basesDiferents() {
    const [a, b] = U.shuffle([2, 3, 5, 7]).slice(0, 2);
    const m = randInt(2, 4);
    let n = randInt(2, 4);
    if (m === n) n = m === 4 ? 3 : m + 1;
    const prod = `${U.repeat(a, m)} · ${U.repeat(b, n)}`;
    return choiceEx({
      prompt: Q('Escriu aquest producte amb potències:', prod),
      options: [
        { label: `${H(a, m)} · ${H(b, n)}`, correct: true },
        { label: `${H(a, n)} · ${H(b, m)}`, id: 'factors_mal_comptats', msg: `Compta els factors de cada base: el ${a} hi surt ${m} vegades i el ${b}, ${n} vegades.` },
        { label: H(a * b, m + n), id: 'bases_diferents', msg: `Només es poden agrupar en una potència els factors que tenen la <b>mateixa base</b>. Agrupa els ${a} d'una banda i els ${b} de l'altra.` },
        { label: `${H(a, m)} + ${H(b, n)}`, id: 'suma_en_lloc_de_producte', msg: 'Entre els dos grups hi ha un signe de multiplicar, no de sumar.' },
      ],
      hint: 'Agrupa els factors iguals i compta quantes vegades surt cadascun.',
      solution: `${prod} = ${H(a, m)} · ${H(b, n)}`,
    });
  }

  // ── 2. Càlcul de potències ─────────────────────────────────────────────────

  function calcPow(b, n) {
    const val = b ** n;
    const traps = [
      t(b * n, 'base_per_exponent', `Has multiplicat la base per l'exponent (${b} · ${n} = ${f(b * n)}). Però ${H(b, n)} vol dir ${U.repeat(b, n)}.`),
      t(b + n, 'base_per_exponent', `Has sumat la base i l'exponent (${b} + ${n}). Però ${H(b, n)} vol dir ${U.repeat(b, n)}.`),
      t(n ** b, 'base_exponent_girats', `Has calculat ${H(n, b)}: has girat la base i l'exponent. La base (${b}) és el nombre que es multiplica.`),
    ];
    if (b === 10) {
      traps.push(
        t(10 ** (n - 1), 'zeros_10', `Compta bé els zeros: ${H(10, n)} és un 1 seguit de <b>${n}</b> zeros.`),
        t(10 ** (n + 1), 'zeros_10', `Compta bé els zeros: ${H(10, n)} és un 1 seguit de <b>${n}</b> zeros.`),
      );
    } else {
      traps.push(
        t(b ** (n - 1), 'factors_mal_comptats', `Et falta un factor: has calculat ${H(b, n - 1)} = ${f(b ** (n - 1))}, però el ${b} ha d'aparèixer <b>${n}</b> vegades.`),
        t(b ** (n + 1), 'factors_mal_comptats', `Tens un factor de més: has calculat ${H(b, n + 1)} = ${f(b ** (n + 1))}, però el ${b} ha d'aparèixer <b>${n}</b> vegades.`),
      );
    }
    let solution = `${H(b, n)} = ${U.repeat(b, n)} = <b>${f(val)}</b>`;
    if (b === 10) solution += `<br>Un 1 seguit de ${n} zeros.`;
    else if (n >= 3) solution += `<br><span class="steps">Pas a pas: ${chain(b, n)}</span>`;
    return numEx({
      prompt: Q('Calcula:', H(b, n)),
      answer: val,
      traps,
      hint: b === 10
        ? 'Les potències de 10 són un 1 seguit de tants zeros com indica l\'exponent.'
        : `Multiplica pas a pas: ${U.repeat(b, n)}.`,
      solution,
    });
  }

  function exprKPow() {
    const k = randInt(2, 5);
    const b = randInt(2, 5);
    const n = randInt(2, 3);
    const p = b ** n;
    const val = k * p;
    return numEx({
      prompt: Q('Calcula:', `${k} · ${H(b, n)}`),
      answer: val,
      traps: [
        t((k * b) ** n, 'ordre_operacions', `Has multiplicat primer ${k} · ${b} i després has elevat. Però la potència es calcula <b>primer</b>: ${H(b, n)} = ${p}, i després ${k} · ${p} = ${val}.`),
        t(k * b * n, 'base_per_exponent', `${H(b, n)} no és ${b} · ${n}. Primer calcula ${H(b, n)} = ${U.repeat(b, n)} = ${p}.`),
      ],
      hint: 'Primer la potència, després la multiplicació.',
      solution: `${k} · ${H(b, n)} = ${k} · ${p} = <b>${val}</b>`,
    });
  }

  function exprSumSq() {
    const a = randInt(2, 9);
    let b = randInt(2, 9);
    if (b === a) b = a === 9 ? 8 : a + 1;
    const val = a * a + b * b;
    return numEx({
      prompt: Q('Calcula:', `${H(a, 2)} + ${H(b, 2)}`),
      answer: val,
      traps: [
        t((a + b) ** 2, 'suma_de_potencies', `Has sumat primer i després has elevat al quadrat: (${a} + ${b})² = ${(a + b) ** 2}. Però aquí cada nombre té el seu quadrat: ${a * a} + ${b * b} = ${val}.`),
        t(2 * a + 2 * b, 'base_per_exponent', `${H(a, 2)} no és ${a} · 2: és ${a} · ${a} = ${a * a}. I ${H(b, 2)} = ${b} · ${b} = ${b * b}.`),
      ],
      hint: 'Calcula cada potència per separat i després suma.',
      solution: `${H(a, 2)} + ${H(b, 2)} = ${a * a} + ${b * b} = <b>${val}</b>`,
    });
  }

  function exprParen() {
    const a = randInt(1, 6);
    const b = randInt(2, 10 - a);
    const s = a + b;
    const val = s * s;
    return numEx({
      prompt: Q('Calcula:', H(`(${a} + ${b})`, 2)),
      answer: val,
      traps: [
        t(a * a + b * b, 'suma_de_potencies', `Has elevat cada nombre per separat. Primer s'ha de resoldre el parèntesi: ${a} + ${b} = ${s}, i després ${H(s, 2)} = ${val}.`),
        t(s * 2, 'base_per_exponent', `El parèntesi val ${s}, però ${H(s, 2)} no és ${s} · 2: és ${s} · ${s} = ${val}.`),
      ],
      hint: 'Primer el parèntesi, després la potència.',
      solution: `${H(`(${a} + ${b})`, 2)} = ${H(s, 2)} = ${s} · ${s} = <b>${val}</b>`,
    });
  }

  function exprDiff() {
    const a = randInt(6, 10);
    const b = randInt(2, 3);
    const val = a * a - b ** 3;
    return numEx({
      prompt: Q('Calcula:', `${H(a, 2)} − ${H(b, 3)}`),
      answer: val,
      traps: [
        t(a * 2 - b * 3, 'base_per_exponent', `Has multiplicat cada base per l'exponent. Però ${H(a, 2)} = ${a} · ${a} = ${a * a} i ${H(b, 3)} = ${U.repeat(b, 3)} = ${b ** 3}.`),
        t(a * a - b * b, 'cub_vs_quadrat', `${H(b, 3)} és el <b>cub</b> de ${b}: ${U.repeat(b, 3)} = ${b ** 3}, no ${b * b}.`),
      ],
      hint: 'Calcula primer cada potència i després resta.',
      solution: `${H(a, 2)} − ${H(b, 3)} = ${a * a} − ${b ** 3} = <b>${val}</b>`,
    });
  }

  function bigPow() {
    const [b, n] = pick([[2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [3, 4], [3, 5], [3, 6], [4, 4], [4, 5],
      [5, 4], [6, 3], [6, 4], [7, 3], [8, 3], [9, 3], [11, 2], [11, 3], [12, 2], [15, 2], [20, 2], [20, 3]]);
    return calcPow(b, n);
  }

  // ── 3. Producte de potències de la mateixa base ───────────────────────────

  function prodEx(base, exps) {
    const sum = exps.reduce((s, e) => s + e, 0);
    const mult = exps.reduce((s, e) => s * e, 1);
    const shown = exps.map((e) => Hb(base, e)).join(' · ');
    const traps = [];
    if (exps.includes(1)) {
      const sumNo1 = exps.filter((e) => e !== 1).reduce((s, e) => s + e, 0);
      traps.push(t(pw(base, sumNo1), 'exponent_1_ocult', `Compte amb el ${base} que no porta exponent: és ${H(base, 1)}. També has de sumar aquest 1: ${exps.join(' + ')} = ${sum}.`));
    }
    traps.push(t(pw(base, mult), 'producte_multiplica_exponents', `Quan multipliquem potències de la mateixa base, els exponents se <b>sumen</b>: ${exps.join(' + ')} = ${sum}. No es multipliquen.`));
    if (typeof base === 'number') {
      const bb = base ** exps.length;
      traps.push(
        t(pw(bb, sum), 'producte_multiplica_bases', `La base no es multiplica: es queda igual (${base}). Només se sumen els exponents.`),
        t(pw(bb, mult), 'producte_multiplica_bases', `La base es queda igual (${base}) i els exponents se sumen (no es multipliquen).`),
      );
    }
    let solution = `${shown} = ${H(base, exps.join(' + '))} = <b>${H(base, sum)}</b>`;
    if (sum <= 10) {
      solution += `<br><span class="steps">Fixa't: ${exps.map((e) => `(${U.repeat(base, e)})`).join(' · ')} → en total hi ha ${sum} factors iguals a ${base}.</span>`;
    }
    return powEx({
      prompt: Q('Escriu com una sola potència:', shown),
      answer: pw(base, sum),
      traps,
      hint: 'Si la base és la mateixa, es deixa igual i se <b>sumen</b> els exponents. Un nombre sense exponent té exponent 1.',
      solution,
    });
  }

  const LETTERS = ['x', 'a', 'y', 'b'];
  function twoExps(lo, hi) {
    const m = randInt(lo, hi);
    let n = randInt(lo, hi);
    if (m === 2 && n === 2) n = 3;
    return [m, n];
  }

  function prodUnknown() {
    const a = randInt(2, 9);
    const m = randInt(2, 7);
    const x = randInt(2, 8);
    const k = m + x;
    const traps = [
      t(k + m, 'equacio_exponent', `Has sumat ${k} + ${m}. Però en un producte els exponents se sumen: ${m} + ? = ${k}. Per trobar el que falta, resta: ${k} − ${m} = ${x}.`),
      t(k, 'altre', `${k} és l'exponent del resultat. Busquem el que falta: ${m} + ? = ${k}.`),
    ];
    if (k % m === 0) traps.push(t(k / m, 'producte_multiplica_exponents', `Has pensat que els exponents es multipliquen (${m} · ${k / m} = ${k}). Però en un producte se <b>sumen</b>: ${m} + ? = ${k}.`));
    return numEx({
      prompt: Q('Quin exponent falta?', `${H(a, m)} · ${H(a, BLANK)} = ${H(a, k)}`),
      answer: x,
      traps,
      hint: `En un producte, els exponents se sumen: ${m} + ? = ${k}.`,
      solution: `${m} + <b>${x}</b> = ${k}, per tant ${H(a, m)} · ${H(a, x)} = ${H(a, k)}.`,
    });
  }

  // ── 4. Quocient de potències de la mateixa base ───────────────────────────

  function quotEx(base, m, n, fraction) {
    const d = m - n;
    const shown = fraction ? U.frac(Hb(base, m), Hb(base, n)) : `${Hb(base, m)} : ${Hb(base, n)}`;
    const traps = [];
    if (n === 1) traps.push(t(pw(base, m), 'exponent_1_ocult', `El divisor ${base} és ${H(base, 1)}. Per tant, cal restar 1: ${m} − 1 = ${m - 1}.`));
    traps.push(t(pw(base, m + n), 'quocient_suma_exponents', `En una divisió de potències de la mateixa base, els exponents es <b>resten</b>: ${m} − ${n} = ${d}. Se sumen quan multipliquem.`));
    if (n > 1 && m % n === 0) traps.push(t(pw(base, m / n), 'quocient_divideix_exponents', `Els exponents no es divideixen, es <b>resten</b>: ${m} − ${n} = ${d}.`));
    if (typeof base === 'number') traps.push(t(pw(1, d), 'quocient_divideix_bases', `La base no es divideix: es queda igual (${base}). Només es resten els exponents.`));
    traps.push(t(pw(base, -d), 'altre', `Es resta l'exponent del dividend menys el del divisor: ${m} − ${n} = ${d}.`));

    let solution = `${shown} = ${H(base, `${m} − ${n}`)} = <b>${H(base, d)}</b>`;
    if (m <= 7) {
      const num = Array.from({ length: m }, (_, i) => (i < n ? `<s>${base}</s>` : String(base))).join(' · ');
      const den = Array(n).fill(`<s>${base}</s>`).join(' · ');
      solution += `<br><span class="steps">Fixa't: ${U.frac(num, den)} → se simplifiquen ${n} factors i en queden ${d}.</span>`;
    }
    return powEx({
      prompt: Q('Escriu com una sola potència:', shown),
      answer: pw(base, d),
      traps,
      hint: 'Si la base és la mateixa, es deixa igual i es <b>resten</b> els exponents (el de dalt menys el de baix).',
      solution,
    });
  }

  function quotEqual() {
    const a = randInt(2, 12);
    const n = randInt(2, 9);
    return numEx({
      prompt: Q('Calcula:', `${H(a, n)} : ${H(a, n)}`),
      answer: 1,
      traps: [
        t(0, 'exponent_zero_es_zero', `És cert que dona ${H(a, 0)}, però ${H(a, 0)} no és 0. Un nombre dividit entre ell mateix sempre fa <b>1</b>.`),
        t(a, 'exponent_zero_es_base', `${H(a, n)} : ${H(a, n)} = ${H(a, 0)}, i ${H(a, 0)} = 1, no ${a}. Un nombre dividit entre ell mateix sempre fa 1.`),
      ],
      hint: 'Què passa quan divideixes un nombre entre ell mateix?',
      solution: `${H(a, n)} : ${H(a, n)} = ${H(a, `${n} − ${n}`)} = ${H(a, 0)} = <b>1</b>. Un nombre dividit entre ell mateix fa 1; per això ${H(a, 0)} = 1.`,
    });
  }

  function quotMixed() {
    const a = randInt(2, 9);
    const m = randInt(2, 6);
    const n = randInt(2, 6);
    const p = randInt(2, m + n - 1);
    const r = m + n - p;
    const shown = `(${H(a, m)} · ${H(a, n)}) : ${H(a, p)}`;
    return powEx({
      prompt: Q('Escriu com una sola potència:', shown),
      answer: pw(a, r),
      traps: [
        t(pw(a, m * n - p), 'producte_multiplica_exponents', `Dins el parèntesi els exponents se <b>sumen</b>: ${m} + ${n} = ${m + n}. Després es resta: ${m + n} − ${p} = ${r}.`),
        t(pw(a, m + n + p), 'quocient_suma_exponents', `En dividir, els exponents es <b>resten</b>: ${m + n} − ${p} = ${r}.`),
        t(pw(1, r), 'quocient_divideix_bases', `La base es manté (${a}); només operem amb els exponents.`),
      ],
      hint: 'Primer el parèntesi (producte: se sumen) i després la divisió (es resten).',
      solution: `${shown} = ${H(a, m + n)} : ${H(a, p)} = ${H(a, `${m + n} − ${p}`)} = <b>${H(a, r)}</b>`,
    });
  }

  function quotUnknown() {
    const a = randInt(2, 9);
    const k = randInt(2, 6);
    const x = randInt(2, 7);
    const m = k + x;
    return numEx({
      prompt: Q('Quin exponent falta?', `${H(a, m)} : ${H(a, BLANK)} = ${H(a, k)}`),
      answer: x,
      traps: [
        t(m + k, 'equacio_exponent', `En dividir, els exponents es resten: ${m} − ? = ${k}. Per tant, ? = ${m} − ${k} = ${x}.`),
        t(k, 'altre', `${k} és l'exponent del resultat. Busquem el del divisor: ${m} − ? = ${k}.`),
      ],
      hint: `Els exponents es resten: ${m} − ? = ${k}.`,
      solution: `${m} − <b>${x}</b> = ${k}, per tant ${H(a, m)} : ${H(a, x)} = ${H(a, k)}.`,
    });
  }

  function quotValue() {
    const a = pick([2, 2, 3, 5, 10]);
    const d = a === 2 ? randInt(2, 5) : randInt(2, 3);
    const n = randInt(2, 6);
    const m = n + d;
    const val = a ** d;
    const traps = [
      t(a * d, 'base_per_exponent', `Has arribat bé a ${H(a, d)}, però ${H(a, d)} no és ${a} · ${d}: és ${U.repeat(a, d)} = ${val}.`),
      t(1, 'quocient_divideix_bases', `La base no es divideix: ${H(a, m)} : ${H(a, n)} = ${H(a, d)}.`),
    ];
    if (m % n === 0) traps.push(t(a ** (m / n), 'quocient_divideix_exponents', `Els exponents es resten, no es divideixen: ${m} − ${n} = ${d}.`));
    return numEx({
      prompt: Q('Calcula el valor de:', `${H(a, m)} : ${H(a, n)}`),
      answer: val,
      traps,
      hint: 'Primer simplifica (resta els exponents) i després calcula la potència que et queda.',
      solution: `${H(a, m)} : ${H(a, n)} = ${H(a, d)} = ${U.repeat(a, d)} = <b>${f(val)}</b>`,
    });
  }

  // ── 5. Potència d'una potència ─────────────────────────────────────────────

  function ppEx(base, exps) {
    const mult = exps.reduce((s, e) => s * e, 1);
    const sum = exps.reduce((s, e) => s + e, 0);
    let shown = H(base, exps[0]);
    for (let i = 1; i < exps.length; i++) shown = Hp(shown, exps[i]);
    const traps = [
      t(pw(base, sum), 'potencia_suma_exponents', `Quan s'eleva una potència a una altra potència, els exponents es <b>multipliquen</b>: ${exps.join(' · ')} = ${mult}. (Se sumen quan multipliquem potències.)`),
    ];
    if (exps.length === 2 && exps[0] ** exps[1] <= 1000) {
      traps.push(t(pw(base, exps[0] ** exps[1]), 'potencia_eleva_exponents', `No s'ha d'elevar ${exps[0]} a ${exps[1]}: els exponents es multipliquen, ${exps[0]} · ${exps[1]} = ${mult}.`));
    }
    let solution = `${shown} = ${H(base, exps.join(' · '))} = <b>${H(base, mult)}</b>`;
    if (exps.length === 2 && exps[1] <= 4) {
      const [m, n] = exps;
      solution += `<br><span class="steps">Fixa't: ${Hp(H(base, m), n)} = ${U.repeat(H(base, m), n)} = ${H(base, Array(n).fill(m).join(' + '))} = ${H(base, mult)}</span>`;
    }
    return powEx({
      prompt: Q('Escriu com una sola potència:', shown),
      answer: pw(base, mult),
      traps,
      hint: 'Potència d\'una potència: es deixa la base i es <b>multipliquen</b> els exponents.',
      solution,
    });
  }

  function ppMixed() {
    const a = randInt(2, 9);
    const m = randInt(2, 4);
    const n = randInt(2, 3);
    const p = randInt(2, 6);
    const r = m * n + p;
    const shown = `${Hp(H(a, m), n)} · ${H(a, p)}`;
    return powEx({
      prompt: Q('Escriu com una sola potència:', shown),
      answer: pw(a, r),
      traps: [
        t(pw(a, m + n + p), 'potencia_suma_exponents', `Primer resol la potència de potència: ${Hp(H(a, m), n)} = ${H(a, m * n)} (es <b>multipliquen</b>). Després, en el producte, se sumen: ${m * n} + ${p} = ${r}.`),
        t(pw(a, m * n * p), 'producte_multiplica_exponents', `${Hp(H(a, m), n)} = ${H(a, m * n)}, d'acord. Però en el producte final els exponents se <b>sumen</b>: ${m * n} + ${p} = ${r}.`),
      ],
      hint: 'Primer la potència de potència (multipliques), després el producte (sumes).',
      solution: `${shown} = ${H(a, m * n)} · ${H(a, p)} = ${H(a, `${m * n} + ${p}`)} = <b>${H(a, r)}</b>`,
    });
  }

  function ppUnknown() {
    const a = randInt(2, 9);
    const m = randInt(2, 5);
    const x = randInt(2, 5);
    const k = m * x;
    return numEx({
      prompt: Q('Quin exponent falta?', `${Hp(H(a, m), BLANK)} = ${H(a, k)}`),
      answer: x,
      traps: [
        t(k - m, 'potencia_suma_exponents', `Has restat ${k} − ${m}, com si els exponents se sumessin. En una potència de potència es multipliquen: ${m} · ? = ${k}, per tant ? = ${k} : ${m} = ${x}.`),
        t(k, 'altre', `${k} és l'exponent del resultat. Busquem el que falta: ${m} · ? = ${k}.`),
      ],
      hint: `Els exponents es multipliquen: ${m} · ? = ${k}.`,
      solution: `${m} · <b>${x}</b> = ${k}, per tant ${Hp(H(a, m), x)} = ${H(a, k)}.`,
    });
  }

  function ppChangeBase() {
    const [B, b, r] = pick([[4, 2, 2], [8, 2, 3], [16, 2, 4], [9, 3, 2], [27, 3, 3], [25, 5, 2], [100, 10, 2]]);
    const n = randInt(2, 5);
    return powEx({
      prompt: Q(`Escriu com una potència de base <b>${b}</b>:`, H(B, n)),
      answer: pw(b, r * n),
      traps: [
        t(pw(b, n), 'base_canviada', `No n'hi ha prou de canviar la base: ${B} = ${H(b, r)}, i per tant ${H(B, n)} = ${Hp(H(b, r), n)} = ${H(b, r * n)}.`),
        t(pw(b, r + n), 'potencia_suma_exponents', `${H(B, n)} = ${Hp(H(b, r), n)}, i en una potència de potència els exponents es <b>multipliquen</b>: ${r} · ${n} = ${r * n}.`),
      ],
      hint: `Primer escriu ${B} com a potència de ${b}.`,
      solution: `${B} = ${H(b, r)}, per tant ${H(B, n)} = ${Hp(H(b, r), n)} = <b>${H(b, r * n)}</b>`,
    });
  }

  function ppQuot() {
    const a = randInt(2, 9);
    const m = randInt(2, 4);
    const n = randInt(2, 3);
    const p = randInt(1, m * n - 1);
    const r = m * n - p;
    const shown = `${Hp(H(a, m), n)} : ${Hb(a, p)}`;
    const traps = [
      t(pw(a, m + n - p), 'potencia_suma_exponents', `${Hp(H(a, m), n)} = ${H(a, m * n)}: els exponents es <b>multipliquen</b>. Després es resten: ${m * n} − ${p} = ${r}.`),
      t(pw(a, m * n + p), 'quocient_suma_exponents', `En dividir, els exponents es <b>resten</b>: ${m * n} − ${p} = ${r}.`),
    ];
    if (p === 1) traps.unshift(t(pw(a, m * n), 'exponent_1_ocult', `El divisor ${a} és ${H(a, 1)}: cal restar 1. ${m * n} − 1 = ${r}.`));
    return powEx({
      prompt: Q('Escriu com una sola potència:', shown),
      answer: pw(a, r),
      traps,
      hint: 'Primer la potència de potència (multipliques), després la divisió (restes).',
      solution: `${shown} = ${H(a, m * n)} : ${H(a, p)} = ${H(a, `${m * n} − ${p}`)} = <b>${H(a, r)}</b>`,
    });
  }

  // ── 6. Exponent 0 i exponent 1 ─────────────────────────────────────────────

  function msgZeroIsZero(a) {
    return `Qualsevol nombre (que no sigui 0) elevat a 0 fa <b>1</b>, no 0. Per què? ${H(a, 2)} : ${H(a, 2)} = ${H(a, 0)}, i un nombre dividit entre ell mateix fa 1.`;
  }
  function msgZeroIsBase(a) {
    return `${H(a, 0)} no és ${a}: el que val ${a} és ${H(a, 1)}. Qualsevol nombre (que no sigui 0) elevat a 0 fa <b>1</b>.`;
  }
  function msgOneIsOne(a) {
    return `L'exponent 1 vol dir que la base apareix <b>una sola vegada</b>: ${H(a, 1)} = ${a}. El que val 1 és ${H(a, 0)}.`;
  }

  function exp0or1(lo, hi) {
    const a = randInt(lo, hi);
    if (Math.random() < 0.5) {
      return numEx({
        prompt: Q('Calcula:', H(a, 0)),
        answer: 1,
        traps: [t(0, 'exponent_zero_es_zero', msgZeroIsZero(a)), t(a, 'exponent_zero_es_base', msgZeroIsBase(a))],
        hint: 'Pensa en 3² : 3². Quin exponent queda? I quant val la divisió?',
        solution: `${H(a, 0)} = <b>1</b>. Qualsevol nombre diferent de 0 elevat a 0 fa 1.`,
      });
    }
    return numEx({
      prompt: Q('Calcula:', H(a, 1)),
      answer: a,
      traps: [t(1, 'exponent_u_es_u', msgOneIsOne(a)), t(0, 'altre', `${H(a, 1)} vol dir que el ${a} apareix una vegada: ${H(a, 1)} = ${a}.`)],
      hint: 'Exponent 1: quantes vegades apareix la base?',
      solution: `${H(a, 1)} = <b>${f(a)}</b>. Un nombre elevat a 1 és ell mateix.`,
    });
  }

  function oneBase() {
    const n = randInt(5, 50);
    return numEx({
      prompt: Q('Calcula:', H(1, n)),
      answer: 1,
      traps: [
        t(n, 'un_elevat', `1 multiplicat per ell mateix sempre fa 1: 1 · 1 · 1 · … = 1, encara que ho facis ${n} vegades.`),
        t(0, 'un_elevat', '1 · 1 = 1, i 1 · 1 · 1 = 1… Per moltes vegades que multipliquis 1 per 1, sempre fa 1.'),
      ],
      hint: 'Quant fa 1 · 1? I 1 · 1 · 1?',
      solution: `${H(1, n)} = 1 · 1 · … · 1 = <b>1</b>`,
    });
  }

  function zeroBase() {
    const n = randInt(2, 20);
    return numEx({
      prompt: Q('Calcula:', H(0, n)),
      answer: 0,
      traps: [
        t(1, 'zero_elevat', `0 multiplicat per qualsevol nombre fa 0: 0 · 0 · 0 · … = 0. (L'exponent és ${n}, no 0.)`),
        t(n, 'zero_elevat', '0 multiplicat per ell mateix sempre fa 0, per moltes vegades que ho facis.'),
      ],
      hint: 'Quant fa 0 · 0?',
      solution: `${H(0, n)} = 0 · 0 · … · 0 = <b>0</b>`,
    });
  }

  function missingExp() {
    const a = randInt(2, 20);
    if (Math.random() < 0.5) {
      return numEx({
        prompt: Q('Quin exponent falta?', `${H(a, BLANK)} = ${a}`),
        answer: 1,
        traps: [t(0, 'exponent_zero_es_base', `${H(a, 0)} = 1, no ${a}. Perquè doni ${a}, l'exponent ha de ser 1.`)],
        hint: 'Quantes vegades ha d\'aparèixer la base?',
        solution: `${H(a, 1)} = ${a}: l'exponent és <b>1</b>.`,
      });
    }
    return numEx({
      prompt: Q('Quin exponent falta?', `${H(a, BLANK)} = 1`),
      answer: 0,
      traps: [t(1, 'exponent_u_es_u', `${H(a, 1)} = ${a}, no 1. Perquè doni 1, l'exponent ha de ser 0.`)],
      hint: `Quin exponent fa que qualsevol nombre valgui 1?`,
      solution: `${H(a, 0)} = 1: l'exponent és <b>0</b>.`,
    });
  }

  function expr01Sum() {
    const [a, b, c] = U.shuffle(Array.from({ length: 19 }, (_, i) => i + 2)).slice(0, 3);
    const val = 2 + b;
    const shown = `${H(a, 0)} + ${H(b, 1)} + ${H(c, 0)}`;
    return numEx({
      prompt: Q('Calcula:', shown),
      answer: val,
      traps: [
        t(b, 'exponent_zero_es_zero', `Els termes elevats a 0 valen 1, no 0: ${H(a, 0)} = 1 i ${H(c, 0)} = 1.`),
        t(a + b + c, 'exponent_zero_es_base', `${H(a, 0)} no és ${a}: val 1. Igual que ${H(c, 0)} = 1.`),
        t(3, 'exponent_u_es_u', `${H(b, 1)} = ${b}, no 1. Només els elevats a 0 valen 1.`),
      ],
      hint: 'Exponent 0 → val 1. Exponent 1 → val la base.',
      solution: `${shown} = 1 + ${b} + 1 = <b>${val}</b>`,
    });
  }

  function expr01Prod() {
    const a = randInt(2, 15);
    let b = randInt(2, 15);
    if (b === a) b++;
    const shown = `${H(a, 1)} · ${H(b, 0)}`;
    return numEx({
      prompt: Q('Calcula:', shown),
      answer: a,
      traps: [
        t(0, 'exponent_zero_es_zero', `${H(b, 0)} = 1, no 0. Per tant, ${a} · 1 = ${a}.`),
        t(a * b, 'exponent_zero_es_base', `${H(b, 0)} = 1, no ${b}. Per tant, ${a} · 1 = ${a}.`),
        t(1, 'exponent_u_es_u', `${H(a, 1)} = ${a}, no 1. Per tant, ${a} · 1 = ${a}.`),
      ],
      hint: 'Calcula cada potència: exponent 1 → la base; exponent 0 → 1.',
      solution: `${shown} = ${a} · 1 = <b>${a}</b>`,
    });
  }

  function expr01Pow() {
    const a = randInt(2, 9);
    const m = randInt(2, 4);
    const shown = Hp(H(a, m), 0);
    const traps = [t(0, 'exponent_zero_es_zero', `Qualsevol potència elevada a 0 fa 1: ${shown} = ${H(a, `${m} · 0`)} = ${H(a, 0)} = 1.`)];
    if (a ** m <= 10000) traps.push(t(a ** m, 'exponent_zero_es_base', `Elevar a 0 no deixa el nombre igual: ${shown} = ${H(a, 0)} = 1.`));
    return numEx({
      prompt: Q('Calcula:', shown),
      answer: 1,
      traps,
      hint: 'Multiplica els exponents. Què dona multiplicar per 0?',
      solution: `${shown} = ${H(a, `${m} · 0`)} = ${H(a, 0)} = <b>1</b>`,
    });
  }

  function expr01One() {
    const a = randInt(3, 15);
    const shown = `${H(a, 1)} + ${H(1, a)}`;
    return numEx({
      prompt: Q('Calcula:', shown),
      answer: a + 1,
      traps: [
        t(2 * a, 'un_elevat', `${H(1, a)} = 1 (1 per ell mateix sempre fa 1), no ${a}.`),
        t(2, 'exponent_u_es_u', `${H(a, 1)} = ${a}, no 1.`),
      ],
      hint: 'Fixa\'t bé en quin nombre és la base de cada potència.',
      solution: `${shown} = ${a} + 1 = <b>${a + 1}</b>`,
    });
  }

  // ── 7. Quadrats i cubs perfectes ───────────────────────────────────────────

  function calcSquare(lo, hi) {
    const n = randInt(lo, hi);
    return numEx({
      prompt: Q(`Calcula el quadrat de ${n}:`, H(n, 2)),
      answer: n * n,
      traps: [
        t(2 * n, 'quadrat_doble', `Has calculat el doble (${n} · 2). El quadrat és ${n} · ${n} = ${n * n}.`),
        t(n ** 3, 'cub_vs_quadrat', `Això és el cub (${U.repeat(n, 3)}). El quadrat és ${n} · ${n}.`),
      ],
      hint: 'El quadrat d\'un nombre és el nombre multiplicat per ell mateix.',
      solution: `${H(n, 2)} = ${n} · ${n} = <b>${f(n * n)}</b>`,
    });
  }

  function calcCube(lo, hi) {
    const n = randInt(lo, hi);
    return numEx({
      prompt: Q(`Calcula el cub de ${n}:`, H(n, 3)),
      answer: n ** 3,
      traps: [
        t(3 * n, 'cub_triple', `Has calculat el triple (${n} · 3). El cub és ${U.repeat(n, 3)} = ${f(n ** 3)}.`),
        t(n * n, 'cub_vs_quadrat', `Això és el quadrat (${n} · ${n}). El cub té tres factors: ${U.repeat(n, 3)}.`),
      ],
      hint: 'El cub d\'un nombre és el nombre multiplicat tres vegades: n · n · n.',
      solution: `${H(n, 3)} = ${U.repeat(n, 3)} = ${n * n} · ${n} = <b>${f(n ** 3)}</b>`,
    });
  }

  function sqRoot(lo, hi) {
    const n = randInt(lo, hi);
    const N = n * n;
    const traps = [t(N, 'altre', `${f(N)} és el quadrat. Busquem el nombre que, multiplicat per ell mateix, dona ${f(N)}.`)];
    if (N % 2 === 0) traps.unshift(t(N / 2, 'arrel_meitat', `Has fet la meitat de ${f(N)}. Però busquem un nombre que multiplicat per <b>ell mateix</b> doni ${f(N)}. Comprova-ho: ${N / 2} · ${N / 2} = ${f((N / 2) ** 2)}.`));
    return numEx({
      prompt: Q('Quin nombre natural, elevat al quadrat, dona aquest resultat?', `${H(BLANK, 2)} = ${f(N)}`),
      answer: n,
      traps,
      hint: `Prova nombres: quin nombre multiplicat per ell mateix fa ${f(N)}?`,
      solution: `${n} · ${n} = ${f(N)}, per tant ${H(n, 2)} = ${f(N)}. L'arrel quadrada de ${f(N)} és <b>${n}</b>.`,
    });
  }

  function cubeRoot(lo, hi) {
    const n = randInt(lo, hi);
    const N = n ** 3;
    const traps = [];
    if (N % 3 === 0) traps.push(t(N / 3, 'arrel_terc', `Has dividit entre 3. Però busquem un nombre que multiplicat <b>tres vegades</b> per ell mateix doni ${f(N)}: ? · ? · ? = ${f(N)}.`));
    if (isSquare(N)) {
      const s = Math.sqrt(N);
      traps.push(t(s, 'cub_vs_quadrat', `${s} · ${s} = ${f(N)}: això és el quadrat. Busquem el cub: ? · ? · ? = ${f(N)}.`));
    }
    traps.push(t(N, 'altre', `${f(N)} és el cub. Busquem el nombre que, multiplicat tres vegades per ell mateix, dona ${f(N)}.`));
    return numEx({
      prompt: Q('Quin nombre natural, elevat al cub, dona aquest resultat?', `${H(BLANK, 3)} = ${f(N)}`),
      answer: n,
      traps,
      hint: `Prova nombres petits: 2 · 2 · 2 = 8, 3 · 3 · 3 = 27…`,
      solution: `${U.repeat(n, 3)} = ${f(N)}, per tant ${H(n, 3)} = ${f(N)}. L'arrel cúbica de ${f(N)} és <b>${n}</b>.`,
    });
  }

  function isSquareQ(max) {
    const yes = Math.random() < 0.5;
    let N;
    if (yes) {
      const r = randInt(2, Math.floor(Math.sqrt(max)));
      N = r * r;
    } else {
      do { N = randInt(5, max); } while (isSquare(N));
    }
    const r = Math.floor(Math.sqrt(N));
    const half = N % 2 === 0 && N / 2 <= 50;
    const noMsg = half
      ? `${N} = ${N / 2} · 2, però un quadrat perfecte és un nombre multiplicat per <b>ell mateix</b>. ${betweenSquares(N)}`
      : `No ho és. ${betweenSquares(N)}`;
    return choiceEx({
      prompt: Q('Aquest nombre és un quadrat perfecte?', f(N)),
      shuffle: false,
      options: [
        yes ? { label: 'Sí', correct: true } : { label: 'Sí', id: half ? 'quadrat_doble' : 'no_es_quadrat', msg: noMsg },
        yes ? { label: 'No', id: 'no_es_quadrat', msg: `Sí que ho és: ${r} · ${r} = ${N}.` } : { label: 'No', correct: true },
      ],
      hint: 'Busca un nombre que, multiplicat per ell mateix, doni exactament aquest resultat.',
      solution: yes ? `Sí: ${r} · ${r} = ${N} = ${H(r, 2)}.` : `No. ${betweenSquares(N)}`,
    });
  }

  function isCubeQ(max) {
    const yes = Math.random() < 0.5;
    let N;
    let squareTrap = false;
    if (yes) {
      const r = randInt(2, Math.floor(Math.cbrt(max) + 1e-9));
      N = r ** 3;
    } else if (Math.random() < 0.5) {
      do { N = randInt(3, Math.floor(Math.sqrt(max))) ** 2; } while (isCube(N));
      squareTrap = true;
    } else {
      do { N = randInt(10, max); } while (isCube(N));
    }
    const r = cbrtInt(N);
    const noMsg = squareTrap
      ? `${N} és un quadrat perfecte (${H(Math.sqrt(N), 2)}), però no un cub. ${betweenCubes(N)}`
      : `No ho és. ${betweenCubes(N)}`;
    return choiceEx({
      prompt: Q('Aquest nombre és un cub perfecte?', f(N)),
      shuffle: false,
      options: [
        yes ? { label: 'Sí', correct: true } : { label: 'Sí', id: squareTrap ? 'cub_vs_quadrat' : 'no_es_quadrat', msg: noMsg },
        yes ? { label: 'No', id: 'no_es_quadrat', msg: `Sí que ho és: ${U.repeat(r, 3)} = ${f(N)}.` } : { label: 'No', correct: true },
      ],
      hint: 'Busca un nombre que, multiplicat tres vegades per ell mateix, doni aquest resultat.',
      solution: yes ? `Sí: ${U.repeat(r, 3)} = ${f(N)} = ${H(r, 3)}.` : `No. ${betweenCubes(N)}`,
    });
  }

  function nonSquareNear(N, spread) {
    for (let i = 0; i < 50; i++) {
      const c = N + (Math.random() < 0.5 ? -1 : 1) * randInt(1, spread);
      if (c > 1 && !isSquare(c)) return c;
    }
    return N + 1;
  }

  function pickSquare(lo, hi) {
    const n = randInt(lo, hi);
    const N = n * n;
    const options = [{ label: f(N), correct: true }];
    if (!isSquare(2 * n)) options.push({ label: f(2 * n), id: 'quadrat_doble', msg: `${2 * n} = ${n} · 2, el doble de ${n}, però no és cap nombre multiplicat per ell mateix. ${betweenSquares(2 * n)}` });
    while (options.length < 4) {
      const c = nonSquareNear(N, 2 * n - 1);
      if (!options.some((o) => o.label === f(c))) options.push({ label: f(c), id: 'no_es_quadrat', msg: betweenSquares(c) });
    }
    return choiceEx({
      prompt: '<p class="q-text">Quin d\'aquests nombres és un quadrat perfecte?</p>',
      options,
      hint: 'Un quadrat perfecte és el resultat de multiplicar un nombre natural per ell mateix: 1, 4, 9, 16…',
      solution: `${f(N)} = ${n} · ${n} = ${H(n, 2)}.`,
    });
  }

  function pickCube(lo, hi) {
    const n = randInt(lo, hi);
    const N = n ** 3;
    const options = [{ label: f(N), correct: true }];
    options.push({ label: f(3 * n), id: 'cub_triple', msg: `${3 * n} = ${n} · 3, el triple de ${n}. El cub és ${U.repeat(n, 3)} = ${f(N)}.` });
    if (!isCube(n * n)) options.push({ label: f(n * n), id: 'cub_vs_quadrat', msg: `${n * n} = ${n} · ${n} és un quadrat, no un cub. ${betweenCubes(n * n)}` });
    let guard = 0;
    while (options.length < 4 && guard++ < 50) {
      const c = N + (Math.random() < 0.5 ? -1 : 1) * randInt(1, 6);
      if (c > 1 && !isCube(c) && !options.some((o) => o.label === f(c))) options.push({ label: f(c), id: 'no_es_quadrat', msg: betweenCubes(c) });
    }
    return choiceEx({
      prompt: '<p class="q-text">Quin d\'aquests nombres és un cub perfecte?</p>',
      options,
      hint: 'Un cub perfecte és el resultat de multiplicar un nombre per ell mateix tres vegades: 1, 8, 27, 64…',
      solution: `${f(N)} = ${U.repeat(n, 3)} = ${H(n, 3)}.`,
    });
  }

  function betweenQ() {
    let N;
    do { N = randInt(20, 400); } while (isSquare(N));
    const r = Math.floor(Math.sqrt(N));
    const label = (a) => `${H(a, 2)} i ${H(a + 1, 2)}`;
    const wrong = (a) => ({ label: label(a), id: 'no_es_quadrat', msg: `${H(a, 2)} = ${a * a} i ${H(a + 1, 2)} = ${(a + 1) ** 2}: el ${N} no queda entre aquests dos.` });
    return choiceEx({
      prompt: Q('Entre quins dos quadrats perfectes consecutius es troba aquest nombre?', f(N)),
      options: [{ label: label(r), correct: true }, wrong(r - 1), wrong(r + 1), wrong(r - 2)],
      hint: `Busca el quadrat més gran que no passa de ${N}.`,
      solution: `${H(r, 2)} = ${r * r} &lt; ${N} &lt; ${(r + 1) ** 2} = ${H(r + 1, 2)}`,
    });
  }

  function oddSum() {
    const n = randInt(3, 8);
    const odds = Array.from({ length: n }, (_, i) => 2 * i + 1);
    const val = n * n;
    return numEx({
      prompt: Q('Calcula aquesta suma de nombres senars:', odds.join(' + ')),
      answer: val,
      traps: [t(2 * n, 'quadrat_doble', `Suma tots els nombres amb calma: ${odds.join(' + ')} = ${val}.`)],
      hint: 'Suma amb calma… i fixa\'t en el resultat. Quin tipus de nombre és?',
      solution: `${odds.join(' + ')} = <b>${val}</b> = ${H(n, 2)}. La suma dels ${n} primers nombres senars és un quadrat perfecte! (Ho pots veure a la visualització d'àrees.)`,
    });
  }

  // ── Generadors per habilitat i nivell ──────────────────────────────────────

  const run = (pool) => pick(pool)();

  ML.potencies.generators = {
    notacio(level) {
      if (level === 1) return run([() => prodAPot(1), identifica, () => prodAPot(1)]);
      if (level === 2) return run([() => prodAPot(2), potAProd, sumaOProd]);
      return run([paraules, llegir, basesDiferents, potAProd]);
    },
    calcul(level) {
      if (level === 1) {
        if (Math.random() < 0.2) return calcPow(10, randInt(2, 4));
        return calcPow(randInt(2, 5), randInt(2, 3));
      }
      if (level === 2) {
        if (Math.random() < 0.25) return calcPow(10, randInt(3, 7));
        let b;
        let n;
        do { b = randInt(2, 9); n = randInt(2, 5); } while (b ** n > 10000 || (b <= 3 && n === 2));
        return calcPow(b, n);
      }
      return run([exprKPow, exprSumSq, exprParen, exprDiff, bigPow]);
    },
    producte(level) {
      if (level === 1) return prodEx(randInt(2, 9), twoExps(2, 7));
      if (level === 2) {
        return run([
          () => prodEx(randInt(2, 9), [randInt(2, 5), randInt(2, 5), randInt(2, 5)]),
          () => prodEx(randInt(2, 9), U.shuffle([1, randInt(2, 8)])),
          () => prodEx(pick(LETTERS), twoExps(2, 9)),
        ]);
      }
      return run([
        prodUnknown,
        () => prodEx(randInt(2, 9), U.shuffle([1, randInt(2, 6), randInt(2, 6), randInt(2, 6)])),
        () => prodEx(pick(LETTERS), U.shuffle([1, randInt(2, 9), randInt(2, 9)])),
      ]);
    },
    quocient(level) {
      const basic = (fraction) => {
        const m = randInt(4, 10);
        return quotEx(randInt(2, 9), m, randInt(2, m - 1), fraction);
      };
      if (level === 1) return basic(false);
      if (level === 2) {
        return run([
          () => basic(true),
          quotEqual,
          () => quotEx(randInt(2, 9), randInt(3, 9), 1, Math.random() < 0.5),
          () => { const m = randInt(4, 12); return quotEx(pick(LETTERS), m, randInt(2, m - 1), false); },
        ]);
      }
      return run([quotMixed, quotUnknown, quotValue]);
    },
    potencia_potencia(level) {
      if (level === 1) {
        const m = randInt(2, 5);
        let n = randInt(2, 4);
        if (m === 2 && n === 2) n = 3;
        return ppEx(randInt(2, 9), [m, n]);
      }
      if (level === 2) {
        return run([
          () => ppEx(randInt(2, 9), [randInt(2, 3), randInt(2, 3), randInt(2, 3)]),
          () => ppEx(pick(LETTERS), [randInt(2, 6), randInt(2, 5)]),
          ppMixed,
        ]);
      }
      return run([ppUnknown, ppChangeBase, ppQuot]);
    },
    exponents_0_1(level) {
      if (level === 1) return exp0or1(2, 99);
      if (level === 2) return run([oneBase, zeroBase, () => exp0or1(100, 5000), missingExp]);
      return run([expr01Sum, expr01Prod, expr01Pow, expr01One]);
    },
    quadrats_cubs(level) {
      if (level === 1) return run([() => sqRoot(2, 10), () => isSquareQ(100), () => pickSquare(3, 10), () => calcSquare(2, 12)]);
      if (level === 2) return run([() => sqRoot(11, 20), () => cubeRoot(2, 6), () => pickCube(2, 6), () => calcCube(2, 10)]);
      return run([betweenQ, () => cubeRoot(2, 10), () => isCubeQ(1000), oddSum]);
    },
  };
})(window.MathLab);
