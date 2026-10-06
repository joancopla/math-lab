# Math Lab 1r ESO

Web app de matemàtiques per a 1r d'ESO, en català, sense backend ni dependències.
Obre `index.html` amb el navegador (doble clic) i ja funciona. El progrés es desa al `localStorage` del navegador.

## Què hi ha

- **Potències** (primer mòdul), amb 7 apartats × 3 nivells:
  notació · càlcul · producte · quocient · potència d'una potència · exponents 0 i 1 · quadrats i cubs perfectes.
- Exercicis **generats aleatòriament**. Quan la resposta és incorrecta, es **detecta l'error típic** (p. ex. «2³ = 6»,
  «a³ · a⁴ = a¹²», «a⁰ = 0», «√36 = 18») i se n'explica el motiu, amb solució pas a pas.
- En pràctica es pot reintentar i demanar pistes. Una **estrella** per nivell quan s'hi fan 5 encerts seguits.
- **Visualització interactiva**: n¹ com a línia, n² com a àrea (amb la «L» que passa de n² a (n+1)²) i n³ com a volum
  isomètric; construcció pas a pas i mini-joc «Endevina».
- **Mode repte**: preguntes barrejades, 3 vides, dificultat adaptativa, ratxes amb multiplicador de punts, rècords i
  repàs dels errors en acabar.
- **Progrés**: ratxa de dies seguits, estrelles, encerts per nivell, rècords i errors que més es repeteixen.

## Estructura

```
index.html                  càrrega dels scripts (ordre: nucli → temes → vistes → app)
css/styles.css
js/core/                    nucli, comú a tots els temes
  utils.js                  aleatoris, format de nombres, HTML de potències…
  registry.js               registre de temes (MathLab.topics)
  checker.js                correcció i detecció d'errors (traps)
  storage.js                progrés a localStorage
  exercise-view.js          pinta qualsevol exercici i en gestiona el feedback
js/topics/
  potencies/                un tema = una carpeta
    errors.js               catàleg d'errors típics
    exercises.js            generadors per apartat i nivell
    visual.js               visualització interactiva
    index.js                registra el tema
  properament.js            temes «Aviat» que surten a l'inici
js/views/                   pantalles: inici, tema, pràctica, visualització, repte, progrés
js/app.js                   router per hash (#/tema/potencies/…)
tests/generators.test.js    prova de robustesa dels generadors
```

Són scripts clàssics (no mòduls ES) a propòsit: així l'app funciona obrint el fitxer directament, sense servidor.

## Com afegir un tema nou (p. ex. divisibilitat)

1. Crea `js/topics/divisibilitat/` amb `errors.js`, `exercises.js` i `index.js` (copia l'estructura de `potencies`).
2. A `index.js`, registra'l:

   ```js
   MathLab.topics.register({
     id: 'divisibilitat', title: 'Divisibilitat', icon: '÷', color: '#e0703a',
     description: '…',
     errors: { confon_multiple_divisor: { title: '…', explain: '…' } },
     skills: [{ id: 'multiples', title: 'Múltiples', summary: '…', theory: '<p>…</p>',
                levels: ['…', '…', '…'], generate: (level) => ({ /* exercici */ }) }],
     visuals: [],   // opcional: [{ id, title, description, mount(container) → cleanup }]
   });
   ```
3. Treu-lo de `js/topics/properament.js` i afegeix els scripts a `index.html` i a `tests/generators.test.js`.

El mode repte, la pàgina de progrés i les estrelles funcionen automàticament per a qualsevol tema registrat.

### Contracte d'un exercici

```js
{
  prompt: 'html',
  input: { type: 'number' }                       // un nombre
       | { type: 'power' }                        // base + exponent (la base pot ser una lletra)
       | { type: 'choice', options: [{ value, label }] },
  answer: 42 | { base: 2, exp: 5 } | 'b',
  traps: [                                         // respostes errònies previsibles
    { match: 10, id: 'base_per_exponent', msg: 'Has multiplicat la base per l\'exponent…' },
    { test: (v) => v > 100, id: '…', msg: '…' },
  ],
  hint: 'html', solution: 'html',
}
```

Si la resposta no coincideix amb cap parany, el corrector en fa un diagnòstic genèric (per a potències: mateix valor
amb una altra base, base canviada o exponent incorrecte).

## Proves

```
node tests/generators.test.js        # 3.000 exercicis per apartat i nivell
```

Comprova que la resposta correcta s'accepta, que cap parany es dona per bo, que no hi ha `NaN`/`undefined` als
textos, que les opcions no es repeteixen i que tots els errors existeixen al catàleg.
