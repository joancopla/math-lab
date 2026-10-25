/* Prova de robustesa dels generadors: node tests/generators.test.js
 * Genera molts exercicis de cada apartat i nivell i comprova que són coherents:
 * la resposta correcta es valida com a correcta, cap parany coincideix amb la resposta,
 * no hi ha NaN/undefined al text i totes les opcions són diferents.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { window: {}, console, Math, Number, String, Array, Object, Set, JSON, Date };
ctx.window = ctx;
vm.createContext(ctx);

const root = path.join(__dirname, '..');

// Sintaxi de tots els scripts de l'app (també els de les vistes, que aquí no s'executen).
(function checkSyntax(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) checkSyntax(p);
    else if (f.endsWith('.js')) new vm.Script(fs.readFileSync(p, 'utf8'), { filename: path.relative(root, p) });
  }
})(path.join(root, 'js'));

[
  'js/core/utils.js',
  'js/core/registry.js',
  'js/core/checker.js',
  'js/topics/potencies/errors.js',
  'js/topics/potencies/exercises.js',
  'js/topics/potencies/visual.js',
  'js/topics/potencies/pas-a-pas.js',
  'js/topics/potencies/index.js',
  'js/topics/divisibilitat/errors.js',
  'js/topics/divisibilitat/exercises.js',
  'js/topics/divisibilitat/visual.js',
  'js/topics/divisibilitat/garbell.js',
  'js/topics/divisibilitat/descomposicio.js',
  'js/topics/divisibilitat/index.js',
  'js/topics/enters/errors.js',
  'js/topics/enters/exercises.js',
  'js/topics/enters/recta.js',
  'js/topics/enters/fitxes.js',
  'js/topics/enters/index.js',
  'js/topics/fraccions/errors.js',
  'js/topics/fraccions/exercises.js',
  'js/topics/fraccions/barres.js',
  'js/topics/fraccions/suma.js',
  'js/topics/fraccions/index.js',
  'js/topics/properament.js',
].forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));

const ML = ctx.MathLab;
const C = ML.checker;
const N = Number(process.argv[2]) || 3000;
let failures = 0;
const fail = (msg, ex) => {
  failures++;
  if (failures <= 25) console.error('✗', msg, ex ? JSON.stringify({ prompt: ex.prompt, answer: ex.answer }) : '');
};

/** Converteix un valor en l'entrada en brut que escriuria l'alumna. */
function toRaw(type, v) {
  if (type === 'power') return { base: String(v.base), exp: String(v.exp) };
  if (type === 'fraction') return { num: String(v.num), den: String(v.den) };
  return String(v);
}

