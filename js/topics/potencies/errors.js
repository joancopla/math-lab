/* Catàleg d'errors típics del tema de potències.
 * Cada exercici fa servir aquests identificadors als seus "traps"; aquí hi ha el títol i
 * l'explicació general que es mostra a la pàgina de progrés.
 */
window.MathLab = window.MathLab || {};
window.MathLab.potencies = window.MathLab.potencies || {};

window.MathLab.potencies.errors = {
  base_exponent_girats: {
    title: 'Confondre la base i l\'exponent',
    explain: 'La base és el nombre que es multiplica (el gran, a baix). L\'exponent diu quantes vegades es multiplica (el petit, a dalt).',
  },
  base_per_exponent: {
    title: 'Multiplicar la base per l\'exponent',
    explain: '2³ no és 2 · 3 = 6. És 2 · 2 · 2 = 8. L\'exponent no és un factor: indica quantes vegades es repeteix la base.',
  },
  suma_en_lloc_de_producte: {
    title: 'Confondre potència i suma repetida',
    explain: 'Una suma repetida (5 + 5 + 5) és una multiplicació (5 · 3). Una multiplicació repetida (5 · 5 · 5) és una potència (5³).',
  },
  factors_mal_comptats: {
    title: 'Comptar malament els factors',
    explain: 'L\'exponent ha de coincidir exactament amb el nombre de vegades que es multiplica la base. Compta els factors amb calma.',
  },
  bases_diferents: {
    title: 'Ajuntar bases diferents',
    explain: 'Només podem agrupar en una sola potència els factors que tenen la mateixa base.',
  },
  zeros_10: {
    title: 'Comptar malament els zeros de 10ⁿ',
    explain: '10ⁿ és un 1 seguit de n zeros: 10³ = 1.000 (tres zeros).',
  },
  ordre_operacions: {
    title: 'Ordre de les operacions',
    explain: 'Les potències es calculen abans que les multiplicacions, les divisions, les sumes i les restes (si no hi ha parèntesis).',
  },
  suma_de_potencies: {
    title: 'Potència d\'una suma',
    explain: '(a + b)² no és igual a a² + b². Primer es resol el parèntesi i després s\'eleva.',
  },
  producte_multiplica_exponents: {
    title: 'Multiplicar exponents en un producte',
    explain: 'aᵐ · aⁿ = aᵐ⁺ⁿ. En un producte de potències de la mateixa base, els exponents se sumen.',
  },
  producte_multiplica_bases: {
    title: 'Multiplicar les bases',
    explain: 'En un producte de potències de la mateixa base, la base es manté: 3² · 3⁴ = 3⁶, no 9⁶.',
  },
  exponent_1_ocult: {
    title: 'Oblidar l\'exponent 1 amagat',
    explain: 'Un nombre sense exponent té exponent 1: 5 = 5¹. Per tant, 5 · 5³ = 5⁴.',
  },
  equacio_exponent: {
    title: 'Operació inversa en buscar l\'exponent',
    explain: 'Per trobar un exponent que falta, desfés l\'operació: si en un producte se sumen, per trobar-lo has de restar.',
  },
  quocient_suma_exponents: {
    title: 'Sumar exponents en una divisió',
    explain: 'aᵐ : aⁿ = aᵐ⁻ⁿ. En un quocient de potències de la mateixa base, els exponents es resten.',
  },
  quocient_divideix_exponents: {
    title: 'Dividir els exponents',
    explain: 'En un quocient de potències de la mateixa base, els exponents es resten, no es divideixen: 2⁶ : 2³ = 2³, no 2².',
  },
  quocient_divideix_bases: {
    title: 'Dividir les bases',
    explain: 'La base es manté: 7⁵ : 7² = 7³, no 1³.',
  },
  potencia_suma_exponents: {
    title: 'Sumar exponents en una potència de potència',
    explain: '(aᵐ)ⁿ = aᵐ·ⁿ. Quan elevem una potència a una altra potència, els exponents es multipliquen.',
  },
  potencia_eleva_exponents: {
    title: 'Elevar un exponent a l\'altre',
    explain: '(2³)² = 2⁶ (3 · 2), no 2⁹ (3²).',
  },
  exponent_zero_es_zero: {
    title: 'Pensar que a⁰ = 0',
    explain: 'Qualsevol nombre diferent de 0 elevat a 0 fa 1. Per exemple, 5³ : 5³ = 5⁰ i, alhora, és 1.',
  },
  exponent_zero_es_base: {
    title: 'Pensar que a⁰ = a',
    explain: 'a⁰ = 1, no a. És a¹ el que val a.',
  },
  exponent_u_es_u: {
    title: 'Pensar que a¹ = 1',
    explain: 'a¹ = a: la base apareix una sola vegada. És a⁰ el que val 1.',
  },
  un_elevat: {
    title: 'Potències de base 1',
    explain: '1 multiplicat per si mateix sempre fa 1: 1ⁿ = 1.',
  },
  zero_elevat: {
    title: 'Potències de base 0',
    explain: '0 multiplicat per qualsevol nombre fa 0: 0ⁿ = 0 (si n > 0).',
  },
  arrel_meitat: {
    title: 'Confondre l\'arrel quadrada amb la meitat',
    explain: 'L\'arrel quadrada de 36 és 6 perquè 6 · 6 = 36. No és la meitat (18).',
  },
  arrel_terc: {
    title: 'Confondre l\'arrel cúbica amb el terç',
    explain: 'L\'arrel cúbica de 27 és 3 perquè 3 · 3 · 3 = 27. No és el terç (9).',
  },
  cub_vs_quadrat: {
    title: 'Confondre quadrat i cub',
    explain: 'El quadrat és n · n (exponent 2). El cub és n · n · n (exponent 3).',
  },
  quadrat_doble: {
    title: 'Confondre el quadrat amb el doble',
    explain: 'El quadrat de 6 és 6 · 6 = 36, no 6 · 2 = 12.',
  },
  cub_triple: {
    title: 'Confondre el cub amb el triple',
    explain: 'El cub de 4 és 4 · 4 · 4 = 64, no 4 · 3 = 12.',
  },
  no_es_quadrat: {
    title: 'Reconèixer quadrats i cubs perfectes',
    explain: 'Un quadrat perfecte és el resultat de multiplicar un nombre natural per si mateix. Si queda entre dos quadrats consecutius, no ho és.',
  },
};
