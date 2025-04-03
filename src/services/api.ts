import { API_CONFIG } from '../config';

// Helper function to construct API URLs
const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_BASE_PATH}${endpoint}`;
};

export const roomApi = {
  fetchRoom: async (roomId: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.ROOM(roomId));
    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {
      // If status is 404, the room doesn't exist
      if (response.status === 404) {
        throw new Error("Room not found");
      }
      throw new Error(`Failed to fetch room: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Additional check - if the API returns success but empty data
    if (!data || (data.hasOwnProperty('error') && data.error)) {
      throw new Error(data.error || "Room not found");
    }
    
    return data;
  },

  joinRoom: async (roomId: string, username: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.JOIN(roomId));
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to join room: ${response.status}`);
    }
    return response.json();
  },

  castVote: async (roomId: string, username: string, vote: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.VOTE(roomId));
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, vote }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to cast vote: ${response.status}`);
    }
    return response.json();
  },
  
  deleteRoom: async (roomId: string, adminPassword?: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.ROOM(roomId));
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete room: ${response.status}`);
    }
    
    return response.json();
  },
  
  revealVotes: async (roomId: string, adminPassword?: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.REVEAL(roomId));
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to reveal votes: ${response.status}`);
    }
    return response.json();
  },
  
  resetVotes: async (roomId: string, adminPassword?: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.RESET(roomId));
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to reset votes: ${response.status}`);
    }
    return response.json();
  },
  
  createRoom: async (roomId?: string, voteOptions?: string[], adminPassword?: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.ROOMS);
    const body: any = {};
    
    if (roomId) {
      body.roomId = roomId;
    }
    
    if (voteOptions && voteOptions.length > 0) {
      body.voteOptions = voteOptions;
    }

    if (adminPassword) {
        body.adminPassword = adminPassword;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create room: ${response.status}`);
    }
    return response.json();
  },

  getVoteOptions: async (roomId: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.VOTE_OPTIONS(roomId));
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch vote options: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  },

  verifyAdmin: async (roomId: string, adminPassword?: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.VERIFY_ADMIN(roomId));
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword }),
    });

    if (!response.ok) {
        // Don't throw an error for 401 Unauthorized, just return false
        if (response.status === 401) {
            return { verified: false };
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Admin verification failed: ${response.status}`);
    }

    return response.json(); // Should return { verified: true } on success
  }
};