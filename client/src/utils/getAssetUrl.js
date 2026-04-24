const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const getAssetUrl = (file, fallback = '/default_profile.jpg') => {
  if (!file) {
    return fallback;
  }

  if (typeof file === 'string') {
    return file;
  }

  if (file.url) {
    return file.url;
  }

  if (file.destination && file.filename) {
    return `${API_BASE}/${file.destination}/${file.filename}`;
  }

  return fallback;
};

export default getAssetUrl;
