/**
 * particles.js — Belin7z Clock
 * Responsabilidade: animação de partículas no canvas de fundo
 */

'use strict';

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // ---- Configável ----
  const CONFIG = {
    count:      70,
    minRadius:  0.4,
    maxRadius:  1.8,
    minSpeed:   0.08,
    maxSpeed:   0.4,
    color:      '168, 85, 247',   // RGB roxo
    minAlpha:   0.08,
    maxAlpha:   0.5,
  };

  let particles = [];
  let W = 0;
  let H = 0;

  // ---- Ajusta canvas ao tamanho da janela ----
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // ---- Cria uma partícula com valores aleatórios ----
  function createParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      vy:  -(CONFIG.minSpeed   + Math.random() * (CONFIG.maxSpeed   - CONFIG.minSpeed)),
      alpha: CONFIG.minAlpha   + Math.random() * (CONFIG.maxAlpha   - CONFIG.minAlpha),
    };
  }

  // ---- Inicializa todas as partículas ----
  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  // ---- Loop principal de animação ----
  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      // Move para cima
      p.y += p.vy;

      // Quando sai pelo topo, recoloca na base
      if (p.y + p.r < 0) {
        p.x     = Math.random() * W;
        p.y     = H + p.r;
        p.alpha = CONFIG.minAlpha + Math.random() * (CONFIG.maxAlpha - CONFIG.minAlpha);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color}, ${p.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  // ---- Listeners ----
  window.addEventListener('resize', () => {
    resize();
    // Redistribui x para a nova largura; mantém y relativo
    for (const p of particles) {
      if (p.x > W) p.x = Math.random() * W;
    }
  });

  // ---- Start ----
  init();
  draw();

}());
