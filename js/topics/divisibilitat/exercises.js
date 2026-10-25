/* Generadors d'exercicis de divisibilitat.
 * Cada generador retorna un exercici amb el contracte descrit a js/core/checker.js.
 * Els "traps" són les respostes incorrectes previsibles, amb l'error que delaten i l'explicació.
 */
window.MathLab = window.MathLab || {};
window.MathLab.divisibilitat = window.MathLab.divisibilitat || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const { randInt, pick } = U;
  const H = U.pw;
  const f = U.fmt;
  const BLANK = '<span class="blank">?</span>';

  // ── Constructors d'exercicis ────────────────────────────────────────────────

  const t = (match, id, msg) => ({ match, id, msg });
  const tt = (test, id, msg) => ({ test, id, msg });
  const Q = (text, math) => `<p class="q-text">${text}</p>${math ? `<div class="q-math">${math}</div>` : ''}`;
  const numEx = (o) => Object.assign({ input: { type: 'number' } }, o);

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

  /** Afegeix a `opts` fins a `max` opcions incorrectes de `pool`, sense repetir etiquetes. */
  function fill(opts, pool, max) {
    const labels = new Set(opts.map((o) => o.label));
    for (const o of U.shuffle(pool)) {
      if (opts.length >= max) break;
      if (labels.has(o.label)) continue;
      labels.add(o.label);
      opts.push(o);
    }
    return opts;
  }

  // ── Aritmètica ───────────────────────────────────────────────────────────────

  const divisors = (n) => {
    const d = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i);
    return d;
  };
  const isPrime = (n) => {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const gcdAll = (ns) => ns.reduce(gcd);
  const lcmAll = (ns) => ns.reduce(lcm);

  /** Descomposició en factors primers: [[p, e], …]. */
  function factorize(n) {
    const out = [];
    for (let p = 2; n > 1; p++) {
      let e = 0;
      while (n % p === 0) { n /= p; e++; }
      if (e) out.push([p, e]);
    }
    return out;
  }
  const valueOf = (F) => F.reduce((acc, [p, e]) => acc * p ** e, 1);
  /** HTML d'una descomposició: 2³ · 3 · 5. */
  const fHtml = (F) => (F.length ? F.map(([p, e]) => (e === 1 ? String(p) : H(p, e))).join(' · ') : '1');
  /** Llista de factors (pot tenir compostos) → [[x, e], …] agrupant els iguals, en ordre creixent. */
  const group = (list) => {
    const m = new Map();
    list.slice().sort((a, b) => a - b).forEach((x) => m.set(x, (m.get(x) || 0) + 1));
    return [...m.entries()];
  };
  /** «2³ · 3 = 24», o només «17» si la descomposició ja és el nombre. */
  const withValue = (F) => (F.length === 1 && F[0][1] === 1 ? `<b>${F[0][0]}</b>` : `${fHtml(F)} = <b>${f(valueOf(F))}</b>`);
  const expand = (F) => F.flatMap(([p, e]) => Array(e).fill(p));
  const omega = (n) => expand(factorize(n)).length;

  const digits = (n) => String(n).split('').map(Number);
  const dsum = (n) => digits(n).reduce((a, b) => a + b, 0);
  const sumExpr = (n) => `${digits(n).join(' + ')} = ${dsum(n)}`;
  /** Criteri de l'11: [suma de posicions senars des de la dreta, suma de posicions parells]. */
  const alt = (n) => {
    const d = digits(n).reverse();
    let a = 0;
    let b = 0;
    d.forEach((x, i) => { if (i % 2 === 0) a += x; else b += x; });
    return [a, b];
  };
  const pairsHtml = (n) => {
    const p = [];
    for (let i = 1; i * i <= n; i++) if (n % i === 0) p.push(`${i} · ${n / i}`);
    return p.join(', ');
  };

  const PRIMES = Array.from({ length: 250 }, (_, i) => i).filter(isPrime);
  /** Compostos senars que «semblen» primers. */
  const ODD_COMP_S = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49];
  const ODD_COMP_L = [51, 57, 69, 77, 85, 87, 91, 93, 111, 117, 119, 121, 133, 143];
  const smallestFactor = (n) => factorize(n)[0][0];
  const asProduct = (n) => `${smallestFactor(n)} · ${n / smallestFactor(n)}`;

  const run = (pool) => pick(pool)();

  // ── 1. Múltiples i divisors ─────────────────────────────────────────────────

  const noMultMsg = (x, b) => `${f(x)} : ${b} = ${Math.floor(x / b)} i sobra ${x % b}. La divisió no és exacta, així que ${f(x)} no és múltiple de ${b}.`;

  function quinMultiple(level) {
    const b = level === 1 ? randInt(3, 9) : randInt(6, 15);
    const k = randInt(3, level === 1 ? 9 : 12);
    const m = b * k;
    const opts = [{ label: f(m), correct: true }];
    const dv = divisors(b).filter((d) => d > 1 && d < b);
    if (dv.length) {
      const d = pick(dv);
      opts.push({ label: f(d), id: 'multiple_divisor_girats', msg: `${d} és un <b>divisor</b> de ${b} (${b} : ${d} = ${b / d}), no un múltiple. Els múltiples de ${b} s'obtenen multiplicant: ${b}, ${2 * b}, ${3 * b}…` });
    }
    const pool = [];
    for (let i = 0; i < 40; i++) {
      const x = randInt(2 * b, m + 2 * b);
      if (x % b !== 0) pool.push({ label: f(x), id: 'divisio_no_exacta', msg: noMultMsg(x, b) });
    }
    return choiceEx({
      prompt: Q(`Quin d'aquests nombres és <b>múltiple de ${b}</b>?`),
      options: fill(opts, pool, 4),
      hint: `Un múltiple de ${b} és el resultat de multiplicar ${b} per un nombre natural. Prova de dividir cada opció entre ${b}.`,
      solution: `${f(m)} = ${b} · ${k}, per tant ${f(m)} és múltiple de ${b}.`,
    });
  }

  function quinDivisor(level) {
    let N;
    do { N = level === 1 ? randInt(12, 48) : randInt(36, 100); } while (divisors(N).length < 5);
    const inner = divisors(N).filter((d) => d > 1 && d < N);
    const d = pick(inner);
    const opts = [
      { label: f(d), correct: true },
      { label: f(2 * N), id: 'multiple_divisor_girats', msg: `${f(2 * N)} = ${N} · 2 és un <b>múltiple</b> de ${N}, no un divisor. Un divisor de ${N} ha de ser més petit o igual que ${N}.` },
    ];
    const pool = [];
    for (let x = 2; x < N; x++) {
      if (N % x !== 0) pool.push({ label: f(x), id: 'divisio_no_exacta', msg: `${N} : ${x} = ${Math.floor(N / x)} i sobra ${N % x}. La divisió no és exacta, així que ${x} no és divisor de ${N}.` });
    }
    return choiceEx({
      prompt: Q(`Quin d'aquests nombres és <b>divisor de ${N}</b>?`),
      options: fill(opts, pool, 4),
      hint: `Un divisor de ${N} divideix ${N} exactament, sense que sobri res.`,
      solution: `${N} : ${d} = ${N / d}, i la divisió és exacta. Els divisors de ${N} són: ${divisors(N).join(', ')}.`,
    });
  }

  function siNo() {
    const b = randInt(3, 9);
    const k = randInt(4, 12);
    if (Math.random() < 0.5) {
      const m = b * k;
      return choiceEx({
        prompt: Q('Tria la resposta i la raó correctes:', `És ${m} múltiple de ${b}?`),
        options: [
          { label: `Sí, perquè ${b} · ${k} = ${m}`, correct: true },
          { label: `No, perquè ${m} : ${b} no és exacta`, id: 'altre', msg: `Fes la divisió: ${m} : ${b} = ${k} i no sobra res. És exacta!` },
          { label: `No: al revés, ${b} és múltiple de ${m}`, id: 'multiple_divisor_girats', msg: `${b} és més petit que ${m}, així que no en pot ser múltiple. És ${b} el que és <b>divisor</b> de ${m}, i ${m} el que és <b>múltiple</b> de ${b}.` },
        ],
        hint: `Divideix ${m} entre ${b}. Si no sobra res, és múltiple.`,
        solution: `${m} : ${b} = ${k} exacta, és a dir, ${m} = ${b} · ${k}. Per tant, ${m} és múltiple de ${b}.`,
      });
    }
    const r = randInt(1, b - 1);
    const m = b * k + r;
    return choiceEx({
      prompt: Q('Tria la resposta i la raó correctes:', `És ${m} múltiple de ${b}?`),
      options: [
        { label: `No, perquè ${m} : ${b} = ${k} i sobra ${r}`, correct: true },
        { label: `Sí, perquè ${m} és més gran que ${b}`, id: 'divisio_no_exacta', msg: `No n'hi ha prou que sigui més gran: la divisió ha de ser exacta. ${noMultMsg(m, b)}` },
        { label: `Sí, perquè ${b} és divisor de ${m}`, id: 'divisio_no_exacta', msg: `${b} no és divisor de ${m}: ${m} : ${b} = ${k} i sobra ${r}.` },
      ],
      hint: `Divideix ${m} entre ${b}. Si sobra alguna cosa, no és múltiple.`,
      solution: `${m} : ${b} = ${k} i sobra ${r}: la divisió no és exacta, així que ${m} no és múltiple de ${b}.`,
    });
  }

  function relacio() {
    const b = randInt(3, 9);
    let k = randInt(2, 9);
    if (k === b) k++;
    const a = b * k;
    return choiceEx({
      prompt: Q('Sabem que:', `${a} = ${b} · ${k}`) + '<p class="q-text">Quina frase és correcta?</p>',
      options: [
        { label: `${a} és múltiple de ${b}`, correct: true },
        { label: `${a} és divisor de ${b}`, id: 'multiple_divisor_girats', msg: `Al revés: ${a} és el gran, per tant és <b>múltiple</b> de ${b}. És ${b} el que és divisor de ${a}.` },
        { label: `${b} és múltiple de ${a}`, id: 'multiple_divisor_girats', msg: `Al revés: ${b} és el petit, per tant és <b>divisor</b> de ${a}. És ${a} el que és múltiple de ${b}.` },
        { label: `${b} no és divisor de ${a}`, id: 'altre', msg: `Sí que ho és: ${a} : ${b} = ${k}, exacta.` },
      ],
      hint: 'El nombre gran és múltiple del petit; el petit és divisor del gran.',
      solution: `Com que ${a} = ${b} · ${k}, el ${a} és múltiple de ${b} (i també de ${k}), i el ${b} és divisor de ${a}.`,
    });
  }

  function numDivisors(level) {
    let N;
    do { N = level === 2 ? randInt(12, 48) : randInt(50, 100); } while (divisors(N).length < 6);
    const D = divisors(N);
    const c = D.length;
    return numEx({
      prompt: Q(`Quants divisors té el <b>${N}</b>?`),
      answer: c,
      traps: [
        t(c - 2, 'u_i_ell_mateix', `Gairebé! T'has deixat l'1 i el ${N}: tots dos també són divisors de ${N}.`),
        t(c - 1, 'u_i_ell_mateix', `Compte: l'1 i el ${N} també són divisors de ${N}. Te n'has deixat un.`),
        tt((v) => v > 0 && v < c, 'divisor_oblidat', `Te n'has deixat alguns. Busca'ls per parelles: ${pairsHtml(N)}.`),
      ],
      hint: `Busca'ls per parelles de nombres que multiplicats donin ${N}: 1 · ${N}, 2 · …`,
      solution: `Parelles: ${pairsHtml(N)}. Els divisors de ${N} són ${D.join(', ')}: n'hi ha <b>${c}</b>.`,
    });
  }

  function divisorsComplets(level) {
    const pool = level === 2 ? [12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 50]
      : [54, 56, 60, 63, 64, 66, 70, 72, 75, 80, 84, 88, 90, 96, 100];
    const N = pick(pool);
    const D = divisors(N);
    const lab = (arr) => arr.join(', ');
    const inner = D.filter((d) => d > 1 && d * d <= N);
    const d = pick(inner);
    const missing = D.filter((x) => x !== d && x !== N / d);
    let extra;
    do { extra = randInt(2, N - 1); } while (N % extra === 0);
    const withExtra = D.concat(extra).sort((a, b) => a - b);
    const opts = [{ label: lab(D), correct: true }];
    fill(opts, [
      { label: lab(D.slice(1, -1)), id: 'u_i_ell_mateix', msg: `Hi falten l'1 i el ${N}. Tot nombre és divisible per 1 i per ell mateix.` },
      { label: lab(missing), id: 'divisor_oblidat', msg: `Hi falta ${d * d === N ? `el ${d}` : `la parella ${d} · ${N / d}`}. Busca els divisors per parelles: ${pairsHtml(N)}.` },
      { label: lab([N, 2 * N, 3 * N, 4 * N]), id: 'multiple_divisor_girats', msg: `Aquests són <b>múltiples</b> de ${N} (${N} · 1, ${N} · 2…). Els divisors són més petits o iguals que ${N}.` },
      { label: lab(withExtra), id: 'divisio_no_exacta', msg: `El ${extra} sobra: ${N} : ${extra} = ${Math.floor(N / extra)} i sobra ${N % extra}.` },
    ], 4);
    return choiceEx({
      prompt: Q(`Quina llista conté <b>tots</b> els divisors de ${N}, i només els divisors?`),
      options: opts,
      hint: `Busca parelles de nombres que multiplicats donin ${N}.`,
      solution: `Parelles: ${pairsHtml(N)}. Divisors de ${N}: <b>${lab(D)}</b>.`,
    });
  }

  function seguentMultiple() {
    const b = randInt(6, 15);
    let L;
    do { L = randInt(50, 200); } while (L % b === 0);
    const q = Math.floor(L / b);
    const ans = (q + 1) * b;
    return numEx({
      prompt: Q(`Quin és el múltiple de <b>${b}</b> més petit que és més gran que <b>${L}</b>?`),
      answer: ans,
      traps: [
        t(q * b, 'altre', `${q * b} = ${b} · ${q} és múltiple de ${b}, però és més petit que ${L}. Busca el següent.`),
        t(L + 1, 'divisio_no_exacta', noMultMsg(L + 1, b)),
      ],
      fallback: `Divideix ${L} entre ${b} i mira quin és el múltiple següent.`,
      hint: `Divideix ${L} : ${b}. El quocient et diu per on vas de la taula del ${b}.`,
      solution: `${L} : ${b} = ${q} i sobra ${L % b}. Així, ${b} · ${q} = ${q * b} queda per sota i ${b} · ${q + 1} = <b>${ans}</b> és el primer que passa de ${L}.`,
    });
  }

  // ── 2. Criteris de divisibilitat ────────────────────────────────────────────

  const RULE = {
    2: 'acaba en 0, 2, 4, 6 o 8',
    3: 'la suma de les xifres és múltiple de 3',
    4: 'les dues últimes xifres formen un múltiple de 4',
    5: 'acaba en 0 o en 5',
    6: 'és divisible per 2 i per 3 alhora',
    9: 'la suma de les xifres és múltiple de 9',
    10: 'acaba en 0',
    11: 'la diferència entre la suma de les xifres de posició senar i la de posició parella és 0 o múltiple d\'11',
  };

  /** Per què x (no) és divisible per d, segons el criteri. */
  function why(d, x) {
    const yes = x % d === 0;
    const last = x % 10;
    switch (d) {
      case 2: return `${f(x)} acaba en ${last}, que ${yes ? 'és parell' : 'és senar'}: ${yes ? '' : 'no '}és divisible per 2.`;
      case 5: return `${f(x)} acaba en ${last}: ${yes ? 'és divisible per 5' : 'per ser divisible per 5 ha d\'acabar en 0 o en 5'}.`;
      case 10: return `${f(x)} acaba en ${last}: ${yes ? 'és divisible per 10' : 'per ser divisible per 10 ha d\'acabar en 0'}.`;
      case 3:
      case 9: return `Les xifres de ${f(x)} sumen ${sumExpr(x)}, que ${yes ? '' : 'no '}és múltiple de ${d}.`;
      case 4: return `Les dues últimes xifres de ${f(x)} formen el ${x % 100}, que ${yes ? '' : 'no '}és múltiple de 4.`;
      case 6:
        if (yes) return `${f(x)} és parell i les xifres sumen ${sumExpr(x)}, múltiple de 3: és divisible per 2 i per 3, i per tant per 6.`;
        if (x % 2) return `${f(x)} és senar, i per ser divisible per 6 ha de ser parell.`;
        return `${f(x)} és parell, però les xifres sumen ${sumExpr(x)}, que no és múltiple de 3. Ha de ser divisible per 2 <b>i</b> per 3.`;
      case 11: {
        const [a, b] = alt(x);
        const diff = Math.abs(a - b);
        const end = !yes ? 'que no és 0 ni múltiple d\'11: no és divisible per 11.'
          : diff === 0 ? 'és a dir, 0: és divisible per 11.' : 'que és múltiple d\'11: és divisible per 11.';
        return `Xifres de posició senar (des de la dreta): suma ${a}. De posició parella: suma ${b}. La diferència és ${diff}, ${end}`;
      }
      default: return '';
    }
  }

  /** Tipus de distractors per a cada divisor: [condició, id, introducció]. */
  const KINDS = {
    2: [[(x) => Math.floor(x / 10 ** (String(x).length - 1)) % 2 === 0, 'criteri_xifra_equivocada', 'Compte: només compta l\'<b>última</b> xifra.'],
      [(x) => dsum(x) % 2 === 0, 'criteri_suma_per_2_5', 'La suma de les xifres no serveix per al 2.']],
    5: [[(x) => String(x).slice(0, -1).includes('5') || String(x).slice(0, -1).includes('0'), 'criteri_xifra_equivocada', 'Compte: només compta l\'<b>última</b> xifra.'],
      [(x) => dsum(x) % 5 === 0, 'criteri_suma_per_2_5', 'La suma de les xifres no serveix per al 5.']],
    10: [[(x) => x % 10 === 5, 'criteri_5_10', 'Acabar en 5 serveix per al 5, però no per al 10.'],
      [(x) => String(x).slice(0, -1).includes('0'), 'criteri_xifra_equivocada', 'Compte: només compta l\'<b>última</b> xifra.'],
      [(x) => dsum(x) % 10 === 0, 'criteri_suma_per_2_5', 'La suma de les xifres no serveix per al 10.']],
    3: [[(x) => [3, 6, 9].includes(x % 10), 'criteri_ultima_per_3_9', 'Per al 3 no n\'hi ha prou de mirar l\'última xifra.']],
    9: [[(x) => x % 10 === 9, 'criteri_ultima_per_3_9', 'Per al 9 no n\'hi ha prou de mirar l\'última xifra.'],
      [(x) => x % 3 === 0, 'criteri_3_9', 'És divisible per 3, però no per 9.']],
    4: [[(x) => x % 2 === 0, 'criteri_4', 'Per ser divisible per 4 no n\'hi ha prou que sigui parell.']],
    6: [[(x) => x % 2 === 0, 'criteri_6', 'No n\'hi ha prou que sigui parell.'], [(x) => x % 3 === 0, 'criteri_6', 'No n\'hi ha prou que sigui divisible per 3.']],
    11: [[(x) => dsum(x) % 11 === 0, 'criteri_11', 'Per a l\'11 no se sumen totes les xifres: cal restar les de posició senar i les de posició parella.']],
  };

  function critChoice(d, min, max) {
    let c;
    do { c = randInt(min, max); } while (c % d !== 0);
    const opts = [{ label: f(c), correct: true }];
    const used = new Set([c]);
    const take = (cond, id, intro) => {
      for (let i = 0; i < 300; i++) {
        const x = randInt(min, max);
        if (x % d === 0 || used.has(x) || !cond(x)) continue;
        used.add(x);
        opts.push({ label: f(x), id, msg: `${intro} ${why(d, x)}` });
        return;
      }
    };
    U.shuffle(KINDS[d]).forEach(([cond, id, intro]) => { if (opts.length < 4) take(cond, id, intro); });
    while (opts.length < 4) take(() => true, 'criteri_mal_aplicat', 'No és divisible.');
    return choiceEx({
      prompt: Q(`Quin d'aquests nombres és <b>divisible per ${d}</b>?`),
      options: opts,
      hint: `Un nombre és divisible per ${d} si ${RULE[d]}.`,
      solution: why(d, c),
    });
  }

  function missingDigit(d, len) {
    let parts;
    let pos;
    let valid;
    do {
      parts = [randInt(1, 9)].concat(Array.from({ length: len - 1 }, () => randInt(0, 9)));
      pos = [2, 4, 5, 10].includes(d) ? len - 1 : randInt(1, len - 1);
      valid = [];
      for (let v = 0; v <= 9; v++) {
        const p = parts.slice();
        p[pos] = v;
        if (Number(p.join('')) % d === 0) valid.push(v);
      }
    } while (!valid.length || valid.length === 10);
    const num = (v) => { const p = parts.slice(); p[pos] = v; return Number(p.join('')); };
    const shown = parts.map((x, i) => (i === pos ? BLANK : x)).join('');
    const isDigit = (v) => Number.isInteger(v) && v >= 0 && v <= 9;
    const traps = [];
    if (d === 9) traps.push(tt((v) => isDigit(v) && num(v) % 3 === 0, 'criteri_3_9', 'Amb aquesta xifra la suma és múltiple de 3, però no de 9.'));
    if (d === 10) traps.push(tt((v) => v === 5, 'criteri_5_10', 'Si acaba en 5 és divisible per 5, però no per 10. Ha d\'acabar en 0.'));
    if ([2, 5, 10].includes(d)) traps.push(tt((v) => isDigit(v) && dsum(num(v)) % d === 0, 'criteri_suma_per_2_5', `La suma de les xifres no serveix per al ${d}: mira només l'última xifra.`));
    if (d === 4) traps.push(tt((v) => isDigit(v) && v % 2 === 0, 'criteri_4', 'No n\'hi ha prou que sigui parell: les dues últimes xifres han de formar un múltiple de 4.'));
    if (d === 6) traps.push(tt((v) => isDigit(v) && (num(v) % 2 === 0 || num(v) % 3 === 0), 'criteri_6', 'Per ser divisible per 6 ha de ser parell <b>i</b> la suma de les xifres ha de ser múltiple de 3.'));
    if (d === 3 && pos === len - 1) traps.push(tt((v) => [3, 6, 9].includes(v), 'criteri_ultima_per_3_9', 'Acabar en 3, 6 o 9 no és el criteri del 3: cal sumar les xifres.'));
    traps.push(tt((v) => !isDigit(v), 'altre', 'Has d\'escriure una sola xifra, del 0 al 9.'));
    const ex = valid.map(num);
    return numEx({
      prompt: Q(`Quina xifra pot anar al lloc del ? perquè el nombre sigui <b>divisible per ${d}</b>?`, shown)
        + (valid.length > 1 ? '<p class="q-text"><small>Hi ha més d\'una solució: n\'hi ha prou amb una.</small></p>' : ''),
      answer: valid[0],
      accept: (v) => valid.includes(v),
      traps,
      fallback: `Amb aquesta xifra no és divisible per ${d}. Recorda: un nombre és divisible per ${d} si ${RULE[d]}.`,
      hint: `Un nombre és divisible per ${d} si ${RULE[d]}.`,
      solution: `Les xifres que funcionen són: <b>${valid.join(', ')}</b>. Per exemple: ${why(d, ex[0])}`,
    });
  }

  // ── 3. Primers i compostos ──────────────────────────────────────────────────

  function quinPrimer(level) {
    const p = level === 1 ? pick(PRIMES.filter((x) => x <= 47)) : pick(PRIMES.filter((x) => x > 50 && x < 150));
    const opts = [{ label: f(p), correct: true }];
    const pool = [];
    const oc = level === 1 ? ODD_COMP_S : ODD_COMP_L;
    oc.forEach((x) => pool.push({ label: f(x), id: 'senar_es_primer', msg: `${x} és senar, però no és primer: ${x} = ${asProduct(x)}.` }));
    if (level === 1) {
      pool.push({ label: '1', id: 'u_es_primer', msg: 'L\'1 no és primer: només té un divisor (ell mateix). Un primer en té exactament dos.' });
      [12, 14, 16, 18, 20, 22, 24, 26, 28, 30].forEach((x) => pool.push({ label: f(x), id: 'altre', msg: `${x} és parell: es pot dividir per 2 (${x} = 2 · ${x / 2}). No és primer.` }));
    }
    const opt = fill(opts, level === 1 ? pool : pool.filter((o) => o.id === 'senar_es_primer'), 4);
    return choiceEx({
      prompt: Q(`Quin d'aquests nombres és <b>primer</b>?`),
      options: opt,
      hint: 'Un nombre primer només es pot dividir exactament per 1 i per ell mateix. Prova de dividir per 2, 3, 5, 7…',
      solution: `${p} només té dos divisors, l'1 i el ${p}: és primer. ${opt.filter((o) => !o.correct && o.label !== '1').map((o) => `${o.label} = ${asProduct(Number(o.label))}`).join('; ')}.`,
    });
  }

  function primerOCompost(level) {
    let n;
    if (level === 1) n = pick([1, 2, 2, ...PRIMES.filter((x) => x < 30), ...ODD_COMP_S, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    else if (level === 2) n = pick([1, 2, ...PRIMES.filter((x) => x > 20 && x < 100), ...ODD_COMP_S, ...ODD_COMP_L.slice(0, 7)]);
    else n = pick([...PRIMES.filter((x) => x > 50 && x < 200), ...ODD_COMP_L]);
    const P = 'És primer';
    const C = 'És compost';
    const N = 'No és ni primer ni compost';
    const D = divisors(n);
    let options;
    if (n === 1) {
      options = [
        { label: P, id: 'u_es_primer', msg: 'L\'1 només té un divisor (ell mateix). Un primer en té exactament dos, i un compost, més de dos.' },
        { label: C, id: 'u_es_primer', msg: 'L\'1 només té un divisor: no en té prou per ser compost. No és ni primer ni compost.' },
        { label: N, correct: true },
      ];
    } else if (isPrime(n)) {
      options = [
        { label: P, correct: true },
        { label: C, id: n === 2 ? 'dos_no_primer' : 'primer_com_compost', msg: n === 2 ? 'El 2 és parell, però només té dos divisors: 1 i 2. És l\'únic primer parell.' : `${n} no té cap divisor a part de l'1 i el ${n}. Comprova-ho dividint per 2, 3, 5, 7…` },
        { label: N, id: n === 2 ? 'dos_no_primer' : 'altre', msg: `Només l'1 no és ni primer ni compost. El ${n} té dos divisors (1 i ${n}), per tant és primer.` },
      ];
    } else {
      options = [
        { label: P, id: n % 2 ? 'senar_es_primer' : 'altre', msg: `${n} té més de dos divisors: ${n} = ${asProduct(n)}.` },
        { label: C, correct: true },
        { label: N, id: 'altre', msg: `Només l'1 no és ni primer ni compost. ${n} = ${asProduct(n)}, per tant és compost.` },
      ];
    }
    return choiceEx({
      prompt: Q('Com és aquest nombre?', String(n)),
      options,
      shuffle: false,
      hint: 'Compta quants divisors té: si en té exactament dos, és primer; si en té més, és compost.',
      solution: n === 1 ? 'L\'1 només té un divisor: no és ni primer ni compost.'
        : `Divisors de ${n}: ${D.length > 8 ? `${D.slice(0, 4).join(', ')}…` : D.join(', ')}. ${isPrime(n) ? 'En té dos: és <b>primer</b>.' : `En té més de dos (${n} = ${asProduct(n)}): és <b>compost</b>.`}`,
    });
  }

  function comptaPrimers() {
    const a = pick([1, 1, ...Array.from({ length: 40 }, (_, i) => i + 2)]);
    const b = a + randInt(10, 16);
    const range = Array.from({ length: b - a + 1 }, (_, i) => a + i);
    const pr = range.filter(isPrime);
    const odd = range.filter((x) => x > 1 && x % 2 === 1).length;
    const traps = [];
    if (a === 1) traps.push(t(pr.length + 1, 'u_es_primer', 'Has comptat l\'1, però l\'1 no és primer.'));
    if (a <= 2) traps.push(t(pr.length - 1, 'dos_no_primer', 'T\'has deixat el 2: és primer (l\'únic primer parell).'));
    traps.push(t(odd + (a <= 2 ? 1 : 0), 'senar_es_primer', `No tots els senars són primers. Per exemple, ${range.find((x) => x % 2 && x > 1 && !isPrime(x)) || 9} és compost.`));
    return numEx({
      prompt: Q(`Quants nombres <b>primers</b> hi ha entre el ${a} i el ${b} (tots dos inclosos)?`),
      answer: pr.length,
      traps,
      hint: 'Ratlla els parells (menys el 2) i els múltiples de 3, 5 i 7 (menys ells mateixos). Recorda que l\'1 no és primer.',
      solution: `Els primers entre ${a} i ${b} són: ${pr.join(', ')}. N'hi ha <b>${pr.length}</b>.`,
    });
  }

  function divisorNoTrivial() {
    const n = pick(ODD_COMP_L.concat([161, 169, 187, 203, 209, 221]));
    const inner = divisors(n).filter((d) => d > 1 && d < n);
    return numEx({
      prompt: Q(`El ${n} sembla primer, però no ho és. Escriu un divisor de ${n} que no sigui ni l'1 ni el ${n}.`),
      answer: inner[0],
      accept: (v) => inner.includes(v),
      traps: [tt((v) => v === 1 || v === n, 'altre', `L'1 i el ${n} són divisors de ${n}, però això passa amb tots els nombres. En busquem un altre.`)],
      fallback: `Aquest nombre no divideix el ${n} exactament. Prova de dividir per 3, 7, 11, 13…`,
      hint: `Prova de dividir ${n} per 3 (suma les xifres), per 7, per 11, per 13…`,
      solution: `${n} = ${inner[0]} · ${n / inner[0]}. Els divisors de ${n} són ${divisors(n).join(', ')}.`,
    });
  }

  function seguentPrimer() {
    const N = randInt(20, 130);
    let p = N + 1;
    while (!isPrime(p)) p++;
    const traps = [];
    for (let x = N + 1; x < p; x++) {
      if (x % 2 === 1) traps.push(t(x, 'senar_es_primer', `${x} és senar, però és compost: ${x} = ${asProduct(x)}.`));
    }
    return numEx({
      prompt: Q(`Quin és el nombre <b>primer</b> més petit que és més gran que ${N}?`),
      answer: p,
      traps,
      fallback: `Aquest no és el primer nombre primer després de ${N}.`,
      hint: 'Mira els senars que venen després i comprova si es poden dividir per 3, 5, 7…',
      solution: `${Array.from({ length: p - N - 1 }, (_, i) => N + 1 + i).map((x) => `${x} = ${asProduct(x)}`).join('; ')}${p - N > 1 ? '. ' : ''}El <b>${p}</b> és primer.`,
    });
  }

  // ── 4. Descomposició en factors primers ─────────────────────────────────────

  function genNumber(level) {
    const [min, max, om] = { 1: [12, 60, 3], 2: [60, 200, 3], 3: [200, 1000, 4] }[level];
    let n;
    do { n = randInt(min, max); } while (omega(n) < om || factorize(n).some(([p]) => p > 13) || (level === 3 && factorize(n).length < 2));
    return n;
  }

  function valorDe(level) {
    const n = genNumber(level);
    const F = factorize(n);
    const wrong = F.reduce((acc, [p, e]) => acc * (e === 1 ? p : p * e), 1);
    const big = F.find(([, e]) => e > 1);
    return numEx({
      prompt: Q('Quin nombre té aquesta descomposició en factors primers?', fHtml(F)),
      answer: n,
      traps: big ? [t(wrong, 'potencia_mal_calculada', `Has multiplicat la base per l'exponent: ${H(big[0], big[1])} no és ${big[0] * big[1]}, sinó ${big[0] ** big[1]}.`)] : [],
      hint: 'Calcula primer cada potència i després multiplica-ho tot.',
      solution: `${fHtml(F)} = ${F.map(([p, e]) => p ** e).join(' · ')} = <b>${f(n)}</b>`,
    });
  }

  function quinaDescomp(level) {
    const n = genNumber(level);
    const F = factorize(n);
    const E = expand(F);
    const opts = [{ label: fHtml(F), correct: true }];
    const pool = [];
    for (let i = 0; i < E.length; i++) {
      for (let j = i + 1; j < E.length; j++) {
        const c = E[i] * E[j];
        const rest = E.filter((_, k) => k !== i && k !== j).concat(c);
        pool.push({ label: fHtml(group(rest)), id: 'factor_no_primer', msg: `El valor és ${f(n)}, però el ${c} no és primer: ${c} = ${E[i]} · ${E[j]}. Cal descompondre'l.` });
      }
    }
    const wrongs = [];
    F.forEach(([p], i) => {
      const up = F.map(([q, e], k) => [q, k === i ? e + 1 : e]);
      wrongs.push({ label: fHtml(up), id: 'exponent_factoritzacio', msg: `Aquesta descomposició val ${f(valueOf(up))}, no ${f(n)}. El ${p} hi surt massa vegades.` });
      const down = F.map(([q, e], k) => [q, k === i ? e - 1 : e]).filter(([, e]) => e > 0);
      wrongs.push({ label: fHtml(down), id: 'exponent_factoritzacio', msg: `Aquesta descomposició val ${f(valueOf(down))}, no ${f(n)}. Hi falta un ${p}.` });
    });
    fill(opts, pool, 2 + (Math.random() < 0.5 ? 1 : 0));
    fill(opts, wrongs, 4);
    return choiceEx({
      prompt: Q('Quina és la descomposició en factors primers d\'aquest nombre?', f(n)),
      options: opts,
      hint: 'Tots els factors han de ser primers, i multiplicats han de donar el nombre. Divideix pel primer més petit possible: 2, 3, 5…',
      solution: `${f(n)} = ${E.join(' · ')} = <b>${fHtml(F)}</b>`,
    });
  }

  function exponentDe(level) {
    let n;
    do { n = genNumber(level); } while (!factorize(n).some(([, e]) => e >= 2));
    const F = factorize(n);
    const [p, e] = pick(F.filter(([, x]) => x >= 2));
    return numEx({
      prompt: Q(`Quin <b>exponent</b> té el ${p} a la descomposició en factors primers de ${f(n)}?`),
      answer: e,
      traps: [
        t(e + 1, 'exponent_factoritzacio', `El ${p} no hi surt tantes vegades. Comprova-ho: ${f(n)} = ${expand(F).join(' · ')}.`),
        t(e - 1, 'exponent_factoritzacio', `El ${p} hi surt més vegades. Continua dividint per ${p} mentre puguis.`),
        t(p ** e, 'altre', `${p ** e} és el valor de ${H(p, e)}. Et demanem l'exponent: quantes vegades surt el ${p}.`),
      ],
      hint: `Divideix ${f(n)} per ${p} tantes vegades com puguis i compta-les.`,
      solution: `${f(n)} = ${expand(F).join(' · ')} = ${fHtml(F)}. El ${p} hi surt ${e} vegades: l'exponent és <b>${e}</b>.`,
    });
  }

  function esDescomp() {
    const n = genNumber(2);
    const opts = [{ label: fHtml(factorize(n)), correct: true }];
    const pool = [];
    for (let i = 0; i < 12; i++) {
      const c = pick([4, 6, 8, 9, 10, 12, 15]);
      const list = [c, pick([2, 3, 5, 7]), pick([2, 3, 5, 7, 11])];
      pool.push({ label: fHtml(group(list)), id: 'factor_no_primer', msg: `El ${c} no és primer: ${c} = ${asProduct(c)}. A una descomposició en factors primers tots els factors han de ser primers.` });
    }
    const m = genNumber(1);
    pool.push({ label: `1 · ${fHtml(factorize(m))}`, id: 'factor_no_primer', msg: 'L\'1 no és primer, i a la descomposició no s\'hi escriu.' });
    return choiceEx({
      prompt: Q('Quina d\'aquestes expressions <b>és</b> una descomposició en factors primers?'),
      options: fill(opts, pool, 4),
      hint: 'Mira si tots els factors són nombres primers (2, 3, 5, 7, 11, 13…).',
      solution: `${fHtml(factorize(n))} = ${f(n)}: tots els factors són primers.`,
    });
  }

  // ── 5 i 6. mcd i mcm ────────────────────────────────────────────────────────

  const listMultiples = (a, upTo) => {
    const out = [];
    for (let x = a; x <= upTo; x += a) out.push(x);
    return out;
  };
  const andJoin = (ns) => (ns.length === 2 ? `${ns[0]} i ${ns[1]}` : `${ns.slice(0, -1).join(', ')} i ${ns[ns.length - 1]}`);

  function factorLines(ns) {
    return ns.map((n) => (isPrime(n) ? `${n} és primer` : `${n} = ${fHtml(factorize(n))}`)).join('; ');
  }

  /** mcd o mcm amb factors de cada nombre: comuns|tots, exponent min|max. */
  function combo(ns, which, exp) {
    const Fs = ns.map((n) => new Map(factorize(n)));
    const primes = [...new Set(Fs.flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);
    const out = [];
    primes.forEach((p) => {
      const present = Fs.filter((m) => m.has(p)).map((m) => m.get(p));
      if (which === 'comuns' && present.length < Fs.length) return;
      out.push([p, exp === 'min' ? Math.min(...present) : Math.max(...present)]);
    });
    return out;
  }

  function gcdPair(level) {
    for (;;) {
      const g = level === 1 ? randInt(2, 9) : randInt(3, 20);
      const x = randInt(1, level === 1 ? 6 : 9);
      const y = randInt(2, level === 1 ? 7 : 11);
      const [a, b] = [g * x, g * y];
      if (x !== y && gcd(x, y) === 1 && b <= (level === 1 ? 60 : 180)) return U.shuffle([a, b]);
    }
  }
  function gcdTriple() {
    for (;;) {
      const g = randInt(2, 12);
      const xs = [randInt(1, 8), randInt(2, 9), randInt(2, 10)];
      if (new Set(xs).size === 3 && gcdAll(xs) === 1 && Math.max(...xs) * g <= 200) return xs.map((x) => x * g);
    }
  }

  function mcdNum(ns, method) {
    const g = gcdAll(ns);
    const L = lcmAll(ns);
    const prod = ns.reduce((a, b) => a * b, 1);
    const mn = Math.min(...ns);
    const commons = divisors(g);
    const traps = [
      t(L, 'mcd_mcm_confosos', `${f(L)} és el <b>mcm</b> (el múltiple comú més petit). El mcd és un divisor: no pot ser més gran que ${mn}.`),
      t(prod, 'mcd_mcm_confosos', `El mcd és un divisor comú: no pot ser més gran que els nombres. Multiplicar-los no serveix.`),
    ];
    if (g > 1) {
      commons.filter((d) => d < g).forEach((d) => traps.push(t(d, 'mcd_no_maxim', `${d} és un divisor comú, però n'hi ha un de més gran. Divisors comuns: ${commons.join(', ')}.`)));
    }
    if (ns.some((n) => n % mn)) traps.push(t(mn, 'mcd_no_comu', `${mn} no divideix ${ns.find((n) => n % mn)}: no és un divisor comú.`));
    traps.push(tt((v) => v > 0 && ns.some((n) => n % v), 'mcd_no_comu', 'Aquest nombre no divideix tots els nombres: no pot ser el mcd.'));
    const sol = method === 'llista'
      ? `${ns.map((n) => `Divisors de ${n}: ${divisors(n).join(', ')}`).join('<br>')}<br>Divisors comuns: ${commons.join(', ')}. El més gran és <b>${g}</b>.`
      : `${factorLines(ns)}.<br>Factors comuns amb l'exponent més petit: ${g === 1 ? 'no n\'hi ha cap, i per tant el mcd és 1' : `${withValue(factorize(g))}`}.`;
    return numEx({
      prompt: Q('Calcula el màxim comú divisor:', `mcd(${ns.join(', ')})`),
      answer: g,
      traps,
      hint: method === 'llista' ? 'Escriu els divisors de cada nombre i busca el més gran que surti a totes les llistes.'
        : 'Descompon cada nombre en factors primers i agafa els factors comuns amb l\'exponent més petit.',
      solution: sol + (g === 1 ? ' Quan el mcd és 1, diem que els nombres són <b>primers entre si</b>.' : ''),
    });
  }

  function mcmNum(ns, method) {
    const g = gcdAll(ns);
    const L = lcmAll(ns);
    const prod = ns.reduce((a, b) => a * b, 1);
    const mx = Math.max(...ns);
    const traps = [
      t(prod, 'mcm_producte', `${f(prod)} és un múltiple comú, però no el més petit. Busca el primer múltiple que coincideix.`),
      t(g, 'mcd_mcm_confosos', `${g} és el <b>mcd</b>. El mcm és un múltiple: no pot ser més petit que ${mx}.`),
      t(2 * L, 'mcm_no_minim', `${f(2 * L)} és un múltiple comú, però n'hi ha un de més petit.`),
    ];
    if (mx !== L) traps.push(t(mx, 'mcm_no_comu', `${mx} no és múltiple de ${ns.find((n) => mx % n)}.`));
    traps.push(tt((v) => v > 0 && ns.some((n) => v % n), 'mcm_no_comu', 'Aquest nombre no és múltiple de tots els nombres: no es pot dividir exactament per cadascun.'));
    traps.push(tt((v) => v > L && ns.every((n) => v % n === 0), 'mcm_no_minim', 'És un múltiple comú, però n\'hi ha un de més petit.'));
    const sol = method === 'llista'
      ? `${ns.map((n) => `Múltiples de ${n}: ${listMultiples(n, L).join(', ')}`).join('<br>')}<br>El primer que surt a totes les llistes és <b>${f(L)}</b>.`
      : `${factorLines(ns)}.<br>Tots els factors amb l'exponent més gran: ${fHtml(factorize(L))} = <b>${f(L)}</b>.`;
    return numEx({
      prompt: Q('Calcula el mínim comú múltiple:', `mcm(${ns.join(', ')})`),
      answer: L,
      traps,
      hint: method === 'llista' ? 'Escriu els primers múltiples de cada nombre i busca el primer que surti a totes les llistes.'
        : 'Descompon cada nombre en factors primers i agafa tots els factors amb l\'exponent més gran.',
      solution: sol,
    });
  }

  /** Dos nombres on les quatre combinacions (comuns/tots, min/max) donen resultats diferents. */
  function methodPair() {
    for (;;) {
      const [p, q, r] = U.shuffle([2, 3, 5, 7]).slice(0, 3);
      const e1 = randInt(1, 3);
      let e2 = randInt(1, 3);
      if (e1 === e2) e2 = e1 === 3 ? 1 : e1 + 1;
      const Fa = [[p, e1], [r, 1]];
      const Fb = [[p, e2]];
      if (Math.random() < 0.5) { Fa.push([q, 1]); Fb.push([q, randInt(1, 2)]); }
      const a = valueOf(Fa);
      const b = valueOf(Fb);
      if (a <= 600 && b <= 600 && a !== b) return U.shuffle([a, b]);
    }
  }

  function metodeChoice(kind) {
    const ns = methodPair();
    const C = { cm: combo(ns, 'comuns', 'min'), cM: combo(ns, 'comuns', 'max'), tM: combo(ns, 'tots', 'max'), tm: combo(ns, 'tots', 'min') };
    const lab = withValue;
    const isMcd = kind === 'mcd';
    const options = isMcd ? [
      { label: lab(C.cm), correct: true },
      { label: lab(C.cM), id: 'mcd_exponent_gran', msg: 'Has agafat els factors comuns, però amb l\'exponent més gran. Per al mcd, l\'exponent ha de ser el <b>més petit</b>.' },
      { label: lab(C.tM), id: 'mcd_mcm_confosos', msg: 'Tots els factors amb l\'exponent més gran: això és el <b>mcm</b>, no el mcd.' },
      { label: lab(C.tm), id: 'mcd_no_comuns', msg: 'Al mcd només hi van els factors que surten a <b>tots dos</b> nombres.' },
    ] : [
      { label: lab(C.tM), correct: true },
      { label: lab(C.tm), id: 'mcm_exponent_petit', msg: 'Has agafat tots els factors, però amb l\'exponent més petit. Per al mcm, l\'exponent ha de ser el <b>més gran</b>.' },
      { label: lab(C.cM), id: 'mcm_nomes_comuns', msg: 'Al mcm hi van <b>tots</b> els factors, també els que només surten en un dels nombres.' },
      { label: lab(C.cm), id: 'mcd_mcm_confosos', msg: 'Factors comuns amb l\'exponent més petit: això és el <b>mcd</b>, no el mcm.' },
    ];
    const ans = isMcd ? C.cm : C.tM;
    return choiceEx({
      prompt: Q(`Quin és el <b>${kind}</b> d'aquests dos nombres?`, ns.map((n) => `${n} = ${fHtml(factorize(n))}`).join('<br>')),
      options,
      hint: isMcd ? 'mcd: factors <b>comuns</b> amb l\'exponent <b>més petit</b>.' : 'mcm: <b>tots</b> els factors amb l\'exponent <b>més gran</b>.',
      solution: `${kind}(${ns.join(', ')}) = ${lab(ans)}. ${isMcd ? 'Només els factors comuns, amb l\'exponent més petit.' : 'Tots els factors, amb l\'exponent més gran.'}`,
    });
  }

  function lcmPair(level) {
    for (;;) {
      const a = level === 1 ? randInt(2, 12) : randInt(6, 40);
      const b = level === 1 ? randInt(3, 15) : randInt(8, 45);
      const L = lcm(a, b);
      if (a !== b && L !== Math.max(a, b) && L <= (level === 1 ? 90 : 400) && (level === 1 || gcd(a, b) > 1)) return [a, b];
    }
  }
  function lcmTriple() {
    for (;;) {
      const ns = [randInt(2, 12), randInt(3, 15), randInt(4, 20)];
      const L = lcmAll(ns);
      if (new Set(ns).size === 3 && L <= 400 && !ns.includes(L)) return ns.sort((x, y) => x - y);
    }
  }
  function coprimePair() {
    for (;;) {
      const a = randInt(4, 20);
      const b = randInt(5, 25);
      if (a !== b && gcd(a, b) === 1) return [a, b];
    }
  }

  // ── 7. Problemes ────────────────────────────────────────────────────────────

  const MCM_PROBS = [
    {
      text: (a, b) => `Dos autobusos surten alhora de la mateixa parada a les 8 del matí. Un en surt cada ${a} minuts i l'altre, cada ${b} minuts.`,
      ask: 'D\'aquí a quants minuts tornaran a sortir junts?',
      follow: 'Quantes vegades haurà sortit el primer autobús fins llavors (sense comptar la sortida de les 8)?',
      unit: 'minuts',
    },
    {
      text: (a, b) => `La Laia va a la piscina cada ${a} dies i el seu cosí Pau, cada ${b} dies. Avui hi han coincidit.`,
      ask: 'D\'aquí a quants dies tornaran a coincidir a la piscina?',
      follow: 'Quantes vegades haurà anat la Laia a la piscina fins llavors (sense comptar avui)?',
      unit: 'dies',
    },
    {
      text: (a, b) => `Un far s'encén cada ${a} segons i un altre, cada ${b} segons. Ara mateix s'han encès tots dos alhora.`,
      ask: 'D\'aquí a quants segons es tornaran a encendre junts?',
      follow: 'Quantes vegades s\'haurà encès el primer far fins llavors (sense comptar ara)?',
      unit: 'segons',
    },
    {
      text: (a, b) => `Volem fer dues piles de la mateixa altura: una amb capses de ${a} cm i l'altra amb capses de ${b} cm.`,
      ask: 'Quina és l\'altura més petita que poden tenir les piles, en cm?',
      follow: (a) => `Quantes capses de ${a} cm caldran per a la primera pila?`,
      unit: 'cm',
      secondSol: (a, L) => `Les piles fan ${L} cm, i ${L} : ${a} = <b>${L / a}</b> capses.`,
    },
  ];
  const MCD_PROBS = [
    {
      text: (a, b) => `Tenim ${a} caramels de maduixa i ${b} de llimona. Volem fer bosses iguals (totes amb el mateix nombre de caramels de cada gust), tantes com sigui possible i sense que en sobri cap.`,
      ask: 'Quantes bosses podem fer?',
      follow: 'Quants caramels hi haurà a cada bossa?',
      second: (a, b, g) => (a + b) / g,
      secondSol: (a, b, g) => `A cada bossa: ${a / g} de maduixa + ${b / g} de llimona = <b>${(a + b) / g}</b> caramels.`,
    },
    {
      text: (a, b) => `Tenim una cinta de ${a} cm i una altra de ${b} cm. Les volem tallar en trossos iguals, tan llargs com sigui possible, sense que en sobri res.`,
      ask: 'Quants cm ha de fer cada tros?',
      follow: 'Quants trossos en sortiran en total?',
      second: (a, b, g) => (a + b) / g,
      secondSol: (a, b, g) => `${a} : ${g} = ${a / g} trossos i ${b} : ${g} = ${b / g} trossos: en total, <b>${(a + b) / g}</b>.`,
    },
    {
      text: (a, b) => `Volem cobrir un terra rectangular de ${a} dm per ${b} dm amb rajoles quadrades iguals, tan grans com sigui possible i sense tallar-ne cap.`,
      ask: 'Quants dm ha de fer el costat de cada rajola?',
      follow: 'Quantes rajoles caldran?',
      second: (a, b, g) => (a / g) * (b / g),
      secondSol: (a, b, g) => `Hi caben ${a} : ${g} = ${a / g} rajoles de llarg i ${b} : ${g} = ${b / g} d'ample: ${a / g} · ${b / g} = <b>${(a / g) * (b / g)}</b> rajoles.`,
    },
    {
      text: (a, b) => `En una colla hi ha ${a} nois i ${b} noies. Volem fer el màxim nombre d'equips possible, tots amb el mateix nombre de nois i el mateix nombre de noies, sense que en quedi cap fora.`,
      ask: 'Quants equips podem fer?',
      follow: 'Quantes persones hi haurà a cada equip?',
      second: (a, b, g) => (a + b) / g,
      secondSol: (a, b, g) => `A cada equip: ${a / g} nois + ${b / g} noies = <b>${(a + b) / g}</b> persones.`,
    },
  ];

  function mcmData() {
    for (;;) {
      const g = randInt(2, 6);
      const x = randInt(2, 5);
      const y = randInt(2, 6);
      if (x !== y && gcd(x, y) === 1 && g * x * y <= 150) return U.shuffle([g * x, g * y]);
    }
  }
  function mcdData(level) {
    for (;;) {
      const g = randInt(3, level === 3 ? 20 : 12);
      const x = randInt(2, 7);
      const y = randInt(2, 8);
      if (x !== y && gcd(x, y) === 1 && g * Math.max(x, y) <= 160) return U.shuffle([g * x, g * y]);
    }
  }

  function quinaOperacio() {
    const isMcm = Math.random() < 0.5;
    const P = pick(isMcm ? MCM_PROBS : MCD_PROBS);
    const [a, b] = isMcm ? mcmData() : mcdData(1);
    const why = isMcm ? 'Busquem quan tornen a coincidir dues coses que es repeteixen: és un <b>múltiple comú</b>, i el volem tan petit com sigui possible.'
      : 'Hem de repartir o tallar en parts iguals, tan grans com puguem: és un <b>divisor comú</b>, i el volem tan gran com puguem.';
    return choiceEx({
      prompt: `<p class="q-text">${P.text(a, b)} ${P.ask}</p><p class="q-text"><b>Què cal calcular per resoldre-ho?</b></p>`,
      options: [
        { label: `El mcm de ${a} i ${b}`, correct: isMcm, id: 'problema_mcd_mcm', msg: `Aquí no es busca un múltiple. ${why}` },
        { label: `El mcd de ${a} i ${b}`, correct: !isMcm, id: 'problema_mcd_mcm', msg: `Aquí no es busca un divisor. ${why}` },
        { label: `${a} · ${b}`, id: isMcm ? 'mcm_producte' : 'altre', msg: isMcm ? `El producte és un múltiple comú, però no sempre el més petit. ${why}` : `Multiplicar no ens ajuda a repartir. ${why}` },
        { label: `${a} + ${b}`, id: 'altre', msg: `Sumar no resol el problema. ${why}` },
      ],
      shuffle: false,
      hint: 'Coses que es repeteixen i tornen a coincidir → mcm. Repartir o tallar en parts iguals tan grans com puguis → mcd.',
      solution: `${why} Per tant, cal el <b>${isMcm ? 'mcm' : 'mcd'}(${a}, ${b}) = ${isMcm ? lcm(a, b) : gcd(a, b)}</b>.`,
    });
  }

  function problemaCalcul(level) {
    const isMcm = Math.random() < 0.5;
    const P = pick(isMcm ? MCM_PROBS : MCD_PROBS);
    const [a, b] = isMcm ? mcmData() : mcdData(level);
    const g = gcd(a, b);
    const L = lcm(a, b);
    const first = isMcm ? L : g;
    const op = `${isMcm ? 'mcm' : 'mcd'}(${a}, ${b}) = ${first}`;
    const otherTrap = isMcm
      ? t(g, 'problema_mcd_mcm', `Has calculat el mcd (${g}). Aquí es busca quan tornen a coincidir: és el <b>mcm</b>.`)
      : t(L, 'problema_mcd_mcm', `Has calculat el mcm (${L}). Aquí cal repartir en parts iguals tan grans com puguis: és el <b>mcd</b>.`);
    if (level === 2) {
      const traps = [otherTrap];
      if (isMcm) traps.push(t(a * b, 'mcm_producte', `${a} · ${b} = ${a * b} és un múltiple comú, però no el més petit. Busca el mcm.`));
      return numEx({
        prompt: `<p class="q-text">${P.text(a, b)}</p><p class="q-text"><b>${P.ask}</b></p>`,
        answer: first,
        traps,
        hint: isMcm ? 'Busques quan tornen a coincidir: necessites un múltiple comú, el més petit.' : 'Has de repartir en parts iguals tan grans com puguis: necessites un divisor comú, el més gran.',
        solution: `${isMcm ? 'Cal el mínim comú múltiple' : 'Cal el màxim comú divisor'}: ${factorLines([a, b])}. ${op}. La resposta és <b>${first}</b>.`,
      });
    }
    // Nivell 3: una pregunta més, que demana un pas extra.
    const second = isMcm ? L / a : P.second(a, b, g);
    const followText = typeof P.follow === 'function' ? P.follow(a) : P.follow;
    const traps = [t(first, 'pas_final_problema', `${first} és el ${isMcm ? 'mcm' : 'mcd'}, però la pregunta demana una altra cosa. Fes l'últim pas!`)];
    if (isMcm) traps.push(t(L / b, 'altre', `Aquestes són les vegades del segon (${L} : ${b}). Et demanem el primer.`));
    else traps.push(t(L, 'problema_mcd_mcm', 'Aquí cal el mcd, no el mcm.'));
    return numEx({
      prompt: `<p class="q-text">${P.text(a, b)}</p><p class="q-text"><b>${followText}</b></p>`,
      answer: second,
      traps,
      hint: `Primer calcula el ${isMcm ? 'mcm' : 'mcd'} de ${a} i ${b}. Després pensa què més et demanen.`,
      solution: `${op}. ${isMcm ? (P.secondSol ? P.secondSol(a, L) : `En ${L} ${P.unit}, el primer ho fa ${L} : ${a} = <b>${second}</b> vegades.`) : P.secondSol(a, b, g)}`,
    });
  }

  function problemaTres() {
    for (;;) {
      const ns = [randInt(2, 6), randInt(3, 8), randInt(4, 10)];
      const L = lcmAll(ns);
      if (new Set(ns).size !== 3 || L > 200 || ns.includes(L)) continue;
      const prod = ns.reduce((x, y) => x * y, 1);
      return numEx({
        prompt: `<p class="q-text">Tres amics fan voluntariat al mateix centre: l'Arnau hi va cada ${ns[0]} dies, la Júlia cada ${ns[1]} dies i la Martina cada ${ns[2]} dies. Avui hi han coincidit tots tres.</p><p class="q-text"><b>D'aquí a quants dies tornaran a coincidir tots tres?</b></p>`,
        answer: L,
        traps: [
          t(prod, 'mcm_producte', `${prod} és un múltiple comú, però no el més petit. Calcula el mcm.`),
          t(gcdAll(ns), 'problema_mcd_mcm', 'Aquest és el mcd. Aquí es busca quan tornen a coincidir: és el mcm.'),
          t(lcm(ns[0], ns[1]), 'altre', `Aquest és el dia que coincideixen l'Arnau i la Júlia, però la Martina no hi és. Calcula el mcm dels tres.`),
        ],
        hint: 'Busques el múltiple comú més petit dels tres nombres.',
        solution: `${factorLines(ns)}. mcm(${ns.join(', ')}) = ${fHtml(factorize(L))} = <b>${L}</b> dies.`,
      });
    }
  }

  // ── Generadors per habilitat i nivell ──────────────────────────────────────

  ML.divisibilitat.generators = {
    multiples_divisors(level) {
      if (level === 1) return run([() => quinMultiple(1), siNo, () => quinDivisor(1)]);
      if (level === 2) return run([() => numDivisors(2), relacio, () => divisorsComplets(2), () => quinDivisor(2)]);
      return run([() => divisorsComplets(3), () => numDivisors(3), seguentMultiple, () => quinMultiple(3)]);
    },
    criteris(level) {
      if (level === 1) return run([() => critChoice(pick([2, 5, 10]), 10, 999), () => missingDigit(pick([2, 5, 10]), randInt(2, 3))]);
      if (level === 2) return run([() => critChoice(pick([3, 9]), 100, 999), () => missingDigit(pick([3, 9]), 3), () => critChoice(pick([2, 5, 10]), 1000, 9999)]);
      return run([() => critChoice(pick([4, 6, 11]), 100, 999), () => missingDigit(pick([4, 6, 9]), 4), () => critChoice(9, 1000, 9999)]);
    },
    primers(level) {
      if (level === 1) return run([() => quinPrimer(1), () => primerOCompost(1)]);
      if (level === 2) return run([() => quinPrimer(2), () => primerOCompost(2), comptaPrimers]);
      return run([divisorNoTrivial, seguentPrimer, () => primerOCompost(3)]);
    },
    factoritzacio(level) {
      if (level === 1) return run([() => valorDe(1), () => quinaDescomp(1)]);
      if (level === 2) return run([() => quinaDescomp(2), () => exponentDe(2), () => valorDe(2), esDescomp]);
      return run([() => quinaDescomp(3), () => exponentDe(3), () => valorDe(3)]);
    },
    mcd(level) {
      if (level === 1) return mcdNum(gcdPair(1), 'llista');
      if (level === 2) return run([() => metodeChoice('mcd'), () => mcdNum(gcdPair(2), 'factors')]);
      return run([() => mcdNum(gcdTriple(), 'factors'), () => metodeChoice('mcd'), () => mcdNum(coprimePair(), 'factors')]);
    },
    mcm(level) {
      if (level === 1) return mcmNum(lcmPair(1), 'llista');
      if (level === 2) return run([() => metodeChoice('mcm'), () => mcmNum(lcmPair(2), 'factors')]);
      return run([() => mcmNum(lcmTriple(), 'factors'), () => metodeChoice('mcm'), () => mcmNum(coprimePair(), 'factors')]);
    },
    problemes(level) {
      if (level === 1) return quinaOperacio();
      if (level === 2) return problemaCalcul(2);
      return run([() => problemaCalcul(3), problemaTres]);
    },
  };

  // Utilitats que també fan servir les visualitzacions.
  ML.divisibilitat.math = { divisors, isPrime, factorize, fHtml, gcd, lcm };
})(window.MathLab);
