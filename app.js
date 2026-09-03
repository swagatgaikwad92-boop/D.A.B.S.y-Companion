const DabsyApp = {
  state: 'IDLE',
  mood: 'happy',
  attentionTarget: 'none',
  canvas: null,
  ctx: null,
  eyeState: {
    blink: 1.0,
    gazeX: 0,
    gazeY: 0,
    targetGazeX: 0,
    targetGazeY: 0,
    shape: 'normal' // normal, happy, sleepy, confused, excited, angry
  },
  touchCount: 0,
  touchTimer: null,
  studyModeActive: false,

  init() {
    this.canvas = document.getElementById('eye-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.setupListeners();
    VisionSystem.init(document.getElementById('webcam-feed'), (newState) => {
      if (this.state !== 'STUDYING') {
        this.setState(newState);
      }
    });

    VoiceSystem.init((spokenText) => {
      this.handleUserInteraction(spokenText);
    });

    // Start rendering loop
    requestAnimationFrame(() => this.loop());

    // Periodic independent eye dart / blinking
    setInterval(() => this.triggerSpontaneousBehaviors(), 4000);
  },

  resizeCanvas() {
    this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  },

  setState(newState, newMood = null) {
    this.state = newState;
    if (newMood) this.mood = newMood;
    
    document.getElementById('state-label').innerText = this.state;
    const dot = document.getElementById('mood-indicator');
    dot.className = `dot ${this.mood}`;

    // Map states to eye shapes
    if (this.state === 'SLEEPY') this.eyeState.shape = 'sleepy';
    else if (this.state === 'HAPPY' || this.state === 'EXCITED') this.eyeState.shape = 'happy';
    else if (this.state === 'CONFUSED') this.eyeState.shape = 'confused';
    else if (this.state === 'CURIOUS' || this.state === 'WATCHING') this.eyeState.shape = 'normal';
    else this.eyeState.shape = 'normal';
  },

  setupListeners() {
    // Vision toggle
    document.getElementById('vision-toggle').addEventListener('click', async () => {
      const active = await VisionSystem.toggle();
      document.getElementById('vision-status').innerText = active ? 'ON' : 'OFF';
      if (active) {
        this.setState('WATCHING', 'curious');
        this.speak("Vision online. I'm looking!");
      } else {
        this.setState('IDLE', 'happy');
        this.speak("Vision offline.");
      }
    });

    // Study mode toggle
    document.getElementById('study-toggle').addEventListener('click', () => {
      this.toggleStudyMode(true);
    });
    document.getElementById('close-study').addEventListener('click', () => {
      this.toggleStudyMode(false);
    });

    // Settings modal
    document.getElementById('settings-btn').addEventListener('click', () => {
      document.getElementById('api-key-input').value = AI.getApiKey();
      document.getElementById('ai-provider').value = AI.getProvider();
      document.getElementById('settings-modal').classList.remove('hidden');
    });
    document.getElementById('close-settings').addEventListener('click', () => {
      document.getElementById('settings-modal').classList.add('hidden');
    });
    document.getElementById('save-settings').addEventListener('click', () => {
      const provider = document.getElementById('ai-provider').value;
      const key = document.getElementById('api-key-input').value;
      AI.setSettings(provider, key);
      document.getElementById('settings-modal').classList.add('hidden');
      this.speak("Settings updated!");
    });

    // Mic & Pet buttons
    document.getElementById('mic-btn').addEventListener('click', () => {
      const listening = VoiceSystem.listen();
      if (listening) {
        this.setState('THINKING', 'curious');
        this.showSubtitle("Listening...");
      }
    });

    document.getElementById('pet-btn').addEventListener('click', () => {
      this.handleTouchInteraction('tap');
    });

    // Canvas touch interactions (Advanced touch modeling)
    let startX = 0, startY = 0, startTime = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      const duration = Date.now() - startTime;
      if (duration > 600) {
        this.handleTouchInteraction('hold');
      } else {
        this.handleTouchInteraction('tap');
      }
    });

    // Study chat actions
    document.getElementById('study-send').addEventListener('click', () => this.sendStudyQuery());
    document.getElementById('study-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendStudyQuery();
    });
    document.getElementById('study-snap').addEventListener('click', async () => {
      if (!VisionSystem.active) {
        alert("Turn VISION ON first to capture study material!");
        return;
      }
      const snap = VisionSystem.captureSnapshot();
      if (snap) {
        this.appendStudyChat("📸 [Captured textbook/work]", 'user');
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
        this.speak("Mrrv... that's cozy.");
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
    const reply = await AI.query(text, { state: this.state });
    this.appendStudyChat(reply, 'dabsy');
    this.setState('HAPPY', 'happy');
    this.speak(reply);
  },

  toggleStudyMode(active) {
    this.studyModeActive = active;
    const panel = document.getElementById('study-panel');
    if (active) {
      panel.classList.remove('hidden');
      this.setState('STUDYING', 'study');
      this.speak("Study mode activated. Let's learn!");
    } else {
      panel.classList.add('hidden');
      this.setState('IDLE', 'happy');
    }
  },

  appendStudyChat(text, sender) {
    const history = document.getElementById('study-chat-history');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerText = text;
    history.appendChild(bubble);
    history.scrollTop = history.scrollHeight;
  },

  showSubtitle(text) {
    const sub = document.getElementById('subtitle-box');
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

  triggerSpontaneousBehaviors() {
    if (this.state === 'STUDYING' || Math.random() > 0.6) return;
    
    // Spontaneous independent gaze shifts
    this.eyeState.targetGazeX = (Math.random() - 0.5) * 40;
    this.eyeState.targetGazeY = (Math.random() - 0.5) * 20;

    // Spontaneous blink
    this.eyeState.blink = 0.1;
    setTimeout(() => { this.eyeState.blink = 1.0; }, 150);
  },

  async sendStudyQuery() {
    const input = document.getElementById('study-input');
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    
    this.appendStudyChat(val, 'user');
    this.setState('THINKING', 'study');
    const response = await AI.query(val, { state: 'STUDYING' });
    this.appendStudyChat(response, 'dabsy');
    this.setState('STUDYING', 'study');
    this.speak(response);
  },

  loop() {
    // Smooth interpolation for gaze & blink
    this.eyeState.gazeX += (this.eyeState.targetGazeX - this.eyeState.gazeX) * 0.1;
    this.eyeState.gazeY += (this.eyeState.targetGazeY - this.eyeState.gazeY) * 0.1;

    this.renderEyes();
    requestAnimationFrame(() => this.loop());
  },

  renderEyes() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const eyeSpacing = 80;
    const eyeWidth = 55;
    const eyeHeight = 70 * this.eyeState.blink;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);

    // Render Left Eye & Right Eye
    [-eyeSpacing / 2 - eyeWidth / 2, eyeSpacing / 2 - eyeWidth / 2].forEach((offsetX) => {
      this.ctx.save();
      this.ctx.translate(offsetX + this.eyeState.gazeX, this.eyeState.gazeY);

      this.ctx.fillStyle = '#00f2fe';
      this.ctx.shadowColor = '#00f2fe';
      this.ctx.shadowBlur = 20;

      if (this.eyeState.shape === 'happy') {
        // Arc / Arch eyes for happy state
        this.ctx.beginPath();
        this.ctx.arc(0, 0, eyeWidth / 1.2, Math.PI, 0, false);
        this.ctx.lineWidth = 12;
        this.ctx.strokeStyle = '#00f2fe';
        this.ctx.stroke();
      } else if (this.eyeState.shape === 'sleepy') {
        // Droopy flat line eyes
        this.ctx.fillRect(-eyeWidth / 2, 0, eyeWidth, 10);
      } else if (this.eyeState.shape === 'confused') {
        // Angled eyes
        this.ctx.rotate(0.2);
        this.ctx.fillRect(-eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight * 0.8);
      } else {
        // Normal rounded glowing eyes with smooth squash & stretch
        this.ctx.beginPath();
        this.ctx.roundRect(-eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight, 24);
        this.ctx.fill();
      }

      this.ctx.restore();
    });

    this.ctx.restore();
  }
};

window.addEventListener('load', () => DabsyApp.init());
        
