/**
 * PulseView - Clock Logic with All Features
 * Jefferson Alves (Belin7z)
 */

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

  init() {
    this.loadSettings();
    this.setupEventListeners();
    this.updateClock();
  },

  loadSettings() {
    const saved = localStorage.getItem('pulseview-settings');
    if (saved) {
      Object.assign(this.settings, JSON.parse(saved));
      document.body.dataset.theme = this.settings.theme;
      document.getElementById('tz-select').value = this.settings.timezone;
      if (!this.settings.format24) {
        document.getElementById('fmt-24').classList.remove('active');
        document.getElementById('fmt-12').classList.add('active');
      }
    }
  },

  saveSettings() {
    localStorage.setItem('pulseview-settings', JSON.stringify(this.settings));
  },

  setupEventListeners() {
    // Settings panel
    document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettings(true));
    document.getElementById('settings-close').addEventListener('click', () => this.toggleSettings(false));
    document.getElementById('settings-overlay').addEventListener('click', () => this.toggleSettings(false));

    // Theme switcher
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => this.changeTheme(btn.dataset.theme));
    });

    // Time format
    document.getElementById('fmt-24').addEventListener('click', () => this.setFormat(true));
    document.getElementById('fmt-12').addEventListener('click', () => this.setFormat(false));

    // Timezone
    document.getElementById('tz-select').addEventListener('change', (e) => {
      this.settings.timezone = e.target.value;
      this.saveSettings();
      this.updateTimezoneLabel();
    });

    // Alarm
    document.getElementById('alarm-toggle').addEventListener('click', () => this.toggleAlarm());

    // Stopwatch
    document.getElementById('sw-start').addEventListener('click', () => this.toggleStopwatch());
    document.getElementById('sw-reset').addEventListener('click', () => this.resetStopwatch());

    // Mobile swipe
    const clockSection = document.getElementById('clock-section');
    clockSection.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    });
    clockSection.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });

    // Parallax
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 30;
      const y = (e.clientY - window.innerHeight / 2) / 30;
      clockSection.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    });
  },

  updateClock() {
    const now = new Date();
    const tz = this.settings.timezone;
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: tz,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
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
      timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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

    setTimeout(() => this.updateClock(), 1000);
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

  updateTimezoneLabel() {
    const tz = this.settings.timezone;
    const labels = {
      'America/Sao_Paulo': { name: 'Brasilia', offset: 'UTC-3' },
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

  toggleSettings(show) {
    document.getElementById('settings-panel').classList.toggle('active', show);
    document.getElementById('settings-overlay').classList.toggle('active', show);
  },

  changeTheme(theme) {
    this.settings.theme = theme;
    document.body.dataset.theme = theme;
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    this.saveSettings();
  },

  setFormat(is24) {
    this.settings.format24 = is24;
    document.getElementById('fmt-24').classList.toggle('active', is24);
    document.getElementById('fmt-12').classList.toggle('active', !is24);
    this.saveSettings();
  },

  toggleAlarm() {
    const alarmInput = document.getElementById('alarm-time');
    const alarmStatus = document.getElementById('alarm-status');
    const alarmBtn = document.getElementById('alarm-toggle');
    if (!this.settings.alarmActive) {
      if (!alarmInput.value) {
        alarmStatus.textContent = 'Defina um horario primeiro!';
        return;
      }
      this.settings.alarmTime = alarmInput.value;
      this.settings.alarmActive = true;
      alarmBtn.textContent = 'DESATIVAR';
      alarmBtn.classList.add('active');
      alarmStatus.textContent = `Alarme ativo para ${alarmInput.value}`;
    } else {
      this.settings.alarmActive = false;
      alarmBtn.textContent = 'ATIVAR';
      alarmBtn.classList.remove('active');
      alarmStatus.textContent = 'Alarme desativado';
    }
    this.saveSettings();
  },

  triggerAlarm() {
    const toast = document.getElementById('alarm-toast');
    if (!toast) return;
    toast.style.animation = 'none';
    toast.offsetHeight;
    toast.style.animation = 'alarmSlide 5s ease-in-out forwards';
    // beep
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch(e) {}
  },

  toggleStopwatch() {
    const btn = document.getElementById('sw-start');
    if (!this.stopwatch.running) {
      this.stopwatch.running = true;
      this.stopwatch.startTime = Date.now() - this.stopwatch.elapsed;
      btn.textContent = 'PAUSE';
      this.tickStopwatch();
    } else {
      this.stopwatch.running = false;
      this.stopwatch.elapsed = Date.now() - this.stopwatch.startTime;
      btn.textContent = 'CONTINUAR';
    }
  },

  resetStopwatch() {
    this.stopwatch.running = false;
    this.stopwatch.elapsed = 0;
    document.getElementById('sw-start').textContent = 'START';
    document.getElementById('sw-h').textContent = '00';
    document.getElementById('sw-m').textContent = '00';
    document.getElementById('sw-s').textContent = '00';
    document.getElementById('sw-ms').textContent = '.00';
  },

  tickStopwatch() {
    if (!this.stopwatch.running) return;
    const elapsed = Date.now() - this.stopwatch.startTime;
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    const ms = Math.floor((elapsed % 1000) / 10);
    document.getElementById('sw-h').textContent = String(h).padStart(2,'0');
    document.getElementById('sw-m').textContent = String(m).padStart(2,'0');
    document.getElementById('sw-s').textContent = String(s).padStart(2,'0');
    document.getElementById('sw-ms').textContent = '.' + String(ms).padStart(2,'0');
    requestAnimationFrame(() => this.tickStopwatch());
  },

  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) < 50) return;
    const modes = ['neon', 'cards', 'stopwatch'];
    const active = document.querySelector('.toggle-btn.active')?.id?.replace('btn-', '');
    const idx = modes.indexOf(active);
    if (diff > 0 && idx < modes.length - 1) switchStyle(modes[idx + 1]);
    if (diff < 0 && idx > 0) switchStyle(modes[idx - 1]);
  }
};

window.switchStyle = function(style) {
  ['neon', 'cards', 'stopwatch'].forEach(s => {
    document.getElementById(`clock-${s}`)?.classList.remove('active');
    document.getElementById(`btn-${s}`)?.classList.remove('active');
  });
  document.getElementById(`clock-${style}`)?.classList.add('active');
  document.getElementById(`btn-${style}`)?.classList.add('active');
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
