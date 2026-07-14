// Synthetic Retro Sound Effects using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('team_party_sound_enabled') === 'true';
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('team_party_sound_enabled', enabled ? 'true' : 'false');
}

/**
 * Play a simple retro beep sound
 */
export function playBeep(freq = 440, duration = 0.1, type: OscillatorType = 'square') {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio play failed:", e);
  }
}

/**
 * Play a short navigation click sound
 */
export function playClickSound() {
  playBeep(600, 0.08, 'triangle');
}

/**
 * Play an upward arpeggio for confirm/success
 */
export function playSuccessSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return;

  const now = ctx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playBeep(freq, 0.12, 'sine');
    }, idx * 100);
  });
}

/**
 * Play a rapid sequence of ticks for the slot machine roll
 */
export function playSlotTickSound() {
  playBeep(Math.random() * 200 + 400, 0.03, 'square');
}

/**
 * Play a low warning tone for countdown
 */
export function playCountdownTone(isFinal = false) {
  if (isFinal) {
    playBeep(880, 0.3, 'sine');
  } else {
    playBeep(440, 0.15, 'sine');
  }
}
