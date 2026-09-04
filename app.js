const DabsyApp = {
  canvas: null,
  ctx: null,
  lastTapTime: 0,

  init() {
    this.canvas = document.getElementById('eye-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.setupInteractions();
    requestAnimationFrame(() => this.loop());

    // Autonomous Proactive Greeting on Boot
    setTimeout(() => {
      const greeting = StateManager.getProactiveGreeting();
      this.speak(greeting);
    }, 1200);

    // Spontaneous Idle behaviors
    setInterval(() => {
      StateManager.eyeState.targetGazeX = (Math.random() - 0.5) * 35;
      StateManager.eyeState.targetGazeY = (Math.random() - 0.5) * 15;
    }, 5000);
  },

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
    if (this.ctx) this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  },

  setupInteractions() {
    VoiceSystem.init(async (text) => {
      this.showSubtitle(text);
      const res = await DabsyBrain.process(text);
      this.speak(res.text);
    });

    // Double tap detector on Canvas to open D.A.B.S.y World
    this.canvas.addEventListener('touchend', () => this.handleTap());
    this.canvas.addEventListener('click', () => this.handleTap());
  },

  handleTap() {
    const now = Date.now();
    if (now - this.lastTapTime < 350) {
      // Double tap detected! Open Expanded World Room
      this.openExpandedWorld();
    } else {
      // Single tap pet reaction
      StateManager.setMood('happy');
      this.speak("👀");
    }
    this.lastTapTime = now;
  },

  openExpandedWorld() {
    const modal = document.getElementById('expanded-world');
    if (!modal) return;
    modal.innerHTML = DabsyRoom.render();
    modal.classList.remove('hidden');

    // Setup Room Tab Listeners
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        modal.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        modal.querySelector(`#tab-${e.target.dataset.tab}`).classList.add('active');
      });
    });

    modal.querySelector('#close-room').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    modal.querySelector('#add-task-btn')?.addEventListener('click', () => {
      const input = modal.querySelector('#new-task-input');
      if (input && input.value.trim()) {
        MemorySystem.addTask({ name: input.value.trim() });
        modal.innerHTML = DabsyRoom.render();
        this.openExpandedWorld(); // Refresh modal
      }
    });

    modal.querySelector('#start-tutor-btn')?.addEventListener('click', () => {
      const chat = modal.querySelector('#tutor-chat');
      const intro = StudyTutor.start("Current Electricity");
      chat.innerHTML = `<div class="chat-bubble dabsy">${intro}</div>`;
      this.speak(intro);
    });
  },

  completeTask(id) {
    MemorySystem.completeTask(id);
    this.openExpandedWorld();
  },

  showSubtitle(text) {
    const sub = document.getElementById('subtitle-box');
    if (!sub) return;
    sub.innerText = text;
    sub.classList.remove('hidden');
    setTimeout(() => sub.classList.add('hidden'), 4500);
  },

  speak(text) {
    this.showSubtitle(text);
    VoiceSystem.speak(text);
  },

  loop() {
    if (this.canvas && this.ctx) {
      StateManager.eyeState.gazeX += (StateManager.eyeState.targetGazeX - StateManager.eyeState.gazeX) * 0.1;
      StateManager.eyeState.gazeY += (StateManager.eyeState.targetGazeY - StateManager.eyeState.gazeY) * 0.1;
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
    const spacing = 85;
    const eWidth = 50;
    const eHeight = 65 * StateManager.eyeState.blink;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);

    [-spacing / 2 - eWidth / 2, spacing / 2 - eWidth / 2].forEach(offsetX => {
      this.ctx.save();
      this.ctx.translate(offsetX + StateManager.eyeState.gazeX, StateManager.eyeState.gazeY);

      this.ctx.fillStyle = '#00f2fe';
      this.ctx.shadowColor = '#00f2fe';
      this.ctx.shadowBlur = 18;

      if (StateManager.eyeState.shape === 'happy') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, eWidth / 2.2, Math.PI, 0, false);
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = '#00f2fe';
        this.ctx.stroke();
      } else if (StateManager.eyeState.shape === 'sleepy') {
        this.ctx.fillRect(-eWidth / 2, 0, eWidth, 8);
      } else if (StateManager.eyeState.shape === 'confused') {
        this.ctx.rotate(0.2);
        this.ctx.fillRect(-eWidth / 2, -eHeight / 2, eWidth, eHeight * 0.7);
      } else {
        this.ctx.beginPath();
        this.ctx.roundRect(-eWidth / 2, -eHeight / 2, eWidth, eHeight, 20);
        this.ctx.fill();
      }
      this.ctx.restore();
    });
    this.ctx.restore();
  }
};

window.addEventListener('load', () => DabsyApp.init());
