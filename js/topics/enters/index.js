/* Tema: Nombres enters. Uneix el catàleg d'errors, els generadors i les visualitzacions, i registra el tema. */
(function (ML) {
  'use strict';

  const H = ML.utils.pw;
  const E = ML.enters;
  const G = E.generators;

  ML.topics.register({
    id: 'enters',
    title: 'Nombres enters',
    pathTitle: 'El camí dels nombres enters',
    icon: '±',
    color: '#2a9d8f',
    description: 'Positius i negatius: la recta numèrica, ordenar, sumar, restar, multiplicar, dividir i potències.',
    errors: E.errors,
    skills: [
      {
        id: 'concepte',
        rule: '|−5| = 5 · oposat de −5 = 5',
        title: 'Què és un nombre enter',
        summary: 'Positius i negatius a la vida real, valor absolut i oposat.',
        levels: ['Situacions, valor absolut i oposat', 'Comparar valors absoluts', 'Dos nombres amb el mateix valor absolut'],
        theory: `
          <p>Els <b>nombres enters</b> són els naturals positius (+1, +2, +3…), el <b>0</b> i els negatius (−1, −2, −3…).</p>
          <p>Fem servir els negatius per a temperatures sota zero, profunditats sota el mar, deutes, plantes de soterrani…</p>
          <ul>
            <li><b>Valor absolut</b>: la distància al 0. Mai no és negatiu: |−5| = 5 i |5| = 5.</li>
            <li><b>Oposat</b>: el mateix nombre amb el signe canviat. L'oposat de −5 és 5, i l'oposat de 5 és −5.</li>
          </ul>`,
        generate: G.concepte,
      },
      {
        id: 'ordenar',
        rule: '−8 &lt; −3 &lt; 0 &lt; 2',
        title: 'Ordenar i comparar',
        summary: 'La recta numèrica i quin enter és més gran.',
        levels: ['Comparar dos nombres', 'Ordenar llistes i moure\'s per la recta', 'Comptar enters i punt mig'],
        theory: `
          <p>A la recta numèrica, els nombres creixen cap a la dreta:</p>
          <div class="formula">… −3 &lt; −2 &lt; −1 &lt; 0 &lt; 1 &lt; 2 &lt; 3 …</div>
          <ul>
            <li>Tot negatiu és més petit que 0, i tot positiu és més gran que 0.</li>
            <li>Entre dos negatius, és més gran el que està <b>més a prop del 0</b>: −3 &gt; −8.</li>
          </ul>
          <p class="warn">⚠️ −8 no és més gran que −3, encara que 8 sigui més gran que 3. A −8 °C fa més fred que a −3 °C!</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/enters/visual/recta">📏 La recta numèrica</a></p>`,
        generate: G.ordenar,
      },
      {
        id: 'suma_resta',
        rule: '5 − (−3) = 5 + 3',
        title: 'Sumar i restar',
        summary: 'Sumes i restes d\'enters, i treure parèntesis.',
        levels: ['Sumar dos enters', 'Restar i sumes de tres', 'Expressions amb parèntesis'],
        theory: `
          <ul>
            <li><b>Mateix signe</b>: se sumen els valors absoluts i es deixa el signe. (−3) + (−5) = −8.</li>
            <li><b>Signes diferents</b>: es resten els valors absoluts i es posa el signe del que en té més. (−7) + (+3) = −4.</li>
            <li><b>Restar</b> és sumar l'oposat: 5 − (−3) = 5 + 3 = 8.</li>
          </ul>
          <p><b>Treure parèntesis:</b> + (+a) = +a · + (−a) = −a · − (+a) = −a · − (−a) = +a</p>
          <p class="warn">⚠️ Si davant del parèntesi hi ha un −, canvien de signe <b>tots</b> els termes de dins: 6 − (2 − 9) = 6 − 2 + 9.</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/enters/visual/fitxes">🔴 Mira-ho amb fitxes</a></p>`,
        generate: G.suma_resta,
      },
      {
        id: 'multiplicacio_divisio',
        rule: '(−) · (−) = + &nbsp; (+) · (−) = −',
        title: 'Multiplicar i dividir',
        summary: 'La regla dels signes, amb dos o més factors.',
        levels: ['Dos nombres', 'Tres factors i el signe del resultat', 'Factors que falten i operacions encadenades'],
        theory: `
          <p>Es multipliquen (o es divideixen) els valors absoluts i el signe es posa amb la <b>regla dels signes</b>:</p>
          <div class="formula">(+) · (+) = + &nbsp; (−) · (−) = + &nbsp; (+) · (−) = − &nbsp; (−) · (+) = −</div>
          <p>Signes iguals → positiu. Signes diferents → negatiu. Exemple: (−6) · (−4) = 24 i (−20) : (+5) = −4.</p>
          <p>Amb molts factors, compta els negatius: si en són un nombre parell, el resultat és positiu; si en són un nombre senar, negatiu.</p>
          <p class="warn">⚠️ La regla dels signes no serveix per sumar: (−3) + (−5) = −8, no +8.</p>`,
        generate: G.multiplicacio_divisio,
      },
      {
        id: 'operacions_combinades',
        rule: 'parèntesis → · i : → + i −',
        title: 'Operacions combinades',
        summary: 'Expressions amb diverses operacions i l\'ordre correcte.',
        levels: ['Suma i producte', 'Productes, quocients i restes', 'Amb parèntesis'],
        theory: `
          <p>L'ordre de les operacions és el mateix que amb els naturals:</p>
          <ol>
            <li>Parèntesis.</li>
            <li>Potències.</li>
            <li>Multiplicacions i divisions, d'esquerra a dreta.</li>
            <li>Sumes i restes, d'esquerra a dreta.</li>
          </ol>
          <div class="formula">−5 + 3 · (−4) = −5 + (−12) = −17</div>
          <p class="warn">⚠️ No es fa tot d'esquerra a dreta: (−5 + 3) · (−4) = 8 és una altra operació.</p>`,
        generate: G.operacions_combinades,
      },
      {
        id: 'potencies',
        rule: `${H('(−2)', 4)} = 16 &nbsp; −${H(2, 4)} = −16`,
        title: 'Potències d\'enters',
        summary: 'Potències de base negativa i el paper del parèntesi.',
        levels: ['Base negativa', 'Amb parèntesi i sense', 'Expressions'],
        theory: `
          <p>Una potència de base negativa:</p>
          <ul>
            <li>amb exponent <b>parell</b> és positiva: ${H('(−2)', 4)} = (−2) · (−2) · (−2) · (−2) = 16;</li>
            <li>amb exponent <b>senar</b> és negativa: ${H('(−2)', 3)} = −8.</li>
          </ul>
          <p class="warn">⚠️ Compte amb el parèntesi! −${H(2, 4)} vol dir −(2 · 2 · 2 · 2) = −16: l'exponent no afecta el signe menys.</p>`,
        generate: G.potencies,
      },
      {
        id: 'problemes',
        rule: 'variació = final − inicial',
        title: 'Problemes amb enters',
        summary: 'Temperatures, ascensors, comptes i altures.',
        levels: ['Pujar i baixar', 'Diferències i variacions', 'Problemes de dos passos'],
        theory: `
          <ul>
            <li>Pujar, guanyar, ingressar → sumar. Baixar, perdre, pagar → restar.</li>
            <li>Per saber quant ha variat una cosa: <b>final − inicial</b>.</li>
          </ul>
          <div class="formula">De −5 °C a 7 °C: 7 − (−5) = 7 + 5 = 12 graus</div>
          <p class="warn">⚠️ La distància entre −5 i 7 no és 2: has de passar pel 0 (5 graus fins al 0 i 7 més).</p>`,
        generate: G.problemes,
      },
    ],
    visuals: [
      {
        id: 'recta',
        emoji: '📏',
        title: 'La recta numèrica',
        description: 'Sumar és moure\'s per la recta. I restar? Descobreix per què restar un negatiu fa augmentar.',
        mount: E.recta.mount,
      },
      {
        id: 'fitxes',
        emoji: '🔴',
        title: 'Sumar amb fitxes',
        description: 'Fitxes positives i negatives: cada parella + i − val 0. Ajunta-les i mira què en queda.',
        mount: E.fitxes.mount,
      },
    ],
  });
})(window.MathLab);
