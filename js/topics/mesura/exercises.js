/* Generadors d'exercicis del tema de la mesura (6è de primària).
 * Cada generador retorna un exercici amb el contracte descrit a js/core/checker.js.
 * Les respostes numèriques fan servir input.decimal (coma o punt) i input.unit (la unitat es mostra al costat de la casella).
 * Els valors decimals es construeixen a partir d'enters i s'arrodoneixen amb R() per evitar errors de coma flotant.
 */
window.MathLab = window.MathLab || {};
window.MathLab.mesura = window.MathLab.mesura || {};

(function (ML) {
  'use strict';

  const U = ML.utils;
  const { randInt, pick } = U;
  const f = U.fmt;
  const PI = 3.14;

  // ── Utilitats ───────────────────────────────────────────────────────────────

  /** Arrodoneix a 6 decimals: elimina els errors de coma flotant. */
  const R = (x) => Math.round(x * 1e6) / 1e6;
  const D = (int, places) => R(int / 10 ** places);
  const places = (x) => (String(x).split('.')[1] || '').length;

  const t = (match, id, msg) => ({ match, id, msg });
  const Q = (text, math) => `<p class="q-text">${text}</p>${math ? `<div class="q-math">${math}</div>` : ''}`;
  /** Enunciat amb una figura (SVG) al costat de les dades. */
  const QF = (text, figure, data) => `<p class="q-text">${text}</p><div class="q-math q-fig">${figure}${data ? `<span class="fig-data">${data}</span>` : ''}</div>`;
  /** Resposta numèrica (pot ser decimal), amb la unitat al costat. Arrodoneix la resposta i els paranys. */
  const numEx = (o) => Object.assign({}, o, {
    input: { type: 'number', decimal: true, unit: o.unit },
    answer: R(o.answer),
    traps: (o.traps || []).map((x) => Object.assign({}, x, { match: R(x.match) })).filter((x) => x.match > 0),
  });
  const run = (pool) => pick(pool)();

  function choiceEx({ prompt, options, hint, solution }) {
    const seen = new Set();
    const unique = options.filter((o) => {
      if (seen.has(o.label)) return false;
      seen.add(o.label);
      return true;
    });
    const ordered = U.shuffle(unique).map((o, i) => Object.assign({}, o, { value: 'abcdef'[i] }));
    return {
      input: { type: 'choice', options: ordered.map(({ value, label }) => ({ value, label })) },
      answer: ordered.find((o) => o.correct).value,
      traps: ordered.filter((o) => !o.correct && o.id).map((o) => t(o.value, o.id, o.msg)),
      prompt,
      hint,
      solution,
    };
  }

  // ── Figures (SVG decoratiu: les dades també són al text) ────────────────────

  const W = 240;
  const H = 150;
  const svg = (body) => `<svg class="fig" viewBox="0 0 ${W} ${H}" aria-hidden="true">${body}</svg>`;
  const lbl = (x, y, s, anchor = 'middle') => `<text class="fig-lbl" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}">${s}</text>`;
  const poly = (pts, cls = 'fig-shape') => `<polygon class="${cls}" points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}"/>`;
  const line = (a, b, cls = 'fig-aux') => `<line class="${cls}" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
  /** Mides en píxels proporcionals a les dades, però sense figures massa primes. */
  const fit = (w, h, maxW = 160, maxH = 96) => {
    const s = Math.min(maxW / w, maxH / h);
    return [Math.max(36, w * s), Math.max(28, h * s)];
  };

  const FIG = {
    rect(b, h, lb, lh) {
      const [w, hh] = fit(b, h);
      const x = (W - w) / 2 - 10;
      const y = (H - hh) / 2 - 6;
      return svg(poly([[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]]) + lbl(x + w / 2, y + hh + 18, lb) + lbl(x + w + 6, y + hh / 2 + 5, lh, 'start'));
    },
    tri(b, h, lb, lh) {
      const [w, hh] = fit(b, h);
      const x = (W - w) / 2 - 10;
      const y = (H - hh) / 2 - 6;
      const ax = x + w * 0.35;
      return svg(poly([[x, y + hh], [x + w, y + hh], [ax, y]]) + line([ax, y], [ax, y + hh]) + lbl(x + w / 2, y + hh + 18, lb) + lbl(ax + 6, y + hh / 2 + 5, lh, 'start'));
    },
    para(b, h, side, lb, lh, ls) {
      const [w, hh] = fit(b * 1.3, h);
      const bw = w / 1.3;
      const o = w - bw;
      const x = (W - w) / 2;
      const y = (H - hh) / 2 - 6;
      return svg(poly([[x + o, y], [x + w, y], [x + bw, y + hh], [x, y + hh]]) + line([x + o, y], [x + o, y + hh])
        + lbl(x + bw / 2, y + hh + 18, lb) + lbl(x + o + 6, y + hh / 2 + 5, lh, 'start') + (ls ? lbl(x + o / 2 - 6, y + hh / 2 - 4, ls, 'end') : ''));
    },
    rombe(dD, dd, lD, ld) {
      const [w, hh] = fit(dD, dd, 170, 110);
      const cx = W / 2;
      const cy = H / 2 - 2;
      return svg(poly([[cx - w / 2, cy], [cx, cy - hh / 2], [cx + w / 2, cy], [cx, cy + hh / 2]]) + line([cx - w / 2, cy], [cx + w / 2, cy]) + line([cx, cy - hh / 2], [cx, cy + hh / 2])
        + lbl(cx, cy + hh / 2 + 18, `D = ${lD}`) + lbl(cx + w / 4 + 10, cy - hh / 4 - 8, `d = ${ld}`, 'start'));
    },
    trap(B, b, h, lB, lb, lh) {
      const [w, hh] = fit(B, h);
      const tw = Math.max(24, (w * b) / B);
      const x = (W - w) / 2 - 10;
      const y = (H - hh) / 2;
      const tx = x + (w - tw) * 0.3;
      return svg(poly([[tx, y], [tx + tw, y], [x + w, y + hh], [x, y + hh]]) + line([tx, y], [tx, y + hh])
        + lbl(x + w / 2, y + hh + 18, lB) + lbl(tx + tw / 2, y - 8, lb) + lbl(tx + 6, y + hh / 2 + 5, lh, 'start'));
    },
    regular(n, ls, la) {
      const cx = W / 2;
      const cy = H / 2 - 4;
      const r = 58;
      const pts = Array.from({ length: n }, (_, i) => {
        const a = Math.PI / 2 + Math.PI / n + (2 * Math.PI * i) / n;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      });
      const ap = r * Math.cos(Math.PI / n);
      return svg(poly(pts) + line([cx, cy], [cx, cy + ap]) + `<circle class="fig-dot" cx="${cx}" cy="${cy}" r="3"/>`
        + lbl(cx, cy + ap + 18, ls) + lbl(cx + 6, cy + ap / 2 + 5, la, 'start'));
    },
    circle(l, diam) {
      const cx = W / 2;
      const cy = H / 2;
      const r = 58;
      return svg(`<circle class="fig-shape" cx="${cx}" cy="${cy}" r="${r}"/><circle class="fig-dot" cx="${cx}" cy="${cy}" r="3"/>`
        + (diam ? line([cx - r, cy], [cx + r, cy], 'fig-solid') + lbl(cx, cy - 8, l) : line([cx, cy], [cx + r, cy], 'fig-solid') + lbl(cx + r / 2, cy - 8, l)));
    },
    box(a, b, c, la, lb, lc) {
      const [w, hh] = fit(a + c * 0.5, b + c * 0.5, 150, 92);
      const k = Math.min(w / (a + c * 0.5), hh / (b + c * 0.5));
      const fw = Math.max(40, a * k);
      const fh = Math.max(30, b * k);
      const d = Math.max(16, c * k * 0.5);
      const x = (W - fw - d) / 2 - 8;
      const y = (H - fh - d) / 2 + d - 4;
      return svg(poly([[x, y], [x + fw, y], [x + fw + d, y - d], [x + d, y - d]], 'fig-shape is-top')
        + poly([[x + fw, y], [x + fw + d, y - d], [x + fw + d, y + fh - d], [x + fw, y + fh]], 'fig-shape is-side')
        + poly([[x, y], [x + fw, y], [x + fw, y + fh], [x, y + fh]])
        + lbl(x + fw / 2, y + fh + 18, la) + lbl(x + fw + d + 6, y + fh / 2 - d / 2 + 5, lb, 'start') + lbl(x + fw + d / 2 + 4, y + fh - d / 2 + 16, lc, 'start'));
    },
    cylinder(lr, lh) {
      const cx = W / 2 - 14;
      const rx = 48;
      const ry = 14;
      const top = 34;
      const bot = 122;
      return svg(`<path class="fig-shape" d="M${cx - rx},${top} L${cx - rx},${bot} A${rx},${ry} 0 0 0 ${cx + rx},${bot} L${cx + rx},${top} Z"/>`
        + `<ellipse class="fig-shape is-top" cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}"/>`
        + line([cx, top], [cx + rx, top], 'fig-solid') + lbl(cx + rx / 2, top - ry - 5, lr)
        + lbl(cx + rx + 8, (top + bot) / 2 + 5, lh, 'start'));
    },
  };

  // ── Escales d'unitats ───────────────────────────────────────────────────────

  const LONG = { units: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], F: 10 };
  const MASSA = { units: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'], F: 10 };
  const CAP = { units: ['kl', 'hl', 'dal', 'l', 'dl', 'cl', 'ml'], F: 10 };
  const SUP = { units: ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'], F: 100 };
  const VOL = { units: ['km³', 'hm³', 'dam³', 'm³', 'dm³', 'cm³', 'mm³'], F: 1000 };
  const graonsTxt = (n) => `${n} ${n === 1 ? 'graó' : 'graons'}`;

  /** Canvi d'unitat: v en la unitat i → unitat j de l'escala M. */
  function convEx(M, i, j, v) {
    const k = j - i; // > 0: cap a una unitat més petita (es multiplica)
    const { F } = M;
    const n = Math.abs(k);
    const fac = F ** n;
    const op = k > 0 ? '·' : ':';
    const ui = M.units[i];
    const uj = M.units[j];
    const ans = R(v * F ** k);
    const how = `De ${ui} a ${uj} hi ha ${graonsTxt(n)} ${k > 0 ? 'cap avall' : 'cap amunt'}: ${op} ${f(fac)}.`;
    const traps = [];
    if (F === 100) traps.push(t(v * 10 ** k, 'factor_superficie', `A la superfície, cada graó és <b>×100</b>, no ×10. ${how}`));
    if (F === 1000) {
      traps.push(t(v * 10 ** k, 'factor_volum', `Al volum, cada graó és <b>×1.000</b>, no ×10. ${how}`));
      traps.push(t(v * 100 ** k, 'factor_volum', `Al volum, cada graó és <b>×1.000</b>, no ×100. ${how}`));
    }
    traps.push(t(v * F ** -k, 'direccio', k > 0
      ? `Passes a una unitat més petita (${uj}), així que el nombre ha de créixer: <b>multiplica</b> per ${f(fac)}.`
      : `Passes a una unitat més gran (${uj}), així que el nombre s'ha de fer més petit: <b>divideix</b> per ${f(fac)}.`));
    [k - Math.sign(k), k + Math.sign(k)].forEach((kk) => {
      if (kk !== 0) traps.push(t(v * F ** kk, 'graons', `Compta bé els graons. ${how}`));
    });
    return numEx({
      prompt: Q('Canvia d\'unitat:', `${f(v)} ${ui} = <b>?</b> ${uj}`),
      unit: uj,
      answer: ans,
      traps,
      hint: `L'escala és ${M.units.join(' · ')}. Cada graó cap avall (unitat més petita) és · ${f(F)}; cap amunt, : ${f(F)}.`,
      solution: `${how} ${f(v)} ${op} ${f(fac)} = <b>${f(ans)} ${uj}</b>`,
    });
  }

  /** Canvi d'unitat aleatori. Nivell 1: enters i 1–2 graons; nivell 2: decimals i fins a 3 graons. */
  function randConv(M, level, allowed = [0, 1, 2, 3, 4, 5, 6], maxSteps = level === 1 ? 2 : 3) {
    for (;;) {
      const i = pick(allowed);
      const j = pick(allowed);
      const n = Math.abs(j - i);
      if (n === 0 || n > maxSteps) continue;
      let v;
      if (level === 1) v = j > i ? randInt(1, 99) : randInt(1, 30) * M.F ** n;
      else v = pick([randInt(1, 999), randInt(1, 9999), D(randInt(11, 999), 1), D(randInt(101, 9999), 2), D(randInt(1, 999), 3)]);
      const ans = R(v * M.F ** (j - i));
      if (ans < 0.001 || ans > 9999999 || places(ans) > 3 || places(v) > 3) continue;
      if (level === 1 && !Number.isInteger(ans)) continue;
      return convEx(M, i, j, v);
    }
  }

  /** Forma complexa → una sola unitat: «2 m 5 cm = ? cm». */
  function complexEx(M, big, small, toSmall) {
    const n = small - big;
    const fac = M.F ** n;
    const x = randInt(1, 9);
    const y = pick([randInt(1, 9), randInt(1, fac - 1)]);
    const ub = M.units[big];
    const us = M.units[small];
    const ans = toSmall ? x * fac + y : R(x + y / fac);
    const traps = [];
    if (toSmall) traps.push(t(Number(`${x}${y}`), 'forma_complexa', `No n'hi ha prou d'ajuntar les xifres: ${x} ${ub} = ${f(x * fac)} ${us}, i ${f(x * fac)} + ${y} = ${f(ans)} ${us}.`));
    else traps.push(t(Number(`${x}.${y}`), 'forma_complexa', `${y} ${us} són ${y} : ${f(fac)} = ${f(R(y / fac))} ${ub}. Per tant, ${x} + ${f(R(y / fac))} = ${f(ans)} ${ub}.`));
    traps.push(t(x + y, 'unitats_diferents', `No pots sumar ${x} i ${y} directament: estan en unitats diferents. Passa-ho tot a ${toSmall ? us : ub}.`));
    return numEx({
      prompt: Q(`Expressa en <b>${toSmall ? us : ub}</b>:`, `${x} ${ub} ${y} ${us} = <b>?</b> ${toSmall ? us : ub}`),
      unit: toSmall ? us : ub,
      answer: ans,
      traps,
      hint: toSmall ? `Primer passa els ${ub} a ${us} (· ${f(fac)}) i després suma els ${us}.` : `Passa els ${us} a ${ub} (: ${f(fac)}) i suma'ls als ${ub}.`,
      solution: toSmall
        ? `${x} ${ub} = ${x} · ${f(fac)} = ${f(x * fac)} ${us}. ${f(x * fac)} + ${y} = <b>${f(ans)} ${us}</b>`
        : `${y} ${us} = ${y} : ${f(fac)} = ${f(R(y / fac))} ${ub}. ${x} + ${f(R(y / fac))} = <b>${f(ans)} ${ub}</b>`,
    });
  }

  // ── 1. Longitud ─────────────────────────────────────────────────────────────

  function problemaLongitud() {
    return run([
      () => {
        const km = pick([2, 3, 4, 5, 6, 10]);
        const n = pick([2, 4, 5, 8]);
        const ans = (km * 1000) / n;
        return numEx({
          prompt: Q(`Una cursa de <b>${km} km</b> té ${n} voltes iguals. Quants <b>metres</b> té cada volta?`),
          unit: 'm',
          answer: ans,
          traps: [t(km / n, 'unitats_diferents', `${f(R(km / n))} és en quilòmetres. Et demanem metres: ${km} km = ${f(km * 1000)} m.`), t(km * 1000 * n, 'direccio', 'Cada volta és un tros de la cursa: cal dividir, no multiplicar.')],
          hint: 'Passa els km a metres i reparteix-los entre les voltes.',
          solution: `${km} km = ${f(km * 1000)} m. ${f(km * 1000)} : ${n} = <b>${f(ans)} m</b>`,
        });
      },
      () => {
        const cm = randInt(55, 95);
        const n = randInt(4, 15);
        const ans = R((cm * n) / 100);
        return numEx({
          prompt: Q(`Cada passa de la Júlia fa <b>${cm} cm</b>. Quants <b>metres</b> recorre amb ${n} passes?`),
          unit: 'm',
          answer: ans,
          traps: [t(cm * n, 'unitats_diferents', `${f(cm * n)} és en centímetres. Passa'ls a metres: ${f(cm * n)} : 100 = ${f(ans)} m.`), t((cm * n) / 10, 'graons', 'De cm a m hi ha 2 graons: es divideix per 100.')],
          hint: 'Multiplica per trobar els centímetres i després passa\'ls a metres.',
          solution: `${cm} · ${n} = ${f(cm * n)} cm = <b>${f(ans)} m</b>`,
        });
      },
      () => {
        const m = D(randInt(11, 29), 1);
        const cm = randInt(15, 95);
        const ans = R(m * 100 + cm);
        return numEx({
          prompt: Q(`Una taula fa <b>${f(m)} m</b> de llarg i la de costat, <b>${cm} cm</b>. Quants <b>centímetres</b> fan en total, posades una al costat de l'altra?`),
          unit: 'cm',
          answer: ans,
          traps: [t(m + cm, 'unitats_diferents', `No pots sumar ${f(m)} i ${cm}: un és en metres i l'altre en centímetres. ${f(m)} m = ${f(m * 100)} cm.`)],
          hint: 'Passa primer els metres a centímetres.',
          solution: `${f(m)} m = ${f(R(m * 100))} cm. ${f(R(m * 100))} + ${cm} = <b>${f(ans)} cm</b>`,
        });
      },
    ]);
  }

  function longitud(level) {
    if (level < 3) return randConv(LONG, level);
    if (Math.random() < 0.5) return problemaLongitud();
    const [big, small] = pick([[0, 3], [3, 5], [3, 4], [3, 6], [5, 6]]);
    return complexEx(LONG, big, small, Math.random() < 0.6);
  }

  // ── 2. Massa i capacitat ────────────────────────────────────────────────────

  function tones() {
    const toKg = Math.random() < 0.5;
    const tn = toKg ? pick([randInt(2, 9), D(randInt(11, 95), 1), D(randInt(101, 999), 2)]) : D(randInt(11, 95), 1);
    const kg = R(tn * 1000);
    const how = '1 t = 1.000 kg';
    return numEx({
      prompt: Q(toKg ? `Un camió porta <b>${f(tn)} tones</b>. Quants quilos són?` : `Un elefant pesa <b>${f(kg)} kg</b>. Quantes tones són?`),
      unit: toKg ? 'kg' : 't',
      answer: toKg ? kg : tn,
      traps: toKg
        ? [t(tn * 100, 'graons', `${how}: es multiplica per 1.000.`), t(tn * 10, 'graons', `${how}: es multiplica per 1.000.`), t(tn / 1000, 'direccio', `Les tones són més grans que els quilos: per passar a kg, multiplica per 1.000.`)]
        : [t(kg / 100, 'graons', `${how}: es divideix per 1.000.`), t(kg * 1000, 'direccio', 'Els quilos són més petits que les tones: per passar a tones, divideix per 1.000.')],
      hint: `Recorda: ${how}.`,
      solution: toKg ? `${f(tn)} · 1.000 = <b>${f(kg)} kg</b>` : `${f(kg)} : 1.000 = <b>${f(tn)} t</b>`,
    });
  }

  function problemaMassaCap() {
    return run([
      () => {
        const [l, ml] = pick([[1.5, 250], [2, 250], [1, 125], [2, 200], [1.5, 300], [3, 250], [1, 200], [0.75, 250]]);
        const ans = (l * 1000) / ml;
        return numEx({
          prompt: Q(`Una ampolla té <b>${f(l)} l</b> d'aigua. Quants gots de <b>${ml} ml</b> pots omplir?`),
          unit: 'gots',
          answer: ans,
          traps: [t(l * 1000 * ml, 'direccio', 'Repartim l\'aigua en gots: cal dividir, no multiplicar.')],
          fallback: `Passa els litres a mil·lilitres (${f(l)} l = ${f(l * 1000)} ml) i divideix entre ${ml}.`,
          hint: 'Primer passa els litres a mil·lilitres.',
          solution: `${f(l)} l = ${f(l * 1000)} ml. ${f(l * 1000)} : ${ml} = <b>${f(ans)} gots</b>`,
        });
      },
      () => {
        const g = pick([250, 500, 750, 300, 150, 400]);
        const kg = D(randInt(5, 25), 1);
        const ans = R(kg * 1000 + g);
        return numEx({
          prompt: Q(`Compres <b>${g} g</b> de formatge i <b>${f(kg)} kg</b> de pomes. Quants <b>grams</b> pesa tot plegat?`),
          unit: 'g',
          answer: ans,
          traps: [t(g + kg, 'unitats_diferents', `No pots sumar ${g} i ${f(kg)}: estan en unitats diferents. ${f(kg)} kg = ${f(R(kg * 1000))} g.`), t(g + kg * 100, 'graons', '1 kg = 1.000 g (3 graons).')],
          hint: 'Passa els quilos a grams abans de sumar.',
          solution: `${f(kg)} kg = ${f(R(kg * 1000))} g. ${f(R(kg * 1000))} + ${g} = <b>${f(ans)} g</b>`,
        });
      },
      () => {
        const kg = pick([1, 2, 3, 5]);
        const g = pick([150, 250, 350, 400, 600, 750]);
        const ans = kg * 1000 - g;
        return numEx({
          prompt: Q(`Tens un paquet de <b>${kg} kg</b> d'arròs i en fas servir <b>${g} g</b>. Quants <b>grams</b> en queden?`),
          unit: 'g',
          answer: ans,
          traps: [t(kg * 1000 + g, 'altre', 'Si en fas servir, en queda menys: cal restar.'), t(R(kg - g / 1000), 'unitats_diferents', `${f(R(kg - g / 1000))} és en quilos. Et demanem grams.`)],
          hint: 'Passa els quilos a grams i resta.',
          solution: `${kg} kg = ${f(kg * 1000)} g. ${f(kg * 1000)} − ${g} = <b>${f(ans)} g</b>`,
        });
      },
    ]);
  }

  function massaCapacitat(level) {
    if (level < 3) return randConv(Math.random() < 0.5 ? MASSA : CAP, level);
    return run([
      tones,
      problemaMassaCap,
      problemaMassaCap,
      () => {
        const M = Math.random() < 0.5 ? MASSA : CAP;
        const [big, small] = pick(M === MASSA ? [[0, 3], [3, 6]] : [[3, 5], [3, 6]]);
        return complexEx(M, big, small, Math.random() < 0.6);
      },
    ]);
  }

  // ── 3. Unitats de superfície i de volum ─────────────────────────────────────

  function hectarees() {
    const toM2 = Math.random() < 0.5;
    const ha = toM2 ? pick([randInt(2, 9), D(randInt(11, 99), 1)]) : D(randInt(11, 99), 1);
    const m2 = R(ha * 10000);
    return numEx({
      prompt: Q(toM2 ? `Un camp fa <b>${f(ha)} ha</b>. Quants m² són?` : `Un bosc fa <b>${f(m2)} m²</b>. Quantes hectàrees són?`),
      unit: toM2 ? 'm²' : 'ha',
      answer: toM2 ? m2 : ha,
      traps: toM2
        ? [t(ha * 100, 'factor_superficie', '1 ha = 1 hm², i de hm² a m² hi ha 2 graons de ×100: · 10.000.'), t(ha * 1000, 'factor_superficie', '1 ha = 10.000 m² (2 graons de ×100).')]
        : [t(m2 / 100, 'factor_superficie', '1 ha = 10.000 m²: es divideix per 10.000.'), t(m2 / 1000, 'factor_superficie', '1 ha = 10.000 m²: es divideix per 10.000.')],
      hint: 'Una hectàrea (ha) és un hm²: 1 ha = 10.000 m².',
      solution: toM2 ? `${f(ha)} · 10.000 = <b>${f(m2)} m²</b>` : `${f(m2)} : 10.000 = <b>${f(ha)} ha</b>`,
    });
  }

  /** Volum ↔ capacitat: 1 dm³ = 1 l, 1 cm³ = 1 ml, 1 m³ = 1.000 l. */
  function volumCapacitat() {
    const cases = [
      { from: 'dm³', to: 'l', k: 1, v: () => pick([randInt(2, 50), D(randInt(11, 99), 1)]), rule: '1 dm³ = 1 l' },
      { from: 'l', to: 'dm³', k: 1, v: () => randInt(2, 80), rule: '1 l = 1 dm³' },
      { from: 'm³', to: 'l', k: 1000, v: () => pick([randInt(2, 9), D(randInt(11, 99), 1)]), rule: '1 m³ = 1.000 dm³ = 1.000 l' },
      { from: 'cm³', to: 'ml', k: 1, v: () => randInt(20, 900), rule: '1 cm³ = 1 ml' },
      { from: 'cm³', to: 'l', k: 1 / 1000, v: () => pick([250, 500, 750, 1500, 2000, 330, 125]), rule: '1.000 cm³ = 1 dm³ = 1 l' },
      { from: 'l', to: 'cm³', k: 1000, v: () => pick([2, 3, D(randInt(11, 39), 1), D(randInt(1, 9), 1)]), rule: '1 l = 1 dm³ = 1.000 cm³' },
    ];
    const c = pick(cases);
    const v = c.v();
    const ans = R(v * c.k);
    const traps = [];
    if (c.k !== 1) traps.push(t(v, 'volum_capacitat', `${c.from} i ${c.to} no són equivalents: ${c.rule}.`));
    else traps.push(t(v * 1000, 'volum_capacitat', `${c.rule}: el nombre no canvia.`), t(v / 1000, 'volum_capacitat', `${c.rule}: el nombre no canvia.`));
    if (c.k !== 1) traps.push(t(c.k > 1 ? v * 100 : v / 100, 'factor_volum', `${c.rule}.`), t(c.k > 1 ? v / 1000 : v * 1000, 'direccio', `${c.rule}.`));
    return numEx({
      prompt: Q('Canvia d\'unitat:', `${f(v)} ${c.from} = <b>?</b> ${c.to}`),
      unit: c.to,
      answer: ans,
      traps,
      hint: 'Recorda: 1 dm³ = 1 l i 1 cm³ = 1 ml.',
      solution: `${c.rule}. Per tant, ${f(v)} ${c.from} = <b>${f(ans)} ${c.to}</b>`,
    });
  }

  function superficieVolum(level) {
    if (level === 1) return randConv(SUP, 1, [2, 3, 4, 5, 6], 1);
    if (level === 2) return Math.random() < 0.55 ? randConv(SUP, 2, [2, 3, 4, 5, 6], 2) : randConv(VOL, 2, [3, 4, 5, 6], 1);
    return run([volumCapacitat, volumCapacitat, hectarees, () => randConv(VOL, 2, [3, 4, 5], 2)]);
  }

  // ── 4. El temps ─────────────────────────────────────────────────────────────

  const hm = (h, m) => (m ? (h ? `${h} h ${m} min` : `${m} min`) : `${h} h`);
  const hora = (min) => `${Math.floor(min / 60) % 24}:${String(min % 60).padStart(2, '0')}`;
  const B100 = '1 hora té <b>60 minuts</b>, no 100.';

  function tempsSimple(level) {
    return run([
      () => {
        const h = randInt(2, level === 1 ? 6 : 12);
        return numEx({ prompt: Q('Quants minuts són?', `${h} h = <b>?</b> min`), unit: 'min', answer: h * 60,
          traps: [t(h * 100, 'base_100', B100), t(h * 10, 'base_100', B100)], hint: '1 h = 60 min.', solution: `${h} · 60 = <b>${h * 60} min</b>` });
      },
      () => {
        const m = randInt(2, 9);
        return numEx({ prompt: Q('Quants segons són?', `${m} min = <b>?</b> s`), unit: 's', answer: m * 60,
          traps: [t(m * 100, 'base_100', '1 minut té <b>60 segons</b>, no 100.')], hint: '1 min = 60 s.', solution: `${m} · 60 = <b>${m * 60} s</b>` });
      },
      () => {
        const h = randInt(1, 4);
        const m = randInt(5, 55);
        const ans = h * 60 + m;
        return numEx({ prompt: Q('Quants minuts són en total?', `${h} h ${m} min = <b>?</b> min`), unit: 'min', answer: ans,
          traps: [t(h * 100 + m, 'base_100', `${B100} ${h} h = ${h * 60} min.`), t(h + m, 'forma_complexa', `Primer passa les hores a minuts: ${h} h = ${h * 60} min.`), t(h * 60, 'altre', `No t'oblidis de sumar els ${m} minuts.`)],
          hint: 'Passa les hores a minuts i suma els minuts que queden.', solution: `${h} · 60 + ${m} = ${h * 60} + ${m} = <b>${ans} min</b>` });
      },
      () => {
        const [txt, ans, wrong] = pick([['mitja hora', 30, 50], ['un quart d\'hora', 15, 25], ['tres quarts d\'hora', 45, 75], ['una hora i mitja', 90, 150], ['dues hores i quart', 135, 225], ['una hora i tres quarts', 105, 175]]);
        return numEx({ prompt: Q(`Quants minuts són <b>${txt}</b>?`), unit: 'min', answer: ans,
          traps: [t(wrong, 'base_100', `${B100} Mitja hora = 30 min i un quart d'hora = 15 min.`)], hint: 'Mitja hora són 30 min; un quart, 15 min.', solution: `${txt[0].toUpperCase()}${txt.slice(1)} = <b>${ans} min</b>` });
      },
    ]);
  }

  function minutsAHores() {
    const h = randInt(1, 4);
    const m = randInt(5, 55);
    const tot = h * 60 + m;
    const opts = [{ label: hm(h, m), correct: true }];
    if (tot % 100 < 60 && Math.floor(tot / 100) > 0) opts.push({ label: hm(Math.floor(tot / 100), tot % 100), id: 'base_100', msg: `${B100} ${tot} min = ${h} · 60 + ${m}.` });
    opts.push({ label: hm(h, (m + 10) % 60 || 10) });
    opts.push({ label: hm(h + 1, m) });
    opts.push({ label: hm(h - 1 > 0 ? h - 1 : h + 2, m) });
    return choiceEx({
      prompt: Q('Quantes hores i minuts són?', `${tot} min`),
      options: opts.slice(0, 4),
      hint: `Busca quantes vegades caben 60 minuts dins de ${tot}.`,
      solution: `${tot} : 60 = ${h} i en sobren ${m}. ${tot} min = <b>${hm(h, m)}</b>`,
    });
  }

  function durada() {
    const s = randInt(7 * 12, 19 * 12) * 5;
    const d = randInt(5, 40) * 5;
    const e = s + d;
    const as100 = (x) => Math.floor(x / 60) * 100 + (x % 60);
    const [tren, verb] = pick([['El tren surt', 'arriba'], ['La pel·lícula comença', 'acaba'], ['L\'excursió comença', 'acaba'], ['L\'autobús surt', 'arriba']]);
    return numEx({
      prompt: Q(`${tren} a les <b>${hora(s)}</b> i ${verb} a les <b>${hora(e)}</b>. Quants minuts dura?`),
      unit: 'min',
      answer: d,
      traps: [t(as100(e) - as100(s), 'base_100', `No pots restar les hores com si fossin nombres normals: ${B100} Compta els minuts fins a l'hora en punt i després la resta.`)],
      hint: `Compta de ${hora(s)} fins a l'hora en punt, i després fins a ${hora(e)}.`,
      solution: `De ${hora(s)} a ${hora(e)} hi ha ${hm(Math.floor(d / 60), d % 60)} = <b>${d} min</b>`,
    });
  }

  function horesDecimals() {
    const [x, ans] = pick([[1.5, 90], [2.5, 150], [0.5, 30], [1.25, 75], [0.75, 45], [2.25, 135], [3.5, 210]]);
    return numEx({
      prompt: Q('Quants minuts són?', `${f(x)} h = <b>?</b> min`),
      unit: 'min',
      answer: ans,
      traps: [t(x * 100, 'base_100', `${B100} ${f(x)} h = ${f(x)} · 60 min.`), t(Math.floor(x) * 60 + Math.round((x % 1) * 100), 'base_100', `${f(x)} h no és ${Math.floor(x)} h ${Math.round((x % 1) * 100)} min: la part decimal és una fracció d'hora (0,5 h = mitja hora = 30 min).`)],
      hint: 'Multiplica les hores per 60. Recorda: 0,5 h = mitja hora.',
      solution: `${f(x)} · 60 = <b>${ans} min</b>`,
    });
  }

  function sumaDurades() {
    const a = randInt(0, 3);
    const c = randInt(1, 3);
    const b = randInt(20, 55);
    const d = randInt(60 - b + 5, 55);
    const tot = (a + c) * 60 + b + d;
    const H = Math.floor(tot / 60);
    const M = tot % 60;
    return choiceEx({
      prompt: Q('Suma aquestes dues durades:', `${hm(a, b)} + ${hm(c, d)}`),
      options: [
        { label: hm(H, M), correct: true },
        { label: `${a + c} h ${b + d} min`, id: 'portar_60', msg: `${b + d} minuts són més d'una hora: ${b + d} min = 1 h ${M} min. Suma aquesta hora a les altres.` },
        { label: hm(a + c, M), id: 'portar_60', msg: `Has tret 60 minuts però no has sumat l'hora que en surt: ${b + d} min = 1 h ${M} min.` },
        { label: hm(H, (M + 10) % 60) },
      ],
      hint: 'Suma les hores i els minuts per separat. Si tens 60 minuts o més, converteix-ne 60 en 1 hora.',
      solution: `${a + c} h ${b + d} min, i ${b + d} min = 1 h ${M} min. Total: <b>${hm(H, M)}</b>`,
    });
  }

  function horaFinal() {
    const sm = randInt(25, 55);
    const s = randInt(8, 18) * 60 + sm;
    const dh = randInt(1, 2);
    const dm = randInt(Math.max(5, 65 - sm), 55);
    const e = s + dh * 60 + dm;
    const [what, verb] = pick([['La pel·lícula comença', 'acaba'], ['El tren surt', 'arriba'], ['El partit comença', 'acaba']]);
    return choiceEx({
      prompt: Q(`${what} a les <b>${hora(s)}</b> i dura <b>${hm(dh, dm)}</b>. A quina hora ${verb}?`),
      options: [
        { label: hora(e), correct: true },
        { label: `${Math.floor(s / 60) + dh}:${sm + dm}`, id: 'portar_60', msg: `${sm + dm} minuts són més d'una hora: ${sm + dm} min = 1 h ${(sm + dm) - 60} min.` },
        { label: hora(e - 60), id: 'portar_60', msg: `${sm + dm} min = 1 h ${(sm + dm) - 60} min: no t'oblidis de sumar aquesta hora.` },
        { label: hora(e + 10) },
      ],
      hint: 'Suma primer les hores i després els minuts. Si passes de 60 minuts, suma 1 hora.',
      solution: `${hora(s)} + ${dh} h = ${hora(s + dh * 60)}. ${hora(s + dh * 60)} + ${dm} min = <b>${hora(e)}</b>`,
    });
  }

  function segons() {
    const h = randInt(1, 2);
    const m = randInt(2, 50);
    const s = randInt(5, 55);
    const ans = h * 3600 + m * 60 + s;
    return numEx({
      prompt: Q('Quants segons són en total?', `${h} h ${m} min ${s} s = <b>?</b> s`),
      unit: 's',
      answer: ans,
      traps: [t(h * 10000 + m * 100 + s, 'base_100', 'Les hores i els minuts no van de 100 en 100: 1 h = 3.600 s i 1 min = 60 s.'), t(h * 60 + m * 60 + s, 'altre', `1 h no són 60 s: 1 h = 60 min = 3.600 s.`)],
      hint: '1 h = 3.600 s i 1 min = 60 s.',
      solution: `${h} · 3.600 + ${m} · 60 + ${s} = ${f(h * 3600)} + ${f(m * 60)} + ${s} = <b>${f(ans)} s</b>`,
    });
  }

  function temps(level) {
    if (level === 1) return tempsSimple(1);
    if (level === 2) return run([minutsAHores, durada, durada, horesDecimals, () => tempsSimple(2)]);
    return run([sumaDurades, horaFinal, horaFinal, segons]);
  }

  // ── 5. Angles ───────────────────────────────────────────────────────────────

  const gm = (g, m) => (m ? `${g}° ${m}′` : `${g}°`);
  const ANGLES = [
    { id: 'agut', name: 'agut', test: (a) => a < 90 },
    { id: 'recte', name: 'recte', test: (a) => a === 90 },
    { id: 'obtus', name: 'obtús', test: (a) => a > 90 && a < 180 },
    { id: 'pla', name: 'pla', test: (a) => a === 180 },
  ];
  const ANGLE_RULE = 'Agut: menys de 90°. Recte: 90°. Obtús: entre 90° i 180°. Pla: 180°.';

  function tipusAngle() {
    const a = pick([randInt(5, 85), randInt(5, 85), 90, randInt(95, 175), randInt(95, 175), 180]);
    const right = ANGLES.find((x) => x.test(a));
    return choiceEx({
      prompt: Q('Quin tipus d\'angle és?', `${a}°`),
      options: ANGLES.map((x) => (x === right ? { label: `Angle ${x.name}`, correct: true }
        : { label: `Angle ${x.name}`, id: 'tipus_angle', msg: `Un angle de ${a}° és <b>${right.name}</b>. ${ANGLE_RULE}` })),
      hint: ANGLE_RULE,
      solution: `${a}° → <b>angle ${right.name}</b>. ${ANGLE_RULE}`,
    });
  }

  function anglesMinuts(level) {
    if (level === 1) {
      const toSec = Math.random() < 0.35;
      const g = randInt(2, 9);
      return numEx({
        prompt: Q(toSec ? 'Quants segons són?' : 'Quants minuts són?', toSec ? `${g}′ = <b>?</b> ″` : `${g}° = <b>?</b> ′`),
        unit: toSec ? '″' : '′',
        answer: g * 60,
        traps: [t(g * 100, 'base_100', toSec ? '1 minut d\'angle té <b>60″</b>, no 100.' : '1 grau té <b>60 minuts (60′)</b>, no 100.')],
        hint: toSec ? '1′ = 60″' : '1° = 60′',
        solution: `${g} · 60 = <b>${g * 60}${toSec ? '″' : '′'}</b>`,
      });
    }
    const g = randInt(1, 9);
    const m = randInt(5, 55);
    const ans = g * 60 + m;
    return numEx({
      prompt: Q('Quants minuts són en total?', `${gm(g, m)} = <b>?</b> ′`),
      unit: '′',
      answer: ans,
      traps: [t(g * 100 + m, 'base_100', `1° = 60′, no 100′. ${g}° = ${g * 60}′.`), t(g + m, 'forma_complexa', `Primer passa els graus a minuts: ${g}° = ${g * 60}′.`)],
      hint: 'Passa els graus a minuts (· 60) i suma els minuts.',
      solution: `${g} · 60 + ${m} = ${g * 60} + ${m} = <b>${ans}′</b>`,
    });
  }

  function complementari() {
    const supl = Math.random() < 0.5;
    const tot = supl ? 180 : 90;
    const a = supl ? pick([randInt(10, 85), randInt(95, 170)]) : randInt(5, 85);
    const ans = tot - a;
    return numEx({
      prompt: Q(`Quant mesura l'angle <b>${supl ? 'suplementari' : 'complementari'}</b> d'un angle de ${a}°?`),
      unit: '°',
      answer: ans,
      traps: [t((supl ? 90 : 180) - a, 'compl_supl', `Dos angles ${supl ? 'suplementaris sumen <b>180°</b>' : 'complementaris sumen <b>90°</b>'}. ${supl ? 'Els que sumen 90° són els complementaris.' : 'Els que sumen 180° són els suplementaris.'}`)],
      hint: 'Complementaris: sumen 90°. Suplementaris: sumen 180°.',
      solution: `${tot}° − ${a}° = <b>${ans}°</b>`,
    });
  }

  function triangle() {
    const a = randInt(25, 90);
    const b = randInt(20, 150 - a);
    const ans = 180 - a - b;
    return numEx({
      prompt: Q(`Dos angles d'un triangle mesuren <b>${a}°</b> i <b>${b}°</b>. Quant mesura el tercer?`),
      unit: '°',
      answer: ans,
      traps: [t(360 - a - b, 'suma_triangle', 'Els angles d\'un triangle sumen <b>180°</b> (360° és la suma dels d\'un quadrilàter).'), t(90 - a - b, 'suma_triangle', 'Els angles d\'un triangle sumen <b>180°</b>.')],
      hint: 'Els tres angles d\'un triangle sumen 180°.',
      solution: `180° − ${a}° − ${b}° = <b>${ans}°</b>`,
    });
  }

  function sumaAngles() {
    const g1 = randInt(10, 70);
    const g2 = randInt(10, 70);
    const m1 = randInt(25, 55);
    const m2 = randInt(65 - m1, 55);
    const M = m1 + m2 - 60;
    return choiceEx({
      prompt: Q('Suma aquests angles:', `${gm(g1, m1)} + ${gm(g2, m2)}`),
      options: [
        { label: gm(g1 + g2 + 1, M), correct: true },
        { label: `${g1 + g2}° ${m1 + m2}′`, id: 'portar_60', msg: `${m1 + m2}′ són més de 60′: ${m1 + m2}′ = 1° ${M}′. Suma aquest grau als altres.` },
        { label: gm(g1 + g2, M), id: 'portar_60', msg: `Has tret 60′ però no has sumat el grau que en surt: ${m1 + m2}′ = 1° ${M}′.` },
        { label: gm(g1 + g2 + 1, M >= 50 ? M - 10 : M + 10) },
      ],
      hint: 'Suma graus amb graus i minuts amb minuts. Si passes de 60′, converteix-ne 60 en 1°.',
      solution: `${g1 + g2}° ${m1 + m2}′ = <b>${gm(g1 + g2 + 1, M)}</b>, perquè ${m1 + m2}′ = 1° ${M}′.`,
    });
  }

  function restaAngles() {
    const supl = Math.random() < 0.4;
    const tot = supl ? 180 : 90;
    const g = randInt(15, tot - 15);
    const m = randInt(5, 55);
    const G = tot - 1 - g;
    const M = 60 - m;
    return choiceEx({
      prompt: Q(`Quant mesura l'angle ${supl ? 'suplementari' : 'complementari'} de <b>${gm(g, m)}</b>?`),
      options: [
        { label: gm(G, M), correct: true },
        { label: gm(tot - g, m), id: 'portar_60', msg: `${tot}° no té minuts: per restar, converteix 1° en 60′. ${tot}° = ${tot - 1}° 60′.` },
        { label: gm(G, 100 - m), id: 'base_100', msg: `1° = 60′, no 100′: ${tot}° = ${tot - 1}° 60′, i 60′ − ${m}′ = ${M}′.` },
        { label: gm(tot - g, M) },
      ],
      hint: `Escriu ${tot}° com ${tot - 1}° 60′ i resta graus amb graus i minuts amb minuts.`,
      solution: `${tot}° = ${tot - 1}° 60′. ${gm(tot - 1, 60)} − ${gm(g, m)} = <b>${gm(G, M)}</b>`,
    });
  }

  function angles(level) {
    if (level === 1) return run([tipusAngle, tipusAngle, () => anglesMinuts(1)]);
    if (level === 2) return run([complementari, complementari, triangle, () => anglesMinuts(2)]);
    return run([sumaAngles, restaAngles, restaAngles, triangle]);
  }

  // ── 6. Perímetres i àrees ───────────────────────────────────────────────────

  function rectangle() {
    const sq = Math.random() < 0.35;
    const u = pick(['cm', 'm']);
    const b = randInt(3, 15);
    let h = sq ? b : randInt(2, 12);
    if (!sq && h === b) h = b + 1;
    const area = Math.random() < 0.5;
    const A = b * h;
    const P = 2 * (b + h);
    const name = sq ? 'quadrat' : 'rectangle';
    const data = sq ? `costat = ${b} ${u}` : `base = ${b} ${u}, altura = ${h} ${u}`;
    const traps = area
      ? [t(P, 'perimetre_area', `${f(P)} és el perímetre (la vora). L'àrea és el que hi ha a dins: ${sq ? 'costat · costat' : 'base · altura'}.`), t(sq ? 2 * b : b + h, sq ? 'quadrat_doble' : 'perimetre_area', sq ? `L'àrea del quadrat és costat · costat = ${b} · ${b}, no ${b} · 2.` : 'Per a l\'àrea cal multiplicar, no sumar.'), t(A / 2, 'meitat_de_mes', 'El rectangle i el quadrat no es divideixen entre 2: àrea = base · altura.')]
      : [t(A, 'perimetre_area', `${f(A)} és l'àrea. El perímetre és la suma de tots els costats.`), t(sq ? 2 * b : b + h, 'meitat_perimetre', `Has sumat només dos costats. ${sq ? 'El quadrat en té quatre: 4 · costat.' : 'El rectangle en té quatre: 2 · (base + altura).'}`)];
    const problem = !sq && Math.random() < 0.35;
    let prompt;
    if (problem && area) prompt = Q(`Volem posar gespa en un jardí rectangular de <b>${b} m</b> per <b>${h} m</b>. Quants m² de gespa calen?`);
    else if (problem) prompt = Q(`Volem tancar amb una tanca un hort rectangular de <b>${b} m</b> per <b>${h} m</b>. Quants metres de tanca calen?`);
    else prompt = QF(`Calcula ${area ? 'l\'àrea' : 'el perímetre'} d'aquest ${name}:`, FIG.rect(b, h, `${b} ${u}`, `${h} ${u}`), data);
    const uu = problem ? 'm' : u;
    return numEx({
      prompt,
      unit: area ? `${uu}²` : uu,
      answer: area ? A : P,
      traps,
      hint: area ? `Àrea del ${name}: ${sq ? 'costat · costat' : 'base · altura'}.` : `Perímetre: suma dels quatre costats.`,
      solution: area ? `${b} · ${h} = <b>${A} ${uu}²</b>` : (sq ? `4 · ${b} = <b>${P} ${uu}</b>` : `${b} + ${h} + ${b} + ${h} = <b>${P} ${uu}</b>`),
    });
  }

  /** Dues mides amb producte parell (perquè la meitat sigui un enter). */
  function evenPair(lo, hi) {
    let a;
    let b;
    do { a = randInt(lo, hi); b = randInt(lo, hi); } while ((a * b) % 2 || a === b);
    return [a, b];
  }

  function areaPoligon() {
    const u = pick(['cm', 'm']);
    return run([
      () => {
        const [b, h] = evenPair(3, 14);
        const A = (b * h) / 2;
        return numEx({
          prompt: QF('Calcula l\'àrea d\'aquest triangle:', FIG.tri(b, h, `${b} ${u}`, `${h} ${u}`), `base = ${b} ${u}, altura = ${h} ${u}`),
          unit: `${u}²`, answer: A,
          traps: [t(b * h, 'oblida_meitat', `Un triangle és la meitat d'un rectangle: cal dividir entre 2. ${b} · ${h} : 2 = ${A}.`), t(b + h, 'perimetre_area', 'L\'àrea es multiplica, no se suma.')],
          hint: 'Àrea del triangle = base · altura : 2.', solution: `${b} · ${h} : 2 = ${b * h} : 2 = <b>${A} ${u}²</b>`,
        });
      },
      () => {
        const b = randInt(5, 14);
        const h = randInt(3, 9);
        const side = h + randInt(1, 3);
        const A = b * h;
        return numEx({
          prompt: QF('Calcula l\'àrea d\'aquest paral·lelogram:', FIG.para(b, h, side, `${b} ${u}`, `${h} ${u}`, `${side} ${u}`), `base = ${b} ${u}, altura = ${h} ${u}, costat inclinat = ${side} ${u}`),
          unit: `${u}²`, answer: A,
          traps: [t(b * side, 'costat_inclinat', `L'altura és la línia de punts (${h} ${u}), no el costat inclinat (${side} ${u}).`), t(A / 2, 'meitat_de_mes', 'El paral·lelogram no es divideix entre 2: àrea = base · altura.')],
          hint: 'Àrea del paral·lelogram = base · altura (l\'altura és la línia de punts).', solution: `${b} · ${h} = <b>${A} ${u}²</b>`,
        });
      },
      () => {
        const [dd, dD] = evenPair(3, 14).sort((x, y) => x - y);
        const A = (dD * dd) / 2;
        return numEx({
          prompt: QF('Calcula l\'àrea d\'aquest rombe:', FIG.rombe(dD, dd, `${dD} ${u}`, `${dd} ${u}`), `diagonal gran = ${dD} ${u}, diagonal petita = ${dd} ${u}`),
          unit: `${u}²`, answer: A,
          traps: [t(dD * dd, 'oblida_meitat', `El rombe és la meitat del rectangle que fan les diagonals: cal dividir entre 2. ${dD} · ${dd} : 2 = ${A}.`), t(dD + dd, 'perimetre_area', 'L\'àrea es multiplica, no se suma.')],
          hint: 'Àrea del rombe = diagonal gran · diagonal petita : 2.', solution: `${dD} · ${dd} : 2 = ${dD * dd} : 2 = <b>${A} ${u}²</b>`,
        });
      },
      () => {
        let B;
        let b;
        let h;
        do { B = randInt(6, 14); b = randInt(2, B - 2); h = randInt(2, 9); } while (((B + b) * h) % 2);
        const A = ((B + b) * h) / 2;
        return numEx({
          prompt: QF('Calcula l\'àrea d\'aquest trapezi:', FIG.trap(B, b, h, `${B} ${u}`, `${b} ${u}`, `${h} ${u}`), `base gran = ${B} ${u}, base petita = ${b} ${u}, altura = ${h} ${u}`),
          unit: `${u}²`, answer: A,
          traps: [t((B + b) * h, 'oblida_meitat', `Cal dividir entre 2: (${B} + ${b}) · ${h} : 2 = ${A}.`), t((B * h) / 2, 'trapezi_bases', 'Has de sumar les dues bases: (base gran + base petita) · altura : 2.'), t(B * h, 'trapezi_bases', 'Has de sumar les dues bases i dividir entre 2.'), t(B * b * h, 'trapezi_bases', 'Les bases se sumen, no es multipliquen: (B + b) · h : 2.')],
          hint: 'Àrea del trapezi = (base gran + base petita) · altura : 2.', solution: `(${B} + ${b}) · ${h} : 2 = ${B + b} · ${h} : 2 = <b>${A} ${u}²</b>`,
        });
      },
    ]);
  }

  const REGULAR = [[5, 'pentàgon', 0.688], [6, 'hexàgon', 0.866], [8, 'octàgon', 1.207]];

  function poligonRegular() {
    const [n, name, k] = pick(REGULAR);
    const s = randInt(4, 12);
    const ap = D(Math.round(s * k * 10), 1);
    const P = n * s;
    const A = R((P * ap) / 2);
    return numEx({
      prompt: QF(`Calcula l'àrea d'aquest ${name} regular:`, FIG.regular(n, `${s} cm`, `${f(ap)} cm`), `costat = ${s} cm, apotema = ${f(ap)} cm`),
      unit: 'cm²',
      answer: A,
      traps: [t(P * ap, 'oblida_meitat', `Cal dividir entre 2: ${P} · ${f(ap)} : 2 = ${f(A)}.`), t(P, 'perimetre_area', `${P} cm és el perímetre. L'àrea és perímetre · apotema : 2.`), t((s * ap) / 2, 'perimetre_area', `Això és l'àrea d'un sol triangle. Un ${name} en té ${n}: fes servir el perímetre (${n} · ${s}).`)],
      hint: 'Àrea del polígon regular = perímetre · apotema : 2.',
      solution: `Perímetre = ${n} · ${s} = ${P} cm. Àrea = ${P} · ${f(ap)} : 2 = <b>${f(A)} cm²</b>`,
    });
  }

  function cercle() {
    const r = randInt(2, 12);
    const diam = Math.random() < 0.4;
    const area = Math.random() < 0.55;
    const d = 2 * r;
    const L = R(2 * PI * r);
    const A = R(PI * r * r);
    const given = diam ? `diàmetre = ${d} cm` : `radi = ${r} cm`;
    const traps = area
      ? [t(PI * 2 * r, 'quadrat_doble', `r² vol dir r · r = ${r} · ${r}, no ${r} · 2.`), t(PI * d * d, 'radi_diametre', `La fórmula fa servir el radi: ${d} : 2 = ${r} cm.`), t(L, 'perimetre_area', `${f(L)} cm és la longitud de la circumferència. L'àrea del cercle és 3,14 · r².`)]
      : [t(PI * r, 'radi_diametre', `La longitud és 2 · 3,14 · r (o 3,14 · diàmetre). T'has oblidat del 2.`), t(2 * PI * d, 'radi_diametre', `Si fas servir el diàmetre, no cal multiplicar per 2: 3,14 · ${d}.`), t(A, 'perimetre_area', `${f(A)} és l'àrea. La longitud de la circumferència és 2 · 3,14 · r.`)];
    return numEx({
      prompt: QF(area ? 'Calcula l\'àrea d\'aquest cercle (π = 3,14):' : 'Calcula la longitud d\'aquesta circumferència (π = 3,14):', FIG.circle(`${diam ? d : r} cm`, diam), given),
      unit: area ? 'cm²' : 'cm',
      answer: area ? A : L,
      traps,
      hint: area ? 'Àrea del cercle = 3,14 · r · r.' : 'Longitud = 2 · 3,14 · r.',
      solution: `${diam ? `r = ${d} : 2 = ${r} cm. ` : ''}${area ? `3,14 · ${r} · ${r} = <b>${f(A)} cm²</b>` : `2 · 3,14 · ${r} = <b>${f(L)} cm</b>`}`,
    });
  }

  function arees(level) {
    if (level === 1) return rectangle();
    if (level === 2) return areaPoligon();
    return run([poligonRegular, cercle, cercle]);
  }

  // ── 7. Volums ───────────────────────────────────────────────────────────────

  function cubOrtoedre() {
    const u = pick(['cm', 'm']);
    if (Math.random() < 0.35) {
      const a = randInt(2, 10);
      const V = a ** 3;
      return numEx({
        prompt: QF('Calcula el volum d\'aquest cub:', FIG.box(a, a, a, `${a} ${u}`, `${a} ${u}`, `${a} ${u}`), `aresta = ${a} ${u}`),
        unit: `${u}³`,
        answer: V,
        traps: [t(3 * a, 'suma_dimensions', `El volum es multiplica: ${a} · ${a} · ${a}, no ${a} + ${a} + ${a}.`), t(a * a, 'volum_area', `${a} · ${a} és l'àrea d'una cara. El volum és ${a} · ${a} · ${a}.`), t(6 * a * a, 'volum_area', 'Això és l\'àrea de les 6 cares, no el volum.')],
        hint: 'Volum del cub = aresta · aresta · aresta.',
        solution: `${a} · ${a} · ${a} = <b>${V} ${u}³</b>`,
      });
    }
    const l = randInt(3, 12);
    const w = randInt(2, 9);
    const h = randInt(2, 10);
    const V = l * w * h;
    return numEx({
      prompt: QF('Calcula el volum d\'aquest ortoedre (una capsa):', FIG.box(l, h, w, `${l} ${u}`, `${h} ${u}`, `${w} ${u}`), `llargada = ${l} ${u}, amplada = ${w} ${u}, altura = ${h} ${u}`),
      unit: `${u}³`,
      answer: V,
      traps: [t(l * w, 'volum_area', `${l} · ${w} és l'àrea de la base. Falta multiplicar per l'altura (${h}).`), t(l + w + h, 'suma_dimensions', 'El volum es multiplica, no se suma.')],
      hint: 'Volum de l\'ortoedre = llargada · amplada · altura.',
      solution: `${l} · ${w} · ${h} = <b>${V} ${u}³</b>`,
    });
  }

  function litres() {
    if (Math.random() < 0.3) {
      const l = randInt(4, 12);
      const w = randInt(2, 6);
      const V = l * w * randInt(2, 8);
      const h = V / (l * w);
      return numEx({
        prompt: Q(`Una capsa té un volum de <b>${V} cm³</b>. La base fa <b>${l} cm</b> per <b>${w} cm</b>. Quina altura té?`),
        unit: 'cm',
        answer: h,
        traps: [t(V / l, 'volum_area', `Has de dividir el volum entre l'àrea de la base (${l} · ${w} = ${l * w} cm²), no només entre ${l}.`), t(V - l * w, 'altre', 'Volum = base · altura; per trobar l\'altura, divideix el volum entre l\'àrea de la base.')],
        hint: 'Volum = àrea de la base · altura. Divideix el volum entre l\'àrea de la base.',
        solution: `Àrea de la base = ${l} · ${w} = ${l * w} cm². Altura = ${V} : ${l * w} = <b>${h} cm</b>`,
      });
    }
    const l = pick([20, 30, 40, 50, 60, 80, 100]);
    const w = pick([10, 20, 25, 30, 40]);
    const h = pick([10, 20, 25, 30, 40, 50]);
    const cm3 = l * w * h;
    const ans = R(cm3 / 1000);
    const what = pick(['Una peixera', 'Un dipòsit', 'Una caixa']);
    return numEx({
      prompt: QF(`${what} fa ${l} cm de llarg, ${w} cm d'ample i ${h} cm d'alt. Quants <b>litres</b> hi caben?`, FIG.box(l, h, w, `${l} cm`, `${h} cm`, `${w} cm`)),
      unit: 'l',
      answer: ans,
      traps: [t(cm3, 'volum_capacitat', `${f(cm3)} són cm³. Per passar a litres: 1.000 cm³ = 1 dm³ = 1 l, així que divideix per 1.000.`), t(cm3 / 100, 'factor_volum', 'De cm³ a dm³ hi ha un graó de ×1.000: divideix per 1.000.'), t(cm3 / 10, 'factor_volum', 'De cm³ a dm³ hi ha un graó de ×1.000: divideix per 1.000.'), t((l * w) / 1000, 'volum_area', 'Falta multiplicar per l\'altura.')],
      hint: 'Calcula el volum en cm³ i passa\'l a litres: 1.000 cm³ = 1 l.',
      solution: `${l} · ${w} · ${h} = ${f(cm3)} cm³ = ${f(ans)} dm³ = <b>${f(ans)} l</b>`,
    });
  }

  function prismaCilindre() {
    if (Math.random() < 0.45) {
      const [b, h] = evenPair(3, 10);
      const L = randInt(4, 15);
      const V = ((b * h) / 2) * L;
      return numEx({
        prompt: Q(`Un prisma té de base un triangle de <b>${b} cm</b> de base i <b>${h} cm</b> d'altura. El prisma fa <b>${L} cm</b> de llarg. Quin volum té?`),
        unit: 'cm³',
        answer: V,
        traps: [t(b * h * L, 'oblida_meitat', `L'àrea de la base (un triangle) porta «: 2»: ${b} · ${h} : 2 = ${(b * h) / 2} cm².`), t(b + h + L, 'suma_dimensions', 'El volum es multiplica, no se suma.')],
        hint: 'Volum del prisma = àrea de la base · llargada. La base és un triangle.',
        solution: `Base = ${b} · ${h} : 2 = ${(b * h) / 2} cm². Volum = ${(b * h) / 2} · ${L} = <b>${V} cm³</b>`,
      });
    }
    const r = randInt(1, 8);
    const h = randInt(2, 12);
    const diam = Math.random() < 0.35;
    const V = R(PI * r * r * h);
    return numEx({
      prompt: QF(`Calcula el volum d'aquest cilindre (π = 3,14):`, FIG.cylinder(diam ? `d = ${2 * r} cm` : `r = ${r} cm`, `${h} cm`), `${diam ? `diàmetre = ${2 * r} cm` : `radi = ${r} cm`}, altura = ${h} cm`),
      unit: 'cm³',
      answer: V,
      traps: [t(PI * 2 * r * h, 'quadrat_doble', `r² vol dir r · r = ${r} · ${r}, no ${r} · 2.`), t(PI * 4 * r * r * h, 'radi_diametre', `Fes servir el radi: ${2 * r} : 2 = ${r} cm.`), t(PI * r * r, 'volum_area', 'Això és l\'àrea de la base. Falta multiplicar per l\'altura.')],
      hint: 'Volum del cilindre = àrea de la base (3,14 · r · r) · altura.',
      solution: `${diam ? `r = ${2 * r} : 2 = ${r} cm. ` : ''}Base = 3,14 · ${r} · ${r} = ${f(R(PI * r * r))} cm². Volum = ${f(R(PI * r * r))} · ${h} = <b>${f(V)} cm³</b>`,
    });
  }

  function volums(level) {
    if (level === 1) return cubOrtoedre();
    if (level === 2) return litres();
    return prismaCilindre();
  }

  ML.mesura.generators = {
    longitud,
    massa_capacitat: massaCapacitat,
    superficie_volum: superficieVolum,
    temps,
    angles,
    arees,
    volums,
  };
  ML.mesura.FIG = FIG;
  ML.mesura.scales = { LONG, MASSA, CAP, SUP, VOL };
})(window.MathLab);
