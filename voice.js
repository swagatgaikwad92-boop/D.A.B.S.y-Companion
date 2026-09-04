const VoiceSystem = {
  recognition: null,
  synth: window.speechSynthesis,
  isListening: false,

  init(onResult) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      try {
        this.recognition = new SR();
        this.recognition.lang = 'en-US';
        this.recognition.onresult = (e) => {
          this.isListening = false;
          if (onResult) onResult(e.results[0][0].transcript);
        };
        this.recognition.onerror = () => { this.isListening = false; };
        this.recognition.onend = () => { this.isListening = false; };
      } catch(e) {}
    }
  },

  listen() {
    if (!this.recognition) return false;
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      return false;
    }
    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch(e) {
      this.isListening = false;
      return false;
    }
  },

  speak(text) {
    if (!this.synth) return;
    try {
      this.synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = 1.3;
      u.rate = 1.1;
      this.synth.speak(u);
    } catch(e) {}
  }
};
