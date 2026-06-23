import { useTranslation } from "react-i18next";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { SOUND_TYPES } from "../utils/soundUtils";

const LANGUAGES = [
  { code: "en", flag: "/EN.svg", label: "English" },
  { code: "de", flag: "/DE.svg", label: "Deutsch" },
  { code: "tr", flag: "/TR.svg", label: "Türkçe" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { playSound } = useSoundEffects();

  const currentIndex = Math.max(
    0,
    LANGUAGES.findIndex((lang) => lang.code === i18n.language)
  );
  const current = LANGUAGES[currentIndex];
  const next = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];

  const cycleLanguage = () => {
    playSound(SOUND_TYPES.CLICK);
    i18n.changeLanguage(next.code);
    localStorage.setItem("language", next.code);
  };

  return (
    <button
      type="button"
      className="language-toggle"
      onClick={cycleLanguage}
      title={`${current.label} → ${next.label}`}
      aria-label={`${current.label} (switch to ${next.label})`}
    >
      <img src={current.flag} alt={current.label} />
      <span className="language-toggle-code">{current.code.toUpperCase()}</span>
    </button>
  );
};

export default LanguageSelector;
