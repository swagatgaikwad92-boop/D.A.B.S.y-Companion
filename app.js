// Main Application Controller tying UI, physics, and behavior together
const App = {
  init() {
    const canvas = document.getElementById('dabsy-canvas');
    this.eyes = new DabsyEyes(canvas);
    this.behavior = new DabsyBehavior(this.eyes);
    this.isWorldOpen = false;
    this.lastTap = 0;

    this.setupInteractions();
    this.loop();
  },

  setupInteractions() {
    const canvas = document.getElementById('dabsy-canvas');
    
    canvas.addEventListener('pointerup', (e) => {
      const now = Date.now();
      if (now - this.lastTap < 350) {
        this.toggleWorld();
      } else {
        this.behavior.reactToTouch(e.clientX, e.clientY);
      }
      this.lastTap = now;
    });
  },

  toggleWorld() {
    this.isWorldOpen = !this.isWorldOpen;
    
    if (this.isWorldOpen) {
      document.body.classList.add('world-open');
      this.behavior.setState('THINKING'); 
      this.eyes.bloom.target = 0.7; // Dim slightly while in menu
    } else {
      document.body.classList.remove('world-open');
      this.behavior.setState('IDLE');
    }
  },

  speak(text) {
    const sub = document.getElementById('subtitle-box');
    sub.innerText = text;
    sub.classList.add('visible');
    
    // Sync light intensity with speaking
    this.eyes.bloom.target = 1.5;
    
    setTimeout(() => {
      sub.classList.remove('visible');
      this.eyes.bloom.target = 1.0;
    }, 4000);
  },

  loop() {
    this.eyes.render();
    requestAnimationFrame(() => this.loop());
  }
};

window.addEventListener('load', () => App.init());
