import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ServerIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import TypeSection from "./TypeSection";
import { getStatusColor } from "../../../utils/statusUtils";

const ServerGroup = ({ group }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const { server, resourcesByType, stats } = group;
  const dotColor = getStatusColor(stats.worst);

  return (
    <div className="mb-6 border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer text-left"
      >
        <span className={`w-3 h-3 rounded-full ${dotColor}`} />
        <ServerIcon className="w-5 h-5 text-muted-foreground" />
        <span className="font-bold text-foreground">{server.name}</span>
        <span className="text-xs text-muted-foreground">
          · {stats.total} {t("serverView.resources")}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-md bg-card border border-border text-success">
            ● {stats.running} {t("serverView.running")}
          </span>
          {stats.stopped > 0 && (
            <span className="text-xs px-2 py-1 rounded-md bg-card border border-border text-warning">
              ● {stats.stopped} {t("serverView.stopped")}
            </span>
          )}
          <span className="text-xs px-2 py-1 rounded-md bg-card border border-primary/40 text-primary inline-flex items-center gap-1">
            {stats.deploying > 0 && (
              <ArrowPathIcon className="w-3 h-3 animate-spin" />
            )}
            ⟳ {stats.deploying} {t("serverView.deploying")}
          </span>
          {open ? (
            <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="p-3 md:p-4">
          <TypeSection
            label={t("dashboard.applications")}
            resources={resourcesByType.applications}
          />
          <TypeSection
            label={t("dashboard.services")}
            resources={resourcesByType.services}
          />
          <TypeSection
            label={t("dashboard.databases")}
            resources={resourcesByType.databases}
          />
        </div>
      )}
    </div>
  );
};

export default ServerGroup;
