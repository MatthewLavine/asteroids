// Simple sound manager for Asteroids
// Audio must be used in a browser context, so this file is for browser use only.
import { SoundName } from "./types.js";

const sounds: Record<SoundName, HTMLAudioElement | null> = {
  laser1:
    typeof window !== "undefined"
      ? new window.Audio("sounds/laser1.wav")
      : null,
  laser2:
    typeof window !== "undefined"
      ? new window.Audio("sounds/laser2.wav")
      : null,
  explosion:
    typeof window !== "undefined"
      ? new window.Audio("sounds/explosion.wav")
      : null,
};

let muted: boolean = false;

function setMuted(value: boolean): void {
  muted = value;
}

function playSound(name: SoundName): void {
  if (muted) return;
  const sound = sounds[name];
  if (sound) {
    // Clone the audio to allow overlapping sounds
    const clonedSound = sound.cloneNode() as HTMLAudioElement;
    clonedSound.volume = 0.5;
    clonedSound.play().catch(() => {
      // Ignore audio play errors (e.g., user hasn't interacted with page)
    });
  }
}

export { playSound, setMuted };
