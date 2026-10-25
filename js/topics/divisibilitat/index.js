/* Tema: Divisibilitat. Uneix el catàleg d'errors, els generadors i les visualitzacions, i registra el tema. */
(function (ML) {
  'use strict';

  const H = ML.utils.pw;
  const D = ML.divisibilitat;
  const G = D.generators;

  ML.topics.register({
    id: 'divisibilitat',
    title: 'Divisibilitat',
    pathTitle: 'El camí de la divisibilitat',
    icon: '÷',
    color: '#e0703a',
    description: 'Múltiples i divisors, criteris de divisibilitat, nombres primers, descomposició, mcd i mcm.',
    errors: D.errors,
    skills: [
      {
        id: 'multiples_divisors',
        rule: '12 = 3 · 4 → 12 és múltiple de 3',
        title: 'Múltiples i divisors',
        summary: 'Reconèixer múltiples i divisors i trobar tots els divisors d\'un nombre.',
        levels: ['Múltiple o no?', 'Llistes de divisors', 'Tots els divisors i múltiples més grans'],
        theory: `
          <p>Si una divisió és <b>exacta</b> (el residu és 0), els nombres estan relacionats:</p>
          <div class="formula">12 : 3 = 4 &nbsp;→&nbsp; 12 = 3 · 4</div>
          <ul>
            <li>12 és <b>múltiple</b> de 3 (i de 4).</li>
            <li>3 és <b>divisor</b> de 12. També diem que 12 és <b>divisible</b> per 3.</li>
          </ul>
          <p>Els múltiples d'un nombre s'obtenen multiplicant-lo: múltiples de 3 → 3, 6, 9, 12… (n'hi ha infinits).</p>
          <p>Els divisors es busquen per parelles: 12 = 1 · 12 = 2 · 6 = 3 · 4. Divisors de 12: 1, 2, 3, 4, 6, 12.</p>
          <p class="warn">⚠️ L'1 i el mateix nombre sempre són divisors.</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/divisibilitat/visual/rectangles">🟧 Mira-ho amb rectangles</a></p>`,
        generate: G.multiples_divisors,
      },
      {
        id: 'criteris',
        rule: '2, 5, 10: última xifra · 3, 9: suma de xifres',
        title: 'Criteris de divisibilitat',
        summary: 'Saber si un nombre és divisible per 2, 3, 4, 5, 6, 9, 10 o 11 sense dividir.',
        levels: ['Per 2, 5 i 10', 'Per 3 i 9', 'Per 4, 6, 9 i 11'],
        theory: `
          <p>Un nombre és divisible…</p>
          <ul>
            <li>per <b>2</b> si acaba en 0, 2, 4, 6 o 8;</li>
            <li>per <b>3</b> si la suma de les seves xifres és múltiple de 3;</li>
            <li>per <b>4</b> si les dues últimes xifres formen un múltiple de 4;</li>
            <li>per <b>5</b> si acaba en 0 o en 5;</li>
            <li>per <b>6</b> si ho és per 2 i per 3;</li>
            <li>per <b>9</b> si la suma de les seves xifres és múltiple de 9;</li>
            <li>per <b>10</b> si acaba en 0;</li>
            <li>per <b>11</b> si la diferència entre la suma de les xifres de posició senar i la de posició parella és 0 o múltiple d'11.</li>
          </ul>
          <div class="formula">5.742 → 5 + 7 + 4 + 2 = 18 → divisible per 3 i per 9</div>
          <p class="warn">⚠️ Per al 2, el 5 i el 10 mira l'última xifra. Per al 3 i el 9, suma-les totes.</p>`,
        generate: G.criteris,
      },
      {
        id: 'primers',
        rule: 'primer: només es divideix per 1 i per ell mateix',
        title: 'Nombres primers i compostos',
        summary: 'Distingir primers i compostos, i trobar divisors amagats.',
        levels: ['Primers fins a 50', 'Primers fins a 150', 'Compostos amagats'],
        theory: `
          <ul>
            <li>Un nombre és <b>primer</b> si té exactament dos divisors: l'1 i ell mateix. Per exemple, 7 (1 i 7).</li>
            <li>Un nombre és <b>compost</b> si en té més de dos. Per exemple, 15 (1, 3, 5 i 15).</li>
            <li>L'<b>1</b> no és ni primer ni compost: només té un divisor.</li>
          </ul>
          <p>Primers fins a 50: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47.</p>
          <p class="warn">⚠️ El 2 és l'únic primer parell. I no tots els senars són primers: 9, 21, 51 o 91 són compostos.</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/divisibilitat/visual/garbell">🔎 El garbell d'Eratòstenes</a></p>`,
        generate: G.primers,
      },
      {
        id: 'factoritzacio',
        rule: `72 = ${H(2, 3)} · ${H(3, 2)}`,
        title: 'Descomposició en factors primers',
        summary: 'Escriure un nombre com a producte de nombres primers.',
        levels: ['Nombres fins a 60', 'Nombres fins a 200', 'Nombres fins a 1.000'],
        theory: `
          <p>Tot nombre compost es pot escriure com un producte de nombres primers. Dividim pel primer més petit possible fins a arribar a 1:</p>
          <div class="formula">72 : 2 = 36 → 36 : 2 = 18 → 18 : 2 = 9 → 9 : 3 = 3 → 3 : 3 = 1</div>
          <p>Així, 72 = 2 · 2 · 2 · 3 · 3 = ${H(2, 3)} · ${H(3, 2)}.</p>
          <p class="warn">⚠️ Tots els factors han de ser primers: 72 = 8 · 9 és correcte com a producte, però no és la descomposició en factors primers.</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/divisibilitat/visual/descomposicio">🪜 Mira-ho pas a pas</a></p>`,
        generate: G.factoritzacio,
      },
      {
        id: 'mcd',
        rule: 'mcd: factors comuns amb l\'exponent més petit',
        title: 'Màxim comú divisor (mcd)',
        summary: 'El divisor més gran que tenen en comú dos o més nombres.',
        levels: ['Amb llistes de divisors', 'Amb factors primers', 'Tres nombres i primers entre si'],
        theory: `
          <p>El <b>mcd</b> és el divisor comú més gran.</p>
          <p><b>Amb llistes:</b> divisors de 12 → 1, 2, 3, 4, <b>6</b>, 12; divisors de 18 → 1, 2, 3, <b>6</b>, 9, 18. mcd(12, 18) = 6.</p>
          <p><b>Amb factors primers:</b> s'agafen els factors <b>comuns</b> amb l'exponent <b>més petit</b>.</p>
          <div class="formula">12 = ${H(2, 2)} · 3 &nbsp; 18 = 2 · ${H(3, 2)} &nbsp;→&nbsp; mcd = 2 · 3 = 6</div>
          <p>Si el mcd és 1, els nombres són <b>primers entre si</b>.</p>
          <p class="warn">⚠️ El mcd no pot ser més gran que el més petit dels nombres.</p>`,
        generate: G.mcd,
      },
      {
        id: 'mcm',
        rule: 'mcm: tots els factors amb l\'exponent més gran',
        title: 'Mínim comú múltiple (mcm)',
        summary: 'El múltiple més petit que tenen en comú dos o més nombres.',
        levels: ['Amb llistes de múltiples', 'Amb factors primers', 'Tres nombres i primers entre si'],
        theory: `
          <p>El <b>mcm</b> és el múltiple comú més petit (sense comptar el 0).</p>
          <p><b>Amb llistes:</b> múltiples de 4 → 4, 8, <b>12</b>, 16…; múltiples de 6 → 6, <b>12</b>, 18… mcm(4, 6) = 12.</p>
          <p><b>Amb factors primers:</b> s'agafen <b>tots</b> els factors amb l'exponent <b>més gran</b>.</p>
          <div class="formula">12 = ${H(2, 2)} · 3 &nbsp; 18 = 2 · ${H(3, 2)} &nbsp;→&nbsp; mcm = ${H(2, 2)} · ${H(3, 2)} = 36</div>
          <p class="warn">⚠️ El producte 4 · 6 = 24 és un múltiple comú, però no el més petit. El mcm no pot ser més petit que el més gran dels nombres.</p>`,
        generate: G.mcm,
      },
      {
        id: 'problemes',
        rule: 'coincidir → mcm · repartir en parts iguals → mcd',
        title: 'Problemes de mcd i mcm',
        summary: 'Decidir si un problema es resol amb el mcd o amb el mcm, i resoldre\'l.',
        levels: ['Quina operació cal?', 'Resoldre el problema', 'Problemes amb un pas més'],
        theory: `
          <ul>
            <li><b>mcm</b>: coses que es repeteixen cada cert temps i volem saber quan <b>tornaran a coincidir</b> (autobusos, alarmes, fars…).</li>
            <li><b>mcd</b>: hem de <b>repartir o tallar</b> en parts iguals, tan grans com sigui possible, sense que sobri res (bosses, trossos, rajoles…).</li>
          </ul>
          <p>Exemple: un autobús passa cada 12 minuts i un altre cada 18. Tornen a coincidir d'aquí a mcm(12, 18) = 36 minuts.</p>
          <p class="warn">⚠️ Quan tinguis el resultat, rellegeix la pregunta: de vegades cal un pas més.</p>`,
        generate: G.problemes,
      },
    ],
    visuals: [
      {
        id: 'rectangles',
        emoji: '🟧',
        title: 'Divisors amb rectangles',
        description: 'Quants rectangles pots fer amb 12 quadrets? Els costats són els divisors. I amb un nombre primer?',
        mount: D.visual.mount,
      },
      {
        id: 'garbell',
        emoji: '🔎',
        title: 'El garbell d\'Eratòstenes',
        description: 'Ratlla els múltiples de 2, 3, 5 i 7 i descobreix tots els nombres primers fins al 100.',
        mount: D.garbell.mount,
      },
      {
        id: 'descomposicio',
        emoji: '🪜',
        title: 'Descomposició pas a pas',
        description: 'Divideix pel primer més petit, una vegada i una altra, fins a arribar a 1.',
        mount: D.descomposicio.mount,
      },
    ],
  });
})(window.MathLab);
