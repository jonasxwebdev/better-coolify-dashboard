import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { SOUND_TYPES } from "../utils/soundUtils";
import { useIsMobile } from "../hooks/useIsMobile";

const SoundToggle = () => {
  const { isSoundEnabled, toggleSound, playSound } = useSoundEffects();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  const handleClick = () => {
    playSound(SOUND_TYPES.CLICK);
    toggleSound();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-gradient-to-br from-indigo-500/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 cursor-pointer group opacity-60 hover:opacity-100"
      aria-label={isSoundEnabled ? "Sesi Kapat" : "Sesi Aç"}
      title={isSoundEnabled ? "Sesi Kapat" : "Sesi Aç"}
    >
      {isSoundEnabled ? (
        <SpeakerWaveIcon className="h-5 w-5 text-white group-hover:animate-pulse" />
      ) : (
        <SpeakerXMarkIcon className="h-5 w-5 text-white/70" />
      )}
    </button>
  );
};

export default SoundToggle;
