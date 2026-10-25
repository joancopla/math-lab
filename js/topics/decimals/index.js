/* Tema: Nombres decimals. Uneix el catàleg d'errors, els generadors i les visualitzacions, i registra el tema. */
(function (ML) {
  'use strict';

  const U = ML.utils;
  const DM = ML.decimals;
  const G = DM.generators;

  ML.topics.register({
    id: 'decimals',
    title: 'Nombres decimals',
    pathTitle: 'El camí dels decimals',
    icon: '0,5',
    color: '#3a7bd5',
    description: 'Dècimes, centèsimes i mil·lèsimes: ordenar, arrodonir, sumar, restar, multiplicar, dividir i problemes.',
    errors: DM.errors,
    skills: [
      {
        id: 'concepte',
        rule: '3,47 = 3 unitats, 4 dècimes i 7 centèsimes',
        title: 'Què és un nombre decimal',
        summary: 'Dècimes, centèsimes i mil·lèsimes, i fraccions decimals.',
        levels: ['Dècimes i centèsimes', 'Centèsimes i mil·lèsimes', 'Mil·lèsimes i fraccions'],
        theory: `
          <p>Després de la coma: la 1a xifra són les <b>dècimes</b>, la 2a les <b>centèsimes</b> i la 3a les <b>mil·lèsimes</b>.</p>
          <div class="formula">0,1 = ${U.frac(1, 10)} &nbsp; 0,01 = ${U.frac(1, 100)} &nbsp; 0,001 = ${U.frac(1, 1000)}</div>
          <p class="warn">⚠️ 5 centèsimes s'escriuen 0,05, no 0,5. Els zeros marquen la posició.</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/decimals/visual/quadricula">🟦 La quadrícula de centèsimes</a></p>`,
        generate: G.concepte,
      },
      {
        id: 'ordenar',
        rule: '0,5 = 0,50 &gt; 0,45',
        title: 'Ordenar i comparar',
        summary: 'Quin decimal és més gran, i ordenar-los.',
        levels: ['Comparar dos nombres', 'Ordenar llistes', 'Decimals entre dos nombres'],
        theory: `
          <p>Per comparar, iguala el nombre de decimals afegint zeros al final i compara xifra a xifra.</p>
          <div class="formula">0,5 i 0,45 → 0,50 &gt; 0,45</div>
          <p class="warn">⚠️ Tenir més xifres decimals no vol dir ser més gran. I un zero al final no canvia el valor: 0,8 = 0,80.</p>`,
        generate: G.ordenar,
      },
      {
        id: 'arrodonir',
        rule: '3,47 ≈ 3,5',
        title: 'Arrodonir',
        summary: 'Arrodonir a les unitats, les dècimes i les centèsimes.',
        levels: ['A les unitats i a les dècimes', 'A les centèsimes i preus', 'Quan se n\'emporta una'],
        theory: `
          <p>Mira la xifra que hi ha just després de la posició on arrodoneixes: si és <b>5 o més</b>, puja una unitat; si és menys de 5, es queda igual.</p>
          <div class="formula">3,47 → dècimes → 3,5 &nbsp;&nbsp; 3,42 → dècimes → 3,4</div>
          <p class="warn">⚠️ Arrodonir no és tallar: 3,47 no és 3,4.</p>`,
        generate: G.arrodonir,
      },
      {
        id: 'suma_resta',
        rule: '3,50 + 1,25 = 4,75',
        title: 'Sumar i restar',
        summary: 'Amb la coma sota la coma.',
        levels: ['Un decimal', 'Decimals diferents i enters', 'Operacions encadenades'],
        theory: `
          <p>Escriu els nombres un sota l'altre amb la <b>coma sota la coma</b>. Si cal, afegeix zeros perquè tinguin els mateixos decimals.</p>
          <div class="formula">3,5 + 1,25 = 3,50 + 1,25 = 4,75</div>
          <p class="warn">⚠️ Un enter també té decimals: 5 − 2,3 = 5,0 − 2,3 = 2,7.</p>`,
        generate: G.suma_resta,
      },
      {
        id: 'multiplicacio',
        rule: '0,3 · 0,2 = 0,06',
        title: 'Multiplicar',
        summary: 'Per 10, 100 i 1.000, i productes de decimals.',
        levels: ['Per 10 i 100, i per un enter', 'Per 1.000 i entre decimals', 'Productes petits'],
        theory: `
          <p><b>Per 10, 100, 1.000</b>: la coma es mou 1, 2 o 3 posicions cap a la dreta. 2,5 · 100 = 250.</p>
          <p><b>Dos decimals</b>: multiplica sense coma i posa al resultat tants decimals com sumin els dos factors.</p>
          <div class="formula">0,3 · 0,2 → 3 · 2 = 6 → 2 decimals → 0,06</div>
          <p><a class="btn btn-small btn-ghost" href="#/tema/decimals/visual/coma">↔️ Mira com es mou la coma</a></p>`,
        generate: G.multiplicacio,
      },
      {
        id: 'divisio',
        rule: '6 : 0,5 = 60 : 5 = 12',
        title: 'Dividir',
        summary: 'Per 10, 100 i 1.000, decimal entre enter i entre decimals.',
        levels: ['Per 10 i 100', 'Decimal entre enter', 'Entre un decimal'],
        theory: `
          <p><b>Per 10, 100, 1.000</b>: la coma es mou cap a l'esquerra. 3,5 : 100 = 0,035.</p>
          <p><b>Decimal entre enter</b>: quan baixes la primera xifra decimal, posa la coma al quocient. 7,5 : 3 = 2,5.</p>
          <p><b>Entre un decimal</b>: multiplica tots dos per 10, 100… fins que el divisor sigui enter. 6 : 0,5 = 60 : 5 = 12.</p>`,
        generate: G.divisio,
      },
      {
        id: 'problemes',
        rule: 'canvi = el que pagues − el que costa',
        title: 'Problemes amb decimals',
        summary: 'Compres, canvi, preus i mesures.',
        levels: ['Compres i canvi', 'Preu d\'una unitat i mesures', 'Mitjanes i dos passos'],
        theory: `
          <ul>
            <li>Total d'una compra: preu · quantitat.</li>
            <li>Canvi: el que pagues − el que costa.</li>
            <li>Preu d'una unitat: preu total : quantitat.</li>
            <li>Mitjana: suma de tots els valors : quants n'hi ha.</li>
          </ul>`,
        generate: G.problemes,
      },
    ],
    visuals: [
      { id: 'quadricula', emoji: '🟦', title: 'La quadrícula de centèsimes', description: 'Una unitat en 100 quadrets. Mira per què 0,5 és més gran que 0,45.', mount: DM.quadricula.mount },
      { id: 'coma', emoji: '↔️', title: 'Per 10, 100 i 1.000', description: 'Multiplica i divideix i mira com les xifres canvien de columna.', mount: DM.coma.mount },
    ],
  });
})(window.MathLab);
