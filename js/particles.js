// Paleta gamer: roxo + magenta + azul
const COLORS = [
    'rgba(168, 85, 247, 0.7)',   // roxo
    'rgba(192, 38, 211, 0.6)',   // magenta
    'rgba(139, 92, 246, 0.7)',   // violeta
    'rgba(217, 70, 239, 0.5)',   // pink/magenta claro
];

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
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.glowColor = this.color.replace(/[\d.]+\)$/, '0.15)');
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
    }

    draw() {
        const ctx = this.ctx;
        // glow suave ao redor da particula
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        // nucleo
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
        this.numParticles = 90;
        this.connectionDistance = 130;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push(new Particle(this.canvas));
        }
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.connectionDistance) {
                    const alpha = (1 - distance / this.connectionDistance) * 0.4;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
                    this.ctx.lineWidth = 0.6;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            p.update();
            p.draw();
        });
        this.drawConnections();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
