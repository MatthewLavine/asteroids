// Simple sound manager for Asteroids
// Audio must be used in a browser context, so this file is for browser use only.
const sounds = {
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

function playSound(name) {
  if (sounds[name]) {
    // Clone the audio to allow overlapping sounds
    const sound = sounds[name].cloneNode();
    sound.volume = 0.5;
    sound.play();
  }
}

export { playSound };
