/* Tema: Potències. Uneix el catàleg d'errors, els generadors i la visualització, i registra el tema. */
(function (ML) {
  'use strict';

  const U = ML.utils;
  const H = U.pw;
  const P = ML.potencies;
  const G = P.generators;

  const squares = Array.from({ length: 15 }, (_, i) => `<span>${H(i + 1, 2)} = ${(i + 1) ** 2}</span>`).join('');
  const cubes = Array.from({ length: 10 }, (_, i) => `<span>${H(i + 1, 3)} = ${U.fmt((i + 1) ** 3)}</span>`).join('');

  ML.topics.register({
    id: 'potencies',
    title: 'Potències',
    icon: 'a<sup>n</sup>',
    color: '#6a4cf0',
    description: 'Multiplicacions repetides: notació, càlcul, operacions amb potències i quadrats i cubs perfectes.',
    errors: P.errors,
    skills: [
      {
        id: 'notacio',
        title: 'Què és una potència',
        summary: 'Base, exponent i com s\'escriu i es llegeix una potència.',
        levels: ['Productes en forma de potència', 'Potències, productes i sumes', 'Lectura i bases diferents'],
        theory: `
          <p>Una <b>potència</b> és una manera curta d'escriure una multiplicació de factors iguals.</p>
          <div class="formula">5 · 5 · 5 = ${H(5, 3)}</div>
          <ul>
            <li>La <b>base</b> (5) és el factor que es repeteix.</li>
            <li>L'<b>exponent</b> (3) diu quantes vegades es repeteix.</li>
          </ul>
          <p>${H(5, 3)} es llegeix «cinc elevat a tres» o «cinc al cub». Amb exponent 2 diem «al quadrat»: ${H(7, 2)} és «set al quadrat».</p>
          <p class="warn">⚠️ No ho confonguis amb la suma: 5 + 5 + 5 = 5 · 3.</p>`,
        generate: G.notacio,
      },
      {
        id: 'calcul',
        title: 'Calcular potències',
        summary: 'Trobar el valor d\'una potència, potències de 10 i expressions.',
        levels: ['Bases i exponents petits', 'Més grans i potències de 10', 'Expressions amb potències'],
        theory: `
          <p>Per calcular una potència, multiplica la base per ella mateixa tantes vegades com indica l'exponent.</p>
          <div class="formula">${H(2, 4)} = 2 · 2 · 2 · 2 = 16</div>
          <p class="warn">⚠️ ${H(2, 4)} no és 2 · 4 = 8!</p>
          <p><b>Potències de 10:</b> un 1 seguit de tants zeros com indica l'exponent: ${H(10, 5)} = 100.000.</p>
          <p><b>Ordre de les operacions:</b> primer els parèntesis, després les potències, després multiplicacions i divisions i, al final, sumes i restes.</p>`,
        generate: G.calcul,
      },
      {
        id: 'producte',
        title: 'Producte de potències',
        summary: 'Multiplicar potències de la mateixa base.',
        levels: ['Dues potències', 'Tres factors, lletres i exponent 1', 'Exponents que falten'],
        theory: `
          <p>Per multiplicar potències de la <b>mateixa base</b>, es deixa la base i se <b>sumen</b> els exponents.</p>
          <div class="formula">${H('a', 'm')} · ${H('a', 'n')} = ${H('a', 'm + n')}</div>
          <p>Exemple: ${H(3, 2)} · ${H(3, 4)} = (3 · 3) · (3 · 3 · 3 · 3) = ${H(3, 6)}</p>
          <p class="warn">⚠️ Un nombre sense exponent té exponent 1: 5 = ${H(5, 1)}. Per tant, 5 · ${H(5, 3)} = ${H(5, 4)}.</p>`,
        generate: G.producte,
      },
      {
        id: 'quocient',
        title: 'Quocient de potències',
        summary: 'Dividir potències de la mateixa base.',
        levels: ['Dues potències', 'Fraccions, exponent 1 i exponents iguals', 'Operacions combinades'],
        theory: `
          <p>Per dividir potències de la <b>mateixa base</b>, es deixa la base i es <b>resten</b> els exponents.</p>
          <div class="formula">${H('a', 'm')} : ${H('a', 'n')} = ${H('a', 'm − n')}</div>
          <p>Exemple: ${U.frac('2 · 2 · <s>2</s> · <s>2</s> · <s>2</s>', '<s>2</s> · <s>2</s> · <s>2</s>')} → ${H(2, 5)} : ${H(2, 3)} = ${H(2, 2)}</p>
          <p>Si els exponents són iguals: ${H(4, 3)} : ${H(4, 3)} = ${H(4, 0)} = 1.</p>`,
        generate: G.quocient,
      },
      {
        id: 'potencia_potencia',
        title: 'Potència d\'una potència',
        summary: 'Elevar una potència a un altre exponent.',
        levels: ['Una potència de potència', 'Tres exponents, lletres i combinades', 'Exponents que falten i canvis de base'],
        theory: `
          <p>Per elevar una potència a un altre exponent, es deixa la base i es <b>multipliquen</b> els exponents.</p>
          <div class="formula">${H('(' + H('a', 'm') + ')', 'n')} = ${H('a', 'm · n')}</div>
          <p>Exemple: ${H('(' + H(5, 2) + ')', 3)} = ${H(5, 2)} · ${H(5, 2)} · ${H(5, 2)} = ${H(5, '2 + 2 + 2')} = ${H(5, 6)}</p>
          <p class="warn">⚠️ Producte → sumar exponents. Potència de potència → multiplicar exponents.</p>`,
        generate: G.potencia_potencia,
      },
      {
        id: 'exponents_0_1',
        title: 'Exponent 0 i exponent 1',
        summary: 'Què passa quan l\'exponent és 0 o 1, i les bases 0 i 1.',
        levels: ['a⁰ i a¹', 'Bases 0 i 1, exponents que falten', 'Expressions'],
        theory: `
          <div class="formula">${H('a', 1)} = a &nbsp;&nbsp;&nbsp; ${H('a', 0)} = 1 <small>(si a ≠ 0)</small></div>
          <p><b>Per què ${H('a', 0)} = 1?</b> Mira: ${H(4, 3)} : ${H(4, 3)} = ${H(4, 0)}. Però un nombre dividit entre ell mateix fa 1. Per tant, ${H(4, 0)} = 1.</p>
          <p>A més: ${H(1, 'n')} = 1 (1 · 1 · 1… sempre fa 1) i ${H(0, 'n')} = 0 si n > 0.</p>`,
        generate: G.exponents_0_1,
      },
      {
        id: 'quadrats_cubs',
        title: 'Quadrats i cubs perfectes',
        summary: 'Reconèixer-los, calcular arrels i situar nombres entre quadrats.',
        levels: ['Quadrats fins a 100', 'Quadrats fins a 400 i cubs', 'Entre quadrats, cubs fins a 1.000'],
        theory: `
          <p>Un <b>quadrat perfecte</b> és el resultat d'elevar un nombre natural al quadrat. Un <b>cub perfecte</b>, el d'elevar-lo al cub.</p>
          <div class="table-pows">${squares}</div>
          <div class="table-pows">${cubes}</div>
          <p>L'<b>arrel quadrada</b> de 49 és 7, perquè ${H(7, 2)} = 49. L'<b>arrel cúbica</b> de 64 és 4, perquè ${H(4, 3)} = 64.</p>`,
        generate: G.quadrats_cubs,
      },
    ],
    visuals: [
      {
        id: 'arees-volums',
        title: 'Àrees i volums',
        description: 'Mira per què n² és un quadrat i n³ és un cub. Construeix-los pas a pas.',
        mount: P.visual.mount,
      },
    ],
  });
})(window.MathLab);
