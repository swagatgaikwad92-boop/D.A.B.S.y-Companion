const BehaviorSystem = {
  currentAttention: 'nothing',
  hierarchy: [
    'user_face',
    'hands_gestures',
    'pointing',
    'moving_object',
    'new_object',
    'sound',
    'nothing'
  ],

  evaluateAttention(perceptionData) {
    if (perceptionData.faceDetected) return 'user_face';
    if (perceptionData.motionDetected) return 'moving_object';
    return 'nothing';
  },

  decideSpontaneousAction(currentState) {
    if (currentState === 'STUDYING' || currentState === 'THINKING') return null;
    const actions = ['blink', 'look_around', 'idle_wiggle', 'shift_gaze'];
    const pick = actions[Math.floor(Math.random() * actions.length)];
    return pick;
  }
};

