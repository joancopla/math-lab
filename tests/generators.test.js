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
[
  'js/core/utils.js',
  'js/core/registry.js',
  'js/core/checker.js',
  'js/topics/potencies/errors.js',
  'js/topics/potencies/exercises.js',
  'js/topics/potencies/visual.js',
  'js/topics/potencies/index.js',
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
  return String(v);
}

const bad = /NaN|undefined|null|\[object/;

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

        if (type === 'number' && (!Number.isInteger(ex.answer) || ex.answer < 0)) fail(`${where}: resposta no natural`, ex);
        if (type === 'power' && (!Number.isInteger(ex.answer.exp) || ex.answer.exp < 0)) fail(`${where}: exponent no natural`, ex);

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

if (failures) {
  console.error(`\n${failures} errors`);
  process.exit(1);
}
console.log('\nTot correcte ✔');
