/**
 * PulseView - Main Logic Module
 * Features: Neon/Cards Clock, Pomodoro, Stopwatch, Multi-Alarms, Themes, Tutorial
 * @author Belin7z (Jefferson Alves)
 */

// ===================
// CONSTANTS & CONFIG
// ===================
const THEMES = ['purple', 'cyan', 'red', 'green', 'minimal'];
const STORAGE_KEY = 'pulseview-settings-v2';
const TUTORIAL_KEY = 'pulseview-tutorial-seen';
const ALARM_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1016/1016-preview.mp3';

const App = {
    settings: {
        timezone: 'America/Sao_Paulo',
        format24: true,
        theme: 'purple',
        activeMode: 'neon',
        visibility: {
            neon: true,
            cards: true,
            pomodoro: true,
            stopwatch: true
        },
        alarms: []
    },

    state: {
        pomodoro: {
            mode: 'focus', // focus, short, long
            timeLeft: 1500,
            isRunning: false,
            sessions: 0,
            timerId: null
        },
        stopwatch: {
            startTime: 0,
            elapsed: 0,
            isRunning: false,
            rafId: null
        },
        prevClockValues: { h: '', m: '', s: '' },
        audio: null,
        rafClockId: null,
        tooltipTimeout: null
    },

    init() {
        this.loadSettings();
        this.setupAudio();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupTooltips();
        this.updateVisibility();
        this.renderAlarms();
        this.startClock();
        this.applyTheme(this.settings.theme);
        this.switchMode(this.settings.activeMode);
        this.checkTutorial();
        
        console.log('PulseView initialized 🚀');
    },

    // ===================
    // CORE LOGIC
    // ===================
    
    startClock() {
        const tick = () => {
            this.updateClockUI();
            this.checkAlarms();
            this.state.rafClockId = requestAnimationFrame(tick);
        };
        this.state.rafClockId = requestAnimationFrame(tick);
    },

    updateClockUI() {
        const now = new Date();
        const options = {
            timeZone: this.settings.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !this.settings.format24
        };

        const formatter = new Intl.DateTimeFormat('pt-BR', options);
        const parts = formatter.formatToParts(now);
        const get = (type) => parts.find(p => p.type === type)?.value || '00';

        let h = get('hour'), m = get('minute'), s = get('second');

        // Update UI
        this.updateDigit('n-h', h, 'n-h-flip');
        this.updateDigit('n-m', m, 'n-m-flip');
        this.updateDigit('n-s', s, 'n-s-flip');
        this.updateDigit('c-h', h, null, true);
        this.updateDigit('c-m', m, null, true);
        this.updateDigit('c-s', s, null, true);

        // Progress
        const progress = (parseInt(s) / 60) * 100;
        ['progress-bar', 'progress-bar-c'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.width = `${progress}%`;
        });

        // Date
        const dateStr = now.toLocaleDateString('pt-BR', { 
            weekday: 'long', day: '2-digit', month: 'long', timeZone: this.settings.timezone 
        }).toUpperCase();
        ['n-date', 'c-date'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = dateStr;
        });

        this.state.prevClockValues = { h, m, s };
    },

    updateDigit(id, val, flipId, isCard = false) {
        const el = document.getElementById(id);
        if (!el) return;

        const prev = isCard ? el.textContent : this.state.prevClockValues[id.split('-')[1]];
        if (val !== prev) {
            el.textContent = val;
            if (flipId) {
                const flipEl = document.getElementById(flipId);
                flipEl?.classList.remove('flip');
                void flipEl?.offsetWidth;
                flipEl?.classList.add('flip');
            }
        }
    },

    // ===================
    // POMODORO MODULE
    // ===================
    
    togglePomodoro() {
        this.state.pomodoro.isRunning ? this.pausePomodoro() : this.startPomodoro();
    },

    startPomodoro() {
        this.state.pomodoro.isRunning = true;
        document.getElementById('pomo-start').textContent = 'PAUSE';
        this.state.pomodoro.timerId = setInterval(() => {
            this.state.pomodoro.timeLeft--;
            this.updatePomodoroUI();
            if (this.state.pomodoro.timeLeft <= 0) this.handlePomodoroEnd();
        }, 1000);
    },

    pausePomodoro() {
        this.state.pomodoro.isRunning = false;
        document.getElementById('pomo-start').textContent = 'START';
        clearInterval(this.state.pomodoro.timerId);
    },

    resetPomodoro() {
        this.pausePomodoro();
        this.setPomodoroMode(this.state.pomodoro.mode);
    },

    setPomodoroMode(mode) {
        this.state.pomodoro.mode = mode;
        const times = { focus: 1500, short: 300, long: 900 };
        this.state.pomodoro.timeLeft = times[mode];
        document.getElementById('pomo-status').textContent = mode.toUpperCase();
        this.updatePomodoroUI();
    },

    updatePomodoroUI() {
        const m = Math.floor(this.state.pomodoro.timeLeft / 60);
        const s = this.state.pomodoro.timeLeft % 60;
        document.getElementById('pomo-m').textContent = m.toString().padStart(2, '0');
        document.getElementById('pomo-s').textContent = s.toString().padStart(2, '0');
    },

    handlePomodoroEnd() {
        this.pausePomodoro();
        this.triggerAlarm(`Pomodoro: ${this.state.pomodoro.mode.toUpperCase()} ENDED`);
        
        if (this.state.pomodoro.mode === 'focus') {
            this.state.pomodoro.sessions++;
            this.updatePomoSessionsUI();
            this.setPomodoroMode(this.state.pomodoro.sessions % 4 === 0 ? 'long' : 'short');
        } else {
            this.setPomodoroMode('focus');
        }
    },

    updatePomoSessionsUI() {
        const dots = document.querySelectorAll('.session-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i < this.state.pomodoro.sessions % 5);
        });
    },

    // ===================
    // STOPWATCH MODULE
    // ===================
    
    toggleStopwatch() {
        this.state.stopwatch.isRunning ? this.pauseStopwatch() : this.startStopwatch();
    },

    startStopwatch() {
        this.state.stopwatch.isRunning = true;
        this.state.stopwatch.startTime = performance.now() - this.state.stopwatch.elapsed;
        document.getElementById('sw-start').textContent = 'PAUSE';
        
        const loop = (now) => {
            this.state.stopwatch.elapsed = now - this.state.stopwatch.startTime;
            this.updateStopwatchUI();
            this.state.stopwatch.rafId = requestAnimationFrame(loop);
        };
        this.state.stopwatch.rafId = requestAnimationFrame(loop);
    },

    pauseStopwatch() {
        this.state.stopwatch.isRunning = false;
        document.getElementById('sw-start').textContent = 'START';
        cancelAnimationFrame(this.state.stopwatch.rafId);
    },

    resetStopwatch() {
        this.pauseStopwatch();
        this.state.stopwatch.elapsed = 0;
        this.updateStopwatchUI();
    },

    updateStopwatchUI() {
        const ms = this.state.stopwatch.elapsed;
        const s = Math.floor(ms / 1000) % 60;
        const m = Math.floor(ms / 60000) % 60;
        const h = Math.floor(ms / 3600000);
        const centi = Math.floor((ms % 1000) / 10);

        document.getElementById('sw-h').textContent = h.toString().padStart(2, '0');
        document.getElementById('sw-m').textContent = m.toString().padStart(2, '0');
        document.getElementById('sw-s').textContent = s.toString().padStart(2, '0');
        document.getElementById('sw-ms').textContent = `.${centi.toString().padStart(2, '0')}`;
    },

    // ===================
    // ALARMS MODULE
    // ===================
    
    addAlarm() {
        const input = document.getElementById('alarm-time');
        const time = input.value;
        if (!time || this.settings.alarms.includes(time)) return;

        this.settings.alarms.push(time);
        this.settings.alarms.sort();
        this.saveSettings();
        this.renderAlarms();
        this.showToast('Alarme adicionado!');
        input.value = '';
    },

    removeAlarm(time) {
        this.settings.alarms = this.settings.alarms.filter(a => a !== time);
        this.saveSettings();
        this.renderAlarms();
    },

    renderAlarms() {
        const list = document.getElementById('alarm-list');
        if (!list) return;
        list.innerHTML = this.settings.alarms.map(time => `
            <div class="alarm-item">
                <span class="alarm-item-time">${time}</span>
                <button class="alarm-item-delete" onclick="App.removeAlarm('${time}')">✕</button>
            </div>
        `).join('');
    },

    checkAlarms() {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', minute: '2-digit', hour12: false, timeZone: this.settings.timezone 
        });
        
        if (now.getSeconds() === 0 && this.settings.alarms.includes(currentTime)) {
            this.triggerAlarm(`ALARME: ${currentTime}`);
        }
    },

    triggerAlarm(msg) {
        this.playAlarmSound();
        this.showToast(msg);
        document.body.classList.add('alarm-flashing');
        setTimeout(() => document.body.classList.remove('alarm-flashing'), 6000);
    },

    // ===================
    // TUTORIAL & TOOLTIPS
    // ===================
    
    checkTutorial() {
        if (!localStorage.getItem(TUTORIAL_KEY)) {
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay) overlay.style.display = 'flex';
        }
    },

    closeTutorial() {
        document.getElementById('tutorial-overlay').style.display = 'none';
        localStorage.setItem(TUTORIAL_KEY, 'true');
    },

    setupTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');
        tooltips.forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                const text = el.dataset.tooltip;
                const tip = document.createElement('div');
                tip.className = 'tooltip tooltip-top';
                tip.textContent = text;
                document.body.appendChild(tip);

                const rect = el.getBoundingClientRect();
                tip.style.left = `${rect.left + rect.width / 2 - tip.offsetWidth / 2}px`;
                tip.style.top = `${rect.top - tip.offsetHeight - 10}px`;
                
                el._tooltip = tip;
            });

            el.addEventListener('mouseleave', () => {
                if (el._tooltip) {
                    el._tooltip.remove();
                    el._tooltip = null;
                }
            });
        });
    },

    // ===================
    // HELPERS & UI
    // ===================
    
    switchMode(mode) {
        this.settings.activeMode = mode;
        this.saveSettings();
        document.querySelectorAll('.clock').forEach(el => el.classList.remove('active'));
        document.getElementById(`clock-${mode}`)?.classList.add('active');
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `btn-${mode}`);
        });
    },

    applyTheme(theme) {
        this.settings.theme = theme;
        document.body.dataset.theme = theme;
        this.saveSettings();
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    },

    updateVisibility() {
        const toggles = document.querySelectorAll('.visibility-toggles input');
        toggles.forEach(input => {
            const mod = input.dataset.module;
            const isVisible = this.settings.visibility[mod];
            input.checked = isVisible;
            const navBtn = document.getElementById(`btn-${mod}`);
            if (navBtn) navBtn.style.display = isVisible ? 'block' : 'none';
        });
    },

    setupAudio() {
        this.state.audio = new Audio(ALARM_SOUND);
    },

    playAlarmSound() {
        this.state.audio?.play().catch(() => {});
    },

    showToast(msg) {
        const toast = document.getElementById('alarm-toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 5000);
    },

    loadSettings() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        const tzSelect = document.getElementById('tz-select');
        if (tzSelect) tzSelect.value = this.settings.timezone;
        this.updateTzBadge();
    },

    saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    },

    updateTzBadge() {
        const badge = document.getElementById('badge-tz');
        if (badge) badge.textContent = this.settings.timezone.split('/').pop().replace('_', ' ');
    },

    setupEventListeners() {
        // Modes
        ['neon', 'cards', 'pomodoro', 'stopwatch'].forEach(m => {
            document.getElementById(`btn-${m}`)?.addEventListener('click', () => this.switchMode(m));
        });

        // Settings Panel
        const panel = document.getElementById('settings-panel');
        const overlay = document.getElementById('settings-overlay');
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            panel.classList.add('active');
            overlay.classList.add('active');
        });
        document.getElementById('settings-close')?.addEventListener('click', () => {
            panel.classList.remove('active');
            overlay.classList.remove('active');
        });
        overlay?.addEventListener('click', () => {
            panel.classList.remove('active');
            overlay.classList.remove('active');
        });

        // Themes
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyTheme(btn.dataset.theme));
        });

        // Formats
        document.getElementById('fmt-24')?.addEventListener('click', () => {
            this.settings.format24 = true;
            this.saveSettings();
            document.getElementById('fmt-24').classList.add('active');
            document.getElementById('fmt-12').classList.remove('active');
        });
        document.getElementById('fmt-12')?.addEventListener('click', () => {
            this.settings.format24 = false;
            this.saveSettings();
            document.getElementById('fmt-12').classList.add('active');
            document.getElementById('fmt-24').classList.remove('active');
        });

        // Timezone
        document.getElementById('tz-select')?.addEventListener('change', (e) => {
            this.settings.timezone = e.target.value;
            this.saveSettings();
            this.updateTzBadge();
        });

        // Visibility
        document.querySelectorAll('.visibility-toggles input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.visibility[e.target.dataset.module] = e.target.checked;
                this.saveSettings();
                this.updateVisibility();
            });
        });

        // Alarms
        document.getElementById('alarm-add')?.addEventListener('click', () => this.addAlarm());

        // Pomodoro
        document.getElementById('pomo-start')?.addEventListener('click', () => this.togglePomodoro());
        document.getElementById('pomo-reset')?.addEventListener('click', () => this.resetPomodoro());
        document.getElementById('pomo-skip')?.addEventListener('click', () => this.handlePomodoroEnd());

        // Stopwatch
        document.getElementById('sw-start')?.addEventListener('click', () => this.toggleStopwatch());
        document.getElementById('sw-reset')?.addEventListener('click', () => this.resetStopwatch());

        // Tutorial
        document.getElementById('tutorial-close')?.addEventListener('click', () => this.closeTutorial());

        // Fullscreen & Export
        document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
            document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
        });
        
        document.getElementById('btn-export')?.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `pulseview-config.json`;
            a.click();
        });
    },

    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'SELECT'].includes(e.target.tagName)) return;

            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.settings.activeMode === 'pomodoro') this.togglePomodoro();
                    if (this.settings.activeMode === 'stopwatch') this.toggleStopwatch();
                    break;
                case 'KeyR':
                    if (this.settings.activeMode === 'pomodoro') this.resetPomodoro();
                    if (this.settings.activeMode === 'stopwatch') this.resetStopwatch();
                    break;
                case 'KeyT':
                    const nextTheme = THEMES[(THEMES.indexOf(this.settings.theme) + 1) % THEMES.length];
                    this.applyTheme(nextTheme);
                    break;
                case 'KeyS':
                    document.getElementById('settings-btn')?.click();
                    break;
                case 'KeyF':
                    document.getElementById('btn-fullscreen')?.click();
                    break;
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
