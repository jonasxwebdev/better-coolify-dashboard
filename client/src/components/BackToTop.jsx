import { useState, useEffect } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { SOUND_TYPES } from "../utils/soundUtils";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { playSound } = useSoundEffects();

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    playSound(SOUND_TYPES.CLICK);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-br from-indigo-500/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 cursor-pointer group opacity-60 hover:opacity-100"
      aria-label="Başa Dön"
      title="Başa Dön"
    >
      <ChevronUpIcon className="h-5 w-5 text-white group-hover:animate-pulse" />
    </button>
  );
};

export default BackToTop;
