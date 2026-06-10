/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Uses Web Audio API to synthesize chimes with zero external file requirements
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a dual-tone sparkling bell sound (C5 and E5 or G5)
    const playTone = (freq: number, delay: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      // Frequency sweep for a bright chime
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + delay + 0.05);
      
      gainNode.gain.setValueAtTime(0.15, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + dur);
    };

    playTone(523.25, 0, 0.4);      // C5
    playTone(659.25, 0.08, 0.5);   // E5
    playTone(783.99, 0.16, 0.6);   // G5 (Harmonious sweep)
  } catch (err) {
    console.warn('Audio feedback failed or blocked by gesture:', err);
  }
}

export function playClickChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(now + 0.1);
  } catch (err) {
    // Fail silently
  }
}

export function playFailureChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3 Low
    osc.frequency.linearRampToValueAtTime(147, now + 0.35); // D3 Lower
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(now + 0.4);
  } catch (err) {
    // Fail silently
  }
}
