import cors from "cors";

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean)
  : ["http://localhost:5173"];

const escapeRegex = (value) => value.replace(/[.+?^${}()|[\]\\]/g, "\\$&");

const wildcardToRegex = (origin) => {
  if (!origin.includes("*")) return null;

  const pattern = origin.split("*").map(escapeRegex).join("[^.]+");
  return new RegExp(`^${pattern}$`);
};

const allowedOriginMatchers = allowedOrigins.map((origin) => ({
  origin,
  wildcard: wildcardToRegex(origin),
}));

const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");

const isConfiguredOriginAllowed = (origin) =>
  allowedOriginMatchers.some((matcher) =>
    matcher.wildcard ? matcher.wildcard.test(origin) : matcher.origin === origin
  );

const isSameHostOrigin = (origin, req) => {
  try {
    const requestHost = req.get("host");
    const originUrl = new URL(origin);
    return Boolean(requestHost && originUrl.host === requestHost);
  } catch {
    return false;
  }
};

export const corsMiddleware = (req, res, next) =>
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);
      if (
        isSameHostOrigin(normalizedOrigin, req) ||
        isConfiguredOriginAllowed(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("CROSS ORIGIN hatası"));
    },
    credentials: true,
  })(req, res, next);
