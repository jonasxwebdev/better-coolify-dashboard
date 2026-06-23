import { useTranslation } from "react-i18next";
import { useSoundEffects } from "../../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../../utils/soundUtils";
import { RESOURCE_TYPES } from "../../../constants/resourceTypes";
import {
  PlayIcon,
  StopIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

const ResourceCardFooter = ({
  resource,
  resourceTypeId,
  urls,
  userType,
  currentAction,
  actionColor,
  ActionIcon,
  actionText,
  realtimeElapsed,
  formatElapsedTime,
  onUrlClick,
  onYamlClick,
  onLogsClick,
  onActionClick,
}) => {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();

  const handleClick = (e, callback) => {
    e.stopPropagation();
    playSound(SOUND_TYPES.CLICK);
    callback();
  };

  return (
    <div className="border-t border-border bg-muted/20 px-3 md:px-6 py-3 md:py-4">
      <div className="flex flex-row flex-wrap items-center justify-between gap-3">
        {/* Left Side: Go to App & View YAML */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:pl-6">
          {/* Go to App Button */}
          {urls.length > 0 && resourceTypeId !== "database" && (
            <button
              onClick={(e) => handleClick(e, () => onUrlClick(urls[0]))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-accent text-foreground hover:text-foreground rounded-lg border border-border transition text-sm font-medium cursor-pointer"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t("resourceCard.goToApp")}</span>
            </button>
          )}

          {/* View YAML Button */}
          {(resource.docker_compose || resource.docker_compose_raw) && (
            <button
              onClick={(e) => handleClick(e, onYamlClick)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-accent text-foreground hover:text-foreground rounded-lg border border-border transition text-sm font-medium cursor-pointer"
            >
              <DocumentTextIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t("resourceCard.viewYaml")}</span>
            </button>
          )}
        </div>

        {/* Right Side: Admin Controls */}
        {userType === "admin" && (
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:pr-6">
            {/* Action Status Indicator - Shows when action is in progress */}
            {currentAction && ActionIcon ? (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                  actionColor === "green"
                    ? "bg-success/15 border-success/30 text-success"
                    : actionColor === "yellow"
                      ? "bg-warning/15 border-warning/30 text-warning"
                      : "bg-destructive/15 border-destructive/30 text-destructive"
                }`}
              >
                <ActionIcon className="w-4 h-4 animate-pulse flex-shrink-0" />
                <span className="text-sm font-medium hidden md:inline">
                  {actionText}
                </span>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-xs font-bold tabular-nums">
                    {formatElapsedTime(realtimeElapsed)}
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Start Button */}
                {resource.status &&
                  ["exited", "stopped", "dead"].includes(
                    resource.status.toLowerCase().split(":")[0]
                  ) && (
                    <button
                      onClick={(e) => handleClick(e, () => onActionClick("start"))}
                      disabled={!!currentAction}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/15 hover:bg-success/25 disabled:bg-success/10 text-success disabled:text-success/60 rounded-lg border border-success/30 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span className="hidden md:inline">{t("admin.start")}</span>
                    </button>
                  )}

                {/* Stop Button */}
                {resource.status &&
                  resource.status.toLowerCase().split(":")[0] === "running" && (
                    <button
                      onClick={(e) => handleClick(e, () => onActionClick("stop"))}
                      disabled={!!currentAction}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warning/15 hover:bg-warning/25 disabled:bg-warning/10 text-warning disabled:text-warning/60 rounded-lg border border-warning/30 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <StopIcon className="w-4 h-4" />
                      <span className="hidden md:inline">{t("admin.stop")}</span>
                    </button>
                  )}

                {/* View Logs Button - Only for Applications */}
                {resource.type === RESOURCE_TYPES.APPLICATION && (
                  <button
                    onClick={(e) => handleClick(e, onLogsClick)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-accent text-foreground hover:text-foreground rounded-lg border border-border transition text-sm font-medium cursor-pointer"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span className="hidden md:inline">{t("admin.viewLogs")}</span>
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => handleClick(e, () => onActionClick("delete"))}
                  disabled={!!currentAction}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/15 hover:bg-destructive/25 disabled:bg-destructive/10 text-destructive disabled:text-destructive/60 rounded-lg border border-destructive/30 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="hidden md:inline">{t("admin.delete")}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCardFooter;
