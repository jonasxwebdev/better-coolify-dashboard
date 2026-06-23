import cors from "cors";

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
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

const isOriginAllowed = (origin) =>
  allowedOriginMatchers.some((matcher) =>
    matcher.wildcard ? matcher.wildcard.test(origin) : matcher.origin === origin
  );

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error("CROSS ORIGIN hatası"));
  },
  credentials: true,
});
