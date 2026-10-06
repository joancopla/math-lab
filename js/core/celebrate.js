/* Celebracions: confeti i avisos breus (toasts). Sense dependències; respecta «reduir moviment». */
(function (ML) {
  'use strict';

  const COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#fbbf24', '#ec4899', '#06b6d4'];
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Pluja de confeti des de dalt. `amount` = nombre de peces. */
  function confetti(amount = 70) {
    if (reduced()) return;
    const layer = document.createElement('div');
    layer.className = 'confetti';
    layer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < amount; i++) {
      const p = document.createElement('i');
      const size = 6 + Math.random() * 8;
      p.style.left = `${Math.random() * 100}%`;
      p.style.width = `${size}px`;
      p.style.height = `${size * (0.4 + Math.random() * 0.8)}px`;
      p.style.background = COLORS[i % COLORS.length];
      p.style.setProperty('--drift', `${(Math.random() - 0.5) * 240}px`);
      p.style.setProperty('--spin', `${(Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 720)}deg`);
      p.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
      p.style.animationDelay = `${Math.random() * 0.4}s`;
      if (Math.random() < 0.3) p.style.borderRadius = '50%';
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 3600);
  }

  /** Avís breu a dalt de la pantalla. També s'anuncia al lector de pantalla. */
  function toast(html, { kind = 'info', ms = 2600 } = {}) {
    let host = document.querySelector('.toasts');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toasts';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    const t = document.createElement('div');
    t.className = `toast toast-${kind}`;
    t.innerHTML = html;
    host.appendChild(t);
    setTimeout(() => {
      t.classList.add('is-leaving');
      setTimeout(() => t.remove(), 300);
    }, ms);
  }

  ML.celebrate = { confetti, toast };
})(window.MathLab);
