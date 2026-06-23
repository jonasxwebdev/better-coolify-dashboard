import { useTranslation } from "react-i18next";
import ResourceCard from "../../../components/ResourceCard";
import { useSoundEffects } from "../../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../../utils/soundUtils";
import { CubeIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ResourceList = ({
  resources,
  sortBy,
  sortOrder,
  onSort,
  activeView,
  totalResourcesByType,
  searchTerm,
  onClearSearch,
}) => {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();

  const handleClearSearch = () => {
    playSound(SOUND_TYPES.CLICK);
    onClearSearch();
  };

  // Empty state
  if (resources.length === 0) {
    const totalCount = totalResourcesByType[activeView] || 0;
    const viewLabel =
      activeView === "applications"
        ? t("dashboard.applications")
        : activeView === "services"
          ? t("dashboard.services")
          : t("dashboard.databases");

    return (
      <div className="text-center py-12 md:py-16">
        <CubeIcon className="w-24 h-24 mx-auto mb-4 text-purple-500/61" />
        <p className="text-slate-200 text-lg">
          {totalCount === 0
            ? `${viewLabel} ${t("dashboard.noResources")}`
            : t("dashboard.noResources")}
        </p>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="cursor-pointer mt-5 inline-flex items-center justify-center gap-1.5 px-4 py-2
           bg-gradient-to-r from-purple-500/50 to-purple-600/50
           text-white text-sm font-semibold
           rounded-lg shadow-md transform transition-all duration-500
            hover:from-purple-600/50 hover:to-purple-700/50 hover:shadow-xl
              active:from-purple-700/50 active:to-purple-800/50
           active:from-purple-600/50 active:to-purple-700/50
           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>{t("common.search")}</span>
          </button>
        )}
      </div>
    );
  }

  const columns = [
    { key: "detail", label: t("common.detail"), sortable: false, span: 1 },
    { key: "status", label: t("common.status"), sortable: true, span: 1 },
    { key: "name", label: t("common.name"), sortable: true, span: 2 },
    {
      key: "created_at",
      label: t("common.created"),
      sortable: true,
      span: 2,
      hideOnMobile: true,
    },
    {
      key: "updated_at",
      label: t("common.updated"),
      sortable: true,
      span: 2,
      hideOnMobile: true,
    },
    {
      key: "type",
      label: t("common.type"),
      sortable: false,
      span: 3,
      hideOnMobile: true,
    },
  ];

  return (
    <div className="bg-white/2 border border-white/10 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="hidden lg:block bg-white/7 border-b text-center border-white/10 px-6 py-3">
        <div className="grid grid-cols-11 gap-4 text-xs font-medium text-slate-300 uppercase tracking-wider">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`col-span-${column.span} ${
                column.hideOnMobile ? "hidden md:block" : ""
              } ${column.sortable ? "cursor-pointer hover:text-slate-200 transition" : "text-center"}`}
              onClick={column.sortable ? () => onSort(column.key) : undefined}
            >
              {column.label}{" "}
              {column.sortable &&
                sortBy === column.key &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </div>
          ))}
        </div>
      </div>

      {/* Resource Cards */}
      {resources.map((resource, index) => (
        <ResourceCard
          key={resource.uuid || resource.id || index}
          resource={resource}
        />
      ))}
    </div>
  );
};

export default ResourceList;
