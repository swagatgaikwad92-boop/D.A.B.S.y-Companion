// High-performance layered Canvas rendering for luminous depth
class DabsyEyes {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    
    // Physics-driven parameters for organic motion
    this.gazeX = new Spring(0, 100, 12);
    this.gazeY = new Spring(0, 100, 12);
    this.blink = new Spring(1, 200, 15);
    this.squash = new Spring(1, 140, 12); // Affects shape based on emotion
    this.bloom = new Spring(1, 80, 20); // Breathing light intensity
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  render() {
    // Update physics
    this.gazeX.update();
    this.gazeY.update();
    this.blink.update();
    this.squash.update();
    this.bloom.update();

    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Clear with deep atmospheric dark
    this.ctx.fillStyle = '#030305';
    this.ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const spacing = 110;
    const baseWidth = 60;
    const baseHeight = 75;

    this.ctx.save();
    this.ctx.translate(cx, cy);

    [-spacing, spacing].forEach(offsetX => {
      this.ctx.save();
      
      // Calculate dynamic geometry based on physics
      const x = offsetX + this.gazeX.val;
      const y = this.gazeY.val;
      const width = baseWidth * (2 - this.squash.val);
      const height = baseHeight * this.blink.val * this.squash.val;
      
      this.ctx.translate(x, y);

      // Layer 1: Deep atmospheric bloom (large, soft, cyan/blue)
      this.ctx.shadowColor = `rgba(0, 180, 255, ${0.4 * this.bloom.val})`;
      this.ctx.shadowBlur = 90;
      this.ctx.fillStyle = 'rgba(0, 242, 254, 0.1)';
      this.drawSquircle(width, height);
      this.ctx.fill();

      // Layer 2: Inner glow
      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.shadowColor = `rgba(0, 242, 254, ${0.6 * this.bloom.val})`;
      this.ctx.shadowBlur = 30;
      this.ctx.fillStyle = 'rgba(0, 242, 254, 0.5)';
      this.drawSquircle(width * 0.9, height * 0.9);
      this.ctx.fill();

      // Layer 3: Luminous Core
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = 10;
      this.ctx.fillStyle = '#ffffff';
      this.drawSquircle(width * 0.6, height * 0.6);
      this.ctx.fill();

      this.ctx.restore();
    });

    this.ctx.restore();
  }

  // Renders a premium, smooth squircle shape rather than a generic arc
  drawSquircle(w, h) {
    this.ctx.beginPath();
    this.ctx.roundRect(-w/2, -h/2, w, h, 28);
  }
}

