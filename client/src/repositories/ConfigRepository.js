import apiClient from "../services/ApiClient";

/**
 * Repository for application configuration
 * Fetches static configuration from the server that doesn't change during runtime
 */
class ConfigRepository {
  constructor(client = apiClient) {
    this.client = client;
  }

  /**
   * Fetch application configuration
   * @returns {Promise<{userType: string}>} Configuration object
   */
  async getConfig() {
    return await this.client.get("/config", { baseURL: "/api" });
  }
}

export default new ConfigRepository();
