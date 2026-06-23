import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

import LanguageSelector from "../../components/LanguageSelector";
import ThemeToggle from "../../components/ThemeToggle";
import ResourceFilters from "./components/ResourceFilters";
import ServerGroup from "./components/ServerGroup";
import { SOUND_TYPES } from "../../utils/soundUtils";
import { logout } from "../../api/auth";
import toast from "react-hot-toast";
import useDashboardState from "./hooks/useDashboardState";
import { useNavigate } from "react-router-dom";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { playSound } = useSoundEffects();

  const {
    searchTerm,
    sortBy,
    sortOrder,
    isRefreshing,
    isInitialLoad,
    loading,
    error,
    serverGroups,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    handleRefresh,
    handleClearSort,
  } = useDashboardState();

  const handleLogout = () => {
    playSound(SOUND_TYPES.CLICK);
    logout();

    toast.success(t("auth.logoutSuccess"), {
      icon: <HandRaisedIcon className="w-6 h-6" />,
      duration: 2000,
    });

    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  // Loading state
  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">
            {t("dashboard.loadingResources")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2 tracking-tight">
              <span className="text-primary">◈</span>
              <span className="hidden md:inline">{t("dashboard.title")}</span>
              <span className="md:hidden">Dashboard</span>
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="px-3 md:px-4 py-1.5 bg-secondary hover:bg-accent text-secondary-foreground rounded-md border border-border transition-colors font-medium flex items-center gap-1.5 cursor-pointer text-sm touch-manipulation"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                <span className="hidden md:inline">{t("auth.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 flex-1">
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/40 text-destructive px-4 md:px-6 py-3 md:py-4 rounded-lg mb-4 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-sm md:text-base">
              {error === "Failed to load resources"
                ? t("dashboard.failedToLoad")
                : error}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-destructive/15 hover:bg-destructive/25 rounded-md transition-colors text-sm font-medium cursor-pointer touch-manipulation whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRefreshing && (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              )}
              {t("common.refresh")}
            </button>
          </div>
        )}

        {/* Controls Section */}
        <div className="mb-4 md:mb-6">
          {/* Refresh Button */}
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 md:px-4 py-2 md:py-1.5 bg-secondary hover:bg-accent text-secondary-foreground rounded-md border border-border transition-colors font-medium flex items-center gap-1.5 md:gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap touch-manipulation"
            >
              <ArrowPathIcon
                className={`w-4 h-4 transition-transform duration-200 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden md:inline">
                {isRefreshing ? t("common.refreshing") : t("common.refresh")}
              </span>
            </button>
          </div>

          {/* Filters */}
          <ResourceFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onClearSort={handleClearSort}
          />
        </div>

        {/* Grouped by server */}
        {serverGroups.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-muted-foreground text-sm">
              {t("dashboard.noResources")}
            </p>
          </div>
        ) : (
          serverGroups.map((group) => (
            <ServerGroup
              key={group.server.uuid || group.server.name}
              group={group}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Jonas Reidel
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/jonasxwebdev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-md group"
                aria-label="GitHub"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
