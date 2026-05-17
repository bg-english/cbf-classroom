/**
 * sounds.js — Web Audio API classroom sounds.
 * No external files. Pure synthesis. Low volume by design.
 */

let audioCtx = null

function ctx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function tone(freq, duration, vol = 0.07, type = 'sine', delay = 0) {
  try {
    const ac = ctx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.value = freq
    const t = ac.currentTime + delay
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(vol, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.start(t)
    osc.stop(t + duration + 0.05)
  } catch (_) { /* ignore if audio not available */ }
}

/** Ascending two-note chime — moving forward */
export function playNext(momentId = 0) {
  const FREQS = [
    [523.25, 659.25],  // M1 C5→E5
    [587.33, 739.99],  // M2 D5→F#5
    [659.25, 830.61],  // M3 E5→G#5
    [698.46, 880.00],  // M4 F5→A5
    [783.99, 987.77],  // M5 G5→B5
    [880.00, 1108.73], // M6 A5→C#6
  ]
  const [f1, f2] = FREQS[momentId] || FREQS[0]
  tone(f1, 0.18, 0.06)
  tone(f2, 0.22, 0.08, 'sine', 0.10)
}

/** Descending two-note — going backward */
export function playPrev() {
  tone(659.25, 0.18, 0.06)
  tone(523.25, 0.22, 0.06, 'sine', 0.10)
}

/** Soft bell — verse spotlight open */
export function playVerse() {
  tone(880.00, 0.5, 0.05)
  tone(1108.73, 0.4, 0.03, 'sine', 0.08)
  tone(1318.51, 0.35, 0.02, 'sine', 0.18)
}

/** Gentle click — generic tap confirmation */
export function playTap() {
  tone(1200, 0.06, 0.04, 'triangle')
}
