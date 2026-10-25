/* Catàleg d'errors típics del tema de nombres decimals.
 * Els "traps" dels exercicis fan servir aquests identificadors; aquí hi ha el títol i
 * l'explicació general que es mostra a la pàgina de progrés.
 */
window.MathLab = window.MathLab || {};
window.MathLab.decimals = window.MathLab.decimals || {};

window.MathLab.decimals.errors = {
  posicio_decimal: {
    title: 'Confondre dècimes, centèsimes i mil·lèsimes',
    explain: 'Després de la coma: la primera xifra són les dècimes, la segona les centèsimes i la tercera les mil·lèsimes. A 3,472: 4 dècimes, 7 centèsimes i 2 mil·lèsimes.',
  },
  zeros_decimals: {
    title: 'Oblidar els zeros després de la coma',
    explain: '5 centèsimes s\'escriuen 0,05 (no 0,5, que són 5 dècimes). 7 mil·lèsimes són 0,007. Els zeros marquen la posició.',
  },
  mes_xifres_mes_gran: {
    title: 'Pensar que amb més xifres decimals és més gran',
    explain: '0,5 és més gran que 0,45: 0,5 = 0,50 i 50 centèsimes són més que 45. Per comparar, iguala el nombre de decimals afegint zeros.',
  },
  zero_final: {
    title: 'Pensar que un zero al final canvia el valor',
    explain: 'Un zero al final de la part decimal no canvia el valor: 0,8 = 0,80 = 0,800.',
  },
  truncar: {
    title: 'Tallar en lloc d\'arrodonir',
    explain: 'Per arrodonir, mira la xifra següent: si és 5 o més, la d\'abans puja una unitat. 3,47 arrodonit a les dècimes és 3,5, no 3,4.',
  },
  arrodonir_posicio: {
    title: 'Arrodonir a una posició equivocada',
    explain: 'Fixa\'t a quina posició et demanen arrodonir: unitats (cap decimal), dècimes (un decimal), centèsimes (dos decimals).',
  },
  alinear_coma: {
    title: 'Sumar o restar sense alinear la coma',
    explain: 'Per sumar o restar decimals, posa la coma sota la coma: unitats sota unitats, dècimes sota dècimes… Pots afegir zeros: 3,5 + 1,25 = 3,50 + 1,25 = 4,75.',
  },
  resta_enter: {
    title: 'Restar un decimal d\'un nombre enter',
    explain: 'Un enter també té decimals, que són zeros: 5 = 5,0. Per tant, 5 − 2,3 = 5,0 − 2,3 = 2,7 (no 3,3).',
  },
  decimals_producte: {
    title: 'Comptar malament els decimals del producte',
    explain: 'Multiplica sense la coma i després posa-hi tants decimals com sumin els dos factors: 0,3 · 0,2 → 3 · 2 = 6 → dos decimals → 0,06.',
  },
  per_10_zero: {
    title: 'Afegir un zero en multiplicar per 10',
    explain: 'Amb decimals, multiplicar per 10 no és afegir un zero (2,5 i 2,50 valen el mateix). Es mou la coma una posició cap a la dreta: 2,5 · 10 = 25.',
  },
  coma_direccio: {
    title: 'Moure la coma cap al costat equivocat',
    explain: 'Multiplicar per 10, 100, 1.000 fa el nombre més gran: la coma va cap a la dreta. Dividir el fa més petit: la coma va cap a l\'esquerra.',
  },
  coma_posicions: {
    title: 'Moure la coma massa o massa poc',
    explain: 'La coma es mou tantes posicions com zeros té el 10, 100 o 1.000. Si falten xifres, s\'afegeixen zeros: 3,5 : 100 = 0,035.',
  },
  quocient_coma: {
    title: 'Oblidar la coma en el quocient',
    explain: 'En dividir un decimal entre un enter, quan baixes la primera xifra decimal posa la coma al quocient: 7,5 : 3 = 2,5.',
  },
  divisor_decimal: {
    title: 'Dividir per un decimal sense ajustar',
    explain: 'Si el divisor té decimals, multiplica el dividend i el divisor per 10, 100… fins que el divisor sigui enter: 6 : 0,5 = 60 : 5 = 12.',
  },
  fraccio_decimal: {
    title: 'Passar malament de fracció a decimal',
    explain: 'Una fracció és una divisió: 3/4 = 3 : 4 = 0,75. No és 3,4. Les fraccions decimals són fàcils: 37/100 = 0,37.',
  },
  pregunta_problema: {
    title: 'Respondre una altra pregunta',
    explain: 'Rellegeix la pregunta del problema: et demanen el total, el canvi, el preu d\'una unitat…? De vegades cal un pas més.',
  },
};
