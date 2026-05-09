import { useCallback } from 'react';

export function useCompletionSound() {
  const playCompletionSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Melodic bell chime: ascending arpeggio E5 - G5 - C6 (pleasant, sparkly)
      const notes = [
        { freq: 659.25, start: 0,    duration: 1.8 }, // E5
        { freq: 783.99, start: 0.12, duration: 1.7 }, // G5
        { freq: 1046.5, start: 0.24, duration: 1.8 }, // C6
      ];

      const now = audioContext.currentTime;

      notes.forEach(({ freq, start, duration }) => {
        // Each note: fundamental + bell-like overtones (2x, 3x)
        const partials = [
          { mult: 1,    gain: 0.32 },
          { mult: 2.01, gain: 0.16 },
          { mult: 3.02, gain: 0.08 },
          { mult: 4.5,  gain: 0.04 },
        ];

        partials.forEach(({ mult, gain }) => {
          const osc = audioContext.createOscillator();
          const g = audioContext.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * mult, now + start);

          const t0 = now + start;
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
          g.gain.exponentialRampToValueAtTime(0.0008, t0 + duration);

          osc.connect(g);
          g.connect(audioContext.destination);

          osc.start(t0);
          osc.stop(t0 + duration + 0.05);
        });
      });
    } catch (error) {
      console.warn('Could not play completion sound:', error);
    }
  }, []);

  return { playCompletionSound };
}
