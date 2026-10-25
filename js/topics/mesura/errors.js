/* Catàleg d'errors típics del tema de la mesura (6è de primària).
 * Cada error té un títol curt i una explicació que es mostra a la pàgina de progrés.
 */
window.MathLab = window.MathLab || {};
window.MathLab.mesura = window.MathLab.mesura || {};

window.MathLab.mesura.errors = {
  direccio: {
    title: 'Multiplicar en lloc de dividir (o al revés)',
    explain: 'Si passes a una unitat més petita, el nombre es fa més gran: multiplica. Si passes a una unitat més gran, el nombre es fa més petit: divideix.',
  },
  graons: {
    title: 'Comptar malament els graons',
    explain: 'Compta quants graons hi ha a l\'escala entre les dues unitats: cada graó és un zero més (o un lloc més per a la coma).',
  },
  forma_complexa: {
    title: 'Ajuntar les xifres sense passar-les a la mateixa unitat',
    explain: '2 m 5 cm no són 25 cm: primer passa els metres a centímetres (200 cm) i després suma (200 + 5 = 205 cm).',
  },
  unitats_diferents: {
    title: 'Sumar quantitats en unitats diferents',
    explain: 'Abans de sumar o comparar, passa totes les quantitats a la mateixa unitat.',
  },
  factor_superficie: {
    title: 'Fer servir ×10 a la superfície',
    explain: 'A les unitats de superfície (m², dm², cm²…) cada graó és ×100, no ×10: 1 m² = 100 dm².',
  },
  factor_volum: {
    title: 'Fer servir ×10 o ×100 al volum',
    explain: 'A les unitats de volum (m³, dm³, cm³…) cada graó és ×1.000: 1 m³ = 1.000 dm³.',
  },
  volum_capacitat: {
    title: 'Confondre volum i capacitat',
    explain: '1 dm³ = 1 litre i 1 cm³ = 1 ml. Per passar de volum a litres, primer passa el volum a dm³.',
  },
  base_100: {
    title: 'Comptar el temps (o els angles) de 100 en 100',
    explain: '1 hora té 60 minuts i 1 minut té 60 segons (no 100). Als angles, igual: 1° = 60′ i 1′ = 60″.',
  },
  portar_60: {
    title: 'No passar 60 minuts a 1 hora',
    explain: 'Quan en sumar surten 60 minuts o més, treu-ne 60 i suma 1 a les hores. Quan restes i no n\'hi ha prou, converteix 1 hora en 60 minuts. Als angles, igual amb els graus.',
  },
  compl_supl: {
    title: 'Confondre complementari i suplementari',
    explain: 'Dos angles complementaris sumen 90°; dos de suplementaris sumen 180°.',
  },
  tipus_angle: {
    title: 'Classificar malament un angle',
    explain: 'Agut: menys de 90°. Recte: 90°. Obtús: entre 90° i 180°. Pla: 180°.',
  },
  suma_triangle: {
    title: 'Oblidar que els angles d\'un triangle sumen 180°',
    explain: 'Els tres angles de qualsevol triangle sumen 180°. El que falta és 180° menys la suma dels altres dos.',
  },
  perimetre_area: {
    title: 'Confondre perímetre i àrea',
    explain: 'El perímetre és la vora: se sumen els costats (cm). L\'àrea és el que hi ha a dins: es multiplica (cm²).',
  },
  meitat_perimetre: {
    title: 'Sumar només dos costats',
    explain: 'Un rectangle té quatre costats: el perímetre és base + altura + base + altura = 2 · (base + altura).',
  },
  oblida_meitat: {
    title: 'Oblidar de dividir entre 2',
    explain: 'L\'àrea del triangle, del rombe, del trapezi i del polígon regular porta un «: 2». Un triangle és la meitat d\'un rectangle.',
  },
  costat_inclinat: {
    title: 'Fer servir el costat inclinat com a altura',
    explain: 'L\'altura és la distància recta (perpendicular) entre les dues bases, no el costat inclinat.',
  },
  meitat_de_mes: {
    title: 'Dividir entre 2 quan no toca',
    explain: 'El rectangle, el quadrat i el paral·lelogram fan base · altura, sense dividir entre 2.',
  },
  trapezi_bases: {
    title: 'Oblidar una de les bases del trapezi',
    explain: 'L\'àrea del trapezi fa servir les dues bases: (base gran + base petita) · altura : 2.',
  },
  radi_diametre: {
    title: 'Confondre radi i diàmetre',
    explain: 'El diàmetre és el doble del radi. Les fórmules del cercle fan servir el radi: si et donen el diàmetre, divideix-lo entre 2.',
  },
  quadrat_doble: {
    title: 'Elevar al quadrat no és multiplicar per 2',
    explain: 'r² vol dir r · r. Per exemple, 5² = 25, no 10.',
  },
  volum_area: {
    title: 'Multiplicar només dues dimensions',
    explain: 'El volum d\'un ortoedre multiplica les tres dimensions: llargada · amplada · altura. Amb dues només tens l\'àrea de la base.',
  },
  suma_dimensions: {
    title: 'Sumar les dimensions en lloc de multiplicar-les',
    explain: 'Per calcular un volum, les dimensions es multipliquen, no se sumen.',
  },
};
