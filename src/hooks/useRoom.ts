import { useState, useCallback } from 'react';
import { RoomState } from '../types/room';
import { roomApi } from '../services/api';

const useRoom = (roomId: string) => {
  const [state, setState] = useState<RoomState>({
    loading: true,
    votes: {},
    votesVisible: false,
    username: '',
    open: false,
    roomNotFound: false,
    voteOptions: [],
    voteOptionsInput: '',
  });

  const fetchRoomData = useCallback(async (isPollingUpdate: boolean = false) => {
    if (!isPollingUpdate) {
        setState(prevState => ({ ...prevState, loading: true }));
    }
    try {
      const data = await roomApi.fetchRoom(roomId);
      
      setState(prevState => {
        return {
          ...prevState,
          loading: false,
          roomNotFound: false,
          votes: data.votes || {},
          votesVisible: data.showVotes || false,
          voteOptions: data.voteOptions && data.voteOptions.length > 0 
                         ? data.voteOptions 
                         : prevState.voteOptions.length > 0 
                           ? prevState.voteOptions 
                           : [],
        };
      });
      return data;
    } catch (error) {
      console.error('Error fetching room data:', error);
      setState(prevState => ({ 
        ...prevState, 
        loading: false,
        votes: {},
        roomNotFound: true 
      }));
      throw error;
    }
  }, [roomId]);

  return { state, setState, fetchRoomData };
};

export default useRoom;