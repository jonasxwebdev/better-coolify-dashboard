import { useQuery } from "@tanstack/react-query";
import configRepository from "../repositories/ConfigRepository";

/**
 * Hook to fetch and cache application configuration
 *
 * Configuration values are set at container startup and never change during runtime,
 * so they are cached indefinitely (staleTime: Infinity)
 *
 * @returns {Object} Query result
 * @returns {Object} data - Config data: { userType: 'admin' | 'member' | 'viewer' }
 * @returns {boolean} isLoading - Loading state
 * @returns {Error} error - Error if request failed
 */
export const useConfig = () => {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => configRepository.getConfig(),
    staleTime: Infinity, // Config never goes stale (set at container startup)
    gcTime: Infinity, // Keep in cache forever
    retry: 3, // Retry failed requests (important for app initialization)
  });
};
