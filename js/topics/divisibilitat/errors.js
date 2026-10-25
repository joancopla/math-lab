/* Catàleg d'errors típics del tema de divisibilitat.
 * Els "traps" dels exercicis fan servir aquests identificadors; aquí hi ha el títol i
 * l'explicació general que es mostra a la pàgina de progrés.
 */
window.MathLab = window.MathLab || {};
window.MathLab.divisibilitat = window.MathLab.divisibilitat || {};

window.MathLab.divisibilitat.errors = {
  multiple_divisor_girats: {
    title: 'Confondre múltiple i divisor',
    explain: 'Si 12 = 3 · 4, el 12 és múltiple de 3 (és més gran o igual) i el 3 és divisor de 12 (és més petit o igual). Els múltiples d\'un nombre s\'obtenen multiplicant-lo; els divisors el divideixen exactament.',
  },
  divisio_no_exacta: {
    title: 'Divisió que no és exacta',
    explain: 'Un nombre és múltiple d\'un altre (o divisible per ell) només si la divisió és exacta, és a dir, si el residu és 0.',
  },
  u_i_ell_mateix: {
    title: 'Oblidar l\'1 o el mateix nombre',
    explain: 'Tot nombre té com a divisors l\'1 i ell mateix: 15 = 1 · 15. No te\'ls deixis quan facis la llista de divisors.',
  },
  divisor_oblidat: {
    title: 'Deixar-se divisors',
    explain: 'Busca els divisors per parelles: 1 · 24, 2 · 12, 3 · 8, 4 · 6. Quan les parelles es troben, ja els tens tots.',
  },
  criteri_xifra_equivocada: {
    title: 'Mirar una xifra que no és l\'última',
    explain: 'Per saber si un nombre és divisible per 2, per 5 o per 10, només compta l\'última xifra (la de les unitats).',
  },
  criteri_suma_per_2_5: {
    title: 'Sumar xifres per al 2, el 5 o el 10',
    explain: 'La suma de les xifres serveix per al 3 i per al 9. Per al 2, el 5 i el 10 cal mirar l\'última xifra.',
  },
  criteri_ultima_per_3_9: {
    title: 'Mirar l\'última xifra per al 3 o el 9',
    explain: 'Que un nombre acabi en 3 o en 9 no vol dir que sigui divisible per 3 o per 9. Cal sumar totes les xifres.',
  },
  criteri_3_9: {
    title: 'Confondre el criteri del 3 i el del 9',
    explain: 'Divisible per 3: la suma de xifres és múltiple de 3. Divisible per 9: la suma de xifres és múltiple de 9. Tots els divisibles per 9 ho són per 3, però no al revés.',
  },
  criteri_5_10: {
    title: 'Confondre el criteri del 5 i el del 10',
    explain: 'Divisible per 5: acaba en 0 o en 5. Divisible per 10: acaba en 0. Un nombre que acaba en 5 no és divisible per 10.',
  },
  criteri_4: {
    title: 'Criteri del 4',
    explain: 'No n\'hi ha prou que sigui parell. Un nombre és divisible per 4 si les dues últimes xifres formen un múltiple de 4 (o són 00).',
  },
  criteri_6: {
    title: 'Criteri del 6',
    explain: 'Un nombre és divisible per 6 si ho és alhora per 2 i per 3: ha de ser parell i la suma de les xifres ha de ser múltiple de 3.',
  },
  criteri_11: {
    title: 'Criteri de l\'11',
    explain: 'Suma les xifres de les posicions senars i, a part, les de les posicions parells. Si la diferència és 0 o un múltiple d\'11, el nombre és divisible per 11.',
  },
  criteri_mal_aplicat: {
    title: 'Aplicar malament un criteri',
    explain: 'Repassa els criteris: 2 → acaba en xifra parella; 3 → suma de xifres múltiple de 3; 5 → acaba en 0 o 5; 9 → suma de xifres múltiple de 9; 10 → acaba en 0.',
  },
  u_es_primer: {
    title: 'Pensar que 1 és primer',
    explain: 'Un nombre primer té exactament dos divisors: l\'1 i ell mateix. L\'1 només en té un, i per això no és ni primer ni compost.',
  },
  senar_es_primer: {
    title: 'Pensar que tots els senars són primers',
    explain: 'Molts nombres senars són compostos: 9 = 3 · 3, 15 = 3 · 5, 21 = 3 · 7, 49 = 7 · 7… Prova de dividir-los per 3, 5, 7…',
  },
  dos_no_primer: {
    title: 'Pensar que 2 no és primer',
    explain: 'El 2 només té dos divisors (1 i 2), per tant és primer. És l\'únic nombre primer parell.',
  },
  primer_com_compost: {
    title: 'Veure divisors on no n\'hi ha',
    explain: 'Un nombre primer no té cap divisor a part de l\'1 i ell mateix. Abans de dir que és compost, comprova que la divisió sigui exacta.',
  },
  factor_no_primer: {
    title: 'Factors que no són primers',
    explain: 'A la descomposició en factors primers tots els factors han de ser primers. 4, 6, 9 o 10 encara es poden descompondre: 4 = 2², 6 = 2 · 3…',
  },
  exponent_factoritzacio: {
    title: 'Comptar malament un factor',
    explain: 'L\'exponent diu quantes vegades surt el factor primer a la descomposició. Comprova-ho multiplicant: el resultat ha de ser el nombre de partida.',
  },
  potencia_mal_calculada: {
    title: 'Calcular malament les potències',
    explain: '2³ vol dir 2 · 2 · 2 = 8, no 2 · 3 = 6. Calcula primer les potències i després multiplica.',
  },
  mcd_mcm_confosos: {
    title: 'Confondre el mcd i el mcm',
    explain: 'El mcd és el divisor comú més gran: no pot ser més gran que els nombres. El mcm és el múltiple comú més petit: no pot ser més petit que els nombres.',
  },
  mcd_no_maxim: {
    title: 'Un divisor comú, però no el més gran',
    explain: 'Has trobat un divisor comú, però el mcd és el més gran de tots. Fes la llista sencera de divisors comuns i tria el més gran.',
  },
  mcd_no_comu: {
    title: 'Un nombre que no divideix tots dos',
    explain: 'El mcd ha de dividir exactament tots els nombres. Comprova-ho fent les divisions.',
  },
  mcd_exponent_gran: {
    title: 'mcd amb l\'exponent més gran',
    explain: 'Per al mcd s\'agafen els factors comuns amb l\'exponent més petit. L\'exponent més gran és per al mcm.',
  },
  mcd_no_comuns: {
    title: 'mcd amb factors que no són comuns',
    explain: 'Al mcd només hi van els factors primers que surten a totes les descomposicions.',
  },
  mcm_producte: {
    title: 'Pensar que el mcm sempre és el producte',
    explain: 'Multiplicar els nombres dona un múltiple comú, però no sempre el més petit. Només coincideix amb el mcm quan els nombres no tenen cap divisor comú a part de l\'1.',
  },
  mcm_no_minim: {
    title: 'Un múltiple comú, però no el més petit',
    explain: 'Has trobat un múltiple comú, però el mcm és el més petit de tots. Fes la llista de múltiples de cada nombre i busca el primer que coincideix.',
  },
  mcm_no_comu: {
    title: 'Un nombre que no és múltiple de tots dos',
    explain: 'El mcm ha de ser múltiple de tots els nombres: s\'ha de poder dividir exactament per cadascun.',
  },
  mcm_exponent_petit: {
    title: 'mcm amb l\'exponent més petit',
    explain: 'Per al mcm s\'agafen tots els factors primers amb l\'exponent més gran. L\'exponent més petit és per al mcd.',
  },
  mcm_nomes_comuns: {
    title: 'mcm només amb els factors comuns',
    explain: 'Al mcm hi van tots els factors primers, siguin comuns o no, amb l\'exponent més gran.',
  },
  problema_mcd_mcm: {
    title: 'Triar malament entre mcd i mcm',
    explain: 'Si busques quan tornen a coincidir coses que es repeteixen, és el mcm. Si has de repartir o tallar en parts iguals tan grans com puguis, és el mcd.',
  },
  pas_final_problema: {
    title: 'Oblidar l\'últim pas del problema',
    explain: 'Després de calcular el mcd o el mcm, rellegeix la pregunta: de vegades encara cal dividir o multiplicar per trobar el que et demanen.',
  },
};
