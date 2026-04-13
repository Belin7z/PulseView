# ⚡ PulseView

[![Live Demo](https://img.shields.io/badge/demo-ao%20vivo-7c3aed?style=for-the-badge&logo=google-chrome&logoColor=white)](https://belin7z.github.io/PulseView/)
[![GitHub license](https://img.shields.io/github/license/Belin7z/PulseView?style=for-the-badge)](https://github.com/Belin7z/PulseView/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Belin7z/PulseView?style=for-the-badge)](https://github.com/Belin7z/PulseView/stargazers)
[![GitHub repo size](https://img.shields.io/github/repo-size/Belin7z/PulseView?style=for-the-badge)](https://github.com/Belin7z/PulseView)

Um relógio digital de alto desempenho feito com **Vanilla JS**, focado em estética gamer e utilidade. Sem frameworks, sem dependências, apenas código puro.

---

## 🚀 O que é isso?

O PulseView começou como um estudo de lógica e evoluiu para uma aplicação web completa (PWA). Ele combina um visual neon moderno com ferramentas essenciais: pomodoro, cronômetro, alarme múltiplo e conversor de fusos.

> **Destaque:** Arquitetura refatorada para usar `requestAnimationFrame` (60fps) e persistência de estado via `localStorage`.

---

## ✨ Funcionalidades

- **🕙 Relógio Multi-Modo:** Escolha entre visual **Neon**, **Cards**, **Minimalista** ou **Pomodoro**.
- **🎨 Temas Dinâmicos:** 5 variações de cores (Purple, Cyan, Red, Green Matrix e Minimal).
- **🌍 Global Ready:** Seletor de fusos horários com ajuste automático de offset.
- **⏱️ Stopwatch Pro:** Cronômetro com precisão de milissegundos e exportação de tempo.
- **🍅 Pomodoro:** Ciclos de foco e descanso com contador de sessões.
- **🔔 Alarme Inteligente:** Múltiplos alarmes com feedback visual pulsante e áudio.
- **📱 Mobile First:** Navegação por gestos (swipe) e suporte a PWA (funciona offline).
- **♿ Acessibilidade:** Suporte a `prefers-reduced-motion` e tags ARIA completas.

---

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| `Space` | Iniciar/Pausar (Pomodoro/Stopwatch) |
| `R` | Resetar (Pomodoro/Stopwatch) |
| `T` | Alternar Tema de Cor |
| `S` | Abrir/Fechar Configurações |
| `F` | Alternar Tela Cheia |

---

## 🛠️ Tecnologias & Conceitos

- **HTML5 Semântico:** SEO e acessibilidade estrutural.
- **CSS3 Moderno:** Variáveis CSS, Grid/Flexbox, animações otimizadas e Glassmorphism.
- **Vanilla JavaScript:**
    - `requestAnimationFrame` para performance.
    - `Intl.DateTimeFormat` para internacionalização.
    - `Notification API` para alertas em background.
    - `Service Workers` para suporte offline.
- **UI/UX:** Design responsivo e sistema de temas escalável.

---

## 🗺️ Roadmap de Melhorias

- [x] Refatoração Modular (State Management)
- [x] Sistema de Temas Dinâmicos
- [x] Módulo Pomodoro com sessões
- [x] Múltiplos Alarmes
- [x] Exportação de Configurações (JSON)
- [ ] Tutorial interativo de primeiro uso
- [ ] Widgets customizáveis para Dashboard
- [ ] Integração com Spotify/Soundcloud (Visualizer)
- [ ] Suporte a Temas Comunitários via JSON

---

## 👤 Autor

**Jefferson Alves (Belin7z)**
- GitHub: [@Belin7z](https://github.com/Belin7z)
- LinkedIn: [Jefferson Alves](https://www.linkedin.com/in/jefferson-alves-belin7z/)

---

*Desenvolvido com ❤️ para a comunidade gamer e dev.*
