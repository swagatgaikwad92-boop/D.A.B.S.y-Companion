const VoiceSystem = {
  recognition: null,
  synth: window.speechSynthesis,
  isListening: false,

  init(onResult) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        this.isListening = false;
        if (onResult) onResult(text);
      };

      this.recognition.onerror = () => { this.isListening = false; };
      this.recognition.onend = () => { this.isListening = false; };
    }
  },

  listen() {
    if (!this.recognition) {
      alert("Speech recognition is not supported in this browser.");
      return false;
    }
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      return false;
    } else {
      try {
        this.recognition.start();
        this.isListening = true;
        return true;
      } catch(e) {
        this.isListening = false;
        return false;
      }
    }
  },

  speak(text, onEnd) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.4; // Cute robotic/creature pitch
    utterance.rate = 1.1;
    utterance.onend = () => { if (onEnd) onEnd(); };
    this.synth.speak(utterance);
  }
};

