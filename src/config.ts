/**
 * Application-wide configuration
 */

// Get the base path from environment
const BASE_PATH = '/planning-poker-frontend';

// API configuration
export const API_CONFIG = {
  // Base URL for all API calls (empty because we're using relative URLs with the proxy)
  BASE_URL: '',
  
  // API base path (relative to the current domain)
  API_BASE_PATH: `${BASE_PATH}/api`,
  
  // Endpoints (relative to BASE_URL + API_BASE_PATH)
  ENDPOINTS: {
    ROOMS: '/rooms',
    JOIN: (roomId: string) => `/rooms/${roomId}/join`,
    VOTE: (roomId: string) => `/rooms/${roomId}/vote`,
    REVEAL: (roomId: string) => `/rooms/${roomId}/reveal`,
    RESET: (roomId: string) => `/rooms/${roomId}/reset`,
    ROOM: (roomId: string) => `/rooms/${roomId}`,
    VOTE_OPTIONS: (roomId: string) => `/rooms/${roomId}/vote-options`
  }
};

// Function to get full frontend URL with subpath
export const getFrontendUrl = (path: string): string => {
  return `${BASE_PATH}${path}`;
};