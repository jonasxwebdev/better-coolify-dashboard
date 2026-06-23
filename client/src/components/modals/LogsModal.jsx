import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getResourceLogs } from "../../api/coolify";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../utils/soundUtils";

const highlightLog = (log) => {
  const parts = [];
  let lastIndex = 0;

  const patterns = [
    {
      regex: /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g,
      className: "text-cyan-400 font-bold",
    },
    {
      regex: /\b([1-5]\d{2})\b/g,
      className: (match) => {
        const code = parseInt(match);
        if (code >= 500) return "text-red-400 font-bold";
        if (code >= 400) return "text-yellow-400 font-bold";
        if (code >= 300) return "text-blue-400 font-bold";
        return "text-green-400 font-bold";
      },
    },
    {
      regex: /(https?:\/\/[^\s]+)/g,
      className: "text-purple-400 font-semibold underline",
    },
    {
      regex: /\b(ERROR|FATAL|CRITICAL)\b/gi,
      className: "text-red-500 font-bold bg-red-500/10 px-1 rounded",
    },
    {
      regex: /\b(WARN|WARNING)\b/gi,
      className: "text-yellow-500 font-bold bg-yellow-500/10 px-1 rounded",
    },
    {
      regex: /\b(INFO|INFORMATION)\b/gi,
      className: "text-blue-400 font-bold bg-blue-500/10 px-1 rounded",
    },
    {
      regex: /\b(DEBUG|TRACE)\b/gi,
      className: "text-muted-foreground font-bold bg-slate-500/10 px-1 rounded",
    },
    {
      regex: /\b(SUCCESS|OK)\b/gi,
      className: "text-green-400 font-bold bg-green-500/10 px-1 rounded",
    },
    {
      regex:
        /\b(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\b/g,
      className: "text-muted-foreground font-mono",
    },
    {
      regex: /\b(\d{2}:\d{2}:\d{2}(?:\.\d+)?)\b/g,
      className: "text-muted-foreground font-mono",
    },
    {
      regex: /([/\\][\w\-./\\]+\.\w+)/g,
      className: "text-indigo-400 font-mono",
    },
    {
      regex: /\b(\d+(?:\.\d+)?(?:ms|s|MB|GB|KB|%)?)\b/g,
      className: "text-emerald-400 font-mono",
    },
  ];

  const matches = [];

  patterns.forEach((pattern) => {
    let match;
    const regex = new RegExp(pattern.regex);
    while ((match = regex.exec(log)) !== null) {
      const className =
        typeof pattern.className === "function"
          ? pattern.className(match[1])
          : pattern.className;
      matches.push({
        index: match.index,
        length: match[1].length,
        text: match[1],
        className,
      });
    }
  });

  matches.sort((a, b) => a.index - b.index);

  const filteredMatches = [];
  let lastEnd = 0;
  matches.forEach((match) => {
    if (match.index >= lastEnd) {
      filteredMatches.push(match);
      lastEnd = match.index + match.length;
    }
  });

  lastIndex = 0;
  filteredMatches.forEach((match, idx) => {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${idx}`} className="text-foreground">
          {log.substring(lastIndex, match.index)}
        </span>
      );
    }
    parts.push(
      <span key={`match-${idx}`} className={match.className}>
        {match.text}
      </span>
    );
    lastIndex = match.index + match.length;
  });

  if (lastIndex < log.length) {
    parts.push(
      <span key="text-end" className="text-foreground">
        {log.substring(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? (
    parts
  ) : (
    <span className="text-foreground">{log}</span>
  );
};

const LogsModal = ({ name, type, uuid, onClose }) => {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const logsEndRef = useRef(null);

  const handleClose = () => {
    playSound(SOUND_TYPES.CLICK);
    // Remove focus from any button when closing
    if (document.activeElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await getResourceLogs(type, uuid);
      const logsText = response.logs || "";
      const logsArray = logsText
        .split("\n")
        .filter((line) => line.trim() !== "");
      setLogs(logsArray);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, uuid]);

  const handleRetry = () => {
    fetchLogs();
  };

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

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

  const filteredLogs = logs.filter((log) =>
    log.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-popover rounded-xl border border-border max-w-6xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.logsTitle", { name })}
            </h3>
            {isLoading && (
              <span className="flex items-center gap-1.5 text-xs text-info">
                <span className="w-2 h-2 bg-info rounded-full animate-pulse"></span>
                {t("common.loading")}
              </span>
            )}
            {hasError && (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <span className="w-2 h-2 bg-destructive rounded-full"></span>
                {t("admin.logsError")}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition cursor-pointer font-bold text-xl"
          >
            &times;
          </button>
        </div>

        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t("admin.filterLogs")}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring transition"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-muted-foreground">
              {t("admin.autoScroll")}
            </span>
          </label>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-background font-mono text-sm">
          {hasError ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-destructive">{t("admin.logsUnavailable")}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-secondary hover:bg-accent border border-border rounded-md text-secondary-foreground transition-colors text-sm cursor-pointer"
              >
                {t("admin.retryConnection")}
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              {filter ? t("admin.noLogsMatch") : t("admin.waitingForLogs")}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex hover:bg-accent/50 transition-colors group"
                >
                  <span className="text-muted-foreground group-hover:text-muted-foreground select-none min-w-[4rem] text-right pr-3 transition-colors">
                    {index + 1}
                  </span>
                  <span className="flex-1 break-all leading-relaxed">
                    {highlightLog(log)}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
          {filter
            ? t("admin.logsFiltered", { count: filteredLogs.length })
            : t("admin.logsTotal", { count: filteredLogs.length })}
        </div>
      </div>
    </div>
  );
};

export default LogsModal;
