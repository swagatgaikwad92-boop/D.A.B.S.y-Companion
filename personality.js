const PersonalitySystem = {
  traits: {
    curiosity: 0.8,
    playfulness: 0.7,
    independence: 0.5,
    friendliness: 0.9
  },
  
  getMoodResponse(mood, trigger) {
    const responses = {
      happy: [
        "Brzt! Great to see you!",
        "*happy chirp* Life is good.",
        "My circuits feel extra cozy right now."
      ],
      curious: [
        "Hmm? What's happening over there?",
        "My optical sensors noticed something interesting.",
        "Tell me more about that!"
      ],
      sleepy: [
        "Yawn... my power cells need a nap...",
        "So quiet... resting eyes...",
        "Zzz... oh, hi human."
      ],
      confused: [
        "Wait... recalculating that thought!",
        "My logic gates are doing a little dance.",
        "Hmm, not quite sure about that one!"
      ]
    };
    const list = responses[mood] || responses['happy'];
    return list[Math.floor(Math.random() * list.length)];
  }
};

