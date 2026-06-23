import { create } from "zustand";
import toast from "react-hot-toast";
import resourceRepository from "../repositories/ResourceRepository";
import { RESOURCE_TYPES } from "../constants/resourceTypes";


const useResourceStore = create((set, get) => ({
  applications: [],
  services: [],
  databases: [],
  loading: false,
  error: null,
  pollingIntervals: {},
  actionLoading: {},

  fetchResources: async (silent = false) => {
    if (!silent) {
      set({ loading: true, error: null });
    }

    try {
      // Use repository instead of direct API call
      const allResources = await resourceRepository.fetchAll();

      const applications = allResources.filter(
        (r) => r.type === RESOURCE_TYPES.APPLICATION
      );
      const services = allResources.filter(
        (r) => r.type === RESOURCE_TYPES.SERVICE
      );
      const databases = allResources.filter(
        (r) => r.type === RESOURCE_TYPES.DATABASE
      );

      set({
        applications,
        services,
        databases,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateResourceStatus: (type, uuid, newStatus) => {
    const stateKey = `${type}s`;
    const resources = get()[stateKey];
    const updated = resources.map((r) =>
      r.uuid === uuid ? { ...r, status: newStatus } : r
    );
    set({ [stateKey]: updated });
  },

  startPolling: (type, uuid, targetStatus, maxAttempts = 60, t, toastId) => {
    const pollKey = `${type}-${uuid}`;

    if (get().pollingIntervals[pollKey]) {
      clearTimeout(get().pollingIntervals[pollKey]);
    }

    let attempts = 0;
    const startTime = Date.now();

    const getSmartInterval = (attemptNumber) => {
      if (attemptNumber <= 6) {
        return 5000;
      } else if (attemptNumber <= 12) {
        return 10000;
      } else if (attemptNumber <= 18) {
        return 15000;
      } else if (attemptNumber <= 24) {
        return 20000;
      } else {
        return 30000;
      }
    };

    const poll = async () => {
      attempts++;
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

      const actionLoading = { ...get().actionLoading };
      if (actionLoading[pollKey]) {
        const currentAction = actionLoading[pollKey].action;
        actionLoading[pollKey] = {
          action: currentAction,
          elapsedSeconds,
        };
        set({ actionLoading });
      }

      if (attempts >= maxAttempts) {
        const intervals = { ...get().pollingIntervals };
        delete intervals[pollKey];
        const updatedActionLoading = { ...get().actionLoading };
        delete updatedActionLoading[pollKey];
        set({
          pollingIntervals: intervals,
          actionLoading: updatedActionLoading,
        });

        if (t && toastId) {
          toast.error(t("admin.operationTimeout"), { id: toastId });
        }
        return;
      }

      try {
        await get().fetchResources(true);
        const stateKey = `${type}s`;
        const resource = get()[stateKey].find((r) => r.uuid === uuid);

        if (resource) {
          const statusLower = resource.status?.toLowerCase() || "";
          const mainStatus = statusLower.split(":")[0];

          if (
            mainStatus === targetStatus ||
            (targetStatus === "stopped" &&
              ["exited", "stopped", "dead"].includes(mainStatus))
          ) {
            const intervals = { ...get().pollingIntervals };
            delete intervals[pollKey];
            const updatedActionLoading = { ...get().actionLoading };
            const completedAction = updatedActionLoading[pollKey]?.action;
            delete updatedActionLoading[pollKey];
            set({
              pollingIntervals: intervals,
              actionLoading: updatedActionLoading,
            });

            if (t && toastId) {
              const successMap = {
                starting: "resourceStarted",
                stopping: "resourceStopped",
                deleting: "resourceDeleted",
              };
              const successKey =
                successMap[completedAction] || "resourceStarted";
              toast.success(
                t(`admin.${successKey}`, { type: t(`resourceTypes.${type}`) }),
                { id: toastId }
              );
            }
            return;
          }
        }

        const timeoutId = setTimeout(poll, getSmartInterval(attempts));
        set({
          pollingIntervals: { ...get().pollingIntervals, [pollKey]: timeoutId },
        });
      } catch {
        const timeoutId = setTimeout(poll, 15000);
        set({
          pollingIntervals: { ...get().pollingIntervals, [pollKey]: timeoutId },
        });
      }
    };

    poll();
  },

  startResourceAction: async (type, uuid, t) => {
    const actionKey = `${type}-${uuid}`;
    set({
      actionLoading: {
        ...get().actionLoading,
        [actionKey]: { action: "starting", elapsedSeconds: 0 },
      },
    });
    get().updateResourceStatus(type, uuid, "starting");

    toast.loading(
      t("admin.startInitiated", { type: t(`resourceTypes.${type}`) }),
      { id: actionKey }
    );

    try {
      // Use repository instead of direct API call
      await resourceRepository.start(type, uuid);
      get().startPolling(type, uuid, "running", 60, t, actionKey);
    } catch (error) {
      toast.error(
        error.message ||
          t("admin.resourceStartFailed", { type: t(`resourceTypes.${type}`) }),
        { id: actionKey }
      );
      const actionLoading = { ...get().actionLoading };
      delete actionLoading[actionKey];
      set({ actionLoading });
      await get().fetchResources(true);
    }
  },

  stopResourceAction: async (type, uuid, t) => {
    const actionKey = `${type}-${uuid}`;
    set({
      actionLoading: {
        ...get().actionLoading,
        [actionKey]: { action: "stopping", elapsedSeconds: 0 },
      },
    });
    get().updateResourceStatus(type, uuid, "stopping");

    toast.loading(
      t("admin.stopInitiated", { type: t(`resourceTypes.${type}`) }),
      { id: actionKey }
    );

    try {
      // Use repository instead of direct API call
      await resourceRepository.stop(type, uuid);
      get().startPolling(type, uuid, "stopped", 60, t, actionKey);
    } catch (error) {
      toast.error(
        error.message ||
          t("admin.resourceStopFailed", { type: t(`resourceTypes.${type}`) }),
        { id: actionKey }
      );
      const actionLoading = { ...get().actionLoading };
      delete actionLoading[actionKey];
      set({ actionLoading });
      await get().fetchResources(true);
    }
  },

  deleteResourceAction: async (type, uuid, t) => {
    const actionKey = `${type}-${uuid}`;
    set({
      actionLoading: {
        ...get().actionLoading,
        [actionKey]: { action: "deleting", elapsedSeconds: 0 },
      },
    });

    toast.loading(
      t("admin.deleteInitiated", { type: t(`resourceTypes.${type}`) }),
      { id: actionKey }
    );

    try {
      // Use repository instead of direct API call
      await resourceRepository.delete(type, uuid);
      toast.success(
        t("admin.resourceDeleted", { type: t(`resourceTypes.${type}`) }),
        { id: actionKey }
      );

      const stateKey = `${type}s`;
      const resources = get()[stateKey];
      const updated = resources.filter((r) => r.uuid !== uuid);
      const actionLoading = { ...get().actionLoading };
      delete actionLoading[actionKey];
      set({ [stateKey]: updated, actionLoading });
    } catch (error) {
      toast.error(
        error.message ||
          t("admin.resourceDeleteFailed", { type: t(`resourceTypes.${type}`) }),
        { id: actionKey }
      );
      const actionLoading = { ...get().actionLoading };
      delete actionLoading[actionKey];
      set({ actionLoading });
    }
  },

  cleanup: () => {
    const intervals = get().pollingIntervals;
    Object.values(intervals).forEach(clearTimeout);
    set({ pollingIntervals: {}, actionLoading: {} });
  },
}));

export default useResourceStore;
