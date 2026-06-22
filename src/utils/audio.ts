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
