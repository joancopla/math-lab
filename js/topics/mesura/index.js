/* Tema de 6è de primària: la mesura. Uneix el catàleg d'errors, els generadors i les visualitzacions, i registra el tema. */
(function (ML) {
  'use strict';

  const MS = ML.mesura;
  const G = MS.generators;
  const escala = '<p><a class="btn btn-small btn-ghost" href="#/tema/mesura/visual/escala">🪜 L\'escala de les unitats</a></p>';

  ML.topics.register({
    id: 'mesura',
    course: '6e',
    title: 'Mesura',
    pathTitle: 'El camí de la mesura',
    icon: 'm²',
    color: '#0d9488',
    description: 'Unitats de longitud, massa, capacitat, superfície i volum; el temps i els angles; perímetres, àrees i volums.',
    errors: MS.errors,
    skills: [
      {
        id: 'longitud',
        rule: 'km · hm · dam · <b>m</b> · dm · cm · mm',
        title: 'Longitud',
        summary: 'Canvis d\'unitat amb l\'escala de la longitud.',
        levels: ['Enters, 1 o 2 graons', 'Decimals, fins a 3 graons', 'Formes complexes i problemes'],
        theory: `
          <p>Les unitats de longitud formen una <b>escala</b>: km, hm, dam, <b>m</b>, dm, cm, mm. Cada graó és 10 vegades més petit que l'anterior.</p>
          <div class="formula">Cap avall (unitat més petita): · 10 a cada graó &nbsp;·&nbsp; Cap amunt: : 10</div>
          <div class="formula">3,5 km = 3.500 m &nbsp;&nbsp; 250 cm = 2,5 m</div>
          <p class="warn">⚠️ Si la unitat es fa més petita, el nombre es fa més gran (i al revés).</p>
          ${escala}`,
        generate: G.longitud,
      },
      {
        id: 'massa_capacitat',
        rule: 'kg · hg · dag · <b>g</b> &nbsp;|&nbsp; kl · hl · dal · <b>l</b> · dl · cl · ml',
        title: 'Massa i capacitat',
        summary: 'Grams, quilos i tones; litres i mil·lilitres.',
        levels: ['Enters, 1 o 2 graons', 'Decimals, fins a 3 graons', 'Tones, formes complexes i problemes'],
        theory: `
          <p>La massa i la capacitat funcionen com la longitud: cada graó és · 10 cap avall i : 10 cap amunt.</p>
          <div class="formula">kg · hg · dag · <b>g</b> · dg · cg · mg</div>
          <div class="formula">kl · hl · dal · <b>l</b> · dl · cl · ml</div>
          <p>A més, <b>1 tona (t) = 1.000 kg</b>.</p>
          <p class="warn">⚠️ 1 kg = 1.000 g i 1 l = 1.000 ml: hi ha 3 graons.</p>
          ${escala}`,
        generate: G.massa_capacitat,
      },
      {
        id: 'superficie_volum',
        rule: '1 m² = 100 dm² &nbsp; 1 m³ = 1.000 dm³ &nbsp; 1 dm³ = 1 l',
        title: 'Unitats de superfície i volum',
        summary: 'm², cm², hectàrees, m³ i litres.',
        levels: ['Superfície, 1 graó', 'Superfície i volum', 'Volum, litres i hectàrees'],
        theory: `
          <p><b>Superfície</b> (m², dm², cm²…): cada graó és <b>· 100</b>. 1 m² = 100 dm² = 10.000 cm².</p>
          <p><b>Volum</b> (m³, dm³, cm³…): cada graó és <b>· 1.000</b>. 1 m³ = 1.000 dm³.</p>
          <div class="formula">1 dm³ = 1 l &nbsp;&nbsp; 1 cm³ = 1 ml &nbsp;&nbsp; 1 ha = 1 hm² = 10.000 m²</div>
          <p class="warn">⚠️ Un quadrat d'1 m de costat té 10 · 10 = 100 quadrets d'1 dm²: per això és · 100 i no · 10.</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/mesura/visual/escala">🪜 L'escala de les unitats</a></p>`,
        generate: G.superficie_volum,
      },
      {
        id: 'temps',
        rule: '1 h = 60 min &nbsp; 1 min = 60 s',
        title: 'El temps',
        summary: 'Hores, minuts i segons; durades i horaris.',
        levels: ['Passar a minuts i segons', 'Durades i horaris', 'Sumar temps i hora d\'arribada'],
        theory: `
          <p>El temps no va de 10 en 10: <b>1 h = 60 min</b> i <b>1 min = 60 s</b>. Per tant, 1 h = 3.600 s.</p>
          <div class="formula">2 h 15 min = 2 · 60 + 15 = 135 min</div>
          <p>Mitja hora = 30 min · Un quart d'hora = 15 min · 1,5 h = 90 min.</p>
          <p class="warn">⚠️ Quan sumes i tens 60 minuts o més, passa'ls a hores: 1 h 75 min = 2 h 15 min.</p>`,
        generate: G.temps,
      },
      {
        id: 'angles',
        rule: '1° = 60′ &nbsp; 1′ = 60″',
        title: 'Els angles',
        summary: 'Tipus d\'angles, graus i minuts, complementaris i suplementaris.',
        levels: ['Tipus d\'angles i minuts', 'Complementaris i triangles', 'Sumar i restar graus i minuts'],
        theory: `
          <p><b>Agut</b>: menys de 90°. <b>Recte</b>: 90°. <b>Obtús</b>: entre 90° i 180°. <b>Pla</b>: 180°.</p>
          <p>Els angles es mesuren en graus, minuts i segons, com el temps: <b>1° = 60′</b> i <b>1′ = 60″</b>.</p>
          <div class="formula">Complementaris: sumen 90° &nbsp;·&nbsp; Suplementaris: sumen 180°</div>
          <p>Els tres angles d'un triangle sumen <b>180°</b>.</p>
          <p class="warn">⚠️ Per restar 90° − 35° 20′, escriu 90° com 89° 60′.</p>`,
        generate: G.angles,
      },
      {
        id: 'arees',
        rule: 'triangle: b · h : 2',
        title: 'Perímetres i àrees',
        summary: 'Rectangle, triangle, paral·lelogram, rombe, trapezi, polígons regulars i cercle.',
        levels: ['Rectangle i quadrat', 'Triangle, paral·lelogram, rombe i trapezi', 'Polígons regulars i cercle'],
        theory: `
          <p>El <b>perímetre</b> és la vora (se sumen els costats, en cm). L'<b>àrea</b> és el que hi ha a dins (en cm²).</p>
          <ul>
            <li>Rectangle i paral·lelogram: b · h. Quadrat: c · c.</li>
            <li>Triangle: b · h : 2. Rombe: D · d : 2.</li>
            <li>Trapezi: (B + b) · h : 2.</li>
            <li>Polígon regular: perímetre · apotema : 2.</li>
            <li>Cercle: àrea = 3,14 · r · r; circumferència = 2 · 3,14 · r.</li>
          </ul>
          <p class="warn">⚠️ L'altura és la línia recta (perpendicular), no el costat inclinat.</p>
          <p><a class="btn btn-small btn-ghost" href="#/tema/mesura/visual/figures">📐 D'on surten les fórmules</a></p>`,
        generate: G.arees,
      },
      {
        id: 'volums',
        rule: 'V = llargada · amplada · altura',
        title: 'Volums',
        summary: 'Cub, ortoedre, prisma i cilindre; quants litres hi caben.',
        levels: ['Cub i ortoedre', 'Litres i altura que falta', 'Prisma i cilindre'],
        theory: `
          <p>El <b>volum</b> és l'espai que ocupa un cos. Es mesura en cm³, dm³, m³…</p>
          <ul>
            <li>Cub: a · a · a.</li>
            <li>Ortoedre (una capsa): llargada · amplada · altura.</li>
            <li>Prisma i cilindre: àrea de la base · altura.</li>
          </ul>
          <div class="formula">1.000 cm³ = 1 dm³ = 1 litre</div>
          <p class="warn">⚠️ Es multipliquen les <b>tres</b> mides. Amb dues només tens l'àrea de la base.</p>`,
        generate: G.volums,
      },
    ],
    visuals: [
      { id: 'escala', emoji: '🪜', title: 'L\'escala de les unitats', description: 'La mateixa quantitat a cada graó. Toca un graó i mira per què multipliques o divideixes.', mount: MS.escala.mount },
      { id: 'figures', emoji: '📐', title: 'Àrees de les figures', description: 'Canvia les mides i descobreix d\'on surt la fórmula de cada figura.', mount: MS.figures.mount },
    ],
  });
})(window.MathLab);
