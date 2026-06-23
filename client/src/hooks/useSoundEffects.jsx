/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import {
  playSoundType,
  getSoundEnabled,
  setSoundEnabled,
} from "../utils/soundUtils";
import { useIsMobile } from "./useIsMobile";

const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => getSoundEnabled());

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const newValue = !prev;
      setSoundEnabled(newValue);
      return newValue;
    });
  }, []);

  const playSound = useCallback(
    (soundType, volume = 0.3) => {
      if (isMobile) return;

      if (isSoundEnabled) {
        playSoundType(soundType, volume);
      }
    },
    [isSoundEnabled, isMobile]
  );

  const value = {
    isSoundEnabled,
    toggleSound,
    playSound,
  };

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
};

export const useSoundEffects = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSoundEffects must be used within a SoundProvider");
  }
  return context;
};
