import { useTranslation } from "react-i18next";
import {
  CubeIcon,
  ServerIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import { useSoundEffects } from "../../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../../utils/soundUtils";

const ResourceTabs = ({
  activeView,
  onViewChange,
  applicationsCount,
  servicesCount,
  databasesCount,
}) => {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();

  const handleTabClick = (view) => {
    playSound(SOUND_TYPES.CLICK);
    onViewChange(view);
  };

  const tabs = [
    {
      id: "applications",
      icon: CubeIcon,
      label: t("dashboard.applications"),
      shortLabel: "Apps",
      count: applicationsCount,
    },
    {
      id: "services",
      icon: ServerIcon,
      label: t("dashboard.services"),
      shortLabel: "Svc",
      count: servicesCount,
    },
    {
      id: "databases",
      icon: CircleStackIcon,
      label: t("dashboard.databases"),
      shortLabel: "DB",
      count: databasesCount,
    },
  ];

  return (
    <div className="flex gap-1.5 md:gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
      {tabs.map(({ id, icon: Icon, label, shortLabel, count }) => (
        <button
          key={id}
          onClick={() => handleTabClick(id)}
          className={`px-3 md:px-6 py-1.5 rounded-lg border font-medium transition cursor-pointer flex items-center gap-1 text-sm whitespace-nowrap touch-manipulation ${
            activeView === id
              ? "bg-purple-500/50 border-purple-500/50 text-purple-200"
              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 active:bg-white/20"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden md:inline">{label}</span>
          <span className="md:hidden">{shortLabel}</span>
          <span className="text-xs md:text-sm">({count})</span>
        </button>
      ))}
    </div>
  );
};

export default ResourceTabs;
