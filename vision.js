const VisionSystem = {
  active: false,
  stream: null,
  videoEl: null,

  init(videoElement) {
    this.videoEl = videoElement;
  },

  async toggle() {
    if (this.active) {
      this.stop();
      return false;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (this.videoEl) this.videoEl.srcObject = this.stream;
      this.active = true;
      return true;
    } catch(e) {
      alert("Camera access denied or unavailable.");
      return false;
    }
  },

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.active = false;
    if (this.videoEl) this.videoEl.srcObject = null;
  }
};
