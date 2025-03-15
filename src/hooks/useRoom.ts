import { useState } from 'react';
import { RoomState } from '../types/room';
import { roomApi } from '../services/api';

const useRoom = (roomId: string) => {
  const [state, setState] = useState<RoomState>({
    users: {},
    votes: {},
    votesVisible: false,
    username: '',
    open: false,
    roomNotFound: false,
    voteOptions: [],
    voteOptionsInput: '',
  });

  const fetchRoomData = async () => {
    // Return the promise so we can chain .then() and .catch()
    return roomApi.fetchRoom(roomId)
      .then(data => {
        console.log('Room data received:', data);
        // Get the current user's vote before updating state
        const sessionUsername = sessionStorage.getItem('planning-poker-username');
        const currentUserVote = sessionUsername ? state.votes[sessionUsername] : undefined;
        
        setState(prevState => ({
          ...prevState,
          users: data.users || {},
          // Preserve the current user's vote if it exists
          votes: {
            ...data.votes,
            ...(currentUserVote ? { [sessionUsername!]: currentUserVote } : {})
          },
          votesVisible: data.showVotes || false,
          // Preserve existing vote options if they exist
          voteOptions: prevState.voteOptions.length > 0 ? prevState.voteOptions : (data.voteOptions || []),
        }));
        return data; // Return data for further processing
      })
      .catch(error => {
        console.error('Error fetching room data:', error);
        setState(prevState => ({ 
          ...prevState, 
          users: {},
          roomNotFound: true 
        }));
        throw error; // Re-throw to allow catch in the component
      });
  };

  return { state, setState, fetchRoomData };
};

export default useRoom;