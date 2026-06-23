import express from "express";
import { verifyToken } from "../middleware/auth.js";

/**
 * Config API Routes
 *
 * Provides static configuration data that is set at container startup.
 * These values don't change during runtime, so they can be cached indefinitely on the client.
 */

const router = express.Router();

/**
 * GET /api/config
 * Returns application configuration including user type
 *
 * @returns {Object} config - Application configuration
 * @returns {string} config.userType - User type from DASHBOARD_USER_TYPE env (admin/member/viewer)
 */
router.get("/", verifyToken, async (req, res) => {
  const config = {
    userType: (process.env.DASHBOARD_USER_TYPE || "viewer").toLowerCase(),
  };

  res.json(config);
});

export default router;
