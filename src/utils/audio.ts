/**
 * Synthesizes a premium iOS-like single clean chime sound.
 */
export const playSuccessPing = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    
    // High-pitched iOS clean chime frequencies (C6 -> E6 slide)
    osc.frequency.setValueAtTime(1046.50, now);
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08);
    
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc.start(now);
    osc.stop(now + 0.45);
  } catch (error) {
    console.warn('Audio synthesis failed:', error);
  }
};

/**
 * Synthesizes a distinct electronic double-chime (ding-dong) for new orders.
 */
export const playNewOrderAlert = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gainNode.gain.setValueAtTime(0.001, start);
      gainNode.gain.exponentialRampToValueAtTime(0.25, start + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = audioCtx.currentTime;
    // First high note (B5)
    playTone(987.77, now, 0.25);
    // Second higher note (E6) starting slightly later
    playTone(1318.51, now + 0.15, 0.4);
  } catch (error) {
    console.warn('Audio synthesis failed:', error);
  }
};

/**
 * Synthesizes a pleasant cooking/prep chime.
 */
export const playPreparingChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.start(now);
    osc.stop(now + 0.45);
  } catch (error) {
    console.warn('Audio synthesis failed:', error);
  }
};

/**
 * Synthesizes a cute "delivery out" horn-like double honk.
 */
export const playDeliveryChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    const playHonk = (time: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, time);
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(349.23, time); // F4
      gainNode.gain.setValueAtTime(0.001, time);
      gainNode.gain.linearRampToValueAtTime(0.1, time + 0.03);
      gainNode.gain.linearRampToValueAtTime(0.001, time + 0.15);
      osc.start(time);
      osc.stop(time + 0.15);
    };
    playHonk(now);
    playHonk(now + 0.18);
  } catch (error) {
    console.warn('Audio synthesis failed:', error);
  }
};

/**
 * Synthesizes a happy success chime for completed delivery.
 */
export const playCompletedChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    const playNote = (freq: number, time: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gainNode.gain.setValueAtTime(0.001, time);
      gainNode.gain.exponentialRampToValueAtTime(0.2, time + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.start(time);
      osc.stop(time + duration);
    };
    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.12, 0.15); // E5
    playNote(783.99, now + 0.24, 0.15); // G5
    playNote(1046.50, now + 0.36, 0.4); // C6
  } catch (error) {
    console.warn('Audio synthesis failed:', error);
  }
};

/**
 * Synthesizes a gentle warning double-beep for pending orders.
 */
export const playPendingOrderReminder = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    const playBeep = (time: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, time); // A5
      gainNode.gain.setValueAtTime(0.001, time);
      gainNode.gain.exponentialRampToValueAtTime(0.15, time + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      osc.start(time);
      osc.stop(time + 0.2);
    };
    playBeep(now);
    playBeep(now + 0.25);
  } catch (error) {
    console.warn('Audio synthesis failed:', error);
  }
};
