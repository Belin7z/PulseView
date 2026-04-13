# ⚡ PulseView

[![Live Demo](https://img.shields.io/badge/demo-ao%20vivo-7c3aed?style=for-the-badge&logo=google-chrome&logoColor=white)](https://belin7z.github.io/PulseView/)
[![GitHub license](https://img.shields.io/github/license/Belin7z/PulseView?style=for-the-badge)](https://github.com/Belin7z/PulseView/blob/main/LICENSE)

Um relógio digital de alto desempenho feito com **Vanilla JS**, focado em estética gamer e utilidade. Sem frameworks, sem dependências, apenas código puro.

---

## 🚀 O que é isso?

O PulseView começou como um estudo de lógica e evoluiu para uma aplicação web completa (PWA). Ele combina um visual neon moderno com ferramentas essenciais: cronômetro, alarme e conversor de fusos.

> **Destaque:** Arquitetura refatorada para usar `requestAnimationFrame` (60fps) e persistência de estado via `localStorage`.

---

## ✨ Funcionalidades

- **🕒 Relógio Multi-Modo:** Escolha entre visual **Neon**, **Cards** ou **Minimalista**.
- **🎨 Temas Dinâmicos:** 5 variações de cores (Purple, Cyan, Red, Green Matrix e Minimal).
- **🌍 Global Ready:** Seletor de fusos horários com ajuste automático de offset.
- **⏱️ Stopwatch Pro:** Cronômetro com precisão de milissegundos e exportação de tempo.
- **⏰ Alarme Inteligente:** Notificações via Browser API e feedback visual pulsante.
- **📱 Mobile First:** Navegação por gestos (swipe) e suporte a PWA (funciona offline).
- **♿ Acessibilidade:** Suporte a `prefers-reduced-motion` e tags ARIA completas.

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

- [ ] Modo Foco (Pomodoro) integrado.
- [ ] Múltiplos alarmes nomeáveis.
- [ ] Personalização de sons de alarme.
- [ ] Widgets instaláveis para desktop.

---

## 💻 Rodando Local

```bash
git clone https://github.com/Belin7z/PulseView.git
cd PulseView
# Abra o index.html no navegador e divirta-se!
```

---

Feito com ❤️ por [Belin7z](https://github.com/Belin7z)
