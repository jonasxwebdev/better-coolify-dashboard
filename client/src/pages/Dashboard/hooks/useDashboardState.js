import { useState, useEffect, useMemo } from "react";
import useResourceStore from "../../../store/resourceStore";
import {
  filterDashboardResources,
  filterAndSortResources,
} from "../../../services/resourceService";

const useDashboardState = () => {
  const {
    applications: storeApplications,
    services: storeServices,
    databases: storeDatabases,
    servers,
    serverMetrics,
    serverMetricsError,
    deployments,
    loading,
    error,
    fetchResources,
    fetchServers,
    fetchServerMetrics,
    fetchDeployments,
    cleanup,
  } = useResourceStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("applications");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchResources(),
      fetchServers(),
      fetchServerMetrics(),
      fetchDeployments(),
    ]).finally(() => setIsInitialLoad(false));

    const metricsInterval = setInterval(fetchServerMetrics, 15000);

    return () => {
      clearInterval(metricsInterval);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applications = useMemo(
    () => filterDashboardResources(storeApplications),
    [storeApplications]
  );

  const services = useMemo(
    () => filterDashboardResources(storeServices),
    [storeServices]
  );

  const databases = useMemo(
    () => filterDashboardResources(storeDatabases),
    [storeDatabases]
  );

  const allResources = useMemo(
    () => [...applications, ...services, ...databases],
    [applications, services, databases]
  );

  const filteredResources = useMemo(
    () =>
      filterAndSortResources(
        allResources,
        activeView,
        searchTerm,
        sortBy,
        sortOrder
      ),
    [allResources, activeView, searchTerm, sortBy, sortOrder]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchResources(),
        fetchServers(),
        fetchServerMetrics(),
        fetchDeployments(),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleClearSort = () => {
    setSortBy("name");
    setSortOrder("asc");
  };

  return {
    searchTerm,
    activeView,
    sortBy,
    sortOrder,
    isRefreshing,
    isInitialLoad,
    loading,
    error,
    serverMetricsError,

    applications,
    services,
    databases,
    servers,
    serverMetrics,
    deployments,
    filteredResources,

    resourceCounts: {
      applications: applications.length,
      services: services.length,
      databases: databases.length,
    },

    setSearchTerm,
    setActiveView,
    setSortBy,
    setSortOrder,
    handleRefresh,
    handleSort,
    handleClearSort,
  };
};

export default useDashboardState;
