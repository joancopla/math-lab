/* Generadors d'exercicis de nombres enters.
 * Cada generador retorna un exercici amb el contracte descrit a js/core/checker.js.
 * Les respostes numèriques poden ser negatives: per això fan servir input.signed (botó +/− al mòbil).
 */
window.MathLab = window.MathLab || {};
window.MathLab.enters = window.MathLab.enters || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const { randInt, pick } = U;
  const H = U.pw;
  const f = U.fmt;

  // ── Constructors d'exercicis ────────────────────────────────────────────────

  const t = (match, id, msg) => ({ match, id, msg });
  const Q = (text, math) => `<p class="q-text">${text}</p>${math ? `<div class="q-math">${math}</div>` : ''}`;
  /** Resposta entera (pot ser negativa). Evita el −0. */
  const intEx = (o) => Object.assign({ input: { type: 'number', signed: true } }, o, { answer: o.answer === 0 ? 0 : o.answer });

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

  // ── Format ───────────────────────────────────────────────────────────────────

  /** Enter amb signe explícit i parèntesi: (+5), (−3). */
  const S = (n) => `(${n > 0 ? '+' : ''}${f(n)})`;
  /** Enter amb parèntesi només si és negatiu: 5, (−3). */
  const P = (n) => (n < 0 ? `(${f(n)})` : f(n));
  /** Enter diferent de 0 entre min i max. */
  const nz = (min, max) => {
    let n;
    do { n = randInt(min, max); } while (n === 0);
    return n;
  };
  const neg = (min, max) => -randInt(min, max);
  const abs = Math.abs;
  const sgnWord = (n) => (n > 0 ? 'positiu' : 'negatiu');
  const run = (pool) => pick(pool)();

  /** Traps genèrics per a una resposta numèrica: el signe contrari. */
  const signTraps = (ans, id = 'signe_canviat', msg) => (ans === 0 ? [] : [t(-ans, ans < 0 ? 'signe_oblidat' : id,
    msg || (ans < 0 ? `El valor és ${abs(ans)}, però el resultat és <b>negatiu</b>: ${f(ans)}.` : `El valor és ${abs(ans)}, però el resultat és <b>positiu</b>: ${f(ans)}.`))]);

  // ── 1. Què és un nombre enter ───────────────────────────────────────────────

  const SITUACIONS = [
    () => { const n = randInt(2, 15); return [`La temperatura és de ${n} graus sota zero.`, -n, 'sota zero → negatiu']; },
    () => { const n = randInt(2, 35); return [`La temperatura és de ${n} graus sobre zero.`, n, 'sobre zero → positiu']; },
    () => { const n = randInt(2, 40) * 10; return [`Un submarí navega a ${n} m per sota del nivell del mar.`, -n, 'per sota del nivell del mar → negatiu']; },
    () => { const n = randInt(5, 90) * 100; return [`Un avió vola a ${f(n)} m d'altura.`, n, 'per sobre del nivell del mar → positiu']; },
    () => { const n = randInt(5, 60); return [`Dec ${n} € a la meva germana.`, -n, 'deure diners → negatiu']; },
    () => { const n = randInt(5, 90); return [`Tinc ${n} € estalviats.`, n, 'tenir diners → positiu']; },
    () => { const n = randInt(1, 4); return [`Hem aparcat al soterrani, ${n} plantes per sota de la planta baixa.`, -n, 'per sota de la planta baixa (que és el 0) → negatiu']; },
    () => { const n = randInt(5, 30); return [`En un joc, he perdut ${n} punts.`, -n, 'perdre → negatiu']; },
    () => { const n = randInt(100, 700); return [`Una ciutat es va fundar l'any ${n} abans de Crist.`, -n, 'abans de Crist → negatiu']; },
  ];

  function situacio() {
    const [text, v, why] = pick(SITUACIONS)();
    return intEx({
      prompt: Q('Escriu amb un nombre enter:', `«${text}»`),
      answer: v,
      traps: [t(-v, 'context_signe', v < 0
        ? `En aquesta situació el nombre és <b>negatiu</b> (${why}). Cal escriure ${f(v)}.`
        : `En aquesta situació el nombre és <b>positiu</b> (${why}): ${f(v)}.`)],
      hint: 'Sota zero, per sota del mar, deutes, soterranis, perdre… són negatius.',
      solution: `${why}: <b>${f(v)}</b>.`,
    });
  }

  function valorAbsolut(max) {
    const n = nz(-max, max);
    return intEx({
      prompt: Q('Calcula el valor absolut:', `|${f(n)}|`),
      answer: abs(n),
      traps: [t(-abs(n), 'valor_absolut_negatiu', `El valor absolut és una distància i no pot ser negatiu: |${f(n)}| = ${abs(n)}.`)],
      hint: 'El valor absolut és la distància del nombre al 0. Una distància sempre és positiva.',
      solution: `El ${f(n)} està a ${abs(n)} unitats del 0: |${f(n)}| = <b>${abs(n)}</b>.`,
    });
  }

  function oposat(max) {
    const n = nz(-max, max);
    return intEx({
      prompt: Q(`Quin és l'<b>oposat</b> d'aquest nombre?`, f(n)),
      answer: -n,
      traps: [t(n, 'oposat_confos', `L'oposat està a l'altre costat del 0. L'oposat de ${f(n)} és ${f(-n)}, no ell mateix.`)],
      hint: 'L\'oposat és a la mateixa distància del 0, però a l\'altre costat: només canvia el signe.',
      solution: `L'oposat de ${f(n)} és <b>${f(-n)}</b>. Fixa't que ${f(n)} + ${P(-n)} = 0.`,
    });
  }

  function mesLluny() {
    let ns;
    do { ns = Array.from({ length: 4 }, () => nz(-15, 15)); } while (new Set(ns.map(abs)).size < 4 || !ns.some((x) => x < 0) || !ns.some((x) => x > 0));
    const far = ns.reduce((a, b) => (abs(b) > abs(a) ? b : a));
    const big = Math.max(...ns);
    return choiceEx({
      prompt: Q('Quin d\'aquests nombres té el <b>valor absolut</b> més gran (és el més lluny del 0)?'),
      options: ns.map((n) => (n === far ? { label: f(n), correct: true }
        : { label: f(n), id: n === big ? 'valor_absolut_negatiu' : 'altre', msg: `|${f(n)}| = ${abs(n)}, però |${f(far)}| = ${abs(far)}, que és més gran.${n === big ? ' Que un nombre sigui el més gran no vol dir que estigui més lluny del 0.' : ''}` })),
      hint: 'Mira la distància al 0: no importa el signe.',
      solution: `Valors absoluts: ${ns.map((n) => `|${f(n)}| = ${abs(n)}`).join(', ')}. El més gran és el de <b>${f(far)}</b>.`,
    });
  }

  function exprAbs() {
    const a = nz(-15, 15);
    const b = nz(-15, 15);
    const kind = pick(['diff', 'inner']);
    if (kind === 'diff') {
      const ans = abs(a) - abs(b);
      return intEx({
        prompt: Q('Calcula:', `|${f(a)}| − |${f(b)}|`),
        answer: ans,
        traps: [t(a - b, 'valor_absolut_negatiu', `Primer calcula els valors absoluts: |${f(a)}| = ${abs(a)} i |${f(b)}| = ${abs(b)}. Tots dos són positius.`)],
        hint: 'Calcula primer cada valor absolut (sempre positiu) i després resta.',
        solution: `|${f(a)}| − |${f(b)}| = ${abs(a)} − ${abs(b)} = <b>${f(ans)}</b>`,
      });
    }
    const s = a + b;
    return intEx({
      prompt: Q('Calcula:', `|${f(a)} + ${P(b)}|`),
      answer: abs(s),
      traps: [
        t(-abs(s), 'valor_absolut_negatiu', `El resultat de dins és ${f(s)}, però el valor absolut sempre és positiu: |${f(s)}| = ${abs(s)}.`),
        t(abs(a) + abs(b), 'altre', `Primer cal fer l'operació de dins: ${f(a)} + ${P(b)} = ${f(s)}. Després, el valor absolut.`),
      ],
      hint: 'Primer fes la suma de dins de les barres; després calcula el valor absolut del resultat.',
      solution: `${f(a)} + ${P(b)} = ${f(s)}, i |${f(s)}| = <b>${abs(s)}</b>.`,
    });
  }

  function dosValors() {
    const n = randInt(2, 12);
    return choiceEx({
      prompt: Q(`Quins nombres enters tenen valor absolut ${n}?`, `|?| = ${n}`),
      options: [
        { label: `${n} i ${f(-n)}`, correct: true },
        { label: `Només ${n}`, id: 'valor_absolut_negatiu', msg: `El ${f(-n)} també està a ${n} unitats del 0, així que |${f(-n)}| = ${n}.` },
        { label: `Només ${f(-n)}`, id: 'valor_absolut_negatiu', msg: `El ${n} també està a ${n} unitats del 0: |${n}| = ${n}.` },
        { label: 'Cap', id: 'altre', msg: `N'hi ha dos: ${n} i ${f(-n)}. Tots dos estan a ${n} unitats del 0.` },
      ],
      hint: 'Quins nombres estan a aquesta distància del 0? Mira tots dos costats.',
      solution: `Hi ha dos nombres a ${n} unitats del 0: <b>${n} i ${f(-n)}</b>.`,
    });
  }

  // ── 2. Ordenar i comparar ───────────────────────────────────────────────────

  function compara(level) {
    let a;
    let b;
    const kind = level === 1 ? pick(['negneg', 'negneg', 'negpos', 'negzero']) : pick(['negneg', 'negpos']);
    const M = level === 1 ? 12 : 60;
    if (kind === 'negneg') { do { a = neg(1, M); b = neg(1, M); } while (a === b); }
    else if (kind === 'negpos') { a = neg(1, M); b = randInt(1, M); if (Math.random() < 0.5) [a, b] = [b, a]; }
    else { a = neg(1, M); b = 0; if (Math.random() < 0.5) [a, b] = [b, a]; }
    const sym = a < b ? '<' : '>';
    const wrongId = kind === 'negneg' ? 'ordre_valor_absolut' : 'negatiu_vs_zero';
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const reason = kind === 'negneg'
      ? `Entre dos negatius, és més gran el que està més a prop del 0: ${f(big)} > ${f(small)}.`
      : `Qualsevol negatiu és més petit que ${big === 0 ? '0' : 'qualsevol positiu'}: ${f(small)} < ${f(big)}.`;
    return choiceEx({
      prompt: Q('Quin signe hi va?', `${f(a)} &nbsp;<span class="blank">?</span>&nbsp; ${f(b)}`),
      options: [
        { label: '&lt;', correct: sym === '<', id: wrongId, msg: reason },
        { label: '&gt;', correct: sym === '>', id: wrongId, msg: reason },
      ],
      shuffle: false,
      hint: 'Imagina la recta numèrica: el que està més a la dreta és el més gran.',
      solution: `${f(a)} ${sym === '<' ? '&lt;' : '&gt;'} ${f(b)}. ${reason}`,
    });
  }

  function extrem(level) {
    const wantMax = Math.random() < 0.5;
    const M = level === 1 ? 12 : 40;
    let ns;
    do {
      ns = wantMax
        ? Array.from({ length: 4 }, () => neg(1, M)) // tots negatius: el més gran és el més proper al 0
        : [neg(1, M), neg(1, M), randInt(0, M), randInt(1, M)];
    } while (new Set(ns.map(abs)).size < 4);
    const ans = wantMax ? Math.max(...ns) : Math.min(...ns);
    const options = ns.map((n) => {
      if (n === ans) return { label: f(n), correct: true };
      if (wantMax) return { label: f(n), id: 'ordre_valor_absolut', msg: `${f(n)} està més lluny del 0 que ${f(ans)}, així que és més petit. Entre negatius, el més gran és el més proper al 0.` };
      if (n >= 0) return { label: f(n), id: 'negatiu_vs_zero', msg: `${f(n)} no és negatiu, i qualsevol negatiu és més petit. El més petit és ${f(ans)}.` };
      return { label: f(n), id: 'ordre_valor_absolut', msg: `${f(n)} està més a prop del 0 que ${f(ans)}, així que és més gran. Entre negatius, el més petit és el més lluny del 0.` };
    });
    return choiceEx({
      prompt: Q(`Quin és el nombre <b>més ${wantMax ? 'gran' : 'petit'}</b>?`),
      options,
      hint: 'A la recta numèrica, els nombres creixen cap a la dreta. Els negatius més grans són els més propers al 0.',
      solution: `Ordenats: ${ns.slice().sort((a, b) => a - b).map(f).join(' &lt; ')}. El més ${wantMax ? 'gran' : 'petit'} és <b>${f(ans)}</b>.`,
    });
  }

  function ordenaLlista() {
    let ns;
    do { ns = [neg(1, 15), neg(1, 15), neg(1, 15), randInt(0, 15), randInt(1, 15)]; } while (new Set(ns.map(abs)).size < 5);
    const asc = ns.slice().sort((a, b) => a - b);
    const byAbs = ns.slice().sort((a, b) => abs(a) - abs(b));
    const negRev = asc.filter((x) => x < 0).reverse().concat(asc.filter((x) => x >= 0));
    const lab = (arr) => arr.map(f).join(' &lt; ');
    return choiceEx({
      prompt: Q('Quina és l\'ordenació correcta, <b>de més petit a més gran</b>?', ns.map(f).join(', ')),
      options: [
        { label: lab(asc), correct: true },
        { label: lab(negRev), id: 'ordre_valor_absolut', msg: `Els negatius estan al revés: entre negatius, el més petit és el més lluny del 0. Per exemple, ${f(asc[0])} &lt; ${f(asc[1])}.` },
        { label: lab(byAbs), id: 'ordre_valor_absolut', msg: 'Has ordenat per la distància al 0 (el valor absolut), però cal tenir en compte el signe: els negatius van abans que el 0 i els positius.' },
        { label: lab(asc.slice().reverse()), id: 'altre', msg: 'Aquesta ordenació és de més gran a més petit. Et demanem de més petit a més gran.' },
      ],
      hint: 'Primer els negatius (del més lluny del 0 al més proper), després el 0 i després els positius.',
      solution: `<b>${lab(asc)}</b>`,
    });
  }

  function recta(level) {
    const a = nz(-10, 10);
    const d = randInt(2, level === 2 ? 12 : 20);
    const right = Math.random() < 0.5;
    const ans = right ? a + d : a - d;
    const wrong = right ? a - d : a + d;
    return intEx({
      prompt: Q(`Ets al <b>${f(a)}</b> de la recta numèrica i et mous ${d} unitats cap a la <b>${right ? 'dreta' : 'esquerra'}</b>. A quin nombre arribes?`),
      answer: ans,
      traps: [
        t(wrong, 'recta_direccio', `T'has mogut cap a l'altre costat. Cap a la ${right ? 'dreta' : 'esquerra'} els nombres ${right ? 'creixen' : 'disminueixen'}: ${f(a)} ${right ? '+' : '−'} ${d} = ${f(ans)}.`),
        ...signTraps(ans),
      ],
      hint: `Cap a la dreta se suma; cap a l'esquerra es resta. Dibuixa la recta si cal.`,
      solution: `${f(a)} ${right ? '+' : '−'} ${d} = <b>${f(ans)}</b>`,
    });
  }

  function comptaEntre() {
    const a = neg(2, 15);
    const b = randInt(1, 15);
    const ans = b - a - 1;
    return intEx({
      prompt: Q(`Quants nombres enters hi ha <b>entre</b> ${f(a)} i ${b}, sense comptar-los a ells?`),
      answer: ans,
      traps: [
        t(ans - 1, 'zero_oblidat', 'T\'has deixat el 0: també és un nombre enter.'),
        t(ans + 2, 'altre', `Has comptat també el ${f(a)} i el ${b}, però la pregunta diu «sense comptar-los».`),
        t(ans + 1, 'altre', `N'has comptat un de més. Fixa't que no compten ni el ${f(a)} ni el ${b}.`),
      ],
      hint: 'Compta els negatius que hi ha, el 0 i els positius. O bé: quants passos hi ha de l\'un a l\'altre?',
      solution: `Negatius: de ${f(a + 1)} a −1 (${abs(a) - 1}); el 0 (1); positius: d'1 a ${b - 1} (${b - 1}). En total, ${abs(a) - 1} + 1 + ${b - 1} = <b>${ans}</b>.`,
    });
  }

  function puntMig() {
    let a;
    let b;
    do { a = neg(2, 20); b = randInt(-8, 20); } while ((a + b) % 2 !== 0 || b - a < 4 || a + b === 0);
    const m = (a + b) / 2;
    return intEx({
      prompt: Q(`Quin nombre enter està just al mig de ${f(a)} i ${f(b)}, a la mateixa distància de tots dos?`),
      answer: m,
      traps: [
        t((b - a) / 2, 'altre', `${(b - a) / 2} és la distància del punt mig a cada extrem, però et demanem el nombre que hi ha al mig: ${f(a)} + ${(b - a) / 2} = ${f(m)}.`),
        ...signTraps(m),
      ],
      hint: 'Calcula la distància entre els dos nombres i avança la meitat des del més petit.',
      solution: `De ${f(a)} a ${f(b)} hi ha ${b - a} unitats. La meitat és ${(b - a) / 2}, i ${f(a)} + ${(b - a) / 2} = <b>${f(m)}</b>.`,
    });
  }

  // ── 3. Suma i resta ─────────────────────────────────────────────────────────

  /** Traps d'una suma a + b. */
  function sumTraps(a, b) {
    const ans = a + b;
    const traps = [];
    if (a < 0 && b < 0) {
      traps.push(t(-ans, 'regla_signes_suma', `Dos negatius sumats donen un negatiu: si dec ${abs(a)} € i en dec ${abs(b)} més, en dec ${abs(ans)}. La regla «menys per menys, més» és per a multiplicar.`));
    } else if ((a < 0) !== (b < 0)) {
      const big = abs(a) > abs(b) ? a : b;
      const s = abs(a) + abs(b);
      traps.push(t(big < 0 ? -s : s, 'suma_valors_absoluts', `Els signes són diferents: cal <b>restar</b> els valors absoluts (${Math.max(abs(a), abs(b))} − ${Math.min(abs(a), abs(b))} = ${abs(ans)}) i posar el signe del que en té més (${f(big)}).`));
      traps.push(t(big < 0 ? s : -s, 'suma_valors_absoluts', `Els signes són diferents: cal <b>restar</b> els valors absoluts (${Math.max(abs(a), abs(b))} − ${Math.min(abs(a), abs(b))} = ${abs(ans)}).`));
      traps.push(...signTraps(ans, 'signe_canviat', `El valor ${abs(ans)} és bo, però el signe és el del nombre amb més valor absolut (${f(big)}): ${f(ans)}.`));
    }
    return traps;
  }

  function sumaDos(level) {
    const M = level === 1 ? 12 : 30;
    let a;
    let b;
    do { a = nz(-M, M); b = nz(-M, M); } while (a > 0 && b > 0);
    const ans = a + b;
    const expr = level === 1 ? `${S(a)} + ${S(b)}` : `${f(a)} + ${P(b)}`;
    return intEx({
      prompt: Q('Calcula:', expr),
      answer: ans,
      traps: sumTraps(a, b),
      hint: (a < 0) === (b < 0) ? 'Mateix signe: suma els valors absoluts i deixa el signe.' : 'Signes diferents: resta els valors absoluts i posa el signe del que en té més.',
      solution: (a < 0) === (b < 0)
        ? `Mateix signe: ${abs(a)} + ${abs(b)} = ${abs(ans)}, amb signe −. ${expr} = <b>${f(ans)}</b>`
        : `Signes diferents: ${Math.max(abs(a), abs(b))} − ${Math.min(abs(a), abs(b))} = ${abs(ans)}, amb el signe de ${f(abs(a) > abs(b) ? a : b)}. ${expr} = <b>${f(ans)}</b>`,
    });
  }

  function resta(level) {
    const M = level === 2 ? 15 : 30;
    const a = nz(-M, M);
    let b = nz(-M, M);
    if (Math.random() < 0.6) b = -abs(b); // sovint, restar un negatiu
    const ans = a - b;
    const traps = [];
    if (b < 0) traps.push(t(a + b, 'resta_sense_canvi', `Restar ${S(b)} és sumar el seu oposat, ${S(-b)}: ${f(a)} − ${S(b)} = ${f(a)} + ${-b} = ${f(ans)}. Dos signes menys seguits fan un més.`));
    else traps.push(t(a + b, 'operacio_equivocada', `Has sumat, però és una resta: ${f(a)} − ${b} = ${f(ans)}.`));
    traps.push(...signTraps(ans));
    return intEx({
      prompt: Q('Calcula:', `${S(a)} − ${S(b)}`),
      answer: ans,
      traps,
      hint: 'Restar és sumar l\'oposat: canvia la resta per una suma i el signe del segon nombre.',
      solution: `${S(a)} − ${S(b)} = ${S(a)} + ${S(-b)} = <b>${f(ans)}</b>`,
    });
  }

  function cadena(level) {
    const n = level === 2 ? 3 : 4;
    const terms = Array.from({ length: n }, () => nz(-15, 15));
    const ans = terms.reduce((x, y) => x + y, 0);
    const expr = terms.map((x, i) => (i === 0 ? f(x) : x < 0 ? `− ${abs(x)}` : `+ ${x}`)).join(' ');
    const pos = terms.filter((x) => x > 0).reduce((x, y) => x + y, 0);
    const negs = terms.filter((x) => x < 0).reduce((x, y) => x + y, 0);
    return intEx({
      prompt: Q('Calcula:', expr),
      answer: ans,
      traps: [
        ...signTraps(ans),
        t(terms.reduce((x, y) => x + abs(y), 0), 'signe_oblidat', 'Has sumat tots els nombres sense mirar els signes. Els que porten − resten.'),
      ],
      hint: 'Suma per una banda els positius i per l\'altra els negatius. Després, resta.',
      solution: `Positius: ${pos}. Negatius: ${f(negs)}. ${pos} + ${P(negs)} = <b>${f(ans)}</b>`,
    });
  }

  function ambParentesis() {
    const kind = pick(['quatre', 'grup']);
    if (kind === 'quatre') {
      const xs = [nz(-12, 12), nz(-12, 12), nz(-12, 12), nz(-12, 12)];
      const ops = ['+', pick(['+', '−']), pick(['+', '−']), pick(['+', '−'])];
      if (!ops.slice(1).includes('−')) ops[2] = '−';
      if (!xs.slice(1).some((x, i) => x < 0 && ops[i + 1] === '−')) xs[ops.indexOf('−', 1)] = -abs(xs[ops.indexOf('−', 1)]);
      const val = (resta) => xs.reduce((acc, x, i) => (i === 0 ? x : ops[i] === '+' ? acc + x : resta(acc, x)), 0);
      const ans = val((acc, x) => acc - x);
      const noChange = val((acc, x) => (x < 0 ? acc + x : acc - x)); // − (−x) com si fos − x
      const expr = xs.map((x, i) => (i === 0 ? S(x) : `${ops[i]} ${S(x)}`)).join(' ');
      const simple = xs.map((x, i) => {
        const v = i === 0 || ops[i] === '+' ? x : -x;
        return i === 0 ? f(v) : v < 0 ? `− ${abs(v)}` : `+ ${v}`;
      }).join(' ');
      return intEx({
        prompt: Q('Calcula:', expr),
        answer: ans,
        traps: [t(noChange, 'resta_sense_canvi', 'Compte amb els − (−…): restar un negatiu és sumar. Treu els parèntesis canviant el signe quan davant hi ha un −.'), ...signTraps(ans)],
        hint: 'Treu els parèntesis: + (+a) → +a, + (−a) → −a, − (+a) → −a, − (−a) → +a.',
        solution: `Sense parèntesis: ${simple} = <b>${f(ans)}</b>`,
      });
    }
    const a = nz(-15, 15);
    const b = randInt(1, 12);
    const c = randInt(1, 15);
    const inner = b - c;
    const ans = a - inner;
    return intEx({
      prompt: Q('Calcula:', `${f(a)} − (${b} − ${c})`),
      answer: ans,
      traps: [
        t(a - b - c, 'parentesi_signe', `El − de davant del parèntesi canvia el signe de <b>tots</b> els termes: ${f(a)} − (${b} − ${c}) = ${f(a)} − ${b} + ${c}.`),
        t(a + inner, 'resta_sense_canvi', `El parèntesi val ${f(inner)}, i cal restar-lo: ${f(a)} − ${P(inner)} = ${f(ans)}.`),
        ...signTraps(ans),
      ],
      hint: 'Primer resol el parèntesi i després resta el resultat. O treu el parèntesi canviant tots els signes de dins.',
      solution: `${b} − ${c} = ${f(inner)}. Aleshores ${f(a)} − ${P(inner)} = ${f(a)} + ${P(-inner)} = <b>${f(ans)}</b>`,
    });
  }

  // ── 4. Multiplicació i divisió ──────────────────────────────────────────────

  const ruleText = (a, b) => `${a < 0 ? '(−)' : '(+)'} · ${b < 0 ? '(−)' : '(+)'} = ${(a < 0) === (b < 0) ? '(+)' : '(−)'}`;

  function producte(level) {
    const M = level === 1 ? 10 : 15;
    let a;
    let b;
    do { a = nz(-M, M); b = nz(-M, M); } while (a > 0 && b > 0);
    const ans = a * b;
    const traps = [t(-ans, 'regla_signes', `Regla dels signes: ${ruleText(a, b)}. ${(a < 0) === (b < 0) ? 'Signes iguals → positiu' : 'Signes diferents → negatiu'}.`)];
    if (a + b !== ans) traps.push(t(a + b, 'operacio_equivocada', `Has sumat, però és una multiplicació: ${abs(a)} · ${abs(b)} = ${abs(ans)}, i el signe és ${sgnWord(ans)}.`));
    return intEx({
      prompt: Q('Calcula:', `${S(a)} · ${S(b)}`),
      answer: ans,
      traps,
      hint: 'Multiplica els valors absoluts i després posa el signe: iguals → +, diferents → −.',
      solution: `${abs(a)} · ${abs(b)} = ${abs(ans)}. Signe: ${ruleText(a, b)}. Resultat: <b>${f(ans)}</b>`,
    });
  }

  function quocient(level) {
    const M = level === 1 ? 10 : 15;
    let q;
    let b;
    do { q = nz(-M, M); b = nz(-M, M); } while ((q > 0 && b > 0) || abs(b) === 1);
    const a = q * b;
    return intEx({
      prompt: Q('Calcula:', `${S(a)} : ${S(b)}`),
      answer: q,
      traps: [t(-q, 'regla_signes', `Per dividir també es fa servir la regla dels signes: ${(a < 0) === (b < 0) ? 'signes iguals → positiu' : 'signes diferents → negatiu'}.`)],
      hint: 'Divideix els valors absoluts i després posa el signe: iguals → +, diferents → −.',
      solution: `${abs(a)} : ${abs(b)} = ${abs(q)}. Signe: ${(a < 0) === (b < 0) ? 'iguals → +' : 'diferents → −'}. Resultat: <b>${f(q)}</b>`,
    });
  }

  function tresFactors() {
    const xs = [nz(-6, 6), nz(-6, 6), nz(-6, 6)];
    if (!xs.some((x) => x < 0)) xs[randInt(0, 2)] *= -1;
    const ans = xs.reduce((a, b) => a * b, 1);
    const nNeg = xs.filter((x) => x < 0).length;
    return intEx({
      prompt: Q('Calcula:', xs.map(S).join(' · ')),
      answer: ans,
      traps: [t(-ans, 'factors_negatius', `Hi ha ${nNeg} ${nNeg === 1 ? 'factor negatiu' : 'factors negatius'}: ${nNeg % 2 ? 'un nombre senar' : 'un nombre parell'}, per tant el resultat és ${sgnWord(ans)}.`)],
      hint: 'Compta quants factors negatius hi ha: si en són un nombre parell, el resultat és positiu.',
      solution: `${xs.map(abs).join(' · ')} = ${abs(ans)}. Hi ha ${nNeg} ${nNeg === 1 ? 'factor negatiu' : 'factors negatius'} → ${sgnWord(ans)}: <b>${f(ans)}</b>`,
    });
  }

  function signeDe() {
    const n = randInt(4, 6);
    const xs = Array.from({ length: n }, () => nz(-9, 9));
    const nNeg = xs.filter((x) => x < 0).length;
    const positive = nNeg % 2 === 0;
    const msg = `Hi ha ${nNeg} ${nNeg === 1 ? 'factor negatiu' : 'factors negatius'}: ${positive ? 'parell → positiu' : 'senar → negatiu'}.`;
    return choiceEx({
      prompt: Q('Sense fer el càlcul: quin signe té el resultat?', xs.map(S).join(' · ')),
      options: [
        { label: 'Positiu (+)', correct: positive, id: 'factors_negatius', msg },
        { label: 'Negatiu (−)', correct: !positive, id: 'factors_negatius', msg },
      ],
      shuffle: false,
      hint: 'Només cal comptar els factors negatius.',
      solution: msg,
    });
  }

  function factorQueFalta() {
    let a;
    let x;
    do { a = nz(-9, 9); x = nz(-9, 9); } while (abs(a) === 1 || (a > 0 && x > 0));
    const p = a * x;
    return intEx({
      prompt: Q('Quin nombre falta?', `${S(a)} · <span class="blank">?</span> = ${f(p)}`),
      answer: x,
      traps: [t(-x, 'regla_signes', `Comprova-ho: ${S(a)} · ${S(-x)} = ${f(-p)}, no ${f(p)}. Si el resultat és ${sgnWord(p)} i ${f(a)} és ${sgnWord(a)}, el que falta ha de ser ${sgnWord(x)}.`)],
      hint: `Fes la divisió: ${f(p)} : ${P(a)}. I pensa quin signe ha de tenir.`,
      solution: `${f(p)} : ${P(a)} = <b>${f(x)}</b>. Comprovació: ${S(a)} · ${S(x)} = ${f(p)}.`,
    });
  }

  function mulDiv() {
    let a;
    let b;
    let c;
    do { b = nz(-6, 6); c = nz(-6, 6); a = nz(-8, 8) * b; } while (abs(b) === 1 || abs(c) === 1);
    const ans = (a / b) * c;
    return intEx({
      prompt: Q('Calcula (d\'esquerra a dreta):', `${S(a)} : ${S(b)} · ${S(c)}`),
      answer: ans,
      traps: [t(-ans, 'regla_signes', 'Aplica la regla dels signes a cada pas: primer la divisió, després la multiplicació.')],
      hint: 'Multiplicacions i divisions es fan en ordre, d\'esquerra a dreta.',
      solution: `${S(a)} : ${S(b)} = ${f(a / b)}; ${P(a / b)} · ${S(c)} = <b>${f(ans)}</b>`,
    });
  }

  // ── 5. Operacions combinades ────────────────────────────────────────────────

  function combinada(level) {
    if (level === 1) {
      const a = nz(-12, 12);
      const b = nz(-9, 9);
      const c = nz(-9, 9);
      const op = pick(['+', '−']);
      const prod = b * c;
      const ans = op === '+' ? a + prod : a - prod;
      const ltr = op === '+' ? (a + b) * c : (a - b) * c;
      return intEx({
        prompt: Q('Calcula:', `${f(a)} ${op} ${P(b)} · ${P(c)}`),
        answer: ans,
        traps: [
          t(ltr, 'ordre_operacions', `Primer es fa la multiplicació: ${P(b)} · ${P(c)} = ${f(prod)}. Després, la ${op === '+' ? 'suma' : 'resta'}.`),
          t(op === '+' ? a - prod : a + prod, 'regla_signes', `${P(b)} · ${P(c)} = ${f(prod)}. Revisa el signe del producte.`),
          ...signTraps(ans),
        ],
        hint: 'Primer la multiplicació, després la suma o la resta.',
        solution: `${f(a)} ${op} ${P(b)} · ${P(c)} = ${f(a)} ${op} ${P(prod)} = <b>${f(ans)}</b>`,
      });
    }
    if (level === 2) {
      const a = nz(-9, 9);
      const b = nz(-9, 9);
      const d = nz(-6, 6);
      const c = nz(-9, 9) * d;
      const q = c / d;
      const ans = a * b - q;
      const ltr = (a * b - c) / d;
      const traps = [t(-(ans), 'signe_canviat', 'Revisa els signes de cada operació.'), t(a * b + q, 'resta_sense_canvi', `Has de restar ${P(q)}: ${f(a * b)} − ${P(q)} = ${f(ans)}.`)];
      if (Number.isInteger(ltr)) traps.unshift(t(ltr, 'ordre_operacions', 'Primer es fan la multiplicació i la divisió, i després la resta.'));
      return intEx({
        prompt: Q('Calcula:', `${P(a)} · ${P(b)} − ${P(c)} : ${P(d)}`),
        answer: ans,
        traps,
        hint: 'Fes primer el producte i el quocient. Al final, la resta.',
        solution: `${P(a)} · ${P(b)} = ${f(a * b)}; ${P(c)} : ${P(d)} = ${f(q)}. ${f(a * b)} − ${P(q)} = <b>${f(ans)}</b>`,
      });
    }
    // Nivell 3: parèntesis.
    const a = nz(-6, 6);
    const b = nz(-9, 9);
    const c = nz(-9, 9);
    const e = nz(-5, 5);
    const d = nz(-6, 6) * e;
    const inner = b - c;
    const ans = a * inner + d / e;
    const traps = [
      t(a * (b + c) + d / e, 'resta_sense_canvi', `Dins del parèntesi: ${f(b)} − ${P(c)} = ${f(inner)}.`),
      t(a * b - c + d / e, 'ordre_operacions', `El parèntesi va primer: ${P(a)} multiplica tot el parèntesi, (${f(b)} − ${P(c)}) = ${f(inner)}.`),
      ...signTraps(ans),
    ];
    return intEx({
      prompt: Q('Calcula:', `${P(a)} · (${f(b)} − ${P(c)}) + ${P(d)} : ${P(e)}`),
      answer: ans,
      traps,
      hint: 'Primer el parèntesi, després multiplicacions i divisions, i al final la suma.',
      solution: `(${f(b)} − ${P(c)}) = ${f(inner)}. ${P(a)} · ${P(inner)} = ${f(a * inner)}; ${P(d)} : ${P(e)} = ${f(d / e)}. ${f(a * inner)} + ${P(d / e)} = <b>${f(ans)}</b>`,
    });
  }

  // ── 6. Potències d'enters ───────────────────────────────────────────────────

  const Hn = (a, n) => H(`(${f(a)})`, n);

  function potencia(level) {
    const a = randInt(level === 1 ? 1 : 2, level === 1 ? 5 : 10);
    const n = level === 1 ? randInt(2, 4) : (a > 5 ? 2 : randInt(2, 5));
    const ans = (-a) ** n;
    const traps = [t(-ans, 'potencia_signe', `Base negativa amb exponent ${n % 2 ? 'senar → resultat negatiu' : 'parell → resultat positiu'}: ${Array(n).fill(`(${f(-a)})`).join(' · ')} = ${f(ans)}.`)];
    if (-a * n !== ans) traps.push(t(-a * n, 'base_per_exponent', `Has multiplicat la base per l'exponent. ${Hn(-a, n)} = ${Array(n).fill(`(${f(-a)})`).join(' · ')}.`));
    return intEx({
      prompt: Q('Calcula:', Hn(-a, n)),
      answer: ans,
      traps,
      hint: `Multiplica ${f(-a)} per ell mateix ${n} vegades. Exponent parell → positiu; senar → negatiu.`,
      solution: `${Hn(-a, n)} = ${Array(n).fill(`(${f(-a)})`).join(' · ')} = <b>${f(ans)}</b>`,
    });
  }

  function senseParentesi() {
    const a = randInt(2, 6);
    const n = a > 4 ? 2 : pick([2, 4, 4, 3]); // sobretot parells: és on el parèntesi canvia el resultat
    const withP = Math.random() < 0.5;
    const ans = withP ? (-a) ** n : -(a ** n);
    const other = withP ? -(a ** n) : (-a) ** n;
    const expr = withP ? Hn(-a, n) : `−${H(a, n)}`;
    const traps = [];
    if (other !== ans) {
      traps.push(t(other, 'potencia_sense_parentesi', withP
        ? `Amb parèntesi, el signe també s'eleva: ${Hn(-a, n)} = ${Array(n).fill(`(${f(-a)})`).join(' · ')} = ${f(ans)}.`
        : `Sense parèntesi, l'exponent només afecta el ${a}: −${H(a, n)} = −(${Array(n).fill(a).join(' · ')}) = ${f(ans)}.`));
    } else traps.push(...signTraps(ans, 'potencia_signe'));
    return intEx({
      prompt: Q('Calcula. Compte amb el parèntesi!', expr),
      answer: ans,
      traps,
      hint: 'Sense parèntesi, l\'exponent no afecta el signe menys. Amb parèntesi, sí.',
      solution: withP
        ? `${expr} = ${Array(n).fill(`(${f(-a)})`).join(' · ')} = <b>${f(ans)}</b>`
        : `${expr} = −(${Array(n).fill(a).join(' · ')}) = <b>${f(ans)}</b>`,
    });
  }

  function exprPotencies() {
    const a = randInt(2, 4);
    const m = randInt(2, 3);
    const b = randInt(2, 4);
    const n = randInt(2, 3);
    const op = pick(['+', '−']);
    const x = (-a) ** m;
    const y = (-b) ** n;
    const ans = op === '+' ? x + y : x - y;
    const wrongX = -x;
    const traps = [
      t(op === '+' ? wrongX + y : wrongX - y, 'potencia_signe', `Revisa el signe de ${Hn(-a, m)}: exponent ${m % 2 ? 'senar → negatiu' : 'parell → positiu'}, ${f(x)}.`),
      t(op === '+' ? x - y : x + y, 'potencia_signe', `Revisa el signe de ${Hn(-b, n)}: exponent ${n % 2 ? 'senar → negatiu' : 'parell → positiu'}, ${f(y)}.`),
    ];
    return intEx({
      prompt: Q('Calcula:', `${Hn(-a, m)} ${op} ${Hn(-b, n)}`),
      answer: ans,
      traps,
      hint: 'Calcula cada potència amb el seu signe i després opera.',
      solution: `${Hn(-a, m)} = ${f(x)} i ${Hn(-b, n)} = ${f(y)}. ${f(x)} ${op} ${P(y)} = <b>${f(ans)}</b>`,
    });
  }

  function signePotencia() {
    const a = randInt(2, 9);
    const n = randInt(3, 15);
    const positive = n % 2 === 0;
    const msg = `L'exponent ${n} és ${positive ? 'parell' : 'senar'}: ${positive ? 'els signes menys s\'anul·len per parelles i el resultat és positiu' : 'en sobra un de sol, i el resultat és negatiu'}.`;
    return choiceEx({
      prompt: Q('Sense calcular-la: quin signe té aquesta potència?', Hn(-a, n)),
      options: [
        { label: 'Positiu (+)', correct: positive, id: 'potencia_signe', msg },
        { label: 'Negatiu (−)', correct: !positive, id: 'potencia_signe', msg },
      ],
      shuffle: false,
      hint: 'Mira si l\'exponent és parell o senar.',
      solution: msg,
    });
  }

  // ── 7. Problemes ────────────────────────────────────────────────────────────

  function probBaixa() {
    const kind = pick(['temp', 'ascensor', 'saldo', 'submari', 'punts']);
    if (kind === 'temp') {
      const a = randInt(1, 10);
      const d = a + randInt(1, 10);
      const ans = a - d;
      return intEx({
        prompt: Q(`Al matí la temperatura era de ${a} °C. A la nit ha baixat ${d} graus. Quina temperatura fa a la nit?`),
        answer: ans,
        traps: [t(-ans, 'signe_oblidat', `Ha baixat més del que hi havia: ha passat per sota de zero. ${a} − ${d} = ${f(ans)} °C.`), t(a + d, 'recta_direccio', 'La temperatura ha <b>baixat</b>: cal restar.')],
        hint: 'Si baixa, resta. Pot quedar per sota de zero.',
        solution: `${a} − ${d} = <b>${f(ans)}</b> °C`,
      });
    }
    if (kind === 'ascensor') {
      const a = randInt(1, 6);
      const d = a + randInt(1, 4);
      const ans = a - d;
      return intEx({
        prompt: Q(`L'ascensor és a la planta ${a} i baixa ${d} plantes. A quina planta arriba? (La planta baixa és la 0 i les del soterrani són negatives.)`),
        answer: ans,
        traps: [t(-ans, 'signe_oblidat', `Ha passat per sota de la planta baixa: és una planta del soterrani, ${f(ans)}.`), t(a + d, 'recta_direccio', 'L\'ascensor <b>baixa</b>: cal restar.')],
        hint: 'Baixar és restar. Les plantes del soterrani són negatives.',
        solution: `${a} − ${d} = <b>${f(ans)}</b>`,
      });
    }
    if (kind === 'saldo') {
      const a = randInt(5, 40);
      const d = a + randInt(5, 40);
      const ans = a - d;
      return intEx({
        prompt: Q(`Al compte hi ha ${a} € i es paga un rebut de ${d} €. Quin és el saldo del compte ara? (Si es deuen diners, és negatiu.)`),
        answer: ans,
        traps: [t(-ans, 'signe_oblidat', `Es paga més del que hi havia, així que el compte queda en negatiu: ${f(ans)} €.`), t(a + d, 'recta_direccio', 'Pagar és restar diners.')],
        hint: 'Pagar és restar. Si es paga més del que hi ha, el saldo queda negatiu.',
        solution: `${a} − ${d} = <b>${f(ans)}</b> €`,
      });
    }
    if (kind === 'submari') {
      const a = randInt(5, 30) * 10;
      const d = randInt(2, a / 10 - 1) * 10;
      const ans = -a + d;
      return intEx({
        prompt: Q(`Un submarí és a ${a} m de profunditat (${f(-a)} m) i puja ${d} m. A quina altura és ara?`),
        answer: ans,
        traps: [t(-a - d, 'recta_direccio', `Si puja, s'acosta a la superfície: ${f(-a)} + ${d} = ${f(ans)}.`), t(-ans, 'signe_oblidat', `Encara és sota l'aigua, així que el nombre és negatiu: ${f(ans)} m.`)],
        hint: 'Pujar és sumar. Mentre sigui sota l\'aigua, el nombre és negatiu.',
        solution: `${f(-a)} + ${d} = <b>${f(ans)}</b> m`,
      });
    }
    const a = neg(2, 20);
    const g = randInt(2, 30);
    const ans = a + g;
    return intEx({
      prompt: Q(`En un joc tinc ${f(a)} punts i en la ronda següent en guanyo ${g}. Quants punts tinc ara?`),
      answer: ans,
      traps: [t(a - g, 'recta_direccio', 'Guanyar punts és sumar.'), ...sumTraps(a, g).filter((x) => x.id !== 'signe_canviat'), ...signTraps(ans)],
      hint: 'Guanyar és sumar. Comença des del nombre negatiu.',
      solution: `${f(a)} + ${g} = <b>${f(ans)}</b> punts`,
    });
  }

  function probDiferencia() {
    const kind = pick(['temp', 'altura', 'temp2']);
    if (kind === 'altura') {
      const up = randInt(5, 60);
      const down = randInt(5, 60);
      const ans = up + down;
      return intEx({
        prompt: Q(`Una gavina vola a ${up} m sobre el nivell del mar, i just a sota hi ha un peix a ${down} m de profunditat. Quina distància hi ha entre tots dos?`),
        answer: ans,
        traps: [t(abs(up - down), 'diferencia_signes', `Un és a +${up} i l'altre a ${f(-down)}: la distància és ${up} − ${P(-down)} = ${up} + ${down} = ${ans} m.`), t(-ans, 'altre', 'Una distància no pot ser negativa.')],
        hint: 'Escriu les dues altures amb signe i fes la resta: més alta − més baixa.',
        solution: `${up} − ${P(-down)} = ${up} + ${down} = <b>${ans}</b> m`,
      });
    }
    const a = neg(1, 12);
    const b = kind === 'temp' ? randInt(1, 20) : neg(1, 12);
    if (a === b) return probDiferencia();
    const ans = b - a;
    const traps = [];
    if (b > 0) traps.push(t(b - abs(a), 'diferencia_signes', `Has restat els valors sense els signes. ${b} − ${P(a)} = ${b} + ${abs(a)} = ${ans}.`));
    else traps.push(t(abs(a) + abs(b), 'diferencia_signes', `${f(b)} − ${P(a)} = ${f(b)} + ${abs(a)} = ${f(ans)}.`));
    traps.push(...signTraps(ans, 'signe_canviat', ans < 0 ? `La temperatura ha baixat, així que la variació és negativa: ${f(ans)}.` : `La temperatura ha pujat, així que la variació és positiva: +${ans}.`));
    return intEx({
      prompt: Q(`A les 7 del matí la temperatura era de ${f(a)} °C i a les 3 de la tarda, de ${f(b)} °C. Quant ha variat la temperatura? (Si ha baixat, escriu-ho en negatiu.)`),
      answer: ans,
      traps,
      hint: 'Variació = temperatura final − temperatura inicial.',
      solution: `${f(b)} − ${P(a)} = ${f(b)} + ${abs(a)} = <b>${f(ans)}</b> graus`,
    });
  }

  function probPassos() {
    const kind = pick(['hores', 'mitjana', 'cota']);
    if (kind === 'hores') {
      const a = randInt(2, 10);
      const r = randInt(2, 4);
      const h = randInt(3, 6);
      const ans = a - r * h;
      return intEx({
        prompt: Q(`A mitjanit fa ${a} °C, i la temperatura baixa ${r} graus cada hora. Quina temperatura farà d'aquí a ${h} hores?`),
        answer: ans,
        traps: [t(-r * h, 'altre', `${f(-r * h)} és el que baixa en total (${h} · ${P(-r)}). Ara cal sumar-ho a la temperatura inicial: ${a} + ${P(-r * h)}.`), t(a + r * h, 'recta_direccio', 'La temperatura baixa: cal restar.'), ...signTraps(ans)],
        hint: `Primer calcula quant baixa en total: ${h} hores · ${r} graus.`,
        solution: `En ${h} hores baixa ${h} · ${r} = ${r * h} graus. ${a} − ${r * h} = <b>${f(ans)}</b> °C`,
      });
    }
    if (kind === 'mitjana') {
      let xs;
      do { xs = Array.from({ length: 4 }, () => randInt(-9, 6)); } while (xs.reduce((a, b) => a + b, 0) % 4 !== 0 || xs.filter((x) => x < 0).length < 2);
      const sum = xs.reduce((a, b) => a + b, 0);
      const ans = sum / 4;
      const absAvg = xs.reduce((a, b) => a + abs(b), 0) / 4;
      const traps = [...signTraps(ans)];
      if (Number.isInteger(absAvg)) traps.push(t(absAvg, 'signe_oblidat', 'Cal sumar les temperatures amb el seu signe: les negatives resten.'));
      if (sum !== ans) traps.push(t(sum, 'altre', `${f(sum)} és la suma. Per a la mitjana, cal dividir-la entre 4.`));
      return intEx({
        prompt: Q(`Aquestes són les temperatures mínimes de quatre dies: ${xs.map((x) => `${f(x)} °C`).join(', ')}. Quina és la temperatura mitjana?`),
        answer: ans,
        traps,
        hint: 'Suma les quatre temperatures (amb el signe) i divideix entre 4.',
        solution: `${xs.map(P).join(' + ')} = ${f(sum)}; ${f(sum)} : 4 = <b>${f(ans)}</b> °C`,
      });
    }
    const start = randInt(-40, -10);
    const up = randInt(5, 30);
    const down = randInt(10, 40);
    const ans = start + up - down;
    return intEx({
      prompt: Q(`Un bus és a ${f(start)} m (sota el mar). Primer puja ${up} m i després baixa ${down} m. A quina altura és al final?`),
      answer: ans,
      traps: [t(start - up + down, 'recta_direccio', 'Pujar és sumar i baixar és restar.'), ...signTraps(ans)],
      hint: 'Pujar és sumar i baixar és restar. Ves pas a pas.',
      solution: `${f(start)} + ${up} = ${f(start + up)}; ${f(start + up)} − ${down} = <b>${f(ans)}</b> m`,
    });
  }

  // ── Generadors per habilitat i nivell ──────────────────────────────────────

  ML.enters.generators = {
    concepte(level) {
      if (level === 1) return run([situacio, () => valorAbsolut(20), () => oposat(20)]);
      if (level === 2) return run([mesLluny, exprAbs, situacio, () => oposat(200)]);
      return run([dosValors, exprAbs, mesLluny]);
    },
    ordenar(level) {
      if (level === 1) return run([() => compara(1), () => extrem(1)]);
      if (level === 2) return run([ordenaLlista, () => recta(2), () => compara(2), () => extrem(2)]);
      return run([comptaEntre, puntMig, () => recta(3), ordenaLlista]);
    },
    suma_resta(level) {
      if (level === 1) return sumaDos(1);
      if (level === 2) return run([() => resta(2), () => sumaDos(2), () => cadena(2)]);
      return run([ambParentesis, () => cadena(3), () => resta(3)]);
    },
    multiplicacio_divisio(level) {
      if (level === 1) return run([() => producte(1), () => quocient(1)]);
      if (level === 2) return run([tresFactors, signeDe, () => quocient(2), () => producte(2)]);
      return run([factorQueFalta, mulDiv, tresFactors]);
    },
    operacions_combinades: (level) => combinada(level),
    potencies(level) {
      if (level === 1) return run([() => potencia(1), signePotencia]);
      if (level === 2) return run([senseParentesi, () => potencia(2), signePotencia]);
      return run([exprPotencies, senseParentesi]);
    },
    problemes(level) {
      if (level === 1) return probBaixa();
      if (level === 2) return run([probDiferencia, probBaixa]);
      return run([probPassos, probDiferencia]);
    },
  };
})(window.MathLab);
