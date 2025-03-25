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
    return response.json();
  },

  castVote: async (roomId: string, username: string, vote: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.VOTE(roomId));
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, vote }),
    });
    return response.json();
  },
  
  deleteRoom: async (roomId: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.ROOM(roomId));
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete room: ${response.status}`);
    }
    
    return response.json();
  },
  
  revealVotes: async (roomId: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.REVEAL(roomId));
    const response = await fetch(url, {
      method: 'POST',
    });
    return response.json();
  },
  
  resetVotes: async (roomId: string) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.RESET(roomId));
    const response = await fetch(url, {
      method: 'POST',
    });
    return response.json();
  },
  
  createRoom: async (roomId?: string, voteOptions?: string[]) => {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.ROOMS);
    const body: any = {};
    
    if (roomId) {
      body.roomId = roomId;
    }
    
    if (voteOptions && voteOptions.length > 0) {
      body.voteOptions = voteOptions;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
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
  }
};