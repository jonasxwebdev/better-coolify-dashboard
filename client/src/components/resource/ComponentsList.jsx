import { useTranslation } from "react-i18next";
import { ServerIcon } from "@heroicons/react/24/outline";

const ComponentsList = ({ applications, databases }) => {
  const { t } = useTranslation();
  if (
    (!applications || applications.length === 0) &&
    (!databases || databases.length === 0)
  ) {
    return null;
  }

  return (
    <div className="bg-muted/40 rounded-lg p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <ServerIcon className="w-5 h-5 text-success" />
        <span className="text-sm font-semibold text-foreground">
          {t("resourceCard.components")}
        </span>
      </div>
      <div className="space-y-3">
        {applications &&
          applications.map((app, idx) => (
            <div
              key={idx}
              className="bg-secondary rounded-lg p-3 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm font-medium text-foreground">
                    {app.name}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    app.status?.includes("running")
                      ? "bg-success/15 text-success border border-success/30"
                      : app.status?.includes("exited")
                        ? "bg-warning/15 text-warning border border-warning/30"
                        : "bg-destructive/15 text-destructive border border-destructive/30"
                  }`}
                >
                  {app.status || "unknown"}
                </span>
              </div>
              {app.image && (
                <p className="text-xs text-muted-foreground font-mono">{app.image}</p>
              )}
            </div>
          ))}
        {databases &&
          databases.map((db, idx) => (
            <div
              key={idx}
              className="bg-secondary rounded-lg p-3 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗄️</span>
                  <span className="text-sm font-medium text-foreground">
                    {db.name}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    db.status?.includes("running")
                      ? "bg-success/15 text-success border border-success/30"
                      : db.status?.includes("exited")
                        ? "bg-warning/15 text-warning border border-warning/30"
                        : "bg-destructive/15 text-destructive border border-destructive/30"
                  }`}
                >
                  {db.status || "unknown"}
                </span>
              </div>
              {db.image && (
                <p className="text-xs text-muted-foreground font-mono">{db.image}</p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ComponentsList;
