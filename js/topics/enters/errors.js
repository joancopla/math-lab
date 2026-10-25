/* Catàleg d'errors típics del tema de nombres enters.
 * Els "traps" dels exercicis fan servir aquests identificadors; aquí hi ha el títol i
 * l'explicació general que es mostra a la pàgina de progrés.
 */
window.MathLab = window.MathLab || {};
window.MathLab.enters = window.MathLab.enters || {};

window.MathLab.enters.errors = {
  signe_oblidat: {
    title: 'Oblidar el signe menys',
    explain: 'Si el resultat és negatiu, cal escriure el signe −. −7 i 7 són nombres diferents: estan a costats oposats del 0.',
  },
  signe_canviat: {
    title: 'Resultat amb el signe contrari',
    explain: 'El valor és bo, però el signe no. Abans de calcular, decideix el signe: en una suma de signes diferents, guanya el signe del nombre amb més valor absolut.',
  },
  context_signe: {
    title: 'Triar malament el signe en una situació',
    explain: 'Sota zero, per sota del nivell del mar, deure diners, plantes de soterrani o anys abans de Crist → negatiu. Sobre zero, guanyar, pujar → positiu.',
  },
  valor_absolut_negatiu: {
    title: 'Pensar que el valor absolut pot ser negatiu',
    explain: 'El valor absolut és la distància al 0, i una distància mai no és negativa: |−6| = 6 i |6| = 6.',
  },
  oposat_confos: {
    title: 'Confondre l\'oposat',
    explain: 'L\'oposat d\'un nombre és el que està a la mateixa distància del 0, però a l\'altre costat: l\'oposat de −4 és +4 i l\'oposat de +4 és −4.',
  },
  ordre_valor_absolut: {
    title: 'Ordenar els negatius pel valor absolut',
    explain: 'Entre dos negatius, és més gran el que està més a prop del 0: −3 > −8. Fa menys fred a −3 °C que a −8 °C.',
  },
  negatiu_vs_zero: {
    title: 'Comparar negatius amb el 0 o amb positius',
    explain: 'Qualsevol negatiu és més petit que 0, i qualsevol positiu és més gran que 0. Per tant, −100 < 1.',
  },
  recta_direccio: {
    title: 'Moure\'s cap al costat equivocat de la recta',
    explain: 'A la recta numèrica, a la dreta hi ha els nombres més grans i a l\'esquerra els més petits. Sumar un positiu és anar cap a la dreta; sumar un negatiu, cap a l\'esquerra.',
  },
  zero_oblidat: {
    title: 'Oblidar el zero',
    explain: 'El 0 també és un nombre enter (ni positiu ni negatiu). Quan comptes els enters entre −3 i 3, el 0 hi és.',
  },
  suma_valors_absoluts: {
    title: 'Sumar quan els signes són diferents',
    explain: 'Si els signes són diferents, es resten els valors absoluts i es posa el signe del que té més valor absolut: −7 + 3 = −4 (no −10).',
  },
  regla_signes_suma: {
    title: 'Aplicar la regla dels signes a la suma',
    explain: 'La regla «menys per menys, més» és per a la multiplicació i la divisió. En una suma de dos negatius, el resultat és negatiu: (−3) + (−5) = −8.',
  },
  resta_sense_canvi: {
    title: 'Restar un negatiu sense canviar el signe',
    explain: 'Restar un nombre és sumar el seu oposat: 5 − (−3) = 5 + 3 = 8. Dos signes menys seguits fan un més.',
  },
  parentesi_signe: {
    title: 'Treure malament un parèntesi',
    explain: 'Si davant del parèntesi hi ha un −, en treure\'l cal canviar el signe de <b>tots</b> els termes de dins: −(4 − 9) = −4 + 9.',
  },
  regla_signes: {
    title: 'Equivocar-se amb la regla dels signes',
    explain: 'Multiplicar o dividir: signes iguals → positiu; signes diferents → negatiu. (+)·(+) = +, (−)·(−) = +, (+)·(−) = −, (−)·(+) = −.',
  },
  factors_negatius: {
    title: 'Comptar malament els factors negatius',
    explain: 'Amb molts factors, compta quants són negatius: si n\'hi ha un nombre parell, el resultat és positiu; si n\'hi ha un nombre senar, és negatiu.',
  },
  operacio_equivocada: {
    title: 'Fer una altra operació',
    explain: 'Llegeix bé el signe de l\'operació: no és el mateix sumar que multiplicar. (−3) · (−4) = 12, però (−3) + (−4) = −7.',
  },
  ordre_operacions: {
    title: 'Ordre de les operacions',
    explain: 'Primer els parèntesis, després les potències, després multiplicacions i divisions, i al final sumes i restes. No es fa tot d\'esquerra a dreta.',
  },
  potencia_signe: {
    title: 'Signe d\'una potència de base negativa',
    explain: 'Una base negativa amb exponent parell dona positiu: (−2)⁴ = 16. Amb exponent senar dona negatiu: (−2)³ = −8.',
  },
  potencia_sense_parentesi: {
    title: 'Confondre (−a)ⁿ i −aⁿ',
    explain: 'Sense parèntesi, l\'exponent només afecta el nombre, no el signe: −2⁴ = −(2 · 2 · 2 · 2) = −16. Amb parèntesi, (−2)⁴ = 16.',
  },
  base_per_exponent: {
    title: 'Multiplicar la base per l\'exponent',
    explain: '(−3)² no és (−3) · 2 = −6. És (−3) · (−3) = 9.',
  },
  diferencia_signes: {
    title: 'Calcular malament una diferència',
    explain: 'Per saber quant ha variat una cosa, fes final − inicial. De −5 °C a 7 °C la temperatura ha pujat 7 − (−5) = 12 graus, no 2.',
  },
};
