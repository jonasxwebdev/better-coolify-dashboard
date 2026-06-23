import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../utils/soundUtils";

const ConfirmUrlModal = ({ url, onClose }) => {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();

  const handleConfirm = () => {
    playSound(SOUND_TYPES.CLICK);
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleClose = () => {
    playSound(SOUND_TYPES.CLICK);
    // Remove focus from any button when closing
    if (document.activeElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-popover rounded-xl border border-border max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("modals.redirecting")}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t("modals.redirectToNewTab")}
          </p>
          <div className="bg-muted/40 p-3 rounded-md mb-6 border border-border">
            <p className="text-xs md:text-sm text-foreground font-mono break-all">
              {url}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground rounded-md border border-border transition-colors font-medium cursor-pointer text-sm"
            >
              {t("modals.cancel")}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors font-medium cursor-pointer text-sm"
            >
              {t("modals.continue")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUrlModal;
