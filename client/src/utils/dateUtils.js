import i18n from "../i18n";

export const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const language = i18n.language === "tr" ? "tr-TR" : "en-US";
  return date.toLocaleDateString(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTimeAgo = (dateString) => {
  if (!dateString) return null;
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      if (i18n.language === "tr") {
        const turkishNames = {
          year: "yıl",
          month: "ay",
          day: "gün",
          hour: "saat",
          minute: "dakika",
        };
        return `${interval} ${turkishNames[name]} önce`;
      } else {
        const suffix = interval === 1 ? "" : "s";
        return `${interval} ${name}${suffix} ago`;
      }
    }
  }
  return i18n.language === "tr" ? "az önce" : "just now";
};
