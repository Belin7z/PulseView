/**
 * PulseView - Clock Module
 * Refactored with rAF, Notification API, Keyboard Shortcuts, Fullscreen
 * @author Belin7z (Jefferson Alves)
 */

// ===================
// STATE & CONFIG
// ===================
const App = {
  settings: {
    timezone: 'America/Sao_Paulo',
    format24: true,
    theme: 'purple',
    alarmTime: null,
    alarmActive: false
  },
  stopwatch: {
    running: false,
    startTime: 0,
    elapsed: 0
  },
  prevValues: { h: '', m: '', s: '' },
  touchStartX: 0,
  touchEndX: 0,
  rafId: null,
  audioContext: null,

  init() {
    this.loadSettings();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.updateTimezoneLabel();
    this.startClock();
    this.registerServiceWorker();
    this.requestNotificationPermission();
  },

  // ===================
  // SETTINGS & STORAGE
  // ===================
  loadSettings() {
    const saved = localStorage.getItem('pulseview-settings');
    if (saved) {
      Object.assign(this.settings, JSON.parse(saved));
      document.body.dataset.theme = this.settings.theme;
      const tzSelect = document.getElementById('tz-select');
      if (tzSelect) tzSelect.value = this.settings.timezone;

      // Update theme buttons
      document.querySelectorAll('.theme-btn').forEach(btn => {
        const isActive = btn.dataset.theme === this.settings.theme;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
      });

      // Update format buttons
      if (!this.settings.format24) {
        const fmt24 = document.getElementById('fmt-24');
        const fmt12 = document.getElementById('fmt-12');
        if (fmt24) { fmt24.classList.remove('active'); fmt24.setAttribute('aria-pressed', 'false'); }
        if (fmt12) { fmt12.classList.add('active'); fmt12.setAttribute('aria-pressed', 'true'); }
      }
    }
  },

  saveSettings() {
    localStorage.setItem('pulseview-settings', JSON.stringify(this.settings));
  },

  // ===================
  // EVENT LISTENERS
  // ===================
  setupEventListeners() {
    // Settings panel
    const settingsBtn = document.getElementById('settings-btn');
    const settingsClose = document.getElementById('settings-close');
    const settingsOverlay = document.getElementById('settings-overlay');

    if (settingsBtn) settingsBtn.addEventListener('click', () => this.toggleSettings(true));
    if (settingsClose) settingsClose.addEventListener('click', () => this.toggleSettings(false));
    if (settingsOverlay) settingsOverlay.addEventListener('click', () => this.toggleSettings(false));

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => this.changeTheme(btn.dataset.theme));
    });

    // Time format
    const fmt24 = document.getElementById('fmt-24');
    const fmt12 = document.getElementById('fmt-12');
    if (fmt24) fmt24.addEventListener('click', () => this.setFormat(true));
    if (fmt12) fmt12.addEventListener('click', () => this.setFormat(false));

    // Timezone
    const tzSelect = document.getElementById('tz-select');
    if (tzSelect) {
      tzSelect.addEventListener('change', (e) => {
        this.settings.timezone = e.target.value;
        this.saveSettings();
        this.updateTimezoneLabel();
      });
    }

    // Alarm
    const alarmToggle = document.getElementById('alarm-toggle');
    if (alarmToggle) alarmToggle.addEventListener('click', () => this.toggleAlarm());

    // Stopwatch
    const swStart = document.getElementById('sw-start');
    const swReset = document.getElementById('sw-reset');
    if (swStart) swStart.addEventListener('click', () => this.toggleStopwatch());
    if (swReset) swReset.addEventListener('click', () => this.resetStopwatch());

    // Fullscreen
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

    // Export stopwatch
    const btnExportSw = document.getElementById('btn-export-sw');
    if (btnExportSw) btnExportSw.addEventListener('click', () => this.exportStopwatch());

    // Mobile swipe
    const clockSection = document.getElementById('clock-section');
    if (clockSection) {
      clockSection.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      clockSection.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });
    }

    // Parallax effect (throttled)
    let parallaxTimeout = null;
    document.addEventListener('mousemove', (e) => {
      if (parallaxTimeout) return;
      parallaxTimeout = setTimeout(() => {
        parallaxTimeout = null;
        const x = (e.clientX - window.innerWidth / 2) / 30;
        const y = (e.clientY - window.innerHeight / 2) / 30;
        if (clockSection) {
          clockSection.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
        }
      }, 16); // ~60fps
    });

    // Mode buttons
    const btnNeon = document.getElementById('btn-neon');
    const btnCards = document.getElementById('btn-cards');
    const btnStopwatch = document.getElementById('btn-stopwatch');
    if (btnNeon) btnNeon.addEventListener('click', () => this.switchStyle('neon'));
    if (btnCards) btnCards.addEventListener('click', () => this.switchStyle('cards'));
    if (btnStopwatch) btnStopwatch.addEventListener('click', () => this.switchStyle('stopwatch'));
  },

  // ===================
  // KEYBOARD SHORTCUTS
  // ===================
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      // Space: toggle stopwatch
      if (key === ' ') {
        e.preventDefault();
        const activeMode = document.querySelector('.clock.active')?.id;
        if (activeMode === 'clock-stopwatch') {
          this.toggleStopwatch();
        }
      }

      // R: reset stopwatch
      if (key === 'r') {
        e.preventDefault();
        this.resetStopwatch();
      }

      // T: cycle themes
      if (key === 't') {
        e.preventDefault();
        const themes = ['purple', 'cyan', 'red', 'green'];
        const idx = themes.indexOf(this.settings.theme);
        const nextTheme = themes[(idx + 1) % themes.length];
        this.changeTheme(nextTheme);
      }

      // F: fullscreen
      if (key === 'f') {
        e.preventDefault();
        this.toggleFullscreen();
      }

      // S: settings
      if (key === 's') {
        e.preventDefault();
        const panel = document.getElementById('settings-panel');
        const isOpen = panel?.classList.contains('active');
        this.toggleSettings(!isOpen);
      }

      // Escape: close settings
      if (key === 'escape') {
        this.toggleSettings(false);
      }
    });
  },

  // ===================
  // CLOCK CORE (using rAF)
  // ===================
  startClock() {
    const tick = () => {
      this.updateClock();
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  },

  updateClock() {
    const now = new Date();
    const tz = this.settings.timezone;
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !this.settings.format24
    });
    const parts = formatter.formatToParts(now);
    const get = (type) => parts.find(p => p.type === type)?.value || '00';

    let h = get('hour');
    let m = get('minute');
    let s = get('second');

    // Flip animation
    this.setWithFlip('n-h-flip', 'n-h', h, this.prevValues.h);
    this.setWithFlip('n-m-flip', 'n-m', m, this.prevValues.m);
    this.setWithFlip('n-s-flip', 'n-s', s, this.prevValues.s);
    this.setWithFlip('c-h', 'c-h', h, this.prevValues.h, true);
    this.setWithFlip('c-m', 'c-m', m, this.prevValues.m, true);
    this.setWithFlip('c-s', 'c-s', s, this.prevValues.s, true);

    this.prevValues = { h, m, s };

    // Date string
    const dateStr = new Intl.DateTimeFormat('pt-BR', {
      timeZone: tz,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now);

    const nDate = document.getElementById('n-date');
    const cDate = document.getElementById('c-date');
    if (nDate) nDate.textContent = dateStr;
    if (cDate) cDate.textContent = dateStr;

    // Progress bar & second badge
    const seconds = parseInt(s);
    const progress = (seconds / 60) * 100;
    ['progress-bar', 'progress-bar-c'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.width = `${progress}%`;
    });
    ['sec-badge-n', 'sec-badge-c'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = `${String(seconds).padStart(2,'0')}s`;
    });

    // Alarm check
    if (this.settings.alarmActive && this.settings.alarmTime) {
      const alarmH = this.settings.alarmTime.split(':')[0];
      const alarmM = this.settings.alarmTime.split(':')[1];
      const nowH = h;
      const nowM = m;
      if (alarmH === nowH && alarmM === nowM && seconds === 0) {
        this.triggerAlarm();
      }
    }
  },

  setWithFlip(containerId, textId, newVal, oldVal, isCard = false) {
    const container = document.getElementById(containerId);
    const el = document.getElementById(textId);
    if (!container || !el) return;

    if (newVal !== oldVal) {
      container.classList.add('flip');
      setTimeout(() => container.classList.remove('flip'), 600);
    }

    if (!isCard) {
      el.textContent = newVal;
    } else {
      container.textContent = newVal;
    }
  },

  // ===================
  // SETTINGS UI
  // ===================
  toggleSettings(show) {
    const panel = document.getElementById('settings-panel');
    const overlay = document.getElementById('settings-overlay');
    if (panel) panel.classList.toggle('active', show);
    if (overlay) overlay.classList.toggle('active', show);
  },

  changeTheme(theme) {
    this.settings.theme = theme;
    document.body.dataset.theme = theme;
    document.querySelectorAll('.theme-btn').forEach(btn => {
      const isActive = btn.dataset.theme === theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
    this.saveSettings();
  },

  setFormat(is24) {
    this.settings.format24 = is24;
    const fmt24 = document.getElementById('fmt-24');
    const fmt12 = document.getElementById('fmt-12');
    if (fmt24) { fmt24.classList.toggle('active', is24); fmt24.setAttribute('aria-pressed', is24); }
    if (fmt12) { fmt12.classList.toggle('active', !is24); fmt12.setAttribute('aria-pressed', !is24); }
    this.saveSettings();
  },

  updateTimezoneLabel() {
    const tz = this.settings.timezone;
    const labels = {
      'America/Sao_Paulo': { name: 'Brasília', offset: 'UTC-3' },
      'America/New_York': { name: 'New York', offset: 'UTC-4' },
      'America/Los_Angeles': { name: 'Los Angeles', offset: 'UTC-7' },
      'Europe/London': { name: 'Londres', offset: 'UTC+0' },
      'Europe/Paris': { name: 'Paris', offset: 'UTC+1' },
      'Asia/Tokyo': { name: 'Tokyo', offset: 'UTC+9' },
      'Asia/Seoul': { name: 'Seoul', offset: 'UTC+9' },
      'UTC': { name: 'UTC', offset: 'UTC+0' }
    };
    const lbl = labels[tz] || { name: tz, offset: '' };
    const badgeTz = document.getElementById('badge-tz');
    const badgeUtc = document.getElementById('badge-utc');
    if (badgeTz) badgeTz.textContent = lbl.name;
    if (badgeUtc) badgeUtc.textContent = lbl.offset;
  },

  // ===================
  // ALARM
  // ===================
  toggleAlarm() {
    const alarmInput = document.getElementById('alarm-time');
    const alarmStatus = document.getElementById('alarm-status');
    const alarmBtn = document.getElementById('alarm-toggle');

    if (!this.settings.alarmActive) {
      if (!alarmInput || !alarmInput.value) {
        if (alarmStatus) alarmStatus.textContent = 'Defina um horário primeiro!';
        return;
      }
      this.settings.alarmTime = alarmInput.value;
      this.settings.alarmActive = true;
      if (alarmBtn) {
        alarmBtn.textContent = 'DESATIVAR';
        alarmBtn.classList.add('active');
      }
      if (alarmStatus) alarmStatus.textContent = `Alarme ativo para ${alarmInput.value}`;
    } else {
      this.settings.alarmActive = false;
      if (alarmBtn) {
        alarmBtn.textContent = 'ATIVAR';
        alarmBtn.classList.remove('active');
      }
      if (alarmStatus) alarmStatus.textContent = 'Alarme desativado';
    }
    this.saveSettings();
  },

  triggerAlarm() {
    const toast = document.getElementById('alarm-toast');
    if (toast) {
      toast.style.animation = 'none';
      toast.offsetHeight; // reflow
      toast.style.animation = 'alarmSlide 5s ease-in-out forwards';
    }

    // Browser notification (if granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ PulseView Alarme', {
        body: 'O horário definido foi alcançado!',
        icon: '/manifest.json',
        tag: 'pulseview-alarm'
      });
    }

    // Beep sound
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880; // A5
      osc.type = 'square';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch(e) {
      console.warn('Audio alarm failed:', e);
    }
  },

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  },

  // ===================
  // STOPWATCH
  // ===================
  toggleStopwatch() {
    const btn = document.getElementById('sw-start');
    if (!this.stopwatch.running) {
      this.stopwatch.running = true;
      this.stopwatch.startTime = performance.now() - this.stopwatch.elapsed;
      if (btn) btn.textContent = 'PAUSE';
      this.tickStopwatch();
    } else {
      this.stopwatch.running = false;
      this.stopwatch.elapsed = performance.now() - this.stopwatch.startTime;
      if (btn) btn.textContent = 'CONTINUAR';
    }
  },

  resetStopwatch() {
    this.stopwatch.running = false;
    this.stopwatch.elapsed = 0;
    const btn = document.getElementById('sw-start');
    if (btn) btn.textContent = 'START';
    const swH = document.getElementById('sw-h');
    const swM = document.getElementById('sw-m');
    const swS = document.getElementById('sw-s');
    const swMs = document.getElementById('sw-ms');
    if (swH) swH.textContent = '00';
    if (swM) swM.textContent = '00';
    if (swS) swS.textContent = '00';
    if (swMs) swMs.textContent = '.00';
  },

  tickStopwatch() {
    if (!this.stopwatch.running) return;
    const elapsed = performance.now() - this.stopwatch.startTime;
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    const ms = Math.floor((elapsed % 1000) / 10);

    const swH = document.getElementById('sw-h');
    const swM = document.getElementById('sw-m');
    const swS = document.getElementById('sw-s');
    const swMs = document.getElementById('sw-ms');

    if (swH) swH.textContent = String(h).padStart(2,'0');
    if (swM) swM.textContent = String(m).padStart(2,'0');
    if (swS) swS.textContent = String(s).padStart(2,'0');
    if (swMs) swMs.textContent = '.' + String(ms).padStart(2,'0');

    requestAnimationFrame(() => this.tickStopwatch());
  },

  exportStopwatch() {
    const elapsed = this.stopwatch.elapsed;
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    const ms = Math.floor((elapsed % 1000) / 10);
    const formatted = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;

    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formatted).then(() => {
        const msg = document.getElementById('sw-export-msg');
        if (msg) {
          msg.textContent = '✅ Copiado: ' + formatted;
          setTimeout(() => { if (msg) msg.textContent = ''; }, 3000);
        }
      }).catch(() => {
        alert('Tempo: ' + formatted);
      });
    } else {
      alert('Tempo: ' + formatted);
    }
  },

  // ===================
  // FULLSCREEN
  // ===================
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  },

  // ===================
  // SWIPE NAVIGATION
  // ===================
  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) < 50) return;

    const modes = ['neon', 'cards', 'stopwatch'];
    const active = document.querySelector('.clock.active')?.id?.replace('clock-', '');
    const idx = modes.indexOf(active);

    if (diff > 0 && idx < modes.length - 1) {
      this.switchStyle(modes[idx + 1]);
    }
    if (diff < 0 && idx > 0) {
      this.switchStyle(modes[idx - 1]);
    }
  },

  switchStyle(style) {
    ['neon', 'cards', 'stopwatch'].forEach(s => {
      const clock = document.getElementById(`clock-${s}`);
      const btn = document.getElementById(`btn-${s}`);
      const isActive = s === style;
      if (clock) clock.classList.toggle('active', isActive);
      if (btn) {
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
      }
    });
  },

  // ===================
  // SERVICE WORKER
  // ===================
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('SW registered:', reg.scope);
      }).catch(err => {
        console.warn('SW registration failed:', err);
      });
    }
  }
};

// ===================
// INIT ON DOM READY
// ===================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
