const AI = {
  getApiKey() {
    return localStorage.getItem('dabsy_api_key') || '';
  },
  getProvider() {
    return localStorage.getItem('dabsy_provider') || 'local';
  },
  setSettings(provider, key) {
    localStorage.setItem('dabsy_provider', provider.trim());
    localStorage.setItem('dabsy_api_key', key.trim());
  },
  async query(prompt, contextState = {}) {
    const provider = this.getProvider();
    const key = this.getApiKey();

    if (provider === 'local' || !key) {
      return PersonalitySystem.getMoodResponse(contextState.mood || 'happy', prompt);
    }

    try {
      if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `You are D.A.B.S.y, a digital AI creature living inside the phone. You are friendly, curious, playful, and intelligent. Current mood: ${contextState.mood || 'happy'}. Keep answers concise and cute.\n\nUser: ${prompt}` }]
            }]
          })
        });

        if (!res.ok) return PersonalitySystem.getMoodResponse(contextState.mood || 'happy', prompt);

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn("AI offline, falling back locally:", e);
    }
    
    return PersonalitySystem.getMoodResponse(contextState.mood || 'happy', prompt);
  },

  async analyzeImage(imageDataUrl, prompt = "What do you see?") {
    const key = this.getApiKey();
    if (!key) return "I see glowing pixels and a curious human! (Add your Gemini API key in settings for vision analysis).";
    
    try {
      const base64Data = imageDataUrl.split(',')[1];
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `You are D.A.B.S.y, a smart study companion. Analyze this image concisely and teach step-by-step.\n\nPrompt: ${prompt}` },
              { inline_data: { mime_type: "image/jpeg", data: base64Data } }
            ]
          }]
        })
      });

      if (!res.ok) return "My optical sensors couldn't reach the AI cloud. Check your API key!";
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Fascinating study material!";
    } catch(e) {
      return "Optical sensor network hiccup.";
    }
  }
};
