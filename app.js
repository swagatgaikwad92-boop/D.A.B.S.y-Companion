const DabsyApp = {
  state: 'IDLE',
  mood: 'happy',
  canvas: null,
  ctx: null,
  eyeState: {
    blink: 1.0,
    gazeX: 0,
    gazeY: 0,
    targetGazeX: 0,
    targetGazeY: 0,
    shape: 'normal'
  },
  touchCount: 0,
  touchTimer: null,
  studyModeActive: false,

  init() {
    try {
      this.canvas = document.getElementById('eye-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());

      this.setupListeners();
      
      VisionSystem.init(document.getElementById('webcam-feed'), (newState, newMood) => {
        if (this.state !== 'STUDYING') {
          this.setState(newState, newMood);
        }
      });

      VoiceSystem.init((spokenText) => {
        this.handleUserInteraction(spokenText);
      });

      requestAnimationFrame(() => this.loop());

      // Spontaneous behavior loop
      setInterval(() => {
        const action = BehaviorSystem.decideSpontaneousAction(this.state);
        if (action === 'shift_gaze') {
          this.eyeState.targetGazeX = (Math.random() - 0.5) * 30;
          this.eyeState.targetGazeY = (Math.random() - 0.5) * 15;
        } else if (action === 'blink') {
          this.eyeState.blink = 0.1;
          setTimeout(() => { this.eyeState.blink = 1.0; }, 140);
        }
      }, 4500);

      this.setState('IDLE', 'happy');
    } catch (e) {
      console.error("D.A.B.S.y initialization error:", e);
    }
  },

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
    if (this.ctx) {
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  },

  setState(newState, newMood = null) {
    this.state = newState;
    if (newMood) this.mood = newMood;
    
    const label = document.getElementById('state-label');
    if (label) label.innerText = this.state;
    
    const dot = document.getElementById('mood-indicator');
    if (dot) dot.className = `dot ${this.mood}`;

    if (this.state === 'SLEEPY') this.eyeState.shape = 'sleepy';
    else if (this.state === 'HAPPY' || this.state === 'EXCITED') this.eyeState.shape = 'happy';
    else if (this.state === 'CONFUSED') this.eyeState.shape = 'confused';
    else this.eyeState.shape = 'normal';
  },

  setupListeners() {
    const visionToggle = document.getElementById('vision-toggle');
    if (visionToggle) {
      visionToggle.addEventListener('click', async () => {
        const active = await VisionSystem.toggle();
        const statusEl = document.getElementById('vision-status');
        if (statusEl) statusEl.innerText = active ? 'ON' : 'OFF';
        if (active) {
          this.setState('WATCHING', 'curious');
          this.speak("Vision online. I'm looking!");
        } else {
          this.setState('IDLE', 'happy');
          this.speak("Vision offline.");
        }
      });
    }

    const studyToggle = document.getElementById('study-toggle');
    if (studyToggle) studyToggle.addEventListener('click', () => this.toggleStudyMode(true));
    
    const closeStudy = document.getElementById('close-study');
    if (closeStudy) closeStudy.addEventListener('click', () => this.toggleStudyMode(false));

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        const keyInput = document.getElementById('api-key-input');
        const providerSelect = document.getElementById('ai-provider');
        if (keyInput) keyInput.value = AI.getApiKey();
        if (providerSelect) providerSelect.value = AI.getProvider();
        document.getElementById('settings-modal')?.classList.remove('hidden');
      });
    }

    document.getElementById('close-settings')?.addEventListener('click', () => {
      document.getElementById('settings-modal')?.classList.add('hidden');
    });

    document.getElementById('save-settings')?.addEventListener('click', () => {
      const provider = document.getElementById('ai-provider')?.value || 'local';
      const key = document.getElementById('api-key-input')?.value || '';
      AI.setSettings(provider, key);
      document.getElementById('settings-modal')?.classList.add('hidden');
      this.speak("Settings updated!");
    });

    document.getElementById('mic-btn')?.addEventListener('click', () => {
      const listening = VoiceSystem.listen();
      if (listening) {
        this.setState('THINKING', 'curious');
        this.showSubtitle("Listening...");
      }
    });

    document.getElementById('pet-btn')?.addEventListener('click', () => {
      this.handleTouchInteraction('tap');
    });

    if (this.canvas) {
      let startTime = 0;
      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) startTime = Date.now();
      });
      this.canvas.addEventListener('touchend', (e) => {
        const duration = Date.now() - startTime;
        this.handleTouchInteraction(duration > 600 ? 'hold' : 'tap');
      });
    }

    document.getElementById('study-send')?.addEventListener('click', () => this.sendStudyQuery());
    document.getElementById('study-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendStudyQuery();
    });

    document.getElementById('study-snap')?.addEventListener('click', async () => {
      if (!VisionSystem.active) {
        alert("Turn VISION ON first!");
        return;
      }
      const snap = VisionSystem.captureSnapshot();
      if (snap) {
        this.appendStudyChat("📸 [Captured work]", 'user');
        this.setState('THINKING', 'study');
        const response = await AI.analyzeImage(snap, "Explain what is in this image step-by-step for a student.");
        this.appendStudyChat(response, 'dabsy');
        this.speak(response);
        this.setState('STUDYING', 'study');
      }
    });
  },

  handleTouchInteraction(type) {
    clearTimeout(this.touchTimer);
    this.touchCount++;

    if (this.touchCount >= 3 || type === 'hold') {
      this.touchCount = 0;
      if (type === 'hold') {
        this.setState('HAPPY', 'happy');
        this.speak("Mrrv... cozy.");
      } else {
        this.setState('CONFUSED', 'confused');
        this.speak("Hey! Tickles!");
      }
      return;
    }

    this.touchTimer = setTimeout(() => {
      if (this.touchCount === 1) {
        this.setState('HAPPY', 'happy');
        this.speak("Hello there!");
      } else if (this.touchCount === 2) {
        this.setState('EXCITED', 'happy');
        this.speak("Yay! Let's play!");
      }
      this.touchCount = 0;
    }, 400);
  },

  async handleUserInteraction(text) {
    this.appendStudyChat(text, 'user');
    this.setState('THINKING', 'curious');
    const reply = await AI.query(text, { state: this.state, mood: this.mood });
    this.appendStudyChat(reply, 'dabsy');
    this.setState('HAPPY', 'happy');
    this.speak(reply);
    MemorySystem.logInteraction('chat', text);
  },

  toggleStudyMode(active) {
    this.studyModeActive = active;
    const panel = document.getElementById('study-panel');
    if (active) {
      panel?.classList.remove('hidden');
      this.setState('STUDYING', 'study');
      this.speak("Study mode active. Let's learn!");
    } else {
      panel?.classList.add('hidden');
      this.setState('IDLE', 'happy');
    }
  },

  appendStudyChat(text, sender) {
    const history = document.getElementById('study-chat-history');
    if (!history) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerText = text;
    history.appendChild(bubble);
    history.scrollTop = history.scrollHeight;
  },

  showSubtitle(text) {
    const sub = document.getElementById('subtitle-box');
    if (!sub) return;
    sub.innerText = text;
    sub.classList.remove('hidden');
    setTimeout(() => {
      sub.classList.add('hidden');
    }, 4000);
  },

  speak(text) {
    this.showSubtitle(text);
    VoiceSystem.speak(text);
  },

  async sendStudyQuery() {
    const input = document.getElementById('study-input');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    
    this.appendStudyChat(val, 'user');
    this.setState('THINKING', 'study');
    const response = await AI.query(val, { state: 'STUDYING', mood: 'curious' });
    this.appendStudyChat(response, 'dabsy');
    this.setState('STUDYING', 'study');
    this.speak(response);
  },

  loop() {
    if (this.canvas && this.ctx) {
      this.eyeState.gazeX += (this.eyeState.targetGazeX - this.eyeState.gazeX) * 0.1;
      this.eyeState.gazeY += (this.eyeState.targetGazeY - this.eyeState.gazeY) * 0.1;
      this.renderEyes();
    }
    requestAnimationFrame(() => this.loop());
  },

  renderEyes() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const eyeSpacing = 85;
    const eyeWidth = 50;
    const eyeHeight = 65 * this.eyeState.blink;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);

    [-eyeSpacing / 2 - eyeWidth / 2, eyeSpacing / 2 - eyeWidth / 2].forEach((offsetX) => {
      this.ctx.save();
      this.ctx.translate(offsetX + this.eyeState.gazeX, this.eyeState.gazeY);

      this.ctx.fillStyle = '#00f2fe';
      this.ctx.shadowColor = '#00f2fe';
      this.ctx.shadowBlur = 18;

      if (this.eyeState.shape === 'happy') {
        // Fixed radius to prevent overlapping/M-shape bug
        this.ctx.beginPath();
        this.ctx.arc(0, 0, eyeWidth / 2.2, Math.PI, 0, false);
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = '#00f2fe';
        this.ctx.stroke();
      } else if (this.eyeState.shape === 'sleepy') {
        this.ctx.fillRect(-eyeWidth / 2, 0, eyeWidth, 8);
      } else if (this.eyeState.shape === 'confused') {
        this.ctx.rotate(0.2);
        this.ctx.fillRect(-eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight * 0.7);
      } else {
        this.ctx.beginPath();
        this.ctx.roundRect(-eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight, 20);
        this.ctx.fill();
      }

      this.ctx.restore();
    });

    this.ctx.restore();
  }
};

window.addEventListener('load', () => DabsyApp.init());
