/**
 * Global configuration.
 * VITE_API_URL should point to the Express server.
 * Falls back to localhost for local development.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
