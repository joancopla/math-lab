/* Generadors d'exercicis de nombres decimals.
 * Cada generador retorna un exercici amb el contracte descrit a js/core/checker.js.
 * Les respostes decimals fan servir input.decimal: s'accepta la coma i també el punt («3,25» o «3.25»).
 * Tots els valors es construeixen a partir d'enters (xifres sense coma) per evitar errors d'arrodoniment.
 */
window.MathLab = window.MathLab || {};
window.MathLab.decimals = window.MathLab.decimals || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const { randInt, pick } = U;
  const f = U.fmt;

  // ── Utilitats ───────────────────────────────────────────────────────────────

  /** Arrodoneix a 6 decimals: elimina els errors de coma flotant (0,1 + 0,2). */
  const R = (x) => Math.round(x * 1e6) / 1e6;
  const P10 = (k) => 10 ** k;
  /** Nombre a partir de les xifres sense coma i de quants decimals té: D(325, 2) = 3,25. */
  const D = (int, places) => R(int / P10(places));
  /** Decimal aleatori amb part entera entre minInt i maxInt i exactament `places` decimals (l'última no és 0). */
  const rnd = (minInt, maxInt, places) => {
    let n;
    do { n = randInt(minInt * P10(places), (maxInt + 1) * P10(places) - 1); } while (places > 0 && n % 10 === 0);
    return D(n, places);
  };
  /** Quants decimals té un nombre. */
  const places = (x) => (String(x).split('.')[1] || '').length;
  const digitsOf = (x) => Math.round(x * P10(places(x)));
  /** Format amb un nombre fix de decimals: fx(0.8, 2) = «0,80». */
  const fx = (x, p) => x.toFixed(p).replace('.', ',');
  const eur = (x) => `${fx(x, 2)} €`;

  const t = (match, id, msg) => ({ match, id, msg });
  const tt = (test, id, msg) => ({ test, id, msg });
  const Q = (text, math) => `<p class="q-text">${text}</p>${math ? `<div class="q-math">${math}</div>` : ''}`;
  /** Resposta decimal. Arrodoneix la resposta i els paranys. */
  const decEx = (o) => Object.assign({ input: { type: 'number', decimal: true } }, o, {
    answer: R(o.answer),
    traps: (o.traps || []).map((x) => (x.match === undefined ? x : Object.assign({}, x, { match: R(x.match) }))).filter((x) => x.match === undefined || x.match >= 0),
  });
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

  const POS = ['unitats', 'dècimes', 'centèsimes', 'mil·lèsimes'];
  const POS1 = ['unitat', 'dècima', 'centèsima', 'mil·lèsima'];
  const posName = (i, n) => (n === 1 ? POS1[i] : POS[i]);

  // ── 1. Què és un nombre decimal ─────────────────────────────────────────────

  function xifraPosicio(level) {
    const nd = level === 1 ? 2 : 3;
    let ds;
    do { ds = Array.from({ length: nd + 1 }, () => randInt(1, 9)); } while (new Set(ds).size < ds.length);
    const ip = level === 1 ? ds[0] : randInt(1, 9) * 10 + ds[0];
    const x = D(ip * P10(nd) + Number(ds.slice(1).join('')), nd);
    const ask = level === 1 ? randInt(1, 2) : randInt(0, 3);
    return decEx({
      prompt: Q(`Quina xifra ocupa el lloc de les <b>${POS[ask]}</b>?`, f(x)),
      answer: ds[ask],
      traps: ds.map((d, i) => (i === ask ? null : t(d, 'posicio_decimal', `El ${d} ocupa les ${POS[i]}. ${ask === 0 ? 'Les unitats són just abans de la coma.' : `Les ${POS[ask]} són la ${['', 'primera', 'segona', 'tercera'][ask]} xifra després de la coma.`}`))).filter(Boolean),
      hint: 'Després de la coma: 1a xifra → dècimes, 2a → centèsimes, 3a → mil·lèsimes.',
      solution: `A ${f(x)}: ${ds.map((d, i) => `${d} ${posName(i, d)}`).join(', ')}. A les ${POS[ask]} hi ha el <b>${ds[ask]}</b>.`,
    });
  }

  function escriureXifres(level) {
    const a = randInt(0, 12);
    const p = level;
    const b = p === 1 ? randInt(1, 9) : p === 2 ? randInt(1, 99) : randInt(1, 999);
    const ans = R(a + D(b, p));
    const parts = [];
    if (a > 0) parts.push(`${a} ${posName(0, a)}`);
    parts.push(`${b} ${posName(p, b)}`);
    const traps = [];
    if (p === 1) traps.push(t(a + D(b, 2), 'posicio_decimal', `Les dècimes són la primera xifra després de la coma: ${f(ans)}.`));
    for (let q = 1; q < p; q++) {
      if (b < P10(q)) traps.push(t(a + D(b, q), 'zeros_decimals', `${b} ${POS[p]} s'escriuen amb zeros davant: ${f(D(b, p))}. Sense els zeros serien ${POS[q]}.`));
    }
    if (p === 2 && b >= 10) traps.push(t(a + D(b, 3), 'posicio_decimal', `${b} centèsimes ocupen dues xifres després de la coma: ${f(ans)}.`));
    return decEx({
      prompt: Q('Escriu en xifres:', `«${parts.join(' i ')}»`),
      answer: ans,
      traps,
      hint: `Les ${POS[p]} acaben a la ${['', 'primera', 'segona', 'tercera'][p]} xifra després de la coma. Si cal, omple amb zeros.`,
      solution: `${parts.join(' i ')} = <b>${f(ans)}</b>`,
    });
  }

  const FRAC_DEC = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [1, 20], [3, 20], [7, 20], [1, 25], [3, 25]];

  function fraccioDecimal(level) {
    let n;
    let d;
    if (level === 3 && Math.random() < 0.6) [n, d] = pick(FRAC_DEC);
    else {
      d = P10(level);
      do { n = randInt(1, d - 1); } while (n % 10 === 0);
    }
    const ans = R(n / d);
    const traps = [];
    const p = Math.log10(d);
    if (Number.isInteger(p)) {
      for (let q = 1; q < p; q++) if (n < P10(q)) traps.push(t(D(n, q), 'zeros_decimals', `Amb denominador ${d} hi ha d'haver ${p} xifres decimals: ${f(ans)}.`));
      if (p === 1 || n >= P10(p - 1)) traps.push(t(D(n, p + 1), 'posicio_decimal', `Amb denominador ${d}, el ${n} acaba a les ${POS[p]}: ${f(ans)}.`));
    } else {
      traps.push(t(R(n + D(d, String(d).length)), 'fraccio_decimal', `${U.frac(n, d)} no és «${n},${d}». Una fracció és una divisió: ${n} : ${d} = ${f(ans)}.`));
    }
    return decEx({
      prompt: Q('Escriu com a nombre decimal:', U.frac(n, d)),
      answer: ans,
      traps,
      hint: Number.isInteger(p) ? `El denominador ${d} et diu quantes xifres decimals hi ha: ${p}.` : `Divideix ${n} entre ${d}. També pots buscar una fracció equivalent amb denominador 10, 100 o 1.000.`,
      solution: Number.isInteger(p) ? `${U.frac(n, d)} = ${n} ${posName(p, n)} = <b>${f(ans)}</b>` : `${U.frac(n, d)} = ${n} : ${d} = <b>${f(ans)}</b>`,
    });
  }

  function quantes() {
    const kind = pick(['c', 'd', 'm']);
    if (kind === 'd') {
      const x = rnd(1, 9, 1);
      const ans = Math.round(x * 10);
      return decEx({
        prompt: Q(`Quantes <b>dècimes</b> hi ha en total en ${f(x)}?`),
        answer: ans,
        traps: [t(ans % 10, 'posicio_decimal', `${ans % 10} és la xifra de les dècimes, però cada unitat també són 10 dècimes. En total: ${ans}.`)],
        hint: '1 unitat = 10 dècimes.',
        solution: `${f(x)} = ${Math.floor(x)} unitats i ${ans % 10} dècimes = ${Math.floor(x) * 10} + ${ans % 10} = <b>${ans}</b> dècimes.`,
      });
    }
    const x = kind === 'c' ? rnd(0, 0, 1) : rnd(0, 0, 2);
    const ans = Math.round(x * (kind === 'c' ? 100 : 1000));
    const unit = kind === 'c' ? 'centèsimes' : 'mil·lèsimes';
    return decEx({
      prompt: Q(`Quantes <b>${unit}</b> són ${f(x)}?`),
      answer: ans,
      traps: [t(digitsOf(x), 'posicio_decimal', `${digitsOf(x)} serien ${kind === 'c' ? 'dècimes' : 'centèsimes'}. Però ${f(x)} = ${fx(x, places(x) + 1)}: són ${ans} ${unit}.`)],
      hint: kind === 'c' ? '1 dècima = 10 centèsimes.' : '1 centèsima = 10 mil·lèsimes.',
      solution: `${f(x)} = ${fx(x, kind === 'c' ? 2 : 3)} = <b>${ans}</b> ${unit}.`,
    });
  }

  // ── 2. Ordenar i comparar ───────────────────────────────────────────────────

  const symHtml = { '<': '&lt;', '>': '&gt;', '=': '=' };

  function compara(level) {
    const ip = randInt(0, level === 1 ? 5 : 20);
    const kind = Math.random() < (level === 1 ? 0.2 : 0.3) ? 'eq' : 'trap';
    let xs;
    let ys;
    let s;
    if (kind === 'eq') {
      const x = rnd(ip, ip, level === 3 ? 2 : 1);
      xs = f(x);
      ys = fx(x, places(x) + 1);
      s = '=';
    } else {
      const d1 = randInt(2, 9);
      const longer = level === 3 ? 3 : 2;
      const d2 = randInt(0, d1 - 1);
      const tail = randInt(1, P10(longer - 1) - 1);
      const x = D(ip * 10 + d1, 1);
      const y = D((ip * 10 + d2) * P10(longer - 1) + tail, longer);
      xs = f(x);
      ys = f(y);
      s = '>';
      if (Math.random() < 0.5) { [xs, ys] = [ys, xs]; s = '<'; }
    }
    const why = s === '=' ? `Un zero al final de la part decimal no canvia el valor: ${xs} = ${ys}.`
      : 'Compara xifra a xifra, començant per les dècimes. Si cal, afegeix zeros perquè tinguin els mateixos decimals.';
    const wrongId = s === '=' ? 'zero_final' : 'mes_xifres_mes_gran';
    return choiceEx({
      prompt: Q('Quin signe hi va?', `${xs} &nbsp;<span class="blank">?</span>&nbsp; ${ys}`),
      options: ['<', '=', '>'].map((c) => ({
        label: symHtml[c],
        correct: c === s,
        id: c === '=' ? 'altre' : wrongId,
        msg: c === '=' && s !== '=' ? `No són iguals. ${why}` : why,
      })),
      shuffle: false,
      hint: 'Iguala el nombre de decimals afegint zeros al final, i compara.',
      solution: `${xs} ${symHtml[s]} ${ys}. ${why}`,
    });
  }

  function decimalsList(n, ip, minLen) {
    for (;;) {
      const xs = Array.from({ length: n }, () => rnd(ip, ip, randInt(1, 3)));
      const vals = new Set(xs);
      if (vals.size < n) continue;
      const max = Math.max(...xs);
      if (places(max) >= minLen && places(max) < Math.max(...xs.map(places))) return xs;
      if (minLen === 0 && places(max) < Math.max(...xs.map(places))) return xs;
    }
  }

  function mesGran() {
    const ip = randInt(0, 9);
    const xs = decimalsList(4, ip, 0);
    const max = Math.max(...xs);
    return choiceEx({
      prompt: Q('Quin és el nombre <b>més gran</b>?'),
      options: xs.map((x) => (x === max ? { label: f(x), correct: true }
        : { label: f(x), id: 'mes_xifres_mes_gran', msg: `${f(x)} té ${places(x) > places(max) ? 'més xifres decimals' : 'xifres decimals'}, però compara xifra a xifra: ${fx(x, 3)} &lt; ${fx(max, 3)}.` })),
      hint: 'Afegeix zeros perquè tots tinguin 3 decimals i compara.',
      solution: `Amb 3 decimals: ${xs.map((x) => fx(x, 3)).join(', ')}. El més gran és <b>${f(max)}</b>.`,
    });
  }

  function ordena() {
    const ip = randInt(0, 9);
    const xs = decimalsList(4, ip, 0);
    const asc = xs.slice().sort((a, b) => a - b);
    const byDigits = xs.slice().sort((a, b) => digitsOf(a) - digitsOf(b));
    const byLen = xs.slice().sort((a, b) => places(a) - places(b) || a - b);
    const lab = (arr) => arr.map(f).join(' &lt; ');
    return choiceEx({
      prompt: Q('Quina és l\'ordenació correcta, <b>de més petit a més gran</b>?', xs.map(f).join(' &nbsp; ')),
      options: [
        { label: lab(asc), correct: true },
        { label: lab(byDigits), id: 'mes_xifres_mes_gran', msg: 'Has comparat les xifres de després de la coma com si fossin nombres enters. Afegeix zeros perquè tinguin els mateixos decimals.' },
        { label: lab(byLen), id: 'mes_xifres_mes_gran', msg: 'Tenir més xifres decimals no vol dir ser més gran.' },
        { label: lab(asc.slice().reverse()), id: 'altre', msg: 'Aquesta ordenació és de més gran a més petit.' },
      ],
      hint: 'Iguala els decimals afegint zeros i ordena.',
      solution: `Amb 3 decimals: ${xs.map((x) => fx(x, 3)).join(', ')}. Ordenats: <b>${lab(asc)}</b>.`,
    });
  }

  function entreDos() {
    const a = rnd(0, 20, 1);
    const b = R(a + 0.1);
    const inside = (v) => v > a + 1e-9 && v < b - 1e-9;
    return decEx({
      prompt: Q(`Escriu un nombre decimal que estigui <b>entre</b> ${f(a)} i ${f(b)}.`) + '<p class="q-text"><small>N\'hi ha molts: n\'hi ha prou amb un.</small></p>',
      answer: R(a + 0.05),
      accept: inside,
      traps: [
        tt((v) => Math.abs(v - a) < 1e-9 || Math.abs(v - b) < 1e-9, 'altre', `Ha d'estar entre els dos, sense ser cap d'ells. Prova amb una centèsima més: ${f(a)} = ${fx(a, 2)}…`),
        tt((v) => Math.abs(v - R(a + 1)) < 1e-9, 'altre', 'Aquest nombre és massa gran.'),
      ],
      fallback: `Aquest nombre no és entre ${f(a)} i ${f(b)}. Escriu-los amb dues xifres decimals: ${fx(a, 2)} i ${fx(b, 2)}. Quins nombres hi ha entremig?`,
      hint: `Escriu-los amb dos decimals: ${fx(a, 2)} i ${fx(b, 2)}. Entremig hi ha ${fx(R(a + 0.01), 2)}, ${fx(R(a + 0.02), 2)}…`,
      solution: `${fx(a, 2)} &lt; ${fx(R(a + 0.05), 2)} &lt; ${fx(b, 2)}. Serveix qualsevol entre ${fx(R(a + 0.01), 2)} i ${fx(R(a + 0.09), 2)}, i molts més (${fx(R(a + 0.001), 3)}…).`,
    });
  }

  // ── 3. Arrodonir ────────────────────────────────────────────────────────────

  const roundTo = (N, p, q) => Math.floor((N + 5 * P10(p - q - 1)) / P10(p - q)) / P10(q);
  const truncTo = (N, p, q) => Math.floor(N / P10(p - q)) / P10(q);

  function arrodonir(level) {
    const [p, q] = pick(level === 1 ? [[1, 0], [2, 1]] : level === 2 ? [[3, 2], [2, 0], [3, 1]] : [[2, 1], [3, 2], [3, 1]]);
    let N;
    do {
      N = randInt(1, 99) * P10(p) + randInt(1, P10(p) - 1);
      if (level === 3) {
        // Forcem que «se n'emporti una»: la xifra on arrodonim és un 9 i la següent ≥ 5.
        const base = Math.floor(N / P10(p - q + 1)) * P10(p - q + 1);
        N = base + 9 * P10(p - q) + randInt(5, 9) * P10(p - q - 1) + (p - q > 1 ? randInt(0, 9) : 0);
      }
    } while (N % 10 === 0);
    const x = D(N, p);
    const ans = R(roundTo(N, p, q));
    const tr = R(truncTo(N, p, q));
    const next = Math.floor(N / P10(p - q - 1)) % 10;
    const traps = [];
    if (tr !== ans) traps.push(t(tr, 'truncar', `La xifra següent és un ${next}, que és 5 o més: cal pujar una unitat. ${f(x)} → ${f(ans)}.`));
    [q - 1, q + 1].filter((z) => z >= 0 && z < p && z !== q).forEach((z) => {
      const other = R(roundTo(N, p, z));
      if (other !== ans) traps.push(t(other, 'arrodonir_posicio', `Has arrodonit a les ${POS[z]}, però et demanen les ${POS[q]}.`));
    });
    return decEx({
      prompt: Q(`Arrodoneix a les <b>${POS[q]}</b>:`, f(x)),
      answer: ans,
      traps,
      hint: `Mira la xifra que hi ha just després de les ${POS[q]}: si és 5 o més, puja una unitat; si és menys de 5, es queda igual.`,
      solution: `La xifra següent a les ${POS[q]} és un ${next}, ${next >= 5 ? 'que és 5 o més: pugem una unitat' : 'que és menys de 5: no canvia'}. ${f(x)} ≈ <b>${fx(ans, q)}</b>`,
    });
  }

  function preuAprox() {
    const x = rnd(2, 60, 2);
    const N = Math.round(x * 100);
    const ans = roundTo(N, 2, 0);
    const tr = truncTo(N, 2, 0);
    const [item, plural] = pick([['Una samarreta', false], ['Un llibre', false], ['Una motxilla', false], ['Un joc de taula', false], ['Unes sabatilles', true]]);
    return decEx({
      prompt: Q(`${item} ${plural ? 'costen' : 'costa'} ${eur(x)}. Arrodonint a les unitats, quants euros ${plural ? 'costen' : 'costa'}?`),
      answer: ans,
      traps: tr !== ans ? [t(tr, 'truncar', `Els cèntims són ${Math.round((x - tr) * 100)}: és més de la meitat d'un euro (50 cèntims), així que s'arrodoneix cap amunt.`)] : [t(ans + 1, 'truncar', 'Els cèntims no arriben a 50: s\'arrodoneix cap avall.')],
      hint: 'Mira les dècimes: si són 5 o més, puja un euro.',
      solution: `${eur(x)} ≈ <b>${ans}</b> €`,
    });
  }

  // ── 4. Sumar i restar ───────────────────────────────────────────────────────

  /** Resultat de sumar o restar «alineant per la dreta» (sense alinear la coma). */
  function misaligned(a, b, sign) {
    const pa = places(a);
    const pb = places(b);
    const m = Math.max(pa, pb);
    return D(digitsOf(a) + sign * digitsOf(b), m);
  }

  function suma(level) {
    const [pa, pb] = level === 1 ? [1, 1] : pick([[1, 2], [2, 1], [1, 3], [2, 3]]);
    const a = rnd(1, level === 1 ? 20 : 50, pa);
    const b = rnd(0, level === 1 ? 20 : 30, pb);
    const ans = R(a + b);
    const m = misaligned(a, b, 1);
    const P = Math.max(pa, pb);
    return decEx({
      prompt: Q('Calcula:', `${f(a)} + ${f(b)}`),
      answer: ans,
      traps: m !== ans ? [t(m, 'alinear_coma', `Cal posar la coma sota la coma: ${fx(a, P)} + ${fx(b, P)} = ${f(ans)}.`)] : [],
      hint: 'Posa un nombre sota l\'altre amb la coma alineada. Afegeix zeros si cal.',
      solution: `${fx(a, P)} + ${fx(b, P)} = <b>${f(ans)}</b>`,
    });
  }

  function resta(level) {
    if (level >= 2 && Math.random() < 0.4) {
      const a = randInt(2, 20);
      const b = rnd(0, a - 1, randInt(1, 2));
      const ans = R(a - b);
      const wrong = R(a - Math.floor(b) + (b - Math.floor(b)));
      return decEx({
        prompt: Q('Calcula:', `${a} − ${f(b)}`),
        answer: ans,
        traps: [t(wrong, 'resta_enter', `El ${a} també té decimals: ${fx(a, places(b))}. Aleshores ${fx(a, places(b))} − ${f(b)} = ${f(ans)}.`)],
        hint: `Escriu el ${a} amb decimals: ${fx(a, places(b))}.`,
        solution: `${fx(a, places(b))} − ${f(b)} = <b>${f(ans)}</b>`,
      });
    }
    const [pa, pb] = level === 1 ? [1, 1] : pick([[1, 2], [2, 1], [1, 3], [3, 1]]);
    let a;
    let b;
    do { a = rnd(2, 40, pa); b = rnd(0, 20, pb); } while (b >= a);
    const ans = R(a - b);
    const m = misaligned(a, b, -1);
    const P = Math.max(pa, pb);
    return decEx({
      prompt: Q('Calcula:', `${f(a)} − ${f(b)}`),
      answer: ans,
      traps: m !== ans ? [t(m, 'alinear_coma', `Cal posar la coma sota la coma: ${fx(a, P)} − ${fx(b, P)} = ${f(ans)}.`)] : [],
      hint: 'Posa la coma sota la coma i afegeix zeros perquè tinguin els mateixos decimals.',
      solution: `${fx(a, P)} − ${fx(b, P)} = <b>${f(ans)}</b>`,
    });
  }

  function cadena() {
    let a;
    let b;
    let c;
    let ans;
    do {
      a = rnd(5, 30, randInt(1, 2));
      b = rnd(1, 15, randInt(1, 2));
      c = rnd(0, 10, randInt(1, 2));
      ans = R(a - b + c);
    } while (ans <= 0 || b >= a);
    return decEx({
      prompt: Q('Calcula:', `${f(a)} − ${f(b)} + ${f(c)}`),
      answer: ans,
      traps: [t(R(a - (b + c)), 'altre', 'Les sumes i restes es fan d\'esquerra a dreta: primer la resta i després la suma.')],
      hint: 'D\'esquerra a dreta, i amb la coma alineada.',
      solution: `${f(a)} − ${f(b)} = ${f(R(a - b))}; ${f(R(a - b))} + ${f(c)} = <b>${f(ans)}</b>`,
    });
  }

  // ── 5. Multiplicar ──────────────────────────────────────────────────────────

  function per10(level) {
    const k = level === 1 ? pick([10, 100]) : pick([10, 100, 1000]);
    const z = Math.log10(k);
    const x = rnd(0, level === 1 ? 20 : 9, randInt(1, 3));
    const ans = R(x * k);
    const traps = [
      t(x, 'per_10_zero', `Afegir un zero al final d'un decimal no el canvia (${f(x)} = ${fx(x, places(x) + 1)}). Cal moure la coma ${z} ${z === 1 ? 'posició' : 'posicions'} cap a la dreta.`),
      t(R(x / k), 'coma_direccio', `Per multiplicar, la coma va cap a la <b>dreta</b> (el nombre es fa més gran): ${f(ans)}.`),
      t(R(ans * 10), 'coma_posicions', `${k} té ${z} ${z === 1 ? 'zero' : 'zeros'}: la coma es mou ${z} ${z === 1 ? 'posició' : 'posicions'}, no ${z + 1}.`),
    ];
    if (z > 1) traps.push(t(R(ans / 10), 'coma_posicions', `${k} té ${z} zeros: la coma es mou ${z} posicions, no ${z - 1}.`));
    return decEx({
      prompt: Q('Calcula:', `${f(x)} · ${f(k)}`),
      answer: ans,
      traps,
      hint: `Multiplicar per ${f(k)} és moure la coma ${z} ${z === 1 ? 'posició' : 'posicions'} cap a la dreta. Si falten xifres, posa zeros.`,
      solution: `La coma es mou ${z} ${z === 1 ? 'posició' : 'posicions'} cap a la dreta: ${f(x)} · ${f(k)} = <b>${f(ans)}</b>`,
    });
  }

  function producte(level) {
    let a;
    let b;
    if (level === 1) { a = rnd(0, 9, randInt(1, 2)); b = randInt(2, 9); }
    else if (level === 2) { a = rnd(1, 9, 1); b = rnd(1, 5, 1); }
    else { a = rnd(0, 0, randInt(1, 2)); b = rnd(0, 1, 1); }
    const pa = places(a);
    const pb = places(b);
    const pt = pa + pb;
    const prodInt = digitsOf(a) * digitsOf(b);
    const ans = D(prodInt, pt);
    const traps = [
      t(D(prodInt, pt - 1), 'decimals_producte', `${f(a)} té ${pa} ${pa === 1 ? 'decimal' : 'decimals'} i ${f(b)} en té ${pb}: el resultat n'ha de tenir ${pt}.`),
      t(D(prodInt, pt + 1), 'decimals_producte', `El resultat ha de tenir ${pt} ${pt === 1 ? 'decimal' : 'decimals'} (${pa} + ${pb}).`),
    ];
    if (pt > 1) traps.push(t(D(prodInt, Math.max(pa, pb)), 'decimals_producte', `No es posen els decimals del factor que en té més: se sumen els de tots dos factors (${pa} + ${pb} = ${pt}).`));
    return decEx({
      prompt: Q('Calcula:', `${f(a)} · ${f(b)}`),
      answer: ans,
      traps,
      hint: 'Multiplica sense les comes. Després, compta els decimals dels dos factors i posa\'n tants al resultat.',
      solution: `${digitsOf(a)} · ${digitsOf(b)} = ${prodInt}. Decimals: ${pa} + ${pb} = ${pt}. Resultat: <b>${f(ans)}</b>`,
    });
  }

  // ── 6. Dividir ──────────────────────────────────────────────────────────────

  function per10div(level) {
    const k = level === 1 ? pick([10, 100]) : pick([10, 100, 1000]);
    const z = Math.log10(k);
    const x = Math.random() < 0.4 ? randInt(2, 99) : rnd(1, 99, 1);
    const ans = R(x / k);
    const traps = [
      t(R(x * k), 'coma_direccio', `Per dividir, la coma va cap a l'<b>esquerra</b> (el nombre es fa més petit): ${f(ans)}.`),
      t(R(ans * 10), 'coma_posicions', `${k} té ${z} ${z === 1 ? 'zero' : 'zeros'}: la coma es mou ${z} ${z === 1 ? 'posició' : 'posicions'}. Si falten xifres, posa zeros: ${f(ans)}.`),
      t(R(ans / 10), 'coma_posicions', `La coma es mou ${z} ${z === 1 ? 'posició' : 'posicions'}, no ${z + 1}.`),
    ];
    return decEx({
      prompt: Q('Calcula:', `${f(x)} : ${f(k)}`),
      answer: ans,
      traps,
      hint: `Dividir per ${f(k)} és moure la coma ${z} ${z === 1 ? 'posició' : 'posicions'} cap a l'esquerra.${Number.isInteger(x) ? ` El ${x} té la coma al final: ${x},0.` : ''}`,
      solution: `La coma es mou ${z} ${z === 1 ? 'posició' : 'posicions'} cap a l'esquerra: ${f(x)} : ${f(k)} = <b>${f(ans)}</b>`,
    });
  }

  function decEntreEnter(level) {
    const b = randInt(2, 9);
    const q = rnd(level === 2 ? 1 : 0, 9, level === 2 ? 1 : 2);
    const a = R(q * b);
    return decEx({
      prompt: Q('Calcula:', `${f(a)} : ${b}`),
      answer: q,
      traps: [
        t(digitsOf(q), 'quocient_coma', `T'has oblidat la coma: quan baixes la primera xifra decimal de ${f(a)}, cal posar la coma al quocient. ${f(a)} : ${b} = ${f(q)}.`),
        t(R(q * 10), 'coma_posicions', `Revisa on poses la coma. Comprova-ho: ${f(q)} · ${b} = ${f(a)}.`),
      ],
      hint: 'Divideix com si no hi hagués coma, però quan arribis a la coma del dividend, posa-la al quocient.',
      solution: `${f(a)} : ${b} = <b>${f(q)}</b>. Comprovació: ${f(q)} · ${b} = ${f(a)}.`,
    });
  }

  function entreDecimal() {
    const b = rnd(0, 2, 1);
    if (b < 0.2) return entreDecimal();
    const q = Math.random() < 0.6 ? randInt(2, 30) : rnd(1, 9, 1);
    const a = R(q * b);
    const a10 = R(a * 10);
    const b10 = R(b * 10);
    return decEx({
      prompt: Q('Calcula:', `${f(a)} : ${f(b)}`),
      answer: q,
      traps: [t(R(q / 10), 'divisor_decimal', `Si treus la coma del divisor (${f(b)} → ${f(b10)}), també has de multiplicar el dividend per 10: ${f(a10)} : ${f(b10)}.`)],
      hint: `Multiplica els dos nombres per 10 perquè el divisor no tingui decimals: ${f(a10)} : ${f(b10)}.`,
      solution: `${f(a)} : ${f(b)} = ${f(a10)} : ${f(b10)} = <b>${f(q)}</b>`,
    });
  }

  // ── 7. Problemes ────────────────────────────────────────────────────────────

  /** [plural, singular, femení?] */
  const ITEMS = [['llibretes', 'llibreta', true], ['bolígrafs', 'bolígraf', false], ['entrades', 'entrada', true], ['croissants', 'croissant', false], ['iogurts', 'iogurt', false]];

  function compra() {
    const n = randInt(2, 6);
    const [pl, , fem] = pick(ITEMS);
    const p = rnd(0, 4, 2);
    if (p < 0.3) return compra();
    const ans = D(digitsOf(p) * n, 2);
    return decEx({
      prompt: Q(`Compres ${n} ${pl} a ${eur(p)} ${fem ? 'cadascuna' : 'cadascun'}. Quant pagues en total?`),
      answer: ans,
      traps: [t(R(p + n), 'altre', `Cal multiplicar el preu per ${n}, no sumar-hi ${n}.`), t(R(ans * 10), 'decimals_producte', `Revisa la coma: ${eur(p)} · ${n} = ${eur(ans)}.`)],
      hint: 'Multiplica el preu d\'una per la quantitat.',
      solution: `${fx(p, 2)} · ${n} = <b>${f(ans)}</b> €`,
    });
  }

  function canvi() {
    const bill = pick([5, 10, 20, 50]);
    let price;
    do { price = rnd(1, bill - 1, 2); } while (price >= bill);
    const ans = R(bill - price);
    const wrong = R(bill - Math.floor(price) + (price - Math.floor(price)));
    return decEx({
      prompt: Q(`Fas una compra de ${eur(price)} i pagues amb un bitllet de ${bill} €. Quant et tornen?`),
      answer: ans,
      traps: [
        t(wrong, 'resta_enter', `El bitllet de ${bill} € són ${fx(bill, 2)} €. ${fx(bill, 2)} − ${fx(price, 2)} = ${fx(ans, 2)}.`),
        t(price, 'pregunta_problema', `${eur(price)} és el que costa la compra. Et demanen el canvi: ${bill} − ${fx(price, 2)}.`),
      ],
      hint: `Resta: ${fx(bill, 2)} − ${fx(price, 2)}.`,
      solution: `${fx(bill, 2)} − ${fx(price, 2)} = <b>${f(ans)}</b> €`,
    });
  }

  function preuUnitari() {
    const n = randInt(2, 8);
    const u = rnd(0, 3, 2);
    if (u < 0.2) return preuUnitari();
    const total = D(digitsOf(u) * n, 2);
    const [pl, sg] = pick(ITEMS);
    return decEx({
      prompt: Q(`Un paquet de ${n} ${pl} costa ${eur(total)}. Quant costa cada ${sg}?`),
      answer: u,
      traps: [
        t(digitsOf(u), 'quocient_coma', `T'has oblidat la coma: ${fx(total, 2)} : ${n} = ${fx(u, 2)}.`),
        t(R(u * 10), 'coma_posicions', `Revisa la coma. Comprova-ho: ${fx(u, 2)} · ${n} = ${fx(total, 2)}.`),
        t(R(total * n), 'altre', 'Si el paquet sencer costa això, cada unitat ha de costar menys: cal dividir.'),
      ],
      hint: `Divideix el preu del paquet entre ${n}.`,
      solution: `${fx(total, 2)} : ${n} = <b>${f(u)}</b> €`,
    });
  }

  function corda() {
    const n = randInt(2, 5);
    const p = rnd(0, 3, 2);
    const used = D(digitsOf(p) * n, 2);
    const L = Math.ceil(used) + randInt(1, 4);
    if (p < 0.3) return corda();
    const ans = R(L - used);
    return decEx({
      prompt: Q(`D'una corda de ${L} m en tallem ${n} trossos de ${f(p)} m. Quants metres de corda queden?`),
      answer: ans,
      traps: [
        t(used, 'pregunta_problema', `${f(used)} m és el que s'ha tallat. Et demanen el que queda: ${L} − ${f(used)}.`),
        t(R(L - p), 'altre', `Hi ha ${n} trossos: primer calcula'n la llargada total (${f(p)} · ${n}).`),
      ],
      hint: 'Primer calcula quanta corda es talla en total; després resta-ho de la llargada inicial.',
      solution: `${f(p)} · ${n} = ${f(used)} m; ${L} − ${f(used)} = <b>${f(ans)}</b> m`,
    });
  }

  function mitjana() {
    const xs = Array.from({ length: 4 }, () => rnd(4, 9, 1));
    const sum = R(xs.reduce((a, b) => a + b, 0));
    const ans = R(sum / 4);
    return decEx({
      prompt: Q(`La Mar ha tret aquestes notes: ${xs.map(f).join('; ')}. Quina és la nota mitjana?`),
      answer: ans,
      traps: [t(sum, 'pregunta_problema', `${f(sum)} és la suma de les notes. La mitjana és la suma dividida entre 4.`)],
      hint: 'Suma les quatre notes i divideix entre 4.',
      solution: `${xs.map(f).join(' + ')} = ${f(sum)}; ${f(sum)} : 4 = <b>${f(ans)}</b>`,
    });
  }

  function dosPassos() {
    const kg = randInt(2, 4);
    const pk = rnd(1, 3, 2);
    const cost = D(digitsOf(pk) * kg, 2);
    const bill = cost < 10 ? 10 : 20;
    const ans = R(bill - cost);
    const fruita = pick(['pomes', 'peres', 'taronges', 'plàtans']);
    return decEx({
      prompt: Q(`Compres ${kg} kg de ${fruita} a ${eur(pk)} el quilo i pagues amb un bitllet de ${bill} €. Quant et tornen?`),
      answer: ans,
      traps: [
        t(cost, 'pregunta_problema', `${eur(cost)} és el que costen les ${fruita}. Et demanen el canvi: ${bill} − ${fx(cost, 2)}.`),
        t(R(bill - pk), 'altre', `Primer calcula el preu dels ${kg} kg: ${fx(pk, 2)} · ${kg}.`),
      ],
      hint: 'Primer calcula quant costen les fruites; després, el canvi.',
      solution: `${fx(pk, 2)} · ${kg} = ${fx(cost, 2)} €; ${bill} − ${fx(cost, 2)} = <b>${fx(ans, 2)}</b> €`,
    });
  }

  // ── Generadors per habilitat i nivell ──────────────────────────────────────

  ML.decimals.generators = {
    concepte(level) {
      if (level === 1) return run([() => xifraPosicio(1), () => escriureXifres(1), () => fraccioDecimal(1)]);
      if (level === 2) return run([() => xifraPosicio(2), () => escriureXifres(2), () => fraccioDecimal(2), quantes]);
      return run([() => escriureXifres(3), () => fraccioDecimal(3), quantes]);
    },
    ordenar(level) {
      if (level === 1) return run([() => compara(1), mesGran]);
      if (level === 2) return run([() => compara(2), ordena, mesGran]);
      return run([entreDos, ordena, () => compara(3)]);
    },
    arrodonir(level) {
      if (level === 2) return run([() => arrodonir(2), preuAprox]);
      return arrodonir(level);
    },
    suma_resta(level) {
      if (level === 1) return run([() => suma(1), () => resta(1)]);
      if (level === 2) return run([() => suma(2), () => resta(2)]);
      return run([cadena, () => resta(3), () => suma(3)]);
    },
    multiplicacio(level) {
      if (level === 1) return run([() => per10(1), () => producte(1)]);
      if (level === 2) return run([() => per10(2), () => producte(2)]);
      return run([() => producte(3), () => per10(3)]);
    },
    divisio(level) {
      if (level === 1) return per10div(1);
      if (level === 2) return run([() => per10div(2), () => decEntreEnter(2)]);
      return run([entreDecimal, () => decEntreEnter(3)]);
    },
    problemes(level) {
      if (level === 1) return run([compra, canvi]);
      if (level === 2) return run([preuUnitari, corda, canvi]);
      return run([mitjana, dosPassos, corda]);
    },
  };
})(window.MathLab);
