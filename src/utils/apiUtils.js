/**
 * Gets the base URL for API requests.
 * otherwise defaults to an empty string (for relative paths used by the dev proxy).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function getApiUrl(path) {
  // Ensure the path starts with a slash if API_BASE_URL is empty
  const formattedPath = API_BASE_URL === '' && !path.startsWith('/') ? `/${path}` : path;
  return `${API_BASE_URL}${formattedPath}`;
}