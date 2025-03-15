/**
 * Application-wide configuration
 */

// API configuration
export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: 'http://localhost:3222',
  
  // Endpoints (relative to BASE_URL)
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

// Function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};