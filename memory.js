const MemorySystem = {
  data: {
    profile: { name: "Human", style: "balanced", goals: [], streak: 0, lastActive: Date.now() },
    study: { subjects: {}, weakAreas: [], completedTopics: [] },
    projects: [],
    tasks: [],
    conversations: [],
    preferences: { voiceEnabled: true, personality: "balanced", isPremium: false }
  },

  init() {
    const saved = localStorage.getItem('dabsy_v4_memory');
    if (saved) {
      try { this.data = JSON.parse(saved); } catch(e) {}
    }
  },

  save() {
    localStorage.setItem('dabsy_v4_memory', JSON.stringify(this.data));
  },

  get(key) { return this.data[key]; },
  setProfile(key, val) { this.data.profile[key] = val; this.save(); },

  addTask(task) {
    const entry = { id: Date.now(), completed: false, priority: 'medium', category: 'General', ...task };
    this.data.tasks.push(entry);
    this.save();
    return entry;
  },

  completeTask(id) {
    const t = this.data.tasks.find(x => x.id === id);
    if (t) {
      t.completed = true;
      this.data.profile.streak++;
      this.save();
    }
    return t;
  },

  addProject(name, details = {}) {
    const p = { id: Date.now(), name, details, notes: [], tasks: [], createdAt: Date.now() };
    this.data.projects.push(p);
    this.save();
    return p;
  },

  logConversation(role, text) {
    this.data.conversations.push({ role, text, timestamp: Date.now() });
    if (this.data.conversations.length > 50) this.data.conversations.shift();
    this.save();
  },

  export() { return JSON.stringify(this.data, null, 2); },
  import(jsonStr) {
    try {
      this.data = JSON.parse(jsonStr);
      this.save();
      return true;
    } catch(e) { return false; }
  }
};
MemorySystem.init();
