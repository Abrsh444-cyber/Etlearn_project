 let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

function createTone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  volume = 0.08
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";

  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration);
}

export function playPremiumSuccessSound() {
  const ctx = getAudioContext();

  const t = ctx.currentTime;

  createTone(ctx, 523.25, t + 0.00, 0.8);
  createTone(ctx, 659.25, t + 0.08, 0.8);
  createTone(ctx, 783.99, t + 0.16, 1.0);
  createTone(ctx, 1046.50, t + 0.30, 1.2);

  // soft echo
  createTone(ctx, 523.25, t + 0.45, 0.6, 0.03);
  createTone(ctx, 783.99, t + 0.60, 0.7, 0.02);
}

export function playSuccessChime() {
  try {
    playPremiumSuccessSound();
  } catch (err) {
    console.warn('Audio playSuccessChime failed:', err);
  }
}

export function playClickChime() {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    createTone(ctx, 900, t, 0.03, 0.01); // ultra soft high click
  } catch (err) {
    // Fail silently
  }
}

export function playFailureChime() {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    createTone(ctx, 220, t, 0.2, 0.06);     // Low A3
    createTone(ctx, 165, t + 0.1, 0.3, 0.06); // Low E3
  } catch (err) {
    // Fail silently
  }
}

export function playAlarmSound() {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    createTone(ctx, 783.99, t, 0.25);       // G5
    createTone(ctx, 659.25, t + 0.12, 0.25); // E5
    createTone(ctx, 523.25, t + 0.24, 0.25); // C5
    createTone(ctx, 783.99, t + 0.36, 0.5);  // G5 accented bell
  } catch (err) {
    console.warn('Audio alarm sound failed:', err);
  }
}

