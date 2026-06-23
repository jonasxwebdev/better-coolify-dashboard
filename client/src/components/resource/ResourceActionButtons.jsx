import { useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import {
  PlayIcon,
  StopIcon,
  TrashIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import useResourceStore from "../../store/resourceStore";

const ConfirmActionModal = lazy(() => import("../modals/ConfirmActionModal"));
const LogsModal = lazy(() => import("../modals/LogsModal"));

const ResourceActionButtons = ({ resource }) => {
  const { t } = useTranslation();
  const {
    startResourceAction,
    stopResourceAction,
    deleteResourceAction,
    actionLoading,
  } = useResourceStore();

  const [confirmAction, setConfirmAction] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  const actionKey = `${resource.type}-${resource.uuid}`;
  const currentAction = actionLoading[actionKey];

  const statusLower = resource.status?.toLowerCase() || "";
  const statusParts = statusLower.split(":");
  const mainStatus = statusParts[0] || "";

  const isRunning = mainStatus === "running";

  const isStopped =
    mainStatus === "stopped" ||
    mainStatus === "exited" ||
    mainStatus === "error" ||
    mainStatus === "dead" ||
    mainStatus === "degraded" ||
    mainStatus === "";

  const isTransitioning =
    mainStatus === "starting" ||
    mainStatus === "stopping" ||
    mainStatus === "restarting";

  const handleStart = () => {
    startResourceAction(resource.type, resource.uuid, t);
  };

  const handleStop = () => {
    stopResourceAction(resource.type, resource.uuid, t);
  };

  const handleDelete = () => {
    deleteResourceAction(resource.type, resource.uuid, t);
  };

  const buttonClass =
    "flex items-center gap-2 px-4 py-2.5 transition-all duration-200 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm cursor-pointer";

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setConfirmAction("start")}
          disabled={isRunning || isTransitioning || currentAction}
          className={`${buttonClass} bg-success/15 hover:bg-success/25 border-success/30 hover:border-success/50 text-success hover:text-success disabled:hover:bg-success/25`}
        >
          {currentAction?.action === "starting" ? (
            <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" />
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
          <span className="hidden md:inline">
            {currentAction?.action === "starting"
              ? t("admin.starting")
              : t("admin.start")}
          </span>
        </button>

        <button
          onClick={() => setConfirmAction("stop")}
          disabled={isStopped || isTransitioning || currentAction}
          className={`${buttonClass} bg-warning/15 hover:bg-warning/25 border-warning/30 hover:border-warning/50 text-warning hover:text-warning disabled:hover:bg-warning/25`}
        >
          {currentAction?.action === "stopping" ? (
            <div className="w-4 h-4 border-2 border-warning border-t-transparent rounded-full animate-spin" />
          ) : (
            <StopIcon className="w-4 h-4" />
          )}
          <span className="hidden md:inline">
            {currentAction?.action === "stopping"
              ? t("admin.stopping")
              : t("admin.stop")}
          </span>
        </button>

        {resource.type === "application" && (
          <button
            onClick={() => setShowLogs(true)}
            disabled={isStopped || isTransitioning}
            className={`${buttonClass} bg-secondary hover:bg-accent border-border hover:border-border text-foreground hover:text-foreground disabled:hover:bg-accent`}
          >
            <DocumentMagnifyingGlassIcon className="w-4 h-4" />
            <span className="hidden md:inline">{t("admin.viewLogs")}</span>
          </button>
        )}

        <button
          onClick={() => setConfirmAction("delete")}
          disabled={isTransitioning || currentAction}
          className={`${buttonClass} bg-destructive/15 hover:bg-destructive/25 border-destructive/30 hover:border-destructive/50 text-destructive hover:text-destructive disabled:hover:bg-destructive/25`}
        >
          {currentAction?.action === "deleting" ? (
            <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
          ) : (
            <TrashIcon className="w-4 h-4" />
          )}
          <span className="hidden md:inline">
            {currentAction?.action === "deleting"
              ? t("admin.deleting")
              : t("admin.delete")}
          </span>
        </button>
      </div>

      {confirmAction && (
        <Suspense fallback={null}>
          <ConfirmActionModal
            action={confirmAction}
            resourceName={resource.name}
            onConfirm={() => {
              if (confirmAction === "start") handleStart();
              else if (confirmAction === "stop") handleStop();
              else if (confirmAction === "delete") handleDelete();
              setConfirmAction(null);
            }}
            onClose={() => setConfirmAction(null)}
          />
        </Suspense>
      )}

      {showLogs && (
        <Suspense fallback={null}>
          <LogsModal
            name={resource.name}
            type={resource.type}
            uuid={resource.uuid}
            onClose={() => setShowLogs(false)}
          />
        </Suspense>
      )}
    </>
  );
};

export default ResourceActionButtons;
