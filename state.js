const StateManager = {
  currentMood: 'happy', // idle, curious, happy, excited, focused, thinking, confused, sleepy, proud, concerned
  eyeState: {
    blink: 1.0,
    gazeX: 0,
    gazeY: 0,
    targetGazeX: 0,
    targetGazeY: 0,
    shape: 'normal'
  },

  setMood(mood) {
    this.currentMood = mood;
    if (mood === 'sleepy') this.eyeState.shape = 'sleepy';
    else if (mood === 'happy' || mood === 'excited' || mood === 'proud') this.eyeState.shape = 'happy';
    else if (mood === 'confused') this.eyeState.shape = 'confused';
    else if (mood === 'focused') this.eyeState.shape = 'focused';
    else this.eyeState.shape = 'normal';
  },

  getProactiveGreeting() {
    const last = MemorySystem.get('profile').lastActive || Date.now();
    const hours = (Date.now() - last) / (1000 * 60 * 60);
    MemorySystem.setProfile('lastActive', Date.now());

    const pending = MemorySystem.get('tasks').filter(t => !t.completed);
    if (hours > 24) return "You're back 👀. Ready to pick up where we left off?";
    if (pending.length > 0) return `Welcome back. You still have "${pending[0].name}" pending.`;
    return "Systems online. What are we tackling?";
  }
};
