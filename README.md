# Math Lab 1r ESO

Web app de matemàtiques per a 1r d'ESO (i un tema de 6è de primària), en català, sense backend ni dependències.
Obre `index.html` amb el navegador (doble clic) i ja funciona. El progrés es desa al `localStorage` del navegador.

## Què hi ha

- **Selector de curs** a dalt de tot: **1r ESO** (per defecte) o **6è**. Només es mostren els temes del curs triat
  (inici, menú, estrelles, progrés i exàmens). El curs es desa; un enllaç a un tema de l'altre curs hi canvia sol.
- **Potències** (primer mòdul), amb 7 apartats × 3 nivells:
  notació · càlcul · producte · quocient · potència d'una potència · exponents 0 i 1 · quadrats i cubs perfectes.
- **Divisibilitat** (segon mòdul), amb 7 apartats × 3 nivells:
  múltiples i divisors · criteris de divisibilitat · primers i compostos · descomposició en factors primers · mcd · mcm ·
  problemes de mcd i mcm. Errors típics detectats: confondre múltiple i divisor, «1 és primer», «tots els senars són
  primers», mirar l'última xifra per al 3, factors no primers a la descomposició, mcm = producte, mcd ↔ mcm…
  Tres visualitzacions: divisors amb rectangles, el garbell d'Eratòstenes i la descomposició pas a pas (taula de divisions).
- **Nombres enters** (tercer mòdul), amb 7 apartats × 3 nivells:
  què és un enter (valor absolut i oposat) · ordenar i comparar · sumar i restar · multiplicar i dividir ·
  operacions combinades · potències d'enters · problemes. Errors típics: «−8 > −3», «(−3) + (−5) = 8»,
  «5 − (−3) = 2», «(−2)⁴ = −16», «−2⁴ = 16», oblidar el signe menys… Les respostes poden ser negatives: el camp
  té un botó +/− perquè el teclat numèric del mòbil sovint no té el signe menys.
  Dues visualitzacions: la recta numèrica (sumar i restar com a desplaçaments) i sumar amb fitxes (+ i − s'anul·len).
- **Fraccions** (quart mòdul), amb 7 apartats × 3 nivells:
  què és una fracció · equivalents i simplificar · comparar i ordenar · sumar i restar · multiplicar i dividir ·
  operacions combinades · problemes. Errors típics: «1/2 + 1/3 = 2/5», «1/5 + 2/5 = 3/10», «1/8 > 1/3»,
  sumar el mateix a dalt i a baix, dividir sense invertir, «1/4 del que queda» calculat sobre el total…
  La resposta es pot escriure com a fracció (numerador i denominador); si el valor és bo però no és irreductible,
  l'app ho diu. Dues visualitzacions: barres de fraccions (equivalents i comparar) i sumar amb barres, pas a pas.
- **Nombres decimals** (cinquè mòdul), amb 7 apartats × 3 nivells:
  què és un decimal · ordenar i comparar · arrodonir · sumar i restar · multiplicar · dividir · problemes.
  Errors típics: «0,45 > 0,5», «5 centèsimes = 0,5», tallar en lloc d'arrodonir, no alinear la coma,
  «5 − 2,3 = 3,3», «2,5 · 10 = 2,50», «0,3 · 0,2 = 0,6», oblidar la coma del quocient… La resposta s'accepta amb coma
  o amb punt («3,25» o «3.25»). Dues visualitzacions: la quadrícula de centèsimes i la taula de valor de posició
  (multiplicar i dividir per 10, 100 i 1.000).
- **6è de primària · Mesura**, amb 7 apartats × 3 nivells:
  longitud · massa i capacitat · unitats de superfície i volum (hectàrees, litres) · el temps · els angles (graus i minuts,
  complementaris, triangles) · perímetres i àrees (fins al polígon regular i el cercle) · volums (cub, ortoedre, prisma,
  cilindre). Errors típics: multiplicar en lloc de dividir, comptar malament els graons, «2 m 5 cm = 25 cm», ·10 a la
  superfície, «1 h = 100 min», no passar 60 min a 1 h, complementari ↔ suplementari, oblidar el «: 2», radi ↔ diàmetre…
  La unitat de la resposta es mostra al costat de la casella. Dues visualitzacions: l'escala de les unitats i d'on surten
  les fórmules de les àrees (amb lliscadors sobre una quadrícula).
- Exercicis **generats aleatòriament**. Quan la resposta és incorrecta, es **detecta l'error típic** (p. ex. «2³ = 6»,
  «a³ · a⁴ = a¹²», «a⁰ = 0», «√36 = 18») i se n'explica el motiu, amb solució pas a pas.
