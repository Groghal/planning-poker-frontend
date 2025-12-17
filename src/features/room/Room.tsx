// src/features/room/Room.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { UserList } from './UserList';
import { VotingControls } from './VotingControls';
import useRoom from '../../hooks/useRoom';
import { useAdmin } from '../../hooks/useAdmin'; // Import the useAdmin hook
import { roomApi } from '../../services/api';
import { API_CONFIG } from '../../config';
import { signalRService } from '../../services/signalr';
import { calculateSummary } from '../../utils/calculateSummary';
import { VotingSummary } from '../../components/VotingSummary';
import { UsernameDialog } from '../../components/UsernameDialog';
import { RoomNotFoundDialog } from '../../components/RoomNotFoundDialog';
import { DeleteRoomDialog } from '../../components/DeleteRoomDialog';
import AdminModeDialog from '../../components/AdminModeDialog'; // Import the AdminModeDialog
import { RoomState } from '../../types/room';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { state, setState, fetchRoomData } = useRoom(roomId || '');

  // Use the admin hook
  const {
    isAdmin,
    isLoading: isAdminLoading,
    verificationError,
    verifyAdminPassword,
    clearAdmin,
    checkAdminStatus
  } = useAdmin(roomId || '');

  // State for dialogs
  const [roomDeletedDialog, setRoomDeletedDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const [deleteRoomError, setDeleteRoomError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [adminModeDialog, setAdminModeDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [localSelectedVote, setLocalSelectedVote] = useState<string | null>(null);
  const [roomNotFoundAdminPassword, setRoomNotFoundAdminPassword] = useState<string>('');
  const [roomNotFoundError, setRoomNotFoundError] = useState<string | null>(null);
  const [incomingSmile, setIncomingSmile] = useState<{ from: string; to: string; emoji: string; id: number } | null>(null);

  // Set up SignalR
  useEffect(() => {
    if (!roomId) return;

    const connectSignalR = async () => {
      try {
        await signalRService.connect(roomId);
        console.log("Connected to SignalR");
      } catch (err) {
        console.error("SignalR Connection failed", err);
      }
    };

    connectSignalR();

    const handleReceiveSmile = (from: string, to: string, emoji: string) => {
      setIncomingSmile({ from, to, emoji, id: Date.now() });
    };

    signalRService.on("ReceiveSmile", handleReceiveSmile);

    return () => {
      signalRService.off("ReceiveSmile", handleReceiveSmile);
      signalRService.disconnect(roomId).catch(err => console.error("SignalR disconnect error", err));
    };
  }, [roomId]);

  const handleSendSmile = useCallback(async (toUsername: string, emoji: string) => {
    if (!state.username || !roomId) return;
    try {
      // Optimistically show animation? No, wait for signal for consistency or just do it?
      // Let's rely on the signal back from server so we see what others see.
      await signalRService.sendSmile(roomId, toUsername, state.username, emoji);
    } catch (err) {
      console.error("Failed to send smile", err);
    }
  }, [roomId, state.username]);

  // Check for username on component mount and set up polling
  useEffect(() => {
    const checkAndSetUsername = async () => {
      const sessionUsername = sessionStorage.getItem('planning-poker-username');
      const localUsername = localStorage.getItem('planning-poker-username');

      try {
        // Fetch current room data to check users
        const roomData = await roomApi.fetchRoom(roomId || '');
        const existingUsers = Object.keys(roomData.votes || {});

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

    // Initialize room: check username and fetch initial data
    const initializeRoom = async () => {
      await checkAndSetUsername();
      try {
        await fetchRoomData(); // Initial fetch
        // Fetch vote options only once on init
        try {
          const voteOptions = await roomApi.getVoteOptions(roomId || '');
          setState(prevState => ({ ...prevState, voteOptions }));
        } catch (error) {
          const defaultOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'];
          setState(prevState => ({ ...prevState, voteOptions: defaultOptions }));
        }
      } catch (error) {
        setState(prevState => ({ ...prevState, roomNotFound: true }));
      }
    };

    initializeRoom();
  }, [roomId, setState, fetchRoomData]); // Keep dependencies for initial setup

  // Effect for loading last vote on mount
  useEffect(() => {
    // Load the last vote from session storage if available
    const lastVote = sessionStorage.getItem('planning-poker-last-vote');
    if (lastVote) {
      setLocalSelectedVote(lastVote);
    }
  }, []);

  // Effect to watch for when votes are reset
  useEffect(() => {
    // Check if votes were reset by checking if current user's vote is now empty/not_voted
    const sessionUsername = sessionStorage.getItem('planning-poker-username');
    if (sessionUsername && state.votes) {
      const currentVote = state.votes[sessionUsername]?.vote;

      // If the current user has no vote or "not_voted", clear the local selection
      if (!currentVote || currentVote === "not_voted") {
        setLocalSelectedVote(null);
        sessionStorage.removeItem('planning-poker-last-vote');
      }
    }
  }, [state.votes]);

  // Effect for polling with visibility check - Simplified
  useEffect(() => {
    // Do not start polling if the room wasn't found initially
    if (state.roomNotFound) {
      return;
    }

    let isTabVisible = document.visibilityState === 'visible';

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
    };

    console.log("Setting up polling interval (3s) and visibility listener.");
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const pollingInterval = setInterval(() => {
      const sessionUsername = sessionStorage.getItem('planning-poker-username');
      // Check visibility, username, and room status before fetching
      if (isTabVisible && sessionUsername && !state.roomNotFound) {
        fetchRoomData(true).catch(err => console.error("Poll refresh error:", err));
      }
    }, 3000); // Polling interval: 3 seconds

    // Cleanup function
    return () => {
      console.log("Clearing polling interval and visibility listener.");
      clearInterval(pollingInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // Re-run this effect only if the room status fundamentally changes (found/not found)
    // or if fetchRoomData reference changes (which it shouldn't if useCallback is used correctly in useRoom)
  }, [fetchRoomData, state.roomNotFound]);

  const handleVote = async (vote: string) => {
    const sessionUsername = sessionStorage.getItem('planning-poker-username');
    if (sessionUsername) {
      try {
        // Store the vote locally so we know what was selected
        setLocalSelectedVote(vote);
        // Store in session storage to persist across refreshes
        sessionStorage.setItem('planning-poker-last-vote', vote);

        await roomApi.castVote(roomId || '', sessionUsername, vote);
        // After voting, refresh the room data to get updated vote status
        await fetchRoomData();
      } catch (error: any) {
        console.error('Error casting vote:', error);
        setSnackbarMessage(error.message || "Failed to cast vote.");
      }
    } else {
      console.error('No username found in session');
      setSnackbarMessage("You must join the room before voting.");
    }
  };

  // Helper to get admin password from session storage
  const getAdminPassword = useCallback(() => {
    return sessionStorage.getItem(`admin_${roomId}`);
  }, [roomId]);

  // Function to handle admin actions requiring password verification
  const performAdminAction = useCallback(async (action: (roomId: string, adminPassword?: string) => Promise<any>) => {
    if (!isAdmin) {
      setAdminModeDialog(true);
      setSnackbarMessage("Admin privileges required.");
      return; // Don't proceed if not admin
    }

    const adminPassword = getAdminPassword();
    if (!adminPassword) {
      // This case should ideally not happen if isAdmin is true, but handle defensively
      setAdminModeDialog(true);
      setSnackbarMessage("Admin verification needed. Please enter password.");
      return;
    }

    try {
      await action(roomId || '', adminPassword);
      await fetchRoomData(); // Refresh data after successful action
    } catch (error: any) {
      console.error('Admin action failed:', error);
      if (error.message && error.message.includes("Invalid admin password")) {
        clearAdmin(); // Clear invalid stored password
        setAdminModeDialog(true); // Re-prompt for password
        setSnackbarMessage("Invalid admin password. Please try again.");
      } else {
        setSnackbarMessage(error.message || 'An error occurred performing the admin action.');
      }
    }
  }, [roomId, isAdmin, getAdminPassword, clearAdmin, fetchRoomData]);

  const handleRevealVotes = useCallback(() => {
    performAdminAction(roomApi.revealVotes);
  }, [performAdminAction]);

  const handleResetVotes = useCallback(() => {
    // Clear local vote state and storage when votes are reset
    setLocalSelectedVote(null);
    sessionStorage.removeItem('planning-poker-last-vote');

    performAdminAction(roomApi.resetVotes);
  }, [performAdminAction]);

  const handleDeleteRoom = () => {
    if (!isAdmin) {
      setAdminModeDialog(true);
      setSnackbarMessage("Admin privileges required to delete the room.");
      return;
    }
    setDeleteConfirmDialog(true);
  };

  const confirmDeleteRoom = useCallback(async () => {
    setIsDeletingRoom(true);
    setDeleteRoomError(null);
    setDeleteConfirmDialog(false);

    const adminPassword = getAdminPassword();
    if (!adminPassword) {
      setAdminModeDialog(true);
      setDeleteRoomError("Admin verification needed.");
      setIsDeletingRoom(false);
      return;
    }

    try {
      // Call the API to delete the room with admin password
      await roomApi.deleteRoom(roomId || '', adminPassword);

      // Show the room deleted dialog
      setSnackbarMessage("Room deleted successfully.");
      setRoomDeletedDialog(true);

      // Navigate after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting room:', error);
      if (error.message && error.message.includes("Invalid admin password")) {
        clearAdmin(); // Clear invalid stored password
        setAdminModeDialog(true); // Re-prompt for password
        setDeleteRoomError("Invalid admin password. Please try again.");
      } else {
        setDeleteRoomError(error.message || 'Failed to delete room. Please try again.');
      }
      setIsDeletingRoom(false);
    }
  }, [roomId, navigate, clearAdmin, getAdminPassword]);

  const handleJoin = async () => {
    if (state.username) {
      setUsernameError(null);
      try {
        // Call the API endpoint to add the user to the room
        await roomApi.joinRoom(roomId || '', state.username);

        // Store username
        sessionStorage.setItem('planning-poker-username', state.username);
        localStorage.setItem('planning-poker-username', state.username);

        // Close the dialog
        setState(prevState => ({ ...prevState, open: false }));

        // Fetch vote options after successful join
        try {
          const voteOptions = await roomApi.getVoteOptions(roomId || '');
          setState(prevState => ({
            ...prevState,
            voteOptions
          }));
        } catch (error) {
          const defaultOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'];
          setState(prevState => ({
            ...prevState,
            voteOptions: defaultOptions
          }));
        }

        // Fetch initial room data after joining
        await fetchRoomData();

      } catch (error: any) {
        setUsernameError(error.message || 'Failed to join room. Please try again.');
      }
    }
  };

  const handleVoteOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prevState => ({ ...prevState, voteOptionsInput: e.target.value }));
  };

  const handleAdminPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomNotFoundAdminPassword(e.target.value);
    setRoomNotFoundError(null);
  };

  const handleCreateRoom = async () => {
    try {
      if (!roomNotFoundAdminPassword.trim()) {
        setRoomNotFoundError("Admin password is required.");
        return;
      }

      const parsedVoteOptions = state.voteOptionsInput.split(',').map(option => option.trim()).filter(Boolean);
      const data = await roomApi.createRoom(roomId, parsedVoteOptions, roomNotFoundAdminPassword);

      // Store admin password in session storage
      const sessionKey = `admin_${data.roomId}`;
      sessionStorage.setItem(sessionKey, roomNotFoundAdminPassword);

      // Fetch data for the newly created room
      await fetchRoomData();

      // Close the not found dialog
      setState(prevState => ({ ...prevState, roomNotFound: false }));

      // Show username dialog for the new room
      setState(prevState => ({ ...prevState, open: true }));

    } catch (error: any) {
      console.error('Error creating room from dialog:', error);
      setRoomNotFoundError(error.message || 'Failed to create room. Please try again.');
    }
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  // Calculate summary when votes are visible
  const summary = state.votesVisible ? calculateSummary(state.votes) : null;

  // Get current user's vote
  const currentUserVote = state.username ? state.votes[state.username]?.vote : undefined;

  // Handle closing the snackbar
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarMessage(null);
  };

  // If room not found, show RoomNotFoundDialog
  if (state.roomNotFound) {
    return (
      <RoomNotFoundDialog
        open={state.roomNotFound}
        roomId={roomId || ''}
        voteOptionsInput={state.voteOptionsInput}
        adminPassword={roomNotFoundAdminPassword}
        onClose={() => navigate('/')} // Close navigates home
        onVoteOptionsChange={handleVoteOptionsChange}
        onAdminPasswordChange={handleAdminPasswordChange}
        onCreate={handleCreateRoom}
        onNavigateHome={handleNavigateHome}
        error={roomNotFoundError}
      />
    );
  }

  // Main Room component structure
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: '#1e2a38', // Main container background
          color: '#ecf0f1',
          borderRadius: '15px'
        }}
      >
        {/* Header with Room Name and Admin Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#2c3e50',
            p: 2,
            mb: 4,
            borderRadius: '10px',
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
            Room: {roomId}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Refresh Room Data">
              <IconButton onClick={() => fetchRoomData(false)} sx={{ color: '#ecf0f1' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {isAdmin ? (
              <Tooltip title="Exit Admin Mode">
                <IconButton onClick={clearAdmin} sx={{ color: '#e74c3c' }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Enter Admin Mode">
                <IconButton onClick={() => setAdminModeDialog(true)} sx={{ color: '#3498db' }}>
                  <AdminPanelSettingsIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* User list with cards around the table */}
        <UserList
          votes={state.votes}
          votesVisible={state.votesVisible}
          onReveal={isAdmin ? handleRevealVotes : undefined} // Only pass if admin
          onReset={isAdmin ? handleResetVotes : undefined}   // Only pass if admin
          onSendSmile={handleSendSmile}
          incomingSmile={incomingSmile}
        />

        {/* Voting options and controls */}
        <VotingControls
          voteOptions={state.voteOptions}
          onVote={handleVote}
          onReveal={handleRevealVotes} // Pass admin-protected reveal
          onRefresh={fetchRoomData}
          onReset={handleResetVotes}   // Pass admin-protected reset
          onDeleteRoom={handleDeleteRoom} // Pass admin-protected delete trigger
          selectedVote={localSelectedVote || undefined}
          votesVisible={state.votesVisible}
          isDeletingRoom={isDeletingRoom}
          isAdmin={isAdmin} // Pass admin status to disable buttons if needed
          hasVoted={!!currentUserVote && currentUserVote !== "not_voted"}
        />

        {/* Voting Summary */}
        {state.votesVisible && summary && (
          <VotingSummary
            avgVote={summary.avgVote}
            sortedVotes={summary.sortedVotes}
          />
        )}

      </Paper>

      {/* Dialogs */}
      <UsernameDialog
        open={state.open}
        username={state.username}
        error={usernameError}
        setUsername={(newUsername) => setState(prevState => ({ ...prevState, username: newUsername }))}
        onJoin={handleJoin}
        onClose={() => setState(prevState => ({ ...prevState, open: false }))} // Allow closing without joining
      />

      <DeleteRoomDialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        onConfirm={confirmDeleteRoom}
        isLoading={isDeletingRoom}
        error={deleteRoomError}
        roomId={roomId || ''}
      />

      <AdminModeDialog
        open={adminModeDialog}
        onClose={() => setAdminModeDialog(false)}
        onSubmit={verifyAdminPassword} // Use the verification function from the hook
        isLoading={isAdminLoading} // Pass loading state from the hook
        error={verificationError} // Pass error state from the hook
      />

      {/* Dialog for room deleted confirmation */}
      <Dialog open={roomDeletedDialog} onClose={() => navigate('/')}>
        <DialogTitle>Room Deleted</DialogTitle>
        <DialogContent>
          <Typography>The room "{roomId}" has been deleted. You will be redirected to the home page.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/')} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Container>
  );
};

export default Room;