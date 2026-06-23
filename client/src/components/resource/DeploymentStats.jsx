import { useTranslation } from "react-i18next";
import { RocketLaunchIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { getTimeAgo } from "../../utils/dateUtils";

const Field = ({ label, value }) =>
  value === null || value === undefined || value === "" ? null : (
    <span className="text-xs md:text-sm text-muted-foreground">
      <span className="text-muted-foreground/70">{label}:</span>{" "}
      <span className="font-mono text-foreground">{value}</span>
    </span>
  );

const DeploymentStats = ({ resource, isDeploying }) => {
  const { t } = useTranslation();

  const commit = resource.git_commit_sha
    ? resource.git_commit_sha.substring(0, 7)
    : null;
  const onlineSince = getTimeAgo(resource.last_online_at);
  const lastRestart = getTimeAgo(resource.last_restart_at);
  const restartType = resource.last_restart_type;
  const restartCount =
    typeof resource.restart_count === "number" ? resource.restart_count : null;

  return (
    <div className="bg-card/60 rounded-lg p-3 md:p-4 border border-primary/30">
      <div className="flex items-center gap-2 mb-2 md:mb-3">
        <RocketLaunchIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          {t("deployment.title")}
        </span>
        {isDeploying && (
          <span className="inline-flex items-center gap-1 bg-primary/15 text-primary border border-primary/40 rounded-full px-2 py-0.5 text-xs">
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            {t("deployment.deploying")}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 bg-muted/40 px-3 py-2 rounded">
        <Field label={t("deployment.commit")} value={commit} />
        <Field label={t("deployment.onlineSince")} value={onlineSince} />
        <Field
          label={t("deployment.lastRestart")}
          value={
            lastRestart
              ? restartType
                ? `${lastRestart} · ${restartType}`
                : lastRestart
              : null
          }
        />
        <Field label={t("deployment.restarts")} value={restartCount} />
      </div>
    </div>
  );
};

export default DeploymentStats;
