import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getCoolifyClient } from "../services/CoolifyApiClient.js";
import {
  createResourceRouter,
  RESOURCE_CONFIGS,
} from "../factories/ResourceRouterFactory.js";
import {
  fetchCurrentMetricsForServers,
  fetchCurrentServerMetrics,
  sanitizeServer,
} from "../services/SentinelMetricsService.js";

const router = express.Router();
const coolify = getCoolifyClient();

// Generic CRUD routers per resource type (factory pattern)
router.use(
  "/",
  createResourceRouter("applications", RESOURCE_CONFIGS.applications),
);
router.use("/", createResourceRouter("services", RESOURCE_CONFIGS.services));
router.use("/", createResourceRouter("databases", RESOURCE_CONFIGS.databases));

// Read-only: list servers (for grouping + canonical names)
router.get("/servers", verifyToken, async (req, res, next) => {
  try {
    const data = await coolify.get("/servers");
    res.json(Array.isArray(data) ? data.map(sanitizeServer) : []);
  } catch (error) {
    next(error);
  }
});

// Read-only: current Sentinel metrics keyed by Coolify server UUID.
router.get("/servers/metrics/current", verifyToken, async (req, res, next) => {
  try {
    const servers = await coolify.get("/servers");
    const metrics = await fetchCurrentMetricsForServers(
      Array.isArray(servers) ? servers : [],
    );
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/servers/:uuid/metrics/current",
  verifyToken,
  async (req, res, next) => {
    try {
      const server = await coolify.get(`/servers/${req.params.uuid}`);
      const metrics = await fetchCurrentServerMetrics(server);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  },
);

// Read-only: list currently-running deployments (for live "deploying" badge)
router.get("/deployments", verifyToken, async (req, res, next) => {
  try {
    const data = await coolify.get("/deployments");
    res.json(Array.isArray(data) ? data : []);
  } catch (error) {
    next(error);
  }
});

export default router;
