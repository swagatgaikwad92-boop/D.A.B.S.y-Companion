// The autonomous creature brain controlling the physics parameters
class DabsyBehavior {
  constructor(eyes) {
    this.eyes = eyes;
    this.state = 'WAKING';
    
    // Start life loop
    this.eyes.blink.val = 0.01;
    setTimeout(() => this.wakeUp(), 800);
    this.lifeLoop();
    this.breathingLoop();
  }

  wakeUp() {
    this.state = 'IDLE';
    this.eyes.blink.target = 1;
    this.eyes.bloom.target = 1;
    App.speak(`Hello, ${Memory.profile.name}.`);
  }

  setState(newState) {
    this.state = newState;
    if (newState === 'THINKING') {
      this.eyes.squash.target = 0.85; // Narrows eyes
      this.eyes.bloom.target = 1.3;
    } else if (newState === 'HAPPY') {
      this.eyes.squash.target = 0.7; // Squints into an arch shape
      this.eyes.blink.target = 0.8;
      this.eyes.bloom.target = 1.2;
    } else if (newState === 'IDLE') {
      this.eyes.squash.target = 1;
      this.eyes.blink.target = 1;
      this.eyes.gazeX.target = 0;
      this.eyes.gazeY.target = 0;
    }
  }

  triggerBlink(speed = 1) {
    this.eyes.blink.target = 0.05;
    setTimeout(() => {
      if (this.state !== 'SLEEPY') this.eyes.blink.target = 1;
    }, 120 * speed);
  }

  lifeLoop() {
    // Micro-animations: Spontaneous blinks and saccades (tiny gaze shifts)
    if (this.state === 'IDLE' && Math.random() > 0.4) {
      if (Math.random() > 0.7) {
        this.triggerBlink();
        if (Math.random() > 0.8) setTimeout(() => this.triggerBlink(0.8), 200); // Double blink
      } else {
        // Micro-look
        this.eyes.gazeX.target = (Math.random() - 0.5) * 15;
        this.eyes.gazeY.target = (Math.random() - 0.5) * 10;
        setTimeout(() => {
          if (this.state === 'IDLE') {
            this.eyes.gazeX.target = 0;
            this.eyes.gazeY.target = 0;
          }
        }, 800 + Math.random() * 1000);
      }
    }
    setTimeout(() => this.lifeLoop(), 2000 + Math.random() * 3000);
  }

  breathingLoop() {
    // Subtle continuous light pulsation
    if (this.state === 'IDLE' || this.state === 'THINKING') {
      this.eyes.bloom.target = this.eyes.bloom.target > 1.0 ? 0.9 : 1.1;
    }
    setTimeout(() => this.breathingLoop(), 1800);
  }

  reactToTouch(x, y) {
    // Look toward the touch with physics overshoot
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    this.eyes.gazeX.target = Math.max(-60, Math.min(60, (x - cx) * 0.15));
    this.eyes.gazeY.target = Math.max(-40, Math.min(40, (y - cy) * 0.15));
    this.eyes.bloom.target = 1.4;
    
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.setState('IDLE'), 1500);
  }
}
