import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon,
  GlobeAltIcon,
  CpuChipIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { copyToClipboard } from "../../utils/clipboardUtils";
import { getDatabasePassword } from "../../utils/resourceUtils";

const DatabaseInfo = ({ resource }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showInternalUrl, setShowInternalUrl] = useState(false);
  const [showExternalUrl, setShowExternalUrl] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (text, fieldName) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const password = getDatabasePassword(resource);

  useEffect(() => {
    if (showPassword) {
      const timer = setTimeout(() => {
        setShowPassword(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showPassword]);

  useEffect(() => {
    if (showInternalUrl) {
      const timer = setTimeout(() => {
        setShowInternalUrl(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showInternalUrl]);

  useEffect(() => {
    if (showExternalUrl) {
      const timer = setTimeout(() => {
        setShowExternalUrl(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showExternalUrl]);

  return (
    <div className="space-y-4">
      {resource.internal_db_url && (
        <div className="bg-muted/40 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center gap-2 cursor-help"
              data-tooltip-id="internal-url-tooltip"
              data-tooltip-content={t("tooltips.internalConnection")}
            >
              <LockClosedIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {t("resourceCard.internalConnectionAddress")}
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5 bg-secondary text-foreground rounded border border-border cursor-help"
              data-tooltip-id="internal-url-tooltip"
              data-tooltip-content={t("tooltips.internalConnection")}
            >
              {t("resourceCard.internal")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 bg-secondary px-3 py-2 rounded">
            <span className="flex-1 text-sm text-muted-foreground font-mono break-all">
              {showInternalUrl
                ? resource.internal_db_url
                : "•••••••••••••••••••"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInternalUrl(!showInternalUrl);
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition cursor-pointer"
              >
                {showInternalUrl ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(resource.internal_db_url, "internal_url");
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition cursor-pointer"
              >
                {copiedField === "internal_url" ? (
                  <CheckIcon className="w-4 h-4 text-success" />
                ) : (
                  <ClipboardDocumentIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {resource.external_db_url && (
        <div className="bg-muted/40 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center gap-2 cursor-help"
              data-tooltip-id="external-url-tooltip"
              data-tooltip-content={t("tooltips.externalConnection")}
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {t("resourceCard.externalConnectionAddress")}
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5 bg-secondary text-foreground rounded border border-border cursor-help"
              data-tooltip-id="external-url-tooltip"
              data-tooltip-content={t("tooltips.externalConnection")}
            >
              {t("resourceCard.external")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 bg-secondary px-3 py-2 rounded">
            <span className="flex-1 text-sm text-muted-foreground font-mono break-all">
              {showExternalUrl
                ? resource.external_db_url
                : "•••••••••••••••••••"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExternalUrl(!showExternalUrl);
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition cursor-pointer"
              >
                {showExternalUrl ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(resource.external_db_url, "external_url");
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition cursor-pointer"
              >
                {copiedField === "external_url" ? (
                  <CheckIcon className="w-4 h-4 text-success" />
                ) : (
                  <ClipboardDocumentIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`grid grid-cols-1 ${password ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}
      >
        {password && (
          <div className="bg-muted/40 rounded-lg p-4 border border-warning/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-warning" />
                <span className="text-sm font-semibold text-foreground">
                  {t("resourceCard.databasePassword")}
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-warning/15 text-warning rounded border border-warning/30">
                {t("resourceCard.critical")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 bg-secondary px-3 py-2 rounded">
              <span className="flex-1 text-sm text-muted-foreground font-mono break-all">
                {showPassword ? password : "••••••••••••••••"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition cursor-pointer"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(password, "password");
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition cursor-pointer"
                >
                  {copiedField === "password" ? (
                    <CheckIcon className="w-4 h-4 text-success" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className={`bg-muted/40 rounded-lg p-4 border ${
            resource.backup_configs && resource.backup_configs.length > 0
              ? "border-success/30"
              : "border-warning/30"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArchiveBoxIcon
                className={`w-5 h-5 ${
                  resource.backup_configs && resource.backup_configs.length > 0
                    ? "text-success"
                    : "text-warning"
                }`}
              />
              <span className="text-sm font-semibold text-foreground">
                {t("resourceCard.backup")}
              </span>
            </div>
            {(!resource.backup_configs ||
              resource.backup_configs.length === 0) && (
              <span
                className="text-xs px-2 py-0.5 bg-warning/15 text-warning rounded border border-warning/30 cursor-help"
                data-tooltip-id="backup-tooltip"
                data-tooltip-content={t("tooltips.backupWarning")}
              >
                {t("resourceCard.warning")}
              </span>
            )}
          </div>
          {resource.backup_configs && resource.backup_configs.length > 0 ? (
            <div className="inline-flex items-center gap-2 bg-secondary px-3 py-2 rounded">
              <CheckCircleIcon className="w-5 h-5 text-success" />
              <span className="text-sm text-success">
                {resource.backup_configs.length} aktif
              </span>
            </div>
          ) : (
            <div
              className="inline-flex items-center gap-2 bg-secondary px-3 py-2 rounded cursor-help"
              data-tooltip-id="backup-tooltip"
              data-tooltip-content={t("tooltips.backupWarning")}
            >
              <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
              <span className="text-sm font-mono text-muted-foreground">
                {t("resourceCard.notConfigured")}
              </span>
            </div>
          )}
        </div>

        <div className="bg-muted/40 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <GlobeAltIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {t("resourceCard.publicAccess")}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 bg-secondary px-3 py-2 rounded">
            {resource.is_public ? (
              <>
                <CheckCircleIcon className="w-5 h-5 text-success" />
                <span className="text-sm text-success font-mono">
                  {t("resourceCard.open")}
                </span>
              </>
            ) : (
              <>
                <XCircleIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-mono">
                  {t("resourceCard.closed")}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="bg-muted/40 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheckIcon className="w-5 h-5 text-success" />
            <span className="text-sm font-semibold text-foreground">
              {t("resourceCard.sslStatus")}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 bg-secondary px-3 py-2 rounded">
            {resource.is_public_port_ssl_enabled ? (
              <>
                <CheckCircleIcon className="w-5 h-5 text-success" />
                <span className="text-sm text-success font-mono">
                  {t("resourceCard.active")}
                </span>
              </>
            ) : (
              <>
                <XCircleIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-mono">
                  {t("resourceCard.passive")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {(resource.limits_cpu ||
        resource.limits_memory ||
        resource.limits_cpus ||
        resource.limits_memory_swap ||
        resource.limits_memory_reservation ||
        resource.limits_cpuset) && (
        <div className="bg-muted/40 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <CpuChipIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {t("resourceCard.resourceLimits")}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {resource.limits_cpus && (
              <div className="bg-secondary px-3 py-2 rounded">
                <p className="text-xs text-muted-foreground mb-1">CPU Cores</p>
                <p className="text-sm text-foreground font-mono">
                  {resource.limits_cpus === "0"
                    ? t("status.unlimited")
                    : resource.limits_cpus}
                </p>
              </div>
            )}
            {resource.limits_cpu && (
              <div className="bg-secondary px-3 py-2 rounded">
                <p className="text-xs text-muted-foreground mb-1">CPU Limit</p>
                <p className="text-sm text-foreground font-mono">
                  {resource.limits_cpu === "0"
                    ? t("status.unlimited")
                    : resource.limits_cpu}
                </p>
              </div>
            )}
            {resource.limits_cpuset && (
              <div className="bg-secondary px-3 py-2 rounded">
                <p className="text-xs text-muted-foreground mb-1">CPU Set</p>
                <p className="text-sm text-foreground font-mono">
                  {resource.limits_cpuset}
                </p>
              </div>
            )}
            {resource.limits_memory && (
              <div className="bg-secondary px-3 py-2 rounded">
                <p className="text-xs text-muted-foreground mb-1">
                  {t("resourceCard.memoryLimit")}
                </p>
                <p className="text-sm text-foreground font-mono">
                  {resource.limits_memory === "0"
                    ? t("status.unlimited")
                    : resource.limits_memory}
                </p>
              </div>
            )}
            {resource.limits_memory_swap && (
              <div className="bg-secondary px-3 py-2 rounded">
                <p className="text-xs text-muted-foreground mb-1">
                  {t("resourceCard.swapLimit")}
                </p>
                <p className="text-sm text-foreground font-mono">
                  {resource.limits_memory_swap === "0" ||
                  resource.limits_memory_swap === "-1"
                    ? t("status.unlimited")
                    : resource.limits_memory_swap}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseInfo;
