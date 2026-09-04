const DabsyBrain = {
  getApiKey() { return localStorage.getItem('dabsy_api_key') || ''; },
  getProvider() { return localStorage.getItem('dabsy_provider') || 'local'; },

  async process(rawInput) {
    const input = rawInput.toLowerCase();

    // 1. Tool execution interception
    if (input.startsWith('remind me to') || input.startsWith('add task')) {
      const taskName = rawInput.replace(/remind me to|add task/i, '').trim();
      MemorySystem.addTask({ name: taskName });
      StateManager.setMood('happy');
      return { text: `Added "${taskName}" to your tasks.`, action: 'TASK_CREATED' };
    }

    if (input.includes('remember my project') || input.includes('robot project')) {
      const projName = rawInput.replace(/.*project[:\s]*is\s*/i, 'Robot Project').trim();
      MemorySystem.addProject(projName, { prompt: rawInput });
      StateManager.setMood('excited');
      return { text: `Project "${projName}" logged into memory.`, action: 'PROJECT_CREATED' };
    }

    // 2. Query LLM / Local fallback
    const provider = this.getProvider();
    const key = this.getApiKey();

    if (provider === 'local' || !key) {
      return this.localFallback(rawInput);
    }

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `You are D.A.B.S.y, a living digital creature and study companion with persistent memory. Current mood: ${StateManager.currentMood}. Keep responses natural, concise, and creature-like.\n\nUser: ${rawInput}` }]
          }]
        })
      });
      if (!res.ok) return this.localFallback(rawInput);
      const data = await res.json();
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (txt) {
        MemorySystem.logConversation('user', rawInput);
        MemorySystem.logConversation('dabsy', txt);
        return { text: txt, action: 'CHAT' };
      }
    } catch(e) {}

    return this.localFallback(rawInput);
  },

  localFallback(input) {
    const replies = [
      "Processing... Everything looks solid here.",
      "I'm keeping watch over your workflow.",
      "That's fascinating. Tell me more.",
      "*blinks curiously* Mm-hm!"
    ];
    const text = replies[Math.floor(Math.random() * replies.length)];
    MemorySystem.logConversation('user', input);
    MemorySystem.logConversation('dabsy', text);
    return { text, action: 'CHAT' };
  }
};

