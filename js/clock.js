/**
 * PulseView - Clock Module
 * Refactored with rAF, Notification API, Keyboard Shortcuts, Fullscreen
 * @author Belin7z (Jefferson Alves)
 */

// ===================
// CONSTANTS & CONFIG
// ===================
const THEMES = ['purple', 'cyan', 'red', 'green', 'minimal'];
const MODES = ['neon', 'cards', 'stopwatch'];
const STORAGE_KEY = 'pulseview-settings';

const App = {
    settings: {
        timezone: 'America/Sao_Paulo',
        format24: true,
        theme: 'purple',
        alarmTime: null,
        alarmActive: false,
        activeMode: 'neon'
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
        this.switchStyle(this.settings.activeMode);
    },

    // ===================
    // SETTINGS & STORAGE
    // ===================
    loadSettings() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            Object.assign(this.settings, JSON.parse(saved));
            document.body.dataset.theme = this.settings.theme;
            
            const tzSelect = document.getElementById('tz-select');
            if (tzSelect) tzSelect.value = this.settings.timezone;

            // Sync theme buttons
            document.querySelectorAll('.theme-btn').forEach(btn => {
                const isActive = btn.dataset.theme === this.settings.theme;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive);
            });

            // Sync format buttons
            const fmt24 = document.getElementById('fmt-24');
            const fmt12 = document.getElementById('fmt-12');
            if (fmt24 && fmt12) {
                fmt24.classList.toggle('active', this.settings.format24);
                fmt12.classList.toggle('active', !this.settings.format24);
            }
        }
    },

    saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
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

        // Theme selection
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

        // Alarm toggle
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

        // Mobile swipe on clock section
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

        // Mode switch buttons
        MODES.forEach(mode => {
            const btn = document.getElementById(`btn-${mode}`);
            if (btn) btn.addEventListener('click', () => this.switchStyle(mode));
        });

        // Pause animation when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(this.rafId);
            } else {
                this.startClock();
            }
        });
    },

    // ===================
    // KEYBOARD SHORTCUTS
    // ===================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            const key = e.key.toLowerCase();

            if (key === ' ') {
                e.preventDefault();
                if (this.settings.activeMode === 'stopwatch') this.toggleStopwatch();
            }
            if (key === 'r') this.resetStopwatch();
            if (key === 't') {
                const idx = THEMES.indexOf(this.settings.theme);
                this.changeTheme(THEMES[(idx + 1) % THEMES.length]);
            }
            if (key === 'f') this.toggleFullscreen();
            if (key === 's') {
                const panel = document.getElementById('settings-panel');
                this.toggleSettings(!panel?.classList.contains('active'));
            }
            if (key === 'escape') this.toggleSettings(false);
        });
    },

    // ===================
    // CLOCK CORE
    // ===================
    startClock() {
        const tick = () => {
            this.updateClock();
            this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
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
        
        let h = get('hour'), m = get('minute'), s = get('second');

        // Update UI with flip effects
        this.setWithFlip('n-h-flip', 'n-h', h, this.prevValues.h);
        this.setWithFlip('n-m-flip', 'n-m', m, this.prevValues.m);
        this.setWithFlip('n-s-flip', 'n-s', s, this.prevValues.s);
        
        this.setWithFlip('c-h', 'c-h', h, this.prevValues.h, true);
        this.setWithFlip('c-m', 'c-m', m, this.prevValues.m, true);
        this.setWithFlip('c-s', 'c-s', s, this.prevValues.s, true);

        this.prevValues = { h, m, s };

        // Progress bar
        const progress = (parseInt(s) / 60) * 100;
        ['progress-bar', 'progress-bar-c'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.width = `${progress}%`;
        });

        // Alarm check
        if (this.settings.alarmActive && this.settings.alarmTime) {
            const [alH, alM] = this.settings.alarmTime.split(':');
            if (alH === h && alM === m && s === '00') {
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
        
        if (!isCard) el.textContent = newVal;
        else container.textContent = newVal;
    },

    // ===================
    // THEME & STYLE
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
        });
        this.saveSettings();
    },

    setFormat(is24) {
        this.settings.format24 = is24;
        document.getElementById('fmt-24')?.classList.toggle('active', is24);
        document.getElementById('fmt-12')?.classList.toggle('active', !is24);
        this.saveSettings();
    },

    switchStyle(mode) {
        this.settings.activeMode = mode;
        MODES.forEach(m => {
            document.getElementById(`clock-${m}`)?.classList.toggle('active', m === mode);
            document.getElementById(`btn-${m}`)?.classList.toggle('active', m === mode);
        });
        this.saveSettings();
    },

    // ===================
    // ALARM
    // ===================
    toggleAlarm() {
        const input = document.getElementById('alarm-time');
        const status = document.getElementById('alarm-status');
        const btn = document.getElementById('alarm-toggle');

        if (!this.settings.alarmActive) {
            if (!input?.value) {
                if (status) status.textContent = 'Escolha um horário!';
                return;
            }
            this.settings.alarmActive = true;
            this.settings.alarmTime = input.value;
            if (btn) { btn.textContent = 'DESATIVAR'; btn.classList.add('active'); }
            if (status) status.textContent = `⏰ Ativo para ${input.value}`;
        } else {
            this.settings.alarmActive = false;
            if (btn) { btn.textContent = 'ATIVAR'; btn.classList.remove('active'); }
            if (status) status.textContent = 'Alarme desativado';
        }
        this.saveSettings();
    },

    triggerAlarm() {
        const toast = document.getElementById('alarm-toast');
        const clockSection = document.getElementById('clock-section');
        
        if (toast) {
            toast.style.animation = 'none';
            toast.offsetHeight;
            toast.style.animation = 'alarmSlide 5s ease-in-out forwards';
        }

        if (clockSection) {
            clockSection.classList.add('alarm-pulsing');
            setTimeout(() => clockSection.classList.remove('alarm-pulsing'), 5000);
        }

        if (Notification.permission === 'granted') {
            new Notification('⏰ PulseView Alarme', { body: 'Horário alcançado!' });
        }
        
        this.playAlarmSound();
    },

    playAlarmSound() {
        try {
            if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
            osc.start();
            osc.stop(this.audioContext.currentTime + 1.5);
        } catch(e) {}
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
        document.getElementById('sw-start').textContent = 'START';
        ['sw-h', 'sw-m', 'sw-s'].forEach(id => document.getElementById(id).textContent = '00');
        document.getElementById('sw-ms').textContent = '.00';
    },

    tickStopwatch() {
        if (!this.stopwatch.running) return;
        const elapsed = performance.now() - this.stopwatch.startTime;
        const h = Math.floor(elapsed / 3600000);
        const m = Math.floor((elapsed % 3600000) / 60000);
        const s = Math.floor((elapsed % 60000) / 1000);
        const ms = Math.floor((elapsed % 1000) / 10);

        document.getElementById('sw-h').textContent = String(h).padStart(2, '0');
        document.getElementById('sw-m').textContent = String(m).padStart(2, '0');
        document.getElementById('sw-s').textContent = String(s).padStart(2, '0');
        document.getElementById('sw-ms').textContent = '.' + String(ms).padStart(2, '0');

        requestAnimationFrame(() => this.tickStopwatch());
    },

    // ===================
    // UTILS
    // ===================
    updateTimezoneLabel() {
        // ... labels update logic same as before but streamlined ...
        const tz = this.settings.timezone;
        document.getElementById('badge-tz').textContent = tz.split('/').pop().replace('_', ' ');
    },

    toggleFullscreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    },

    handleSwipe() {
        const diff = this.touchStartX - this.touchEndX;
        if (Math.abs(diff) < 50) return;
        const idx = MODES.indexOf(this.settings.activeMode);
        if (diff > 0 && idx < MODES.length - 1) this.switchStyle(MODES[idx + 1]);
        if (diff < 0 && idx > 0) this.switchStyle(MODES[idx - 1]);
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
