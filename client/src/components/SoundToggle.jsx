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
      className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-card hover:bg-accent border border-border shadow-sm transition-colors cursor-pointer group opacity-70 hover:opacity-100"
      aria-label={isSoundEnabled ? "Sesi Kapat" : "Sesi Aç"}
      title={isSoundEnabled ? "Sesi Kapat" : "Sesi Aç"}
    >
      {isSoundEnabled ? (
        <SpeakerWaveIcon className="h-5 w-5 text-foreground" />
      ) : (
        <SpeakerXMarkIcon className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
};

export default SoundToggle;
