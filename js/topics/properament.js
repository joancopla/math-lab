/* Temes que encara no estan fets. Quan en facis un, crea'n la carpeta (com js/topics/potencies/),
 * esborra'l d'aquesta llista i afegeix-ne els scripts a index.html. */
(function (ML) {
  'use strict';

  [
    { id: 'divisibilitat', title: 'Divisibilitat', icon: '÷', color: '#e0703a', description: 'Múltiples, divisors, nombres primers, mcd i mcm.' },
    { id: 'enters', title: 'Nombres enters', icon: '±', color: '#2a9d8f', description: 'Positius i negatius, la recta numèrica i les operacions.' },
    { id: 'fraccions', title: 'Fraccions', icon: '½', color: '#d6457a', description: 'Fraccions equivalents, simplificar, comparar i operar.' },
    { id: 'decimals', title: 'Nombres decimals', icon: '0,5', color: '#3a7bd5', description: 'Ordenar, arrodonir i operar amb decimals.' },
  ].forEach((t) => ML.topics.register(Object.assign({ comingSoon: true }, t)));
})(window.MathLab);
