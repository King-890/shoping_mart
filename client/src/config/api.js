// Centralized API Configuration
// This allows switching between localhost and production via environment variables

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Strip trailing slash if present to avoid double slashes in paths
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
export default API_URL;
