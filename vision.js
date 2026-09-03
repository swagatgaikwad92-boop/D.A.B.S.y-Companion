const VisionSystem = {
  active: false,
  stream: null,
  videoEl: null,
  canvas: null,
  ctx: null,
  onChangeCallback: null,

  init(videoElement, callback) {
    this.videoEl = videoElement;
    this.onChangeCallback = callback;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  },

  async toggle() {
    if (this.active) {
      this.stop();
      return false;
    } else {
      return await this.start();
    }
  },

  async start() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera API not supported in this environment.");
        return false;
      }
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      if (this.videoEl) {
        this.videoEl.srcObject = this.stream;
      }
      this.active = true;
      this.startMotionLoop();
      return true;
    } catch (e) {
      console.warn("Camera access denied or unavailable:", e);
      alert("Could not access camera. Please check permissions.");
      return false;
    }
  },

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.active = false;
    if (this.videoEl) this.videoEl.srcObject = null;
    if (this.onChangeCallback) this.onChangeCallback('AWAY', 'sleepy');
  },

  startMotionLoop() {
    if (!this.active) return;
    setTimeout(() => {
      if (!this.active) return;
      if (this.videoEl && this.videoEl.videoWidth > 0) {
        this.canvas.width = 160;
        this.canvas.height = 120;
        this.ctx.drawImage(this.videoEl, 0, 0, 160, 120);
        if (this.onChangeCallback) {
          this.onChangeCallback('WATCHING', 'curious');
        }
      }
      this.startMotionLoop();
    }, 4000);
  },

  captureSnapshot() {
    if (!this.active || !this.videoEl || this.videoEl.videoWidth === 0) return null;
    this.canvas.width = this.videoEl.videoWidth;
    this.canvas.height = this.videoEl.videoHeight;
    this.ctx.drawImage(this.videoEl, 0, 0);
    return this.canvas.toDataURL('image/jpeg', 0.8);
  }
};
