/**
 * PulseView - Clock Logic
 * Jefferson Alves (Belin7z)
 */

function updateClock() {
    const now = new Date();
    
    // Componentes de tempo
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    
    // Componentes de data
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let dateStr = now.toLocaleDateString('pt-BR', options);
    
    // Progresso dos segundos
    const progress = (now.getSeconds() / 60) * 100;

    // Atualizar Estilo A (Neon)
    const nh = document.getElementById('n-h');
    const nm = document.getElementById('n-m');
    const ns = document.getElementById('n-s');
    const nDate = document.getElementById('n-date');
    const nProgress = document.getElementById('progress-bar');

    if (nh) nh.textContent = h;
    if (nm) nm.textContent = m;
    if (ns) ns.textContent = s;
    if (nDate) nDate.textContent = dateStr;
    if (nProgress) nProgress.style.width = `${progress}%`;

    // Atualizar Estilo B (Cards)
    const ch = document.getElementById('c-h');
    const cm = document.getElementById('c-m');
    const cs = document.getElementById('c-s');
    const cDate = document.getElementById('c-date');
    const cProgress = document.getElementById('progress-bar-c');

    if (ch) ch.textContent = h;
    if (cm) cm.textContent = m;
    if (cs) cs.textContent = s;
    if (cDate) cDate.textContent = dateStr;
    if (cProgress) cProgress.style.width = `${progress}%`;

    requestAnimationFrame(updateClock);
}

// Função para alternar estilos
window.switchStyle = function(style) {
    const neon = document.getElementById('clock-neon');
    const cards = document.getElementById('clock-cards');
    const btnNeon = document.getElementById('btn-neon');
    const btnCards = document.getElementById('btn-cards');

    if (style === 'neon') {
        neon.classList.add('active');
        cards.classList.remove('active');
        btnNeon.classList.add('active');
        btnCards.classList.remove('active');
    } else {
        cards.classList.add('active');
        neon.classList.remove('active');
        btnCards.classList.add('active');
        btnNeon.classList.remove('active');
    }
}

// Efeito Parallax
document.addEventListener('mousemove', (e) => {
    const clockSection = document.getElementById('clock-section');
    if (!clockSection) return;

    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    const x = (clientX - innerWidth / 2) / 30;
    const y = (clientY - innerHeight / 2) / 30;

    clockSection.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
});
