// PulseView Particles - Stars + Gamer particles + Visibility pause

function getThemeColor(alpha = 0.8) {
  const style = getComputedStyle(document.body);
  const rgb = style.getPropertyValue('--glow-rgb').trim() || '168, 85, 247';
  return `rgba(${rgb}, ${alpha})`;
}

const COLORS = () => [
  getThemeColor(0.8),
  getThemeColor(0.6),
  getThemeColor(0.7),
  getThemeColor(0.5),
];

class Star {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.reset();
  }
  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = Math.random() * 1.5 + 0.2;
    this.opacity = Math.random() * 0.6 + 0.1;
    this.twinkleSpeed = Math.random() * 0.02 + 0.005;
    this.twinkleDir = 1;
  }
  update() {
    this.opacity += this.twinkleSpeed * this.twinkleDir;
    if (this.opacity >= 0.7 || this.opacity <= 0.05) this.twinkleDir *= -1;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    this.ctx.fill();
  }
}

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.reset();
  }
  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this.radius = Math.random() * 1.8 + 0.5;
    this.color = COLORS()[Math.floor(Math.random() * 4)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
  }
  draw() {
    const ctx = this.ctx;
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4);
    grad.addColorStop(0, this.color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.stars = [];
    this.numParticles = 80;
    this.numStars = 120;
    this.connectionDistance = 130;
    this.running = true;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    for (let i = 0; i < this.numParticles; i++) this.particles.push(new Particle(this.canvas));
    for (let i = 0; i < this.numStars; i++) this.stars.push(new Star(this.canvas));
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      this.running = !document.hidden;
      if (this.running) this.animate();
    });
    this.animate();
  }
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Re-scatter stars on resize
    this.stars.forEach(s => s.reset());
  }
  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.connectionDistance) {
          const alpha = (1 - dist / this.connectionDistance) * 0.35;
          this.ctx.beginPath();
          this.ctx.strokeStyle = getThemeColor(alpha);
          this.ctx.lineWidth = 0.6;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }
  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.stars.forEach(s => { s.update(); s.draw(); });
    this.particles.forEach(p => { p.update(); p.draw(); });
    this.drawConnections();
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem();
});
