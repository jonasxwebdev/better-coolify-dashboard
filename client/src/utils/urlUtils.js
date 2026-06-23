export const normalizeUrl = (url) => {
  if (!url) return null;
  let normalized = url.trim();
  if (
    normalized.startsWith("https://https://") ||
    normalized.startsWith("http://https://")
  ) {
    normalized = normalized.replace(/^https?:\/\//, "");
  }
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }
  return normalized;
};

export const extractFqdns = (fqdnString) => {
  if (!fqdnString) return [];

  const urls = fqdnString
    .split(/[,\s]+/)
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  return urls;
};
