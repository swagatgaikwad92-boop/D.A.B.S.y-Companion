const MemorySystem = {
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(`dabsy_${key}`);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`dabsy_${key}`, JSON.stringify(value));
    } catch (e) {}
  },
  logInteraction(type, detail) {
    const history = this.get('history', []);
    history.push({ type, detail, timestamp: Date.now() });
    if (history.length > 50) history.shift();
    this.set('history', history);
  }
};
