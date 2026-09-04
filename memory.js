const Memory = {
  profile: {
    name: "Swagat",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    lastInteraction: Date.now()
  },
  save() {
    localStorage.setItem('dabsy_memory', JSON.stringify(this.profile));
  },
  load() {
    const saved = localStorage.getItem('dabsy_memory');
    if (saved) this.profile = { ...this.profile, ...JSON.parse(saved) };
  }
};
Memory.load();
