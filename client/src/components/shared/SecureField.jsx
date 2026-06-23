import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeSlashIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../utils/soundUtils";
import useAutoHide from "../../hooks/useAutoHide";

const SecureField = ({
  label,
  value,
  hideText = "••••••••",
  autoHideTimeout = 10000,
  className = "",
}) => {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-hide after timeout
  useAutoHide(isVisible, setIsVisible, autoHideTimeout);
  useAutoHide(copied, setCopied, 2000);

  const handleToggleVisibility = () => {
    playSound(SOUND_TYPES.CLICK);
    setIsVisible(!isVisible);
  };

  const handleCopy = async () => {
    playSound(SOUND_TYPES.CLICK);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        {/* Value Display */}
        <div className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg font-mono text-sm text-foreground break-all">
          {isVisible ? value : hideText}
        </div>

        {/* Toggle Visibility Button */}
        <button
          onClick={handleToggleVisibility}
          className="p-2 bg-secondary hover:bg-accent rounded-md border border-border transition-colors text-secondary-foreground cursor-pointer"
          title={isVisible ? t("common.hide") : t("common.show")}
        >
          {isVisible ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>

        {/* Copy to Clipboard Button */}
        <button
          onClick={handleCopy}
          className={`p-2 rounded-md border transition-colors cursor-pointer ${
            copied
              ? "bg-success/15 border-success/30 text-success"
              : "bg-secondary hover:bg-accent border-border text-secondary-foreground"
          }`}
          title={copied ? t("common.copied") : t("common.copy")}
        >
          <ClipboardIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SecureField;
