# PulseView

**[>> demo ao vivo <<](https://belin7z.github.io/PulseView/)**

um relógio digital feito do zero com HTML, CSS e JS puro. sem frameworks, sem dependências. só código.

---

## o que é isso

comecei esse projeto pra praticar e foi crescendo. hoje tem tema, cronômetro, alarme, fuso horário, partículas no fundo, modo PWA... virou uma bagunça boa.

a ideia principal é exibir a hora atual com um visual gamer — fundo escuro, neon roxo, fonte monospace, aquele estilo.

---

## funcionalidades

- relógio em tempo real (HH:MM:SS)
- troca de temas: roxo, ciano, vermelho e verde
- seletor de fuso horário (Brasília, UTC, Tokyo, NY...)
- modo 12h/24h
- cronômetro com milissegundos
- alarme simples com beep
- partículas e estrelas no background (pausam quando a aba tá oculta)
- animação flip nos dígitos
- efeito glitch no título
- responsivo e funciona como PWA
- swipe no mobile

---

## stack

- HTML5
- CSS3 (variáveis, animações, glassmorphism)
- JavaScript puro (sem jQuery, sem nada)

---

## rodando local

```bash
git clone https://github.com/Belin7z/PulseView.git
cd PulseView
# abre o index.html no navegador, só isso
```

não precisa instalar nada. abre e roda.

---

## estrutura

```
PulseView/
├── index.html
├── manifest.json
├── css/
│   └── style.css
└── js/
    ├── clock.js
    └── particles.js
```

---

feito por [Belin7z](https://github.com/Belin7z) — projeto de estudo, tá em constante mudança
