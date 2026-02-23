import { useRef } from 'react'

// Simple hook — plays an alert tone when called.
// Uses the Web Audio API so no external file is needed.
export function useOrderAlert() {
  const audioCtx = useRef(null)

  const playAlert = () => {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtx.current

      // Two-tone "ding ding" effect
      const times = [0, 0.3]
      times.forEach((startTime) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(880, ctx.currentTime + startTime)

        gainNode.gain.setValueAtTime(0.6, ctx.currentTime + startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + 0.4)

        oscillator.start(ctx.currentTime + startTime)
        oscillator.stop(ctx.currentTime + startTime + 0.4)
      })
    } catch (err) {
      console.warn('Audio alert failed:', err)
    }
  }

  return { playAlert }
}