/**
 * clock.js — Belin7z Clock
 * Responsabilidades:
 *   - Atualizar hora de Brasília em tempo real
 *   - Alternar entre Estilo NEON e CARDS
 */

'use strict';

// ---- Constantes de localização ----
const TZ      = 'America/Sao_Paulo';
const LOCALE  = 'pt-BR';
const DAYS    = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const MONTHS  = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

// ---- Elementos do DOM ----
const $ = id => document.getElementById(id);

const el = {
  nH:     $('n-h'),
  nM:     $('n-m'),
  nS:     $('n-s'),
  nDate:  $('n-date'),
  cH:     $('c-h'),
  cM:     $('c-m'),
  cS:     $('c-s'),
  cDate:  $('c-date'),
};

// ---- Estado interno ----
const prev = { h: null, m: null, s: null };

// ---- Helpers ----
const pad  = n => String(n).padStart(2, '0');

function brasilia() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
}

function formatDate(now) {
  return `${DAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]} de ${now.getFullYear()}`;
}

/**
 * Aplica classe .tick temporariamente para animar card.
 * @param {HTMLElement} el
 */
function tick(el) {
  el.classList.remove('tick');
  // Force reflow para reiniciar animação
  void el.offsetWidth;
  el.classList.add('tick');
  setTimeout(() => el.classList.remove('tick'), 200);
}

// ---- Atualizar relógio ----
function updateClock() {
  const now = brasilia();
  const h   = pad(now.getHours());
  const m   = pad(now.getMinutes());
  const s   = pad(now.getSeconds());
  const dateStr = formatDate(now);

  // -- NEON --
  el.nH.textContent   = h;
  el.nM.textContent   = m;
  el.nS.textContent   = s;
  el.nDate.textContent = dateStr;

  // -- CARDS (apenas anima o que mudou) --
  if (h !== prev.h) { el.cH.textContent = h; tick(el.cH); prev.h = h; }
  if (m !== prev.m) { el.cM.textContent = m; tick(el.cM); prev.m = m; }
  if (s !== prev.s) { el.cS.textContent = s; tick(el.cS); prev.s = s; }
  el.cDate.textContent = dateStr;
}

// ---- Alternar estilo ----
window.switchStyle = function(style) {
  const neon  = document.getElementById('clock-neon');
  const cards = document.getElementById('clock-cards');
  const btnN  = document.getElementById('btn-neon');
  const btnC  = document.getElementById('btn-cards');

  if (style === 'neon') {
    neon.classList.add('active');
    cards.classList.remove('active');
    btnN.classList.add('active');
    btnC.classList.remove('active');
  } else {
    cards.classList.add('active');
    neon.classList.remove('active');
    btnC.classList.add('active');
    btnN.classList.remove('active');
  }
};

// ---- Init ----
updateClock();
setInterval(updateClock, 1000);
