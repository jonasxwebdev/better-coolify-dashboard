import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import {
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../utils/soundUtils";

const ConfirmActionModal = ({ action, resourceName, onConfirm, onClose }) => {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();

  const actionConfig = {
    start: {
      icon: PlayIcon,
      iconColor: "text-success",
      iconBg: "bg-success/15",
      confirmBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
      message: t("admin.confirmStart", { name: resourceName }),
    },
    stop: {
      icon: StopIcon,
      iconColor: "text-warning",
      iconBg: "bg-warning/15",
      confirmBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
      message: t("admin.confirmStop", { name: resourceName }),
    },
    restart: {
      icon: ArrowPathIcon,
      iconColor: "text-info",
      iconBg: "bg-info/15",
      confirmBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
      message: t("admin.confirmRestart", { name: resourceName }),
    },
    delete: {
      icon: TrashIcon,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/15",
      confirmBg: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
      message: t("admin.confirmDelete", { name: resourceName }),
      isDestructive: true,
    },
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  const handleClose = () => {
    playSound(SOUND_TYPES.CLICK);
    // Remove focus from any button when closing
    if (document.activeElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  const handleConfirm = () => {
    playSound(SOUND_TYPES.CLICK);
    onConfirm();
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
            <div
              className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}
            >
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {config.message}
            </h3>
          </div>
          {config.isDestructive && (
            <div className="flex items-center gap-2 mb-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
              <span>{t("admin.deleteWarning")}</span>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground rounded-md border border-border transition-colors font-medium cursor-pointer text-sm"
            >
              {t("modals.cancel")}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2.5 ${config.confirmBg} rounded-md transition-colors font-medium cursor-pointer text-sm`}
            >
              {t(`admin.${action}`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
