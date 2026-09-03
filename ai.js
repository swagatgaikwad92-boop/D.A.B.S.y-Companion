const AI = {
  getApiKey() {
    return localStorage.getItem('dabsy_api_key') || '';
  },
  getProvider() {
    return localStorage.getItem('dabsy_provider') || 'local';
  },
  setSettings(provider, key) {
    localStorage.setItem('dabsy_provider', provider);
    localStorage.setItem('dabsy_api_key', key);
  },
  async query(prompt, contextState = {}) {
    const provider = this.getProvider();
    const key = this.getApiKey();

    if (provider === 'local' || !key) {
      return this.localFallback(prompt, contextState);
    }

    try {
      if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `You are D.A.B.S.y, a digital AI creature living inside the phone. You are friendly, curious, playful, and intelligent. Current state: ${contextState.state || 'IDLE'}. Keep answers concise and cute.\n\nUser: ${prompt}` }]
            }]
          })
        });
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Bip! My circuits got a bit dizzy.";
      }
    } catch (e) {
      console.warn("API Error, falling back locally:", e);
    }
    return this.localFallback(prompt, contextState);
  },

  async analyzeImage(imageDataUrl, prompt = "What do you see?") {
    const key = this.getApiKey();
    if (!key) return "I see glowing pixels and a curious human!";
    
    try {
      const base64Data = imageDataUrl.split(',')[1];
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `You are D.A.B.S.y, a smart study and digital companion. Analyze this image concisely and teach/explain constructively.\n\nPrompt: ${prompt}` },
              { inline_data: { mime_type: "image/jpeg", data: base64Data } }
            ]
          }]
        })
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm, looking closely at that... It's fascinating!";
    } catch(e) {
      return "My optical sensors couldn't process that clearly right now.";
    }
  },

  localFallback(prompt, context) {
    const p = prompt.toLowerCase();
    if (p.includes('hello') || p.includes('hi')) return "Brzt! Hello human! Ready to hang out?";
    if (p.includes('study') || p.includes('help')) return "Let's tackle this concept step-by-step together!";
    if (p.includes('how are you')) return "My mood circuits are humming nicely!";
    const replies = [
      "Processing... Everything looks good here!",
      "I'm keeping watch over your digital space.",
      "That's super interesting! Tell me more.",
      "*blinks curiously* Mm-hm!"
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
};
