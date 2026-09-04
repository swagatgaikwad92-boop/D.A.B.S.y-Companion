const MemorySystem = {
  data: {
    profile: { name: "Human", style: "balanced", goals: [] },
    study: { subjects: {}, weakAreas: [], streak: 0, completedTopics: [] },
    tasks: [],
    conversations: [],
    preferences: { voiceEnabled: true, theme: "dark" }
  },

  init() {
    const saved = localStorage.getItem('dabsy_v2_memory');
    if (saved) {
      try { this.data = JSON.parse(saved); } catch(e) {}
    }
  },

  save() {
    localStorage.setItem('dabsy_v2_memory', JSON.stringify(this.data));
  },

  getProfile(key) { return this.data.profile[key]; },
  setProfile(key, val) { this.data.profile[key] = val; this.save(); },

  addTask(task) {
    this.data.tasks.push({ id: Date.now(), completed: false, ...task });
    this.save();
  },

  getPendingTasks() {
    return this.data.tasks.filter(t => !t.completed);
  },

  logConversation(role, text) {
    this.data.conversations.push({ role, text, timestamp: Date.now() });
    if (this.data.conversations.length > 30) this.data.conversations.shift();
    this.save();
  },

  exportMemory() { return JSON.stringify(this.data, null, 2); },
  importMemory(jsonString) {
    try {
      this.data = JSON.parse(jsonString);
      this.save();
      return true;
    } catch(e) { return false; }
  }
};
MemorySystem.init();
