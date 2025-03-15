// src/features/room/Room.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { UserList } from './UserList';
import { VotingControls } from './VotingControls';
import useRoom from '../../hooks/useRoom';
import { roomApi } from '../../services/api';
import { API_CONFIG } from '../../config';
import { calculateSummary } from '../../utils/calculateSummary';
import { VotingSummary } from '../../components/VotingSummary';
import { UsernameDialog } from '../../components/UsernameDialog';
import { RoomNotFoundDialog } from '../../components/RoomNotFoundDialog';
import { DeleteRoomDialog } from '../../components/DeleteRoomDialog';
import { RoomState } from '../../types/room';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { state, setState, fetchRoomData } = useRoom(roomId || '');
  
  // State for dialogs
  const [roomDeletedDialog, setRoomDeletedDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const [deleteRoomError, setDeleteRoomError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Check for username on component mount and set up polling
  useEffect(() => {
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    
    const checkAndSetUsername = async () => {
      const sessionUsername = sessionStorage.getItem('planning-poker-username');
      const localUsername = localStorage.getItem('planning-poker-username');
      
      try {
        // Fetch current room data to check users
        const roomData = await roomApi.fetchRoom(roomId || '');
        const existingUsers = Object.values(roomData.users || {}).map((user: any) => user.username);
        
        if (!sessionUsername) {
          // If we have a local username, use it but still show dialog for confirmation
          if (localUsername) {
            setState(prevState => ({ 
              ...prevState, 
              username: localUsername,
              open: true 
            }));
          } else {
            // No username at all, show dialog
            setState(prevState => ({ 
              ...prevState, 
              open: true 
            }));
          }
        } else {
          // We have a session username, but check if it's in the room
          if (!existingUsers.includes(sessionUsername)) {
            // User not in room, show dialog
            setState(prevState => ({ 
              ...prevState, 
              username: sessionUsername,
              open: true 
            }));
          } else {
            // User is in room, set username in state
            setState(prevState => ({ 
              ...prevState, 
              username: sessionUsername 
            }));
          }
        }
      } catch (error) {
        console.error('Error checking room users:', error);
        // If we can't fetch room data, default to showing the dialog
        setState(prevState => ({ 
          ...prevState, 
          open: true,
          username: sessionUsername || localUsername || ''
        }));
      }
    };
    
    // First set default vote options
    setState(prevState => ({
      ...prevState,
      voteOptionsInput: '0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?'
    }));
    
    // Check username and setup polling
    const initializeRoom = async () => {
      // Check username immediately
      await checkAndSetUsername();
      
      // Then attempt to fetch room data
      try {
        await fetchRoomData();
        console.log("Room found, checking for username");
        
        // Fetch vote options for the room
        try {
          const voteOptions = await roomApi.getVoteOptions(roomId || '');
          console.log("Fetched vote options:", voteOptions);
          setState(prevState => ({
            ...prevState,
            voteOptions
          }));
        } catch (error) {
          console.error('Failed to fetch vote options:', error);
          const defaultOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'];
          setState(prevState => ({
            ...prevState,
            voteOptions: defaultOptions
          }));
        }
        
        // Start polling for room data updates
        pollingInterval = setInterval(() => {
          const sessionUsername = sessionStorage.getItem('planning-poker-username');
          if (sessionUsername) {
            console.log("Polling for room updates...");
            fetchRoomData()
              .then(() => console.log("Room data refreshed via polling"))
              .catch(err => console.error("Poll refresh error:", err));
          }
        }, 3000);
      } catch (error) {
        console.error('Error fetching room:', error);
        setState(prevState => ({ 
          ...prevState, 
          roomNotFound: true 
        }));
      }
    };

    initializeRoom();
    
    // Cleanup polling on unmount  
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [roomId]); // Re-run when roomId changes

  const handleVote = async (vote: string) => {
    const sessionUsername = sessionStorage.getItem('planning-poker-username');
    if (sessionUsername) {
      await roomApi.castVote(roomId || '', sessionUsername, vote);
      fetchRoomData();
    }
  };

  const handleRevealVotes = async () => {
    try {
      await roomApi.revealVotes(roomId || '');
      setState((prevState: RoomState) => ({ ...prevState, votesVisible: true }));
      await fetchRoomData();
      console.log('Votes revealed');
    } catch (error) {
      console.error('Error revealing votes:', error);
    }
  };

  const handleResetVotes = async () => {
    try {
      // First reset the votes on the server
      await roomApi.resetVotes(roomId || '');
      
      // Clear votes and visibility in state
      setState((prevState: RoomState) => ({ 
        ...prevState, 
        votes: {},
        votesVisible: false 
      }));

      // Clear the current user's vote
      const sessionUsername = sessionStorage.getItem('planning-poker-username');
      if (sessionUsername) {
        setState((prevState: RoomState) => ({
          ...prevState,
          votes: {
            ...prevState.votes,
            [sessionUsername]: ''  // Set to empty string instead of undefined
          }
        }));
      }

      console.log('Votes reset');
    } catch (error) {
      console.error('Error resetting votes:', error);
    }
  };

  const handleDeleteRoom = async () => {
    setDeleteConfirmDialog(true);
  };

  const confirmDeleteRoom = async () => {
    try {
      setIsDeletingRoom(true);
      setDeleteRoomError(null);
      setDeleteConfirmDialog(false);
      
      // Call the API to delete the room
      await roomApi.deleteRoom(roomId || '');
      
      // Show the room deleted dialog
      setRoomDeletedDialog(true);
      
      // Navigate after a delay to allow the dialog to display
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error deleting room:', error);
      setDeleteRoomError('Failed to delete room. Please try again.');
      setIsDeletingRoom(false);
    }
  };

  const handleJoin = async () => {
    if (state.username) {
      console.log(`User ${state.username} joining room ${roomId} via handleJoin`);
      
      try {
        // Check if username is already taken
        const roomData = await roomApi.fetchRoom(roomId || '');
        const existingUsers = Object.values(roomData.users || {}).map((user: any) => user.username);
        
        if (existingUsers.includes(state.username)) {
          setUsernameError('This name is already taken. Please choose a different name.');
          return;
        }
        
        // If username is available, proceed with join
        sessionStorage.setItem('planning-poker-username', state.username);
        localStorage.setItem('planning-poker-username', state.username);
        
        // Call the API endpoint to add the user to the room
        await roomApi.joinRoom(roomId || '', state.username);
        console.log(`API join successful for user ${state.username} in room ${roomId}`);
        
        // Clear any previous error
        setUsernameError(null);
        
        // Fetch vote options after successful join
        try {
          const voteOptions = await roomApi.getVoteOptions(roomId || '');
          console.log("Fetched vote options after join:", voteOptions);
          setState(prevState => ({
            ...prevState,
            open: false,
            voteOptions
          }));
        } catch (error) {
          console.error('Failed to fetch vote options:', error);
          const defaultOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'];
          setState(prevState => ({
            ...prevState,
            open: false,
            voteOptions: defaultOptions
          }));
        }

        fetchRoomData();
      } catch (error) {
        console.error('Failed to join room:', error);
        setUsernameError('Failed to join room. Please try again.');
      }
    }
  };

  const handleCreateRoom = async () => {
    try {
      // Parse vote options from input and create room with them
      const voteOptions = state.voteOptionsInput.split(',').map(option => option.trim());
      const data = await roomApi.createRoom(roomId, voteOptions);
      
      setState(prevState => ({ ...prevState, roomNotFound: false }));
      fetchRoomData();
  
      const sessionUsername = sessionStorage.getItem('planning-poker-username');
      if (sessionUsername) {
        setState(prevState => ({ ...prevState, username: sessionUsername }));
        const usersList = data.users || [];
        if (!usersList.includes(sessionUsername)) {
          setState(prevState => ({ ...prevState, open: true }));
        }
      } else {
        const localUsername = localStorage.getItem('planning-poker-username');
        if (localUsername) {
          setState(prevState => ({ ...prevState, username: localUsername }));
        }
        setState(prevState => ({ ...prevState, open: true }));
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const { avgVote, sortedVotes } = calculateSummary(state.votes);
  
  // Add more debug logging
  console.log("Render state:", {
    roomNotFound: state.roomNotFound,
    open: state.open,
    username: state.username,
    users: state.users,
    votes: state.votes,
    votesVisible: state.votesVisible,
    voteOptions: state.voteOptions,
    sortedVotes,
    avgVote
  });

  // Just keeping a minimal fallback for safety
  if (!state) {
    return (
      <div style={{color: 'white', padding: '20px'}}>
        <h2>Loading Room: {roomId}</h2>
        <button onClick={fetchRoomData}>Refresh</button>
      </div>
    );
  }
  
  // Find the current user's vote
  const sessionUsername = sessionStorage.getItem('planning-poker-username');
  const currentUserVote = sessionUsername ? state.votes[sessionUsername] : undefined;
  
  // Main UI
  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <Paper 
        elevation={5}
        sx={{ 
          backgroundColor: '#1e2a38', // Darker background
          p: 3, 
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: '1px solid #2c3e50',
          position: 'relative'
        }}
      >
        {/* Combined room header */}
        <Box
          sx={{
            backgroundColor: '#2c3e50',
            p: 2,
            mb: 4,
            borderRadius: '10px',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#ecf0f1', 
              fontWeight: 'bold',
              textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            Planning Poker
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#3498db', 
              fontWeight: 'bold',
              mt: 1
            }}
          >
            Room: {roomId}
          </Typography>
        </Box>

        {/* User list with cards around the table and action buttons in center */}
        <UserList
          users={Object.values(state.users).map(user => user.username)}
          votes={state.votes}
          votesVisible={state.votesVisible}
          onReveal={handleRevealVotes}
          onReset={handleResetVotes}
        />

        {/* Voting options */}
        <VotingControls
          voteOptions={state.voteOptions}
          onVote={handleVote}
          onReveal={handleRevealVotes}
          onRefresh={fetchRoomData}
          onReset={handleResetVotes}
          onDeleteRoom={handleDeleteRoom}
          selectedVote={currentUserVote}
          votesVisible={state.votesVisible}
          isDeletingRoom={isDeletingRoom}
        />

        {/* Results summary (only visible when votes are revealed) */}
        {state.votesVisible && (
          <VotingSummary
            avgVote={avgVote}
            sortedVotes={sortedVotes}
          />
        )}

        {/* Dialogs */}
        <UsernameDialog
          open={state.open}
          username={state.username}
          error={usernameError || undefined}
          onClose={() => {
            setState((prevState: RoomState) => ({ ...prevState, open: false }));
            setUsernameError(null);
          }}
          onUsernameChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setUsernameError(null);
            setState((prevState: RoomState) => ({ ...prevState, username: e.target.value }));
          }}
          onJoin={handleJoin}
        />

        <RoomNotFoundDialog
          open={state.roomNotFound}
          roomId={roomId || ''}
          voteOptionsInput={state.voteOptionsInput}
          onClose={() => setState((prevState: RoomState) => ({ ...prevState, roomNotFound: false }))}
          onVoteOptionsChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setState((prevState: RoomState) => ({ ...prevState, voteOptionsInput: e.target.value }))}
          onCreate={handleCreateRoom}
          onNavigateHome={() => navigate('/')}
        />

        <DeleteRoomDialog
          open={deleteConfirmDialog}
          onClose={() => setDeleteConfirmDialog(false)}
          onConfirm={confirmDeleteRoom}
          roomId={roomId || ''}
        />
        
        {/* Room Deleted Dialog */}
        <Dialog
          open={roomDeletedDialog}
          aria-labelledby="room-deleted-dialog-title"
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: '#1e2a38',
              border: '1px solid #3498db',
              borderRadius: '16px',
              maxWidth: '400px',
            }
          }}
        >
          <DialogTitle 
            id="room-deleted-dialog-title"
            sx={{ 
              backgroundColor: '#2c3e50',
              color: '#ecf0f1',
              textAlign: 'center'
            }}
          >
            Room Deleted
          </DialogTitle>
          <DialogContent
            sx={{
              padding: '20px',
              color: '#ecf0f1'
            }}
          >
            <Typography variant="body1" sx={{ marginTop: '10px', marginBottom: '15px' }}>
              This room has been deleted by the admin. You will be redirected to the home page in a few seconds.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ padding: '15px', justifyContent: 'center' }}>
            <Button 
              onClick={() => navigate('/')} 
              variant="contained"
              sx={{
                backgroundColor: '#3498db',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#2980b9'
                }
              }}
            >
              Go to Home Page Now
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Room Error Dialog */}
        <Dialog
          open={!!deleteRoomError}
          onClose={() => setDeleteRoomError(null)}
          aria-labelledby="delete-room-error-dialog-title"
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: '#1e2a38',
              border: '1px solid #e74c3c',
              borderRadius: '16px',
              maxWidth: '400px',
            }
          }}
        >
          <DialogTitle 
            id="delete-room-error-dialog-title"
            sx={{ 
              backgroundColor: '#2c3e50',
              color: '#ecf0f1',
              textAlign: 'center'
            }}
          >
            Error Deleting Room
          </DialogTitle>
          <DialogContent
            sx={{
              padding: '20px',
              color: '#ecf0f1'
            }}
          >
            <Typography variant="body1" sx={{ marginTop: '10px', marginBottom: '15px' }}>
              {deleteRoomError}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ padding: '15px', justifyContent: 'center' }}>
            <Button 
              onClick={() => setDeleteRoomError(null)} 
              variant="contained"
              sx={{
                backgroundColor: '#3498db',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#2980b9'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Room;