import { AppError } from "../utils/errorHandler.js";

export const checkAdminPermission = (req, res, next) => {
  const userType = process.env.DASHBOARD_USER_TYPE;

  if (!userType || userType.toLowerCase() !== "admin") {
    throw new AppError("Admin permission required for this operation", 403);
  }

  next();
};
