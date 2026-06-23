import { useState, useEffect, useMemo } from "react";
import useResourceStore from "../../../store/resourceStore";
import {
  filterDashboardResources,
  searchResources,
  sortResources,
} from "../../../services/resourceService";
import { groupByServer } from "../../../services/serverGrouping";

const useDashboardState = () => {
  const {
    applications: storeApplications,
    services: storeServices,
    databases: storeDatabases,
    servers,
    deployments,
    loading,
    error,
    fetchResources,
    fetchServers,
    fetchDeployments,
    cleanup,
  } = useResourceStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    Promise.all([fetchResources(), fetchServers(), fetchDeployments()]).finally(
      () => setIsInitialLoad(false)
    );

    return () => cleanup();
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

  // Search filters resources across all servers; sort runs before grouping so
  // order is preserved within each type bucket (groupByServer filters, not sorts).
  const searchedResources = useMemo(
    () => searchResources(allResources, searchTerm),
    [allResources, searchTerm]
  );

  const sortedResources = useMemo(
    () => sortResources(searchedResources, sortBy, sortOrder),
    [searchedResources, sortBy, sortOrder]
  );

  const serverGroups = useMemo(
    () => groupByServer(sortedResources, servers, deployments),
    [sortedResources, servers, deployments]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchResources(), fetchServers(), fetchDeployments()]);
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
    sortBy,
    sortOrder,
    isRefreshing,
    isInitialLoad,
    loading,
    error,

    serverGroups,

    resourceCounts: {
      applications: applications.length,
      services: services.length,
      databases: databases.length,
    },

    setSearchTerm,
    setSortBy,
    setSortOrder,
    handleRefresh,
    handleSort,
    handleClearSort,
  };
};

export default useDashboardState;
