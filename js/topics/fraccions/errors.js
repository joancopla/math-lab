/* Catàleg d'errors típics del tema de fraccions.
 * Els "traps" dels exercicis fan servir aquests identificadors; aquí hi ha el títol i
 * l'explicació general que es mostra a la pàgina de progrés.
 */
window.MathLab = window.MathLab || {};
window.MathLab.fraccions = window.MathLab.fraccions || {};

window.MathLab.fraccions.errors = {
  num_den_girats: {
    title: 'Confondre numerador i denominador',
    explain: 'El denominador (a baix) diu en quantes parts iguals es divideix la unitat. El numerador (a dalt) diu quantes parts en prenem.',
  },
  parts_mal_comptades: {
    title: 'Comptar malament les parts',
    explain: 'El denominador és el nombre total de parts (pintades i no pintades). El numerador, només les parts que es prenen (les pintades).',
  },
  quantitat_nomes_divideix: {
    title: 'Fracció d\'una quantitat: només dividir',
    explain: 'Per calcular 3/4 de 20, divideix pel denominador (20 : 4 = 5) i després multiplica pel numerador (5 · 3 = 15). No t\'aturis a la meitat!',
  },
  quantitat_nomes_multiplica: {
    title: 'Fracció d\'una quantitat: només multiplicar',
    explain: 'Per calcular 3/4 de 20, cal multiplicar pel numerador i també dividir pel denominador: 20 : 4 · 3 = 15.',
  },
  total_des_de_part: {
    title: 'Trobar el total a partir d\'una part',
    explain: 'Si els 3/5 d\'un nombre són 12, 1/5 és 12 : 3 = 4, i el total (5/5) és 4 · 5 = 20.',
  },
  equivalent_suma: {
    title: 'Sumar el mateix a dalt i a baix',
    explain: 'Per obtenir una fracció equivalent cal multiplicar (o dividir) el numerador i el denominador pel mateix nombre. Sumar-hi el mateix nombre no la deixa igual: 1/2 i 2/3 no són equivalents.',
  },
  equivalent_un_sol_terme: {
    title: 'Canviar només un terme',
    explain: 'Si multipliques o divideixes el numerador, també has de fer-ho amb el denominador (i pel mateix nombre).',
  },
  simplificar_diferent: {
    title: 'Simplificar per nombres diferents',
    explain: 'Per simplificar, divideix el numerador i el denominador pel <b>mateix</b> nombre, que ha de ser divisor de tots dos.',
  },
  comparar_denominador: {
    title: 'Pensar que un denominador més gran fa la fracció més gran',
    explain: 'Amb el mateix numerador, com més gran és el denominador, més petites són les parts: 1/8 és més petit que 1/3.',
  },
  comparar_termes: {
    title: 'Comparar només els numeradors (o els denominadors)',
    explain: 'Si els denominadors són diferents, no n\'hi ha prou de mirar els numeradors. Redueix-les a denominador comú i després compara-les.',
  },
  comparar_unitat: {
    title: 'Fraccions més grans o més petites que 1',
    explain: 'Si el numerador és més gran que el denominador, la fracció és més gran que 1. Si és més petit, és més petita que 1. Si són iguals, val 1.',
  },
  suma_denominadors_iguals: {
    title: 'Sumar també els denominadors iguals',
    explain: 'Amb el mateix denominador, se sumen els numeradors i el denominador es queda igual: 1/5 + 2/5 = 3/5, no 3/10.',
  },
  suma_num_den: {
    title: 'Sumar numeradors i denominadors',
    explain: '1/2 + 1/3 no és 2/5. Primer cal reduir a denominador comú: 3/6 + 2/6 = 5/6.',
  },
  denominador_comu_num: {
    title: 'Canviar el denominador i no el numerador',
    explain: 'Quan passes a denominador comú, el numerador també canvia: 1/2 = 3/6 (multipliquem dalt i baix per 3).',
  },
  enter_com_fraccio: {
    title: 'Sumar un enter amb una fracció',
    explain: 'Un nombre enter és una fracció amb denominador 1: 2 = 2/1 = 8/4. Per tant, 2 + 3/4 = 8/4 + 3/4 = 11/4.',
  },
  producte_creuat: {
    title: 'Multiplicar en creu',
    explain: 'Per multiplicar fraccions, numerador per numerador i denominador per denominador: 2/3 · 4/5 = 8/15. En creu es multiplica per dividir.',
  },
  producte_denominador: {
    title: 'Multiplicar també el denominador per l\'enter',
    explain: 'Per multiplicar un enter per una fracció, només es multiplica el numerador: 3 · 2/7 = 6/7.',
  },
  divisio_sense_invertir: {
    title: 'Dividir sense invertir',
    explain: 'Dividir per una fracció és multiplicar per la seva inversa: 2/3 : 4/5 = 2/3 · 5/4 = 10/12. O bé, multiplica en creu.',
  },
  divisio_inverteix_primera: {
    title: 'Invertir la fracció equivocada',
    explain: 'En una divisió s\'inverteix la segona fracció (el divisor), no la primera.',
  },
  inversa_confosa: {
    title: 'Confondre la inversa',
    explain: 'La inversa d\'una fracció s\'obté girant-la: la inversa de 3/5 és 5/3. Una fracció per la seva inversa fa 1.',
  },
  ordre_operacions: {
    title: 'Ordre de les operacions',
    explain: 'També amb fraccions: primer parèntesis, després multiplicacions i divisions, i al final sumes i restes.',
  },
  part_que_queda: {
    title: 'Confondre la part feta i la que queda',
    explain: 'Si se n\'ha gastat (o llegit, o omplert) una fracció, el que queda és la resta fins a la unitat: si se n\'ha gastat 2/5, en queden 3/5.',
  },
  fraccio_del_que_queda: {
    title: 'Fracció del que queda',
    explain: 'Quan diu «1/4 del que queda», la fracció s\'aplica a la part que queda, no al total. Calcula primer el que queda.',
  },
};
