/* Generadors d'exercicis de fraccions.
 * Cada generador retorna un exercici amb el contracte descrit a js/core/checker.js.
 * Les respostes de tipus 'fraction' es demanen irreductibles, llevat que l'exercici porti anyForm.
 */
window.MathLab = window.MathLab || {};
window.MathLab.fraccions = window.MathLab.fraccions || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const { randInt, pick } = U;
  const f = U.fmt;
  const BLANK = '<span class="blank">?</span>';

  // ── Aritmètica de fraccions ──────────────────────────────────────────────────

  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const fr = (num, den) => ({ num, den });
  const red = (n, d) => {
    const g = gcd(n, d) || 1;
    return fr(n / g, d / g);
  };
  const same = (x, y) => x.num * y.den === y.num * x.den;
  const add = (x, y) => red(x.num * y.den + y.num * x.den, x.den * y.den);
  const sub = (x, y) => red(x.num * y.den - y.num * x.den, x.den * y.den);
  const mul = (x, y) => red(x.num * y.num, x.den * y.den);
  const div = (x, y) => red(x.num * y.den, x.den * y.num);
  const val = (x) => x.num / x.den;
  /** Fracció irreductible aleatòria, amb el denominador entre minD i maxD. */
  const irr = (minD, maxD, proper = true) => {
    for (;;) {
      const d = randInt(minD, maxD);
      const n = proper ? randInt(1, d - 1) : randInt(1, 2 * d);
      if (gcd(n, d) === 1 && n !== d) return fr(n, d);
    }
  };

  // ── Constructors d'exercicis ────────────────────────────────────────────────

  const t = (match, id, msg) => ({ match, id, msg });
  const ft = (n, d, id, msg) => t(fr(n, d), id, msg);
  const Q = (text, math) => `<p class="q-text">${text}</p>${math ? `<div class="q-math">${math}</div>` : ''}`;
  const numEx = (o) => Object.assign({ input: { type: 'number' } }, o);
  /** Resposta en forma de fracció. Treu els paranys impossibles o amb el mateix valor (si anyForm). */
  const fracEx = (o, anyForm = false) => {
    const traps = (o.traps || []).filter((x) => !x.match || (x.match.den > 0 && x.match.num >= 0 && !(anyForm && same(x.match, o.answer))));
    return Object.assign({ input: { type: 'fraction', anyForm } }, o, { traps });
  };
  /** HTML d'una fracció. */
  const F = (n, d) => U.frac(typeof n === 'number' ? f(n) : n, typeof d === 'number' ? f(d) : d);
  const Fo = (x) => F(x.num, x.den);
  const IRR = '<p class="q-text"><small>Dona el resultat en forma de fracció irreductible.</small></p>';
  const run = (pool) => pick(pool)();

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

  // ── Figures (SVG) ───────────────────────────────────────────────────────────

  /** Figura dividida en `den` parts iguals, amb les parts de `on` pintades. */
  function figure(den, on, kind) {
    const shaded = new Set(on);
    const parts = [];
    let vb;
    if (kind === 'circle') {
      const r = 70;
      const c = 75;
      vb = '0 0 150 150';
      for (let i = 0; i < den; i++) {
        const a0 = -Math.PI / 2 + (2 * Math.PI * i) / den;
        const a1 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / den;
        const p = (a) => `${(c + r * Math.cos(a)).toFixed(2)} ${(c + r * Math.sin(a)).toFixed(2)}`;
        parts.push(`<path class="fr-part${shaded.has(i) ? ' on' : ''}" d="M${c} ${c} L${p(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)} Z"/>`);
      }
    } else if (kind === 'grid') {
      const cols = [5, 4, 3, 2].find((x) => den % x === 0 && den / x <= 5 && den / x >= 2) || den;
      const rows = den / cols;
      const s = 30;
      vb = `-2 -2 ${cols * s + 4} ${rows * s + 4}`;
      for (let i = 0; i < den; i++) {
        parts.push(`<rect class="fr-part${shaded.has(i) ? ' on' : ''}" x="${(i % cols) * s}" y="${Math.floor(i / cols) * s}" width="${s}" height="${s}" rx="3"/>`);
      }
    } else {
      const w = 300 / den;
      vb = '-2 -2 304 54';
      for (let i = 0; i < den; i++) {
        parts.push(`<rect class="fr-part${shaded.has(i) ? ' on' : ''}" x="${i * w}" y="0" width="${w}" height="50" rx="3"/>`);
      }
    }
    return `<svg class="fr-fig fr-${kind}" viewBox="${vb}" role="img" aria-label="Figura dividida en ${den} parts iguals, amb ${on.length} parts pintades">${parts.join('')}</svg>`;
  }

  // ── Lectura de fraccions ────────────────────────────────────────────────────

  const SING = { 2: 'mig', 3: 'terç', 4: 'quart', 5: 'cinquè', 6: 'sisè', 7: 'setè', 8: 'vuitè', 9: 'novè', 10: 'desè' };
  const PLUR = { 2: 'mitjos', 3: 'terços', 4: 'quarts', 5: 'cinquens', 6: 'sisens', 7: 'setens', 8: 'vuitens', 9: 'novens', 10: 'desens' };
  const readFrac = (n, d) => (n === 1 ? `un ${SING[d]}` : `${U.numWord(n)} ${PLUR[d]}`);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ── 1. Què és una fracció ───────────────────────────────────────────────────

  function figura(level) {
    const kind = level === 1 ? pick(['bar', 'circle']) : 'grid';
    const den = level === 1 ? randInt(2, 8) : pick([6, 8, 9, 10, 12, 15, 16, 20]);
    const num = randInt(1, den - 1);
    const idx = level === 1 ? Array.from({ length: num }, (_, i) => i) : U.shuffle(Array.from({ length: den }, (_, i) => i)).slice(0, num);
    return fracEx({
      prompt: Q('Quina fracció de la figura està pintada?', figure(den, idx, kind)),
      answer: fr(num, den),
      traps: [
        ft(den - num, den, 'parts_mal_comptades', `Has comptat les parts <b>sense</b> pintar. N'hi ha ${num} de pintades, de ${den} en total.`),
        ft(num, den - num, 'parts_mal_comptades', `El denominador és el nombre <b>total</b> de parts (${den}), no les que queden sense pintar.`),
        ft(den, num, 'num_den_girats', 'Has girat la fracció: a baix hi va el total de parts, i a dalt les pintades.'),
      ],
      hint: 'Denominador: en quantes parts iguals està dividida. Numerador: quantes n\'hi ha de pintades.',
      solution: `Hi ha ${den} parts iguals i n'hi ha ${num} de pintades: ${F(num, den)}.`,
    }, true);
  }

  function llegir() {
    const d = randInt(3, 10);
    let n;
    do { n = randInt(2, 9); } while (n >= d || gcd(n, d) !== 1);
    return choiceEx({
      prompt: Q('Com es llegeix aquesta fracció?', F(n, d)),
      options: [
        { label: cap(readFrac(n, d)), correct: true },
        { label: cap(readFrac(d, n)), id: 'num_den_girats', msg: `Primer es diu el numerador (${n}) i després el denominador (${d}), amb la paraula «${PLUR[d]}».` },
        { label: cap(`${U.numWord(n)} ${U.numWord(d)}`), id: 'altre', msg: `El denominador es llegeix amb una paraula especial: ${d} → «${PLUR[d]}».` },
        { label: cap(`${U.numWord(n)} per ${U.numWord(d)}`), id: 'altre', msg: `Una fracció no és una multiplicació. Es llegeix «${readFrac(n, d)}».` },
      ],
      hint: 'Es diu el numerador i després el denominador: 2 → mitjos, 3 → terços, 4 → quarts, 5 → cinquens…',
      solution: `${F(n, d)} es llegeix «${readFrac(n, d)}».`,
    });
  }

  function quantitat(level) {
    const d = level === 1 ? randInt(2, 6) : randInt(3, 10);
    const n = level === 3 ? randInt(d + 1, 2 * d - 1) : randInt(1, d - 1);
    const k = randInt(2, level === 1 ? 10 : 20);
    const N = d * k;
    const ans = n * k;
    const traps = [];
    if (n > 1) traps.push(t(k, 'quantitat_nomes_divideix', `${N} : ${d} = ${k} és només una part (${F(1, d)}). En volem ${n}: ${k} · ${n} = ${ans}.`));
    if (n > 1) traps.push(t(N * n, 'quantitat_nomes_multiplica', `Has multiplicat ${N} · ${n}, però falta dividir entre ${d}: ${N * n} : ${d} = ${ans}.`));
    if ((N * d) % n === 0 && (N * d) / n !== ans) traps.push(t((N * d) / n, 'num_den_girats', `Has dividit pel numerador i multiplicat pel denominador. Es fa al revés: ${N} : ${d} · ${n}.`));
    return numEx({
      prompt: Q('Calcula:', `${F(n, d)} de ${f(N)}`),
      answer: ans,
      traps,
      hint: `Divideix ${N} entre el denominador (${d}) i multiplica el resultat pel numerador (${n}).`,
      solution: `${f(N)} : ${d} = ${k}; ${k} · ${n} = <b>${f(ans)}</b>`,
    });
  }

  function partDelTotal() {
    const { total, p, text } = pick([
      () => {
        const T = randInt(18, 30);
        const P = randInt(3, T - 3);
        return { total: T, p: P, text: `En una classe de ${T} alumnes, n'hi ha ${P} que porten ulleres. Quina fracció de la classe porta ulleres?` };
      },
      () => {
        const T = pick([8, 10, 12, 16]);
        const P = randInt(2, T - 2);
        return { total: T, p: P, text: `Un pastís està tallat en ${T} trossos iguals i se n'han menjat ${P}. Quina fracció del pastís s'ha menjat?` };
      },
      () => {
        const T = randInt(20, 40);
        const P = randInt(4, T - 4);
        return { total: T, p: P, text: `En una bossa hi ha ${T} caramels i ${P} són de maduixa. Quina fracció dels caramels és de maduixa?` };
      },
    ])();
    return fracEx({
      prompt: Q(text),
      answer: fr(p, total),
      traps: [
        ft(p, total - p, 'parts_mal_comptades', `A baix hi va el total (${total}), no la resta (${total - p}).`),
        ft(total - p, total, 'part_que_queda', `Aquesta és la part que <b>no</b> compleix la condició. Et demanem l'altra: ${p} de ${total}.`),
        ft(total, p, 'num_den_girats', 'Has girat la fracció: a baix hi va el total.'),
      ],
      hint: 'Numerador: la part que et pregunten. Denominador: el total.',
      solution: `${p} de ${total}: ${F(p, total)}${gcd(p, total) > 1 ? `, que simplificada és ${Fo(red(p, total))}` : ''}.`,
    }, true);
  }

  function minuts() {
    const M = pick([5, 10, 12, 15, 20, 30, 40, 45, 50]);
    const r = red(M, 60);
    return fracEx({
      prompt: Q(`Quina fracció d'una hora són <b>${M} minuts</b>?`) + IRR,
      answer: r,
      traps: [
        ft(M, 100, 'altre', 'Una hora no té 100 minuts, sinó 60.'),
        ft(60, M, 'num_den_girats', 'Has girat la fracció: a baix hi va el total (60 minuts).'),
      ],
      hint: 'Una hora té 60 minuts. Escriu la fracció i simplifica-la.',
      solution: `${F(M, 60)} = <b>${Fo(r)}</b> d'hora.`,
    });
  }

  function totalDesDePart() {
    const d = randInt(3, 8);
    let n;
    do { n = randInt(2, d - 1); } while (gcd(n, d) !== 1);
    const u = randInt(2, 12);
    const part = n * u;
    const total = d * u;
    return numEx({
      prompt: Q(`Els ${F(n, d)} d'un nombre són ${part}. Quin és el nombre?`),
      answer: total,
      traps: [
        t(u, 'total_des_de_part', `${part} : ${n} = ${u} és només ${F(1, d)} del nombre. El total són ${d} parts: ${u} · ${d} = ${total}.`),
        t(part * d, 'total_des_de_part', `Primer cal dividir entre ${n} (per trobar ${F(1, d)}), i després multiplicar per ${d}.`),
      ].concat((part * n) % d === 0 && (part * n) / d !== total ? [t((part * n) / d, 'quantitat_nomes_multiplica', `Has calculat ${F(n, d)} de ${part}, però ${part} ja és la part. Busquem el total.`)] : []),
      hint: `Si ${n} parts són ${part}, quant val 1 part? I el total, que són ${d} parts?`,
      solution: `${F(1, d)} = ${part} : ${n} = ${u}. El total és ${F(d, d)} = ${u} · ${d} = <b>${total}</b>.`,
    });
  }

  // ── 2. Equivalents i simplificar ────────────────────────────────────────────

  function completa(level) {
    const x = irr(2, level === 1 ? 9 : 12);
    const k = randInt(2, level === 1 ? 5 : 9);
    const missingNum = Math.random() < 0.6;
    const [a, b] = [x.num, x.den];
    if (missingNum) {
      return numEx({
        prompt: Q('Quin nombre falta perquè siguin equivalents?', `${F(a, b)} = ${F(BLANK, b * k)}`),
        answer: a * k,
        traps: [
          t(a + (b * k - b), 'equivalent_suma', `Al denominador no s'hi ha sumat ${b * k - b}: s'ha multiplicat per ${k}. Al numerador cal fer el mateix: ${a} · ${k} = ${a * k}.`),
          t(a, 'equivalent_un_sol_terme', `El denominador s'ha multiplicat per ${k}, així que el numerador també: ${a} · ${k} = ${a * k}.`),
        ],
        hint: `Per quin nombre s'ha multiplicat el denominador? (${b} · ? = ${b * k})`,
        solution: `${b} · ${k} = ${b * k}, per tant ${a} · ${k} = <b>${a * k}</b>: ${F(a, b)} = ${F(a * k, b * k)}.`,
      });
    }
    return numEx({
      prompt: Q('Quin nombre falta perquè siguin equivalents?', `${F(a * k, b * k)} = ${F(a, BLANK)}`),
      answer: b,
      traps: [
        t(b * k - (a * k - a), 'equivalent_suma', `Al numerador no s'hi ha restat res: s'ha dividit entre ${k}. Al denominador, igual: ${b * k} : ${k} = ${b}.`),
        t(b * k, 'equivalent_un_sol_terme', `El numerador s'ha dividit entre ${k}; el denominador també s'ha de dividir: ${b * k} : ${k} = ${b}.`),
      ],
      hint: `Entre quin nombre s'ha dividit el numerador? (${a * k} : ? = ${a})`,
      solution: `${a * k} : ${k} = ${a}, per tant ${b * k} : ${k} = <b>${b}</b>.`,
    });
  }

  function simplifica(level) {
    const x = irr(2, level === 3 ? 15 : 9, level !== 3);
    const k = level === 1 ? pick([2, 3, 5]) : level === 2 ? pick([4, 6, 8, 9, 10, 12]) : randInt(6, 15);
    const [n, d] = [x.num * k, x.den * k];
    const ps = [2, 3, 5].filter((p) => k % p === 0);
    const traps = [];
    ps.forEach((p) => traps.push(ft(n / p, d, 'equivalent_un_sol_terme', `Si divideixes el numerador entre ${p}, també has de dividir el denominador.`)));
    if (ps.length) {
      const p = ps[0];
      const q = [2, 3, 5, 7].find((z) => z !== p && d % z === 0);
      if (q) traps.push(ft(n / p, d / q, 'simplificar_diferent', `Has dividit el numerador entre ${p} i el denominador entre ${q}. Cal dividir-los tots dos pel mateix nombre.`));
    }
    return fracEx({
      prompt: Q('Simplifica fins a la fracció irreductible:', F(n, d)),
      answer: x,
      traps,
      hint: `Busca un nombre que divideixi ${n} i ${d} alhora. El més ràpid és fer-ho pel mcd(${n}, ${d}) = ${k}.`,
      solution: `mcd(${n}, ${d}) = ${k}. ${F(n, d)} = ${F(`${n} : ${k}`, `${d} : ${k}`)} = <b>${Fo(x)}</b>`,
    });
  }

  function quinaEquivalent() {
    const x = irr(3, 9);
    const k = randInt(2, 5);
    const m = randInt(1, 5);
    return choiceEx({
      prompt: Q('Quina fracció és <b>equivalent</b> a aquesta?', Fo(x)),
      options: [
        { label: F(x.num * k, x.den * k), correct: true },
        { label: F(x.num + m, x.den + m), id: 'equivalent_suma', msg: `Sumar ${m} a dalt i a baix no dona una fracció equivalent. Cal <b>multiplicar</b> tots dos termes pel mateix nombre.` },
        { label: F(x.num * k, x.den), id: 'equivalent_un_sol_terme', msg: `Només s'ha multiplicat el numerador. Cal multiplicar els dos termes: ${F(x.num * k, x.den * k)}.` },
        { label: F(x.den, x.num), id: 'num_den_girats', msg: 'Aquesta és la fracció girada (la inversa), no una equivalent.' },
      ],
      hint: 'Una fracció equivalent s\'obté multiplicant el numerador i el denominador pel mateix nombre.',
      solution: `${Fo(x)} = ${F(`${x.num} · ${k}`, `${x.den} · ${k}`)} = ${F(x.num * k, x.den * k)}`,
    });
  }

  function sonEquivalents() {
    const x = irr(3, 9);
    const yes = Math.random() < 0.5;
    const k = randInt(2, 5);
    const m = randInt(1, 4);
    const y = yes ? fr(x.num * k, x.den * k) : fr(x.num + m, x.den + m);
    const p1 = x.num * y.den;
    const p2 = x.den * y.num;
    const cross = `${x.num} · ${y.den} = ${p1} i ${x.den} · ${y.num} = ${p2}`;
    const options = yes ? [
      { label: `Sí, perquè ${cross}`, correct: true },
      { label: 'No, perquè els nombres són diferents', id: 'altre', msg: `Dues fraccions poden ser equivalents amb nombres diferents. Fes els productes en creu: ${cross}. Són iguals!` },
      { label: 'No, perquè la segona és més gran', id: 'comparar_termes', msg: `Que els termes siguin més grans no vol dir que la fracció ho sigui. ${cross}: són equivalents.` },
    ] : [
      { label: `No, perquè ${cross}`, correct: true },
      { label: `Sí, perquè s'ha sumat ${m} a dalt i a baix`, id: 'equivalent_suma', msg: `Sumar el mateix nombre no dona fraccions equivalents (cal multiplicar). Productes en creu: ${cross}.` },
      { label: 'Sí, perquè totes dues són més petites que 1', id: 'altre', msg: `Moltes fraccions són més petites que 1 i no són iguals. ${cross}: no són equivalents.` },
    ];
    return choiceEx({
      prompt: Q('Són equivalents aquestes dues fraccions?', `${Fo(x)} &nbsp; i &nbsp; ${Fo(y)}`),
      options,
      hint: 'Multiplica en creu: si els dos productes són iguals, les fraccions són equivalents.',
      solution: `${cross}. ${yes ? 'Són iguals: <b>són equivalents</b>.' : 'Són diferents: <b>no són equivalents</b>.'}`,
    });
  }

  // ── 3. Comparar i ordenar ───────────────────────────────────────────────────

  const sym = (x, y) => (val(x) < val(y) ? '<' : val(x) > val(y) ? '>' : '=');
  const symHtml = { '<': '&lt;', '>': '&gt;', '=': '=' };

  function compara(level) {
    const kind = level === 1 ? pick(['den', 'num']) : level === 2 ? pick(['diff', 'diff', 'num']) : pick(['diff', 'eq', 'diff']);
    let x;
    let y;
    if (kind === 'den') {
      const d = randInt(4, 12);
      let a;
      let b;
      do { a = randInt(1, d + 3); b = randInt(1, d + 3); } while (a === b);
      [x, y] = [fr(a, d), fr(b, d)];
    } else if (kind === 'num') {
      const n = randInt(1, 6);
      let a;
      let b;
      do { a = randInt(2, 12); b = randInt(2, 12); } while (a === b);
      [x, y] = [fr(n, a), fr(n, b)];
    } else if (kind === 'eq') {
      x = irr(2, 9);
      const k = randInt(2, 4);
      y = fr(x.num * k, x.den * k);
      if (Math.random() < 0.5) [x, y] = [y, x];
    } else {
      // Denominadors diferents, i sovint comparar només els numeradors enganya.
      do { x = irr(2, 12); y = irr(2, 12); } while (x.den === y.den || x.num === y.num || same(x, y) || (Math.random() < 0.7 && (x.num > y.num) === (val(x) > val(y))));
    }
    const s = sym(x, y);
    const L = lcm(x.den, y.den);
    const why = {
      den: `Amb el mateix denominador, és més gran la que té el numerador més gran.`,
      num: `Amb el mateix numerador, és més gran la que té el denominador <b>més petit</b> (les parts són més grans).`,
      diff: `Amb denominador comú: ${F(x.num * (L / x.den), L)} ${symHtml[s]} ${F(y.num * (L / y.den), L)}.`,
      eq: `Són equivalents: ${Fo(red(x.num, x.den))} = ${Fo(red(y.num, y.den))}.`,
    }[kind];
    const wrongId = { den: 'altre', num: 'comparar_denominador', diff: 'comparar_termes', eq: 'altre' }[kind];
    const opt = (c) => ({ label: symHtml[c], correct: c === s, id: c === '=' && s !== '=' ? 'altre' : wrongId, msg: c === '=' && s !== '=' ? `No són equivalents. ${why}` : why });
    return choiceEx({
      prompt: Q('Quin signe hi va?', `${Fo(x)} &nbsp;<span class="blank">?</span>&nbsp; ${Fo(y)}`),
      options: ['<', '=', '>'].map(opt),
      shuffle: false,
      hint: kind === 'num' ? 'Pensa en un pastís: és més gros 1 tros de 3 o 1 tros de 8?' : 'Si els denominadors són diferents, redueix a denominador comú.',
      solution: `${Fo(x)} ${symHtml[s]} ${Fo(y)}. ${why}`,
    });
  }

  function mesGranQue1() {
    const d = randInt(3, 9);
    const big = fr(randInt(d + 1, 2 * d), d);
    const opts = [{ label: Fo(big), correct: true }];
    const pool = [
      { label: F(d, d), id: 'comparar_unitat', msg: `${F(d, d)} és exactament 1 (numerador i denominador iguals), no més gran.` },
    ];
    for (let i = 0; i < 8; i++) {
      const dd = randInt(4, 15);
      const n = randInt(1, dd - 1);
      pool.push({ label: F(n, dd), id: 'comparar_unitat', msg: `A ${F(n, dd)} el numerador és més petit que el denominador: és més petita que 1.` });
    }
    const seen = new Set([opts[0].label]);
    for (const o of pool) {
      if (opts.length >= 4) break;
      if (!seen.has(o.label)) { seen.add(o.label); opts.push(o); }
    }
    return choiceEx({
      prompt: Q('Quina d\'aquestes fraccions és <b>més gran que 1</b>?'),
      options: opts,
      hint: 'Si el numerador és més gran que el denominador, la fracció és més gran que 1.',
      solution: `A ${Fo(big)} el numerador (${big.num}) és més gran que el denominador (${d}): és més gran que 1.`,
    });
  }

  function mesGran() {
    let xs;
    do { xs = Array.from({ length: 4 }, () => irr(2, 12)); } while (new Set(xs.map(val)).size < 4 || new Set(xs.map((x) => x.num)).size < 4 || new Set(xs.map((x) => x.den)).size < 4);
    const max = xs.reduce((a, b) => (val(b) > val(a) ? b : a));
    const bigNum = xs.reduce((a, b) => (b.num > a.num ? b : a));
    const bigDen = xs.reduce((a, b) => (b.den > a.den ? b : a));
    const L = xs.reduce((a, x) => lcm(a, x.den), 1);
    return choiceEx({
      prompt: Q('Quina és la fracció <b>més gran</b>?'),
      options: xs.map((x) => (x === max ? { label: Fo(x), correct: true }
        : x === bigNum ? { label: Fo(x), id: 'comparar_termes', msg: `Té el numerador més gran, però també cal mirar el denominador. ${Fo(x)} ≈ ${val(x).toFixed(2).replace('.', ',')} i ${Fo(max)} ≈ ${val(max).toFixed(2).replace('.', ',')}.` }
          : x === bigDen ? { label: Fo(x), id: 'comparar_denominador', msg: 'Un denominador gran vol dir parts petites. No fa la fracció més gran.' }
            : { label: Fo(x), id: 'altre', msg: `Compara-les amb denominador comú. ${Fo(max)} és la més gran.` })),
      hint: L <= 60 ? `Passa-les totes a denominador ${L}.` : 'Compara-les amb un denominador comú, o pensa quina part de la unitat representa cadascuna.',
      solution: `Amb denominador ${L}: ${xs.map((x) => `${Fo(x)} = ${F(x.num * (L / x.den), L)}`).join(', ')}. La més gran és <b>${Fo(max)}</b>.`,
    });
  }

  function ordena() {
    let xs;
    do { xs = Array.from({ length: 3 }, () => irr(2, 10)); } while (new Set(xs.map(val)).size < 3 || new Set(xs.map((x) => x.num)).size < 3 || new Set(xs.map((x) => x.den)).size < 3);
    const lab = (arr) => arr.map(Fo).join(' &lt; ');
    const asc = xs.slice().sort((a, b) => val(a) - val(b));
    const byNum = xs.slice().sort((a, b) => a.num - b.num);
    const byDen = xs.slice().sort((a, b) => a.den - b.den);
    const L = xs.reduce((a, x) => lcm(a, x.den), 1);
    return choiceEx({
      prompt: Q('Quina és l\'ordenació correcta, <b>de més petita a més gran</b>?', xs.map(Fo).join(' &nbsp; ')),
      options: [
        { label: lab(asc), correct: true },
        { label: lab(byNum), id: 'comparar_termes', msg: 'Has ordenat pels numeradors, però els denominadors són diferents. Cal reduir a denominador comú.' },
        { label: lab(byDen), id: 'comparar_denominador', msg: 'Has ordenat pels denominadors. Un denominador més gran no fa la fracció més gran.' },
        { label: lab(asc.slice().reverse()), id: 'altre', msg: 'Aquesta ordenació és de més gran a més petita.' },
      ],
      hint: 'Redueix-les a denominador comú i compara els numeradors.',
      solution: `Amb denominador ${L}: ${xs.map((x) => `${Fo(x)} = ${F(x.num * (L / x.den), L)}`).join(', ')}. Per tant, <b>${lab(asc)}</b>.`,
    });
  }

  // ── 4. Sumar i restar ───────────────────────────────────────────────────────

  function mateixDen() {
    const d = randInt(3, 12);
    const plus = Math.random() < 0.6;
    let a;
    let b;
    do { a = randInt(1, d + 2); b = randInt(1, d); } while ((!plus && a <= b));
    const n = plus ? a + b : a - b;
    const op = plus ? '+' : '−';
    const traps = plus
      ? [ft(a + b, 2 * d, 'suma_denominadors_iguals', `Amb el mateix denominador, el denominador no se suma: es queda ${d}. ${F(a, d)} + ${F(b, d)} = ${F(a + b, d)}.`)]
      : [ft(a + b, d, 'altre', 'Has sumat els numeradors, però és una resta.')];
    return fracEx({
      prompt: Q('Calcula:', `${F(a, d)} ${op} ${F(b, d)}`),
      answer: fr(n, d),
      traps,
      hint: `Tenen el mateix denominador: ${plus ? 'suma' : 'resta'} els numeradors i deixa el denominador igual.`,
      solution: `${F(a, d)} ${op} ${F(b, d)} = ${F(`${a} ${op} ${b}`, d)} = <b>${F(n, d)}</b>${gcd(n, d) > 1 ? ` = ${Fo(red(n, d))}` : ''}`,
    }, true);
  }

  function diferentDen(level) {
    let x;
    let y;
    do { x = irr(2, level === 2 ? 8 : 12); y = irr(2, level === 2 ? 8 : 12); } while (x.den === y.den || lcm(x.den, y.den) > (level === 2 ? 40 : 72));
    const plus = Math.random() < 0.55;
    if (!plus && val(x) < val(y)) [x, y] = [y, x];
    if (!plus && same(x, y)) return diferentDen(level);
    const L = lcm(x.den, y.den);
    const ax = x.num * (L / x.den);
    const ay = y.num * (L / y.den);
    const op = plus ? '+' : '−';
    const ans = plus ? add(x, y) : sub(x, y);
    const traps = [];
    if (plus) {
      traps.push(ft(x.num + y.num, x.den + y.den, 'suma_num_den', `No es poden sumar numeradors i denominadors per separat. Primer, denominador comú (${L}): ${F(ax, L)} + ${F(ay, L)}.`));
      traps.push(ft(x.num + y.num, L, 'denominador_comu_num', `En passar a denominador ${L}, els numeradors també canvien: ${Fo(x)} = ${F(ax, L)} i ${Fo(y)} = ${F(ay, L)}.`));
    } else {
      if (x.num > y.num && x.den > y.den) traps.push(ft(x.num - y.num, x.den - y.den, 'suma_num_den', `No es poden restar numeradors i denominadors per separat. Primer, denominador comú (${L}).`));
      if (x.num > y.num) traps.push(ft(x.num - y.num, L, 'denominador_comu_num', `En passar a denominador ${L}, els numeradors també canvien: ${F(ax, L)} − ${F(ay, L)}.`));
    }
    return fracEx({
      prompt: Q('Calcula:', `${Fo(x)} ${op} ${Fo(y)}`) + IRR,
      answer: ans,
      traps,
      hint: `Redueix a denominador comú: el mcm de ${x.den} i ${y.den} és ${L}.`,
      solution: `mcm(${x.den}, ${y.den}) = ${L}. ${F(ax, L)} ${op} ${F(ay, L)} = ${F(plus ? ax + ay : ax - ay, L)}${gcd(plus ? ax + ay : ax - ay, L) > 1 ? ` = ${Fo(ans)}` : ''}. Resultat: <b>${Fo(ans)}</b>`,
    });
  }

  function ambEnter() {
    const x = irr(2, 9);
    const n = randInt(1, 4);
    const plus = Math.random() < 0.6;
    const ans = plus ? fr(n * x.den + x.num, x.den) : fr(n * x.den - x.num, x.den);
    const op = plus ? '+' : '−';
    const traps = [];
    if (plus) traps.push(ft(n + x.num, x.den, 'enter_com_fraccio', `L'enter ${n} no se suma al numerador: ${n} = ${F(n * x.den, x.den)}. Aleshores ${F(n * x.den, x.den)} + ${Fo(x)}.`));
    else if (n > x.num) traps.push(ft(n - x.num, x.den, 'enter_com_fraccio', `L'enter ${n} s'ha de passar a fracció: ${n} = ${F(n * x.den, x.den)}.`));
    traps.push(ft(n + (plus ? x.num : -x.num), x.den + 1, 'enter_com_fraccio', `Un enter té denominador 1, però per sumar cal el mateix denominador: ${n} = ${F(n * x.den, x.den)}.`));
    return fracEx({
      prompt: Q('Calcula:', plus ? `${n} + ${Fo(x)}` : `${n} − ${Fo(x)}`) + IRR,
      answer: ans,
      traps,
      hint: `Escriu el ${n} com una fracció de denominador ${x.den}.`,
      solution: `${n} = ${F(n * x.den, x.den)}. ${F(n * x.den, x.den)} ${op} ${Fo(x)} = <b>${Fo(ans)}</b>`,
    });
  }

  function tresTermes() {
    const dens = [2, 3, 4, 6, 8, 12];
    let a;
    let b;
    let c;
    let ans;
    do {
      a = red(randInt(1, 5), pick(dens));
      b = red(randInt(1, 5), pick(dens));
      c = red(randInt(1, 5), pick(dens));
      ans = sub(add(a, b), c);
    } while (ans.num <= 0 || new Set([a.den, b.den, c.den]).size < 2 || a.num >= a.den * 2);
    const L = lcm(lcm(a.den, b.den), c.den);
    const e = (x) => x.num * (L / x.den);
    return fracEx({
      prompt: Q('Calcula:', `${Fo(a)} + ${Fo(b)} − ${Fo(c)}`) + IRR,
      answer: ans,
      traps: [
        ft(a.num + b.num - c.num, a.den + b.den - c.den, 'suma_num_den', `Cal un denominador comú per a les tres fraccions: ${L}.`),
        ft(a.num + b.num - c.num, L, 'denominador_comu_num', `En passar a denominador ${L}, els numeradors també canvien.`),
      ],
      hint: `Denominador comú de ${a.den}, ${b.den} i ${c.den}: ${L}.`,
      solution: `${F(e(a), L)} + ${F(e(b), L)} − ${F(e(c), L)} = ${F(e(a) + e(b) - e(c), L)}${gcd(e(a) + e(b) - e(c), L) > 1 ? ` = ${Fo(ans)}` : ''}. Resultat: <b>${Fo(ans)}</b>`,
    });
  }

  // ── 5. Multiplicar i dividir ────────────────────────────────────────────────

  function producte(level) {
    const x = irr(2, level === 1 ? 7 : 10, level === 1);
    const y = irr(2, level === 1 ? 7 : 10, level === 1);
    const ans = mul(x, y);
    const traps = [
      ft(x.num * y.den, x.den * y.num, 'producte_creuat', `Per multiplicar no es fa en creu: numerador per numerador (${x.num} · ${y.num}) i denominador per denominador (${x.den} · ${y.den}).`),
      ft(x.num + y.num, x.den + y.den, 'altre', 'Has sumat els termes. Per multiplicar fraccions, multiplica numeradors i denominadors.'),
    ];
    return fracEx({
      prompt: Q('Calcula:', `${Fo(x)} · ${Fo(y)}`) + (level === 1 ? '' : IRR),
      answer: level === 1 ? fr(x.num * y.num, x.den * y.den) : ans,
      traps,
      hint: 'Numerador per numerador i denominador per denominador.',
      solution: `${Fo(x)} · ${Fo(y)} = ${F(`${x.num} · ${y.num}`, `${x.den} · ${y.den}`)} = ${F(x.num * y.num, x.den * y.den)}${gcd(x.num * y.num, x.den * y.den) > 1 ? ` = <b>${Fo(ans)}</b>` : ''}`,
    }, level === 1);
  }

  function enterPerFraccio() {
    const x = irr(3, 9);
    const n = randInt(2, 6);
    return fracEx({
      prompt: Q('Calcula:', `${n} · ${Fo(x)}`),
      answer: fr(n * x.num, x.den),
      traps: [ft(n * x.num, n * x.den, 'producte_denominador', `Si multipliques també el denominador, la fracció no canvia de valor. Només es multiplica el numerador: ${F(n * x.num, x.den)}.`)],
      hint: `${n} = ${F(n, 1)}. Multiplica el ${n} pel numerador.`,
      solution: `${n} · ${Fo(x)} = ${F(`${n} · ${x.num}`, x.den)} = <b>${F(n * x.num, x.den)}</b>`,
    }, true);
  }

  function divisio(level) {
    let x;
    let y;
    do { x = irr(2, level === 2 ? 8 : 12, false); y = irr(2, level === 2 ? 8 : 12, false); } while (same(x, y) || same(x, fr(y.den, y.num)));
    const ans = div(x, y);
    return fracEx({
      prompt: Q('Calcula:', `${Fo(x)} : ${Fo(y)}`) + IRR,
      answer: ans,
      traps: [
        ft(x.num * y.num, x.den * y.den, 'divisio_sense_invertir', `Has multiplicat sense invertir. Dividir és multiplicar per la inversa: ${Fo(x)} · ${F(y.den, y.num)}.`),
        ft(x.den * y.num, x.num * y.den, 'divisio_inverteix_primera', `S'inverteix la segona fracció, no la primera: ${Fo(x)} · ${F(y.den, y.num)}.`),
      ],
      hint: 'Dividir és multiplicar per la inversa de la segona fracció (o multiplicar en creu).',
      solution: `${Fo(x)} : ${Fo(y)} = ${Fo(x)} · ${F(y.den, y.num)} = ${F(x.num * y.den, x.den * y.num)}${gcd(x.num * y.den, x.den * y.num) > 1 ? ` = ${Fo(ans)}` : ''}. Resultat: <b>${Fo(ans)}</b>`,
    });
  }

  function inversa() {
    const isInt = Math.random() < 0.3;
    const x = isInt ? fr(randInt(2, 12), 1) : irr(2, 12, false);
    const label = isInt ? String(x.num) : Fo(x);
    return fracEx({
      prompt: Q('Quina és la <b>inversa</b> d\'aquest nombre?', label),
      answer: fr(x.den, x.num),
      traps: [ft(x.num, x.den, 'inversa_confosa', `Aquesta és la mateixa fracció. La inversa s'obté girant-la: ${F(x.den, x.num)}.`)],
      hint: isInt ? `${x.num} = ${F(x.num, 1)}. Gira-la.` : 'Gira la fracció: el numerador passa a baix i el denominador a dalt.',
      solution: `La inversa de ${label} és <b>${F(x.den, x.num)}</b>, perquè ${label} · ${F(x.den, x.num)} = 1.`,
    });
  }

  function fraccioDeFraccio() {
    const x = irr(2, 6);
    const y = irr(2, 9);
    const ans = mul(x, y);
    const name = x.num === 1 && x.den === 2 ? 'la meitat' : readFrac(x.num, x.den);
    return fracEx({
      prompt: Q(`Quant és ${name ? `${name} (${Fo(x)})` : Fo(x)} de ${Fo(y)}?`) + IRR,
      answer: ans,
      traps: [
        ft(x.num * y.den, x.den * y.num, 'producte_creuat', '«De» vol dir multiplicar: numerador per numerador i denominador per denominador.'),
        ...(same(add(x, y), ans) ? [] : [t(add(x, y), 'altre', '«De» vol dir multiplicar, no sumar.')]),
      ],
      hint: '«La fracció d\'una fracció» es calcula multiplicant-les.',
      solution: `${Fo(x)} · ${Fo(y)} = ${F(x.num * y.num, x.den * y.den)}${gcd(x.num * y.num, x.den * y.den) > 1 ? ` = ${Fo(ans)}` : ''}. Resultat: <b>${Fo(ans)}</b>`,
    });
  }

  // ── 6. Operacions combinades ────────────────────────────────────────────────

  function combinada(level) {
    const D = [2, 3, 4, 5, 6];
    for (;;) {
      const a = irr(2, 6);
      const b = fr(randInt(1, 5), pick(D));
      const c = fr(randInt(1, 5), pick(D));
      let expr;
      let ans;
      let wrong;
      let steps;
      if (level === 1) {
        // a + b · c
        const p = mul(b, c);
        ans = add(a, p);
        wrong = mul(add(a, b), c);
        expr = `${Fo(a)} + ${Fo(b)} · ${Fo(c)}`;
        steps = `Primer el producte: ${Fo(b)} · ${Fo(c)} = ${Fo(p)}. Després: ${Fo(a)} + ${Fo(p)} = <b>${Fo(ans)}</b>`;
      } else if (level === 2) {
        // (a + b) · c
        const s = add(a, b);
        ans = mul(s, c);
        wrong = add(a, mul(b, c));
        expr = `(${Fo(a)} + ${Fo(b)}) · ${Fo(c)}`;
        steps = `Primer el parèntesi: ${Fo(a)} + ${Fo(b)} = ${Fo(s)}. Després: ${Fo(s)} · ${Fo(c)} = <b>${Fo(ans)}</b>`;
      } else {
        // a : (b − c)   o   1 − a · b
        if (Math.random() < 0.5) {
          const dif = sub(b, c);
          if (dif.num <= 0) continue;
          ans = div(a, dif);
          const w = sub(div(a, b), c);
          wrong = w.num > 0 ? w : null;
          expr = `${Fo(a)} : (${Fo(b)} − ${Fo(c)})`;
          steps = `Primer el parèntesi: ${Fo(b)} − ${Fo(c)} = ${Fo(dif)}. Després: ${Fo(a)} : ${Fo(dif)} = <b>${Fo(ans)}</b>`;
        } else {
          const p = mul(a, b);
          ans = sub(fr(1, 1), p);
          const w = mul(sub(fr(1, 1), a), b);
          wrong = w.num > 0 ? w : null;
          expr = `1 − ${Fo(a)} · ${Fo(b)}`;
          steps = `Primer el producte: ${Fo(a)} · ${Fo(b)} = ${Fo(p)}. Després: 1 − ${Fo(p)} = <b>${Fo(ans)}</b>`;
        }
      }
      if (ans.num <= 0 || ans.den > 60 || ans.num > 99 || (wrong && same(wrong, ans))) continue;
      return fracEx({
        prompt: Q('Calcula:', expr) + IRR,
        answer: ans,
        traps: wrong ? [t(wrong, 'ordre_operacions', level === 2 ? 'El parèntesi va primer: suma les fraccions de dins i després multiplica.' : 'Primer es fan els parèntesis i després multiplicacions i divisions. Les sumes i restes, al final.')] : [],
        hint: 'Ordre: parèntesis → multiplicacions i divisions → sumes i restes.',
        solution: steps,
      });
    }
  }

  // ── 7. Problemes ────────────────────────────────────────────────────────────

  function probQuantitat() {
    const x = irr(3, 8);
    const k = randInt(2, 8);
    const N = x.den * k;
    const part = x.num * k;
    const rest = N - part;
    const ctx = pick([
      { text: `En una classe de ${N} alumnes, els ${Fo(x)} són noies.`, ask: 'Quantes noies hi ha?', askRest: 'Quants nois hi ha?' },
      { text: `Un llibre té ${N} pàgines i la Júlia n'ha llegit els ${Fo(x)}.`, ask: 'Quantes pàgines ha llegit?', askRest: 'Quantes pàgines li falten per acabar-lo?' },
      { text: `Un dipòsit de ${N} litres està ple fins als ${Fo(x)}.`, ask: 'Quants litres d\'aigua hi ha?', askRest: 'Quants litres falten per omplir-lo?' },
    ]);
    const askRest = Math.random() < 0.5;
    const ans = askRest ? rest : part;
    const traps = [t(k, 'quantitat_nomes_divideix', `${N} : ${x.den} = ${k} és només ${F(1, x.den)}. Cal multiplicar per ${x.num}.`)];
    if (askRest) traps.push(t(part, 'part_que_queda', `${part} és la part dels ${Fo(x)}. Et demanen la resta: ${N} − ${part} = ${rest}.`));
    else traps.push(t(rest, 'part_que_queda', `Aquesta és la part que queda. Et demanen els ${Fo(x)}: ${part}.`));
    return numEx({
      prompt: Q(`${ctx.text} ${askRest ? ctx.askRest : ctx.ask}`),
      answer: ans,
      traps,
      hint: `Calcula els ${Fo(x)} de ${N}: divideix entre ${x.den} i multiplica per ${x.num}.`,
      solution: `${Fo(x)} de ${N} = ${N} : ${x.den} · ${x.num} = ${part}.${askRest ? ` Falten ${N} − ${part} = <b>${rest}</b>.` : ` Resposta: <b>${part}</b>.`}`,
    });
  }

  function probFraccions() {
    let x;
    let y;
    do { x = irr(2, 8); y = irr(2, 8); } while (x.den === y.den || val(x) + val(y) >= 1 || lcm(x.den, y.den) > 40);
    const s = add(x, y);
    const restF = sub(fr(1, 1), s);
    const askRest = Math.random() < 0.5;
    const ans = askRest ? restF : s;
    const traps = [ft(x.num + y.num, x.den + y.den, 'suma_num_den', `Per sumar ${Fo(x)} + ${Fo(y)} cal denominador comú (${lcm(x.den, y.den)}).`)];
    if (askRest) traps.push(t(s, 'part_que_queda', `${Fo(s)} és el que ha llegit. Li falta la resta fins a 1: 1 − ${Fo(s)}.`));
    return fracEx({
      prompt: Q(`El Marc llegeix ${Fo(x)} d'un llibre dissabte i ${Fo(y)} diumenge. ${askRest ? 'Quina fracció del llibre li falta per llegir?' : 'Quina fracció del llibre ha llegit en total?'}`) + IRR,
      answer: ans,
      traps,
      hint: askRest ? 'Suma el que ha llegit i resta-ho de la unitat (el llibre sencer és 1).' : 'Suma les dues fraccions amb denominador comú.',
      solution: `${Fo(x)} + ${Fo(y)} = ${Fo(s)}.${askRest ? ` Li falta 1 − ${Fo(s)} = <b>${Fo(restF)}</b>.` : ` Ha llegit <b>${Fo(s)}</b> del llibre.`}`,
    });
  }

  function probTotal() {
    const x = irr(3, 8);
    const u = randInt(5, 30);
    const part = x.num * u;
    const total = x.den * u;
    return numEx({
      prompt: Q(`La Clara ha llegit els ${Fo(x)} d'un llibre, que són ${part} pàgines. Quantes pàgines té el llibre?`),
      answer: total,
      traps: [
        t(u, 'total_des_de_part', `${part} : ${x.num} = ${u} pàgines és ${F(1, x.den)} del llibre. El llibre sencer són ${x.den} parts: ${u} · ${x.den} = ${total}.`),
        ...((part * x.num) % x.den === 0 ? [t((part * x.num) / x.den, 'quantitat_nomes_multiplica', `Has calculat els ${Fo(x)} de ${part}, però ${part} ja és la part llegida. Busquem el total.`)] : []),
      ],
      hint: `Si ${x.num} parts són ${part} pàgines, quant fa 1 part? I ${x.den} parts?`,
      solution: `${F(1, x.den)} del llibre = ${part} : ${x.num} = ${u} pàgines. Llibre sencer = ${u} · ${x.den} = <b>${total}</b> pàgines.`,
    });
  }

  function probDelQueQueda() {
    const x = pick([fr(1, 2), fr(1, 3), fr(2, 5), fr(1, 4), fr(3, 5), fr(2, 3)]);
    const y = pick([fr(1, 2), fr(1, 3), fr(1, 4), fr(3, 4), fr(2, 3)]);
    const M = x.den * y.den * randInt(2, 6);
    const spent1 = (M / x.den) * x.num;
    const left1 = M - spent1;
    const spent2 = (left1 / y.den) * y.num;
    const left2 = left1 - spent2;
    const wrong = M - spent1 - (M / y.den) * y.num;
    const traps = [t(spent2, 'part_que_queda', `${spent2} € és el que es gasta en el berenar. Et demanen el que li queda: ${left1} − ${spent2} = ${left2}.`)];
    if (wrong >= 0 && wrong !== left2) traps.push(t(wrong, 'fraccio_del_que_queda', `Els ${Fo(y)} són del que <b>queda</b> (${left1} €), no del total: ${left1} : ${y.den} · ${y.num} = ${spent2} €.`));
    return numEx({
      prompt: Q(`L'Aina té ${M} €. Es gasta ${Fo(x)} dels diners en un llibre i, després, ${Fo(y)} del que li queda en un berenar. Quants diners li queden?`),
      answer: left2,
      traps,
      hint: 'Ves pas a pas: primer calcula el que li queda després del llibre, i després els diners del berenar a partir d\'aquesta quantitat.',
      solution: `Llibre: ${Fo(x)} de ${M} = ${spent1} €; li queden ${left1} €. Berenar: ${Fo(y)} de ${left1} = ${spent2} €. Li queden ${left1} − ${spent2} = <b>${left2}</b> €.`,
    });
  }

  // ── Generadors per habilitat i nivell ──────────────────────────────────────

  const gens = {
    concepte(level) {
      if (level === 1) return run([() => figura(1), llegir, () => quantitat(1)]);
      if (level === 2) return run([() => figura(2), partDelTotal, () => quantitat(2)]);
      return run([totalDesDePart, minuts, () => quantitat(3)]);
    },
    equivalents(level) {
      if (level === 1) return run([() => completa(1), () => simplifica(1), quinaEquivalent]);
      if (level === 2) return run([() => completa(2), () => simplifica(2), quinaEquivalent]);
      return run([() => simplifica(3), sonEquivalents]);
    },
    comparar(level) {
      if (level === 1) return run([() => compara(1), mesGranQue1]);
      if (level === 2) return run([() => compara(2), mesGran]);
      return run([ordena, () => compara(3), mesGran]);
    },
    suma_resta(level) {
      if (level === 1) return mateixDen();
      if (level === 2) return diferentDen(2);
      return run([() => diferentDen(3), ambEnter, tresTermes]);
    },
    multiplicacio_divisio(level) {
      if (level === 1) return run([() => producte(1), enterPerFraccio]);
      if (level === 2) return run([() => producte(2), () => divisio(2), inversa]);
      return run([() => divisio(3), fraccioDeFraccio]);
    },
    operacions_combinades: (level) => combinada(level),
    problemes(level) {
      if (level === 1) return probQuantitat();
      if (level === 2) return run([probFraccions, probTotal]);
      return run([probDelQueQueda, probFraccions, probTotal]);
    },
  };

  /** Si la resposta en forma de fracció és un nombre enter (6/3 = 2), se'n genera una altra:
   * escriure «2 sobre 1» confon més que no ensenya. */
  const noInteger = (gen) => (level) => {
    for (;;) {
      const ex = gen(level);
      if (ex.input.type !== 'fraction' || red(ex.answer.num, ex.answer.den).den !== 1) return ex;
    }
  };
  ML.fraccions.generators = {};
  Object.keys(gens).forEach((k) => { ML.fraccions.generators[k] = noInteger(gens[k]); });

  ML.fraccions.math = { gcd, lcm, red };
})(window.MathLab);
