/* Tema: Fraccions. Uneix el catàleg d'errors, els generadors i les visualitzacions, i registra el tema. */
(function (ML) {
  'use strict';

  const U = ML.utils;
  const F = (n, d) => U.frac(String(n), String(d));
  const R = ML.fraccions;
  const G = R.generators;

  ML.topics.register({
    id: 'fraccions',
    title: 'Fraccions',
    pathTitle: 'El camí de les fraccions',
    icon: '½',
    color: '#d6457a',
    description: 'Què és una fracció, equivalents, comparar, sumar, restar, multiplicar, dividir i problemes.',
    errors: R.errors,
    skills: [
      {
        id: 'concepte',
        rule: `${F('a', 'b')}: a parts de b`,
        title: 'Què és una fracció',
        summary: 'Parts d\'un tot, com es llegeixen i la fracció d\'una quantitat.',
        levels: ['Figures, lectura i fracció d\'una quantitat', 'Parts d\'un grup', 'Trobar el total i fraccions d\'hora'],
        theory: `
          <p>Una <b>fracció</b> expressa parts iguals d'una unitat.</p>
          <div class="formula">${F(3, 4)}</div>
          <ul>
            <li><b>Numerador</b> (3, a dalt): les parts que prenem.</li>
            <li><b>Denominador</b> (4, a baix): les parts iguals que hi ha en total.</li>
          </ul>
          <p>Es llegeix «tres quarts». Els denominadors es llegeixen: 2 mitjos, 3 terços, 4 quarts, 5 cinquens, 6 sisens…</p>
          <p><b>Fracció d'una quantitat:</b> ${F(3, 4)} de 20 → 20 : 4 = 5 → 5 · 3 = 15.</p>
          <p class="warn">⚠️ El denominador compta <b>totes</b> les parts, també les que no estan pintades.</p>`,
        generate: G.concepte,
      },
      {
        id: 'equivalents',
        rule: `${F(2, 3)} = ${F(4, 6)} = ${F(6, 9)}`,
        title: 'Equivalents i simplificar',
        summary: 'Fraccions que valen el mateix, i com simplificar-les.',
        levels: ['Completar i simplificar', 'Simplificar en diversos passos', 'Simplificar pel mcd i productes en creu'],
        theory: `
          <p>Dues fraccions són <b>equivalents</b> si representen la mateixa part. S'obtenen multiplicant o dividint els dos termes pel mateix nombre:</p>
          <div class="formula">${F(2, 3)} = ${F('2 · 4', '3 · 4')} = ${F(8, 12)}</div>
          <p><b>Simplificar</b> és dividir els dos termes pel mateix nombre. Si es divideixen pel mcd, s'obté la fracció <b>irreductible</b> d'un sol cop: ${F(18, 24)} = ${F('18 : 6', '24 : 6')} = ${F(3, 4)}.</p>
          <p>Per saber si dues fraccions són equivalents, multiplica en creu: ${F(2, 3)} i ${F(8, 12)} → 2 · 12 = 24 = 3 · 8.</p>
          <p class="warn">⚠️ Sumar el mateix nombre a dalt i a baix no dona una fracció equivalent.</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/fraccions/visual/barres">📊 Mira-ho amb barres</a></p>`,
        generate: G.equivalents,
      },
      {
        id: 'comparar',
        rule: `${F(1, 3)} &gt; ${F(1, 5)} &nbsp; ${F(2, 3)} &gt; ${F(3, 5)}`,
        title: 'Comparar i ordenar',
        summary: 'Quina fracció és més gran, i ordenar-les.',
        levels: ['Mateix denominador o numerador', 'Denominadors diferents', 'Ordenar i fraccions equivalents'],
        theory: `
          <ul>
            <li><b>Mateix denominador</b>: és més gran la que té el numerador més gran. ${F(5, 8)} &gt; ${F(3, 8)}.</li>
            <li><b>Mateix numerador</b>: és més gran la que té el denominador <b>més petit</b> (trossos més grans). ${F(1, 3)} &gt; ${F(1, 5)}.</li>
            <li><b>Tots dos diferents</b>: redueix-les a denominador comú. ${F(2, 3)} = ${F(10, 15)} i ${F(3, 5)} = ${F(9, 15)}, per tant ${F(2, 3)} &gt; ${F(3, 5)}.</li>
          </ul>
          <p>Si el numerador és més gran que el denominador, la fracció és més gran que 1.</p>`,
        generate: G.comparar,
      },
      {
        id: 'suma_resta',
        rule: `${F(1, 2)} + ${F(1, 3)} = ${F(3, 6)} + ${F(2, 6)} = ${F(5, 6)}`,
        title: 'Sumar i restar',
        summary: 'Amb el mateix denominador i amb denominadors diferents.',
        levels: ['Mateix denominador', 'Denominadors diferents', 'Amb enters i tres fraccions'],
        theory: `
          <p><b>Mateix denominador</b>: se sumen (o resten) els numeradors i el denominador es queda igual.</p>
          <div class="formula">${F(2, 7)} + ${F(3, 7)} = ${F(5, 7)}</div>
          <p><b>Denominadors diferents</b>: primer cal reduir-les a denominador comú (el mcm dels denominadors).</p>
          <div class="formula">${F(1, 2)} + ${F(1, 3)} = ${F(3, 6)} + ${F(2, 6)} = ${F(5, 6)}</div>
          <p class="warn">⚠️ ${F(1, 2)} + ${F(1, 3)} no és ${F(2, 5)}: no se sumen ni els denominadors ni els numeradors per separat.</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/fraccions/visual/suma">➕ Suma amb barres, pas a pas</a></p>`,
        generate: G.suma_resta,
      },
      {
        id: 'multiplicacio_divisio',
        rule: `${F('a', 'b')} · ${F('c', 'd')} = ${F('a · c', 'b · d')} &nbsp; ${F('a', 'b')} : ${F('c', 'd')} = ${F('a · d', 'b · c')}`,
        title: 'Multiplicar i dividir',
        summary: 'Producte, quocient, inversa i fracció d\'una fracció.',
        levels: ['Productes', 'Divisions i inversa', 'Divisions i fracció d\'una fracció'],
        theory: `
          <p><b>Multiplicar</b>: numerador per numerador i denominador per denominador.</p>
          <div class="formula">${F(2, 3)} · ${F(4, 5)} = ${F(8, 15)}</div>
          <p><b>Dividir</b>: es multiplica per la inversa de la segona (o, el que és el mateix, en creu).</p>
          <div class="formula">${F(2, 3)} : ${F(4, 5)} = ${F(2, 3)} · ${F(5, 4)} = ${F(10, 12)} = ${F(5, 6)}</div>
          <p>La <b>inversa</b> d'una fracció és la fracció girada: la de ${F(3, 5)} és ${F(5, 3)}.</p>
          <p>«${F(2, 3)} de ${F(3, 4)}» vol dir ${F(2, 3)} · ${F(3, 4)}.</p>`,
        generate: G.multiplicacio_divisio,
      },
      {
        id: 'operacions_combinades',
        rule: 'parèntesis → · i : → + i −',
        title: 'Operacions combinades',
        summary: 'Expressions amb diverses operacions amb fraccions.',
        levels: ['Suma i producte', 'Amb parèntesis', 'Divisions i restes de la unitat'],
        theory: `
          <p>L'ordre és el mateix que amb els nombres naturals: parèntesis, després multiplicacions i divisions, i al final sumes i restes.</p>
          <div class="formula">${F(1, 2)} + ${F(1, 3)} · ${F(3, 4)} = ${F(1, 2)} + ${F(1, 4)} = ${F(3, 4)}</div>
          <p>Simplifica sempre que puguis: els càlculs queden més fàcils.</p>`,
        generate: G.operacions_combinades,
      },
      {
        id: 'problemes',
        rule: `${F(3, 4)} de 20 = 20 : 4 · 3`,
        title: 'Problemes amb fraccions',
        summary: 'Parts d\'una quantitat, el que queda i el total.',
        levels: ['Parts d\'una quantitat', 'Sumes de fraccions i trobar el total', 'Fracció del que queda'],
        theory: `
          <ul>
            <li>Si se n'ha fet ${F(2, 5)}, en queden ${F(3, 5)} (fins a ${F(5, 5)} = 1).</li>
            <li>Si els ${F(3, 4)} són 120, ${F(1, 4)} és 120 : 3 = 40, i el total és 40 · 4 = 160.</li>
            <li>«${F(1, 4)} <b>del que queda</b>»: calcula primer el que queda, i després la fracció d'aquesta quantitat.</li>
          </ul>`,
        generate: G.problemes,
      },
    ],
    visuals: [
      {
        id: 'barres',
        emoji: '📊',
        title: 'Barres de fraccions',
        description: 'Mira per què 2/3 i 4/6 són la mateixa part, i compara dues fraccions a cop d\'ull.',
        mount: R.barres.mount,
      },
      {
        id: 'suma',
        emoji: '➕',
        title: 'Sumar amb barres',
        description: 'Per què 1/2 + 1/3 no és 2/5? Talla les barres en trossos iguals i descobreix-ho pas a pas.',
        mount: R.suma.mount,
      },
    ],
  });
})(window.MathLab);
