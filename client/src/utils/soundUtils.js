export const SOUNDS = {
  CLICK: "/sounds/click.wav",
};

export const SOUND_TYPES = {
  CLICK: "click",
};

const audioCache = new Map();

const getAudio = (soundPath) => {
  if (!audioCache.has(soundPath)) {
    const audio = new Audio(soundPath);
    audio.preload = "auto";
    audioCache.set(soundPath, audio);
  }
  return audioCache.get(soundPath);
};

export const playSound = (soundPath, volume = 0.3) => {
  try {
    const audio = getAudio(soundPath);
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.warn("Sound playback failed:", error);
    });
  } catch (error) {
    console.warn("Error playing audio:", error);
  }
};

export const playSoundType = (type, volume = 0.3) => {
  const soundMap = {
    [SOUND_TYPES.CLICK]: SOUNDS.CLICK,
  };

  const soundPath = soundMap[type];
  if (soundPath) {
    playSound(soundPath, volume);
  }
};

export const getSoundEnabled = () => {
  const stored = localStorage.getItem("soundEnabled");
  // Default to true (enabled)
  return stored === null ? true : stored === "true";
};

export const setSoundEnabled = (enabled) => {
  localStorage.setItem("soundEnabled", enabled.toString());
};