- En pràctica es pot reintentar i demanar pistes. Es practica en **rondes de 10 exercicis** que acaben amb un resum
  (encerts, punts i errors per repassar). Una **estrella** per nivell quan s'hi fan 5 encerts seguits.
- **Objectiu diari** de 10 exercicis: la ratxa compta els dies que es compleix. Confeti i avisos en guanyar una estrella,
  complir l'objectiu, pujar de nivell al repte o batre un rècord.
- **Visualització interactiva**: n¹ com a línia, n² com a àrea (amb la «L» que passa de n² a (n+1)²) i n³ com a volum
  isomètric; construcció pas a pas i mini-joc «Endevina».
- **Producte i quocient, pas a pas**: explicació animada que avança amb «Següent»: les potències es despleguen
  en factors, es compten (3 + 4 = 7) o es ratllen per parelles (5 − 3 = 2), i acaba amb la regla i l'error típic.
  S'hi arriba des de «Visualitza» i des de la teoria de cada apartat (`#/tema/potencies/visual/pas-a-pas/quocient`).
- **Mode repte**: preguntes barrejades, 3 vides, dificultat adaptativa, ratxes amb multiplicador de punts, rècords i
  repàs dels errors en acabar.
- **Examen sorpresa** (`#/examen`): 10 preguntes de tots els temes (2 per tema), triades entre els apartats que menys
  s'han practicat i sense repetir enunciats d'exàmens anteriors. Sense pistes ni correcció fins al final; botó «No ho sé».
  En acabar: nota sobre 10 (Insuficient… Excel·lent) i repàs de cada pregunta amb l'error i la solució. Compta per a
  l'objectiu diari i els errors, però no per a les ratxes de les estrelles. Hi ha accés des de l'inici i des del progrés.
  També hi ha l'**examen d'un sol tema** (`#/examen/:tema`, des de la pàgina de cada tema): 10 preguntes, com a mínim
  una de cada apartat i en l'ordre del tema, i les que sobren dels apartats menys practicats.
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
    visual.js               visualització interactiva (àrees i volums)
    pas-a-pas.js            producte i quocient, pas a pas (accepta un apartat: mount(c, { tema }))
    index.js                registra el tema
  divisibilitat/            errors, exercicis, visual.js (rectangles), garbell.js, descomposicio.js, index.js
  enters/                   errors, exercicis, recta.js (recta numèrica), fitxes.js, index.js
  fraccions/                errors, exercicis, barres.js, suma.js (sumar amb barres), index.js
  decimals/                 errors, exercicis, quadricula.js, coma.js (per 10, 100 i 1.000), index.js
  mesura/                   (6è) errors, exercicis amb figures SVG, escala.js, figures.js, index.js
  properament.js            temes «Aviat» que surten a l'inici
js/views/                   pantalles: inici, tema, pràctica, visualització, repte, progrés
js/app.js                   router per hash (#/tema/potencies/…)
tests/generators.test.js    prova de robustesa dels generadors
```

Són scripts clàssics (no mòduls ES) a propòsit: així l'app funciona obrint el fitxer directament, sense servidor.

## Com afegir un tema nou (p. ex. proporcionalitat)

1. Crea `js/topics/proporcionalitat/` amb `errors.js`, `exercises.js` i `index.js` (copia l'estructura de `potencies` o `divisibilitat`).
2. A `index.js`, registra'l:

   ```js
   MathLab.topics.register({
     id: 'proporcionalitat', title: 'Proporcionalitat', icon: '%', color: '#8a5cd6',
     description: '…',
     errors: { regla_de_tres_girada: { title: '…', explain: '…' } },
     skills: [{ id: 'percentatges', title: 'Percentatges', summary: '…', theory: '<p>…</p>',
                levels: ['…', '…', '…'], generate: (level) => ({ /* exercici */ }) }],
     visuals: [],   // opcional: [{ id, title, description, mount(container) → cleanup }]
   });
   ```
3. Si el tema era a `js/topics/properament.js`, treu-lo d'allà. Afegeix els scripts a `index.html` i a `tests/generators.test.js`.

Per a un tema de 6è de primària, afegeix `course: '6e'` a la definició (per defecte és `'1eso'`; els cursos són a `js/core/registry.js`).

El mode repte, la pàgina de progrés i les estrelles funcionen automàticament per a qualsevol tema registrat. Opcionalment, `pathTitle` dona el títol del camí a l'inici («El camí de la divisibilitat»).

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