const bad = /NaN|undefined|null|\[object/;
const gcdT = (a, b) => (b ? gcdT(b, a % b) : Math.abs(a));

for (const topic of ML.topics.available()) {
  const errorIds = new Set([...Object.keys(topic.errors), ...Object.keys(C.coreErrors)]);
  for (const skill of topic.skills) {
    for (const level of [1, 2, 3]) {
      const trapIds = new Set();
      for (let i = 0; i < N; i++) {
        let ex;
        try {
          ex = skill.generate(level);
        } catch (e) {
          fail(`${skill.id} n${level}: excepció ${e.message}`);
          continue;
        }
        const type = ex.input.type;
        const where = `${skill.id} n${level}`;
        const texts = [ex.prompt, ex.hint, ex.solution, ...(ex.traps || []).map((t) => t.msg)];
        if (type === 'choice') texts.push(...ex.input.options.map((o) => o.label));
        if (texts.some((s) => typeof s !== 'string' || bad.test(s))) fail(`${where}: text amb NaN/undefined`, ex);

        // La resposta correcta s'accepta.
        const ok = C.evaluate(ex, toRaw(type, ex.answer));
        if (!ok.valid || !ok.correct) fail(`${where}: la resposta correcta no es valida`, ex);

        if (type === 'number' && (!Number.isInteger(ex.answer) || (ex.answer < 0 && !ex.input.signed))) fail(`${where}: resposta no entera (o negativa sense input.signed)`, ex);
        if (Object.is(ex.answer, -0)) fail(`${where}: resposta −0`, ex);
        if (type === 'power' && (!Number.isInteger(ex.answer.exp) || ex.answer.exp < 0)) fail(`${where}: exponent no natural`, ex);
        if (type === 'fraction' && (!Number.isInteger(ex.answer.num) || !Number.isInteger(ex.answer.den) || ex.answer.den <= 0 || ex.answer.num < 0)) fail(`${where}: fracció no vàlida`, ex);
        if (type === 'fraction' && !ex.input.anyForm && gcdT(ex.answer.num, ex.answer.den) !== 1) fail(`${where}: la resposta (sense anyForm) no és irreductible`, ex);

        if (type === 'choice') {
          const labels = ex.input.options.map((o) => o.label);
          if (new Set(labels).size !== labels.length) fail(`${where}: opcions repetides`, ex);
          if (labels.length < 2) fail(`${where}: menys de 2 opcions`, ex);
          if (!ex.input.options.some((o) => o.value === ex.answer)) fail(`${where}: la resposta no és cap opció`, ex);
        }

        for (const t of ex.traps || []) {
          if (!errorIds.has(t.id)) fail(`${where}: error desconegut "${t.id}"`, ex);
          if (t.match === undefined) continue;
          if (C.key(type, t.match) === C.key(type, ex.answer)) continue; // s'ignora (coincideix amb la resposta)
          const r = C.evaluate(ex, toRaw(type, t.match));
          if (r.correct) fail(`${where}: un parany es dona per bo`, ex);
          else trapIds.add(r.trap.id);
        }
      }
      console.log(`✓ ${topic.id}/${skill.id} nivell ${level} — errors detectables: ${[...trapIds].sort().join(', ')}`);
    }
  }
}

// Comprovacions puntuals del corrector.
const ex = { input: { type: 'power' }, answer: { base: 2, exp: 6 }, traps: [] };
const r1 = C.evaluate(ex, { base: '4', exp: '3' });
if (r1.correct || r1.trap.id !== 'forma_equivalent') fail('4³ per 2⁶ hauria de ser forma_equivalent');
const r2 = C.evaluate({ input: { type: 'number' }, answer: 100000, traps: [] }, '100.000');
if (!r2.correct) fail('"100.000" hauria de valer 100000');
const r3 = C.evaluate({ input: { type: 'power' }, answer: { base: 'x', exp: 5 }, traps: [] }, { base: 'X', exp: '5' });
if (!r3.correct) fail('La base en majúscula hauria de valer');
const r4 = C.evaluate({ input: { type: 'number', signed: true }, answer: -5, traps: [] }, '−5');
if (!r4.correct) fail('"−5" (signe menys tipogràfic) hauria de valer −5');
const r5 = C.evaluate({ input: { type: 'number', signed: true }, answer: 5, traps: [] }, '+5');
if (!r5.correct) fail('"+5" hauria de valer 5');
const fx = { input: { type: 'fraction' }, answer: { num: 3, den: 4 }, traps: [] };
const r6 = C.evaluate(fx, { num: '6', den: '8' });
if (r6.correct || r6.trap.id !== 'fraccio_no_irreductible') fail('6/8 per 3/4 hauria de ser fraccio_no_irreductible');
const r7 = C.evaluate(Object.assign({}, fx, { input: { type: 'fraction', anyForm: true } }), { num: '6', den: '8' });
if (!r7.correct) fail('Amb anyForm, 6/8 hauria de valer per 3/4');
if (C.evaluate(fx, { num: '3', den: '0' }).valid) fail('Un denominador 0 no hauria de ser vàlid');

if (failures) {
  console.error(`\n${failures} errors`);
  process.exit(1);
}
console.log('\nTot correcte ✔');
