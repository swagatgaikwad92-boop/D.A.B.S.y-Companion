const StudyTutor = {
  activeSession: null,
  step: 0,

  start(topic) {
    this.activeSession = topic;
    this.step = 1;
    return `Let's build ${topic} from zero. First, what do you think the core concept means in your own words?`;
  },

  respond(answer) {
    if (this.step === 1) {
      this.step = 2;
      return `Good start. Now consider what happens when resistance changes. How does that affect the flow?`;
    }
    return `Let's break that down into simpler parts. What is our primary variable here?`;
  }
};
