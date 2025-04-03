import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, Alert } from '@mui/material';
import { roomApi } from '../services/api';
import AddIcon from '@mui/icons-material/Add';

const RoomCreation: React.FC = () => {
  const [roomName, setRoomName] = useState<string>('');
  const [voteOptions, setVoteOptions] = useState<string>('0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const createRoom = async () => {
    setError(null);
    if (!adminPassword.trim()) {
        setError("Admin password is required.");
        return;
    }
    try {
      // Use the customized roomId if provided in roomName
      const customRoomId = roomName && roomName.trim() !== '' ? roomName.trim() : undefined;
      
      // Parse vote options from input
      const parsedVoteOptions = voteOptions.split(',').map(option => option.trim()).filter(Boolean);
      
      // Use the API service to create a room
      const data = await roomApi.createRoom(customRoomId, parsedVoteOptions, adminPassword);
      console.log('Room created:', data.roomId);

      // Store admin password in session storage
      const sessionKey = `admin_${data.roomId}`;
      sessionStorage.setItem(sessionKey, adminPassword);
      
      // After room is created, navigate to it
      navigate(`/rooms/${data.roomId}`);
    } catch (error: any) {
      console.error('Error creating room:', error);
      setError(error.message || 'Failed to create room. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#2c3e50', // Adjusted background color
        color: '#ecf0f1', // Adjusted text color
        p: 4,
        borderRadius: 2,
        mb: 4,
        boxShadow: 3 // Added slight shadow
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          color: '#ecf0f1', // Ensure contrast
          mb: 3,
          textAlign: 'center' // Center title
        }}
      >
        Create a New Planning Room
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Room Name (Optional)"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
        InputLabelProps={{ style: { color: '#bdc3c7' } }}
        sx={{
          input: { color: '#ecf0f1' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#34495e' },
            '&:hover fieldset': { borderColor: '#7f8c8d' },
            '&.Mui-focused fieldset': { borderColor: '#3498db' },
            backgroundColor: '#34495e' // Input background
          },
          mb: 2
        }}
      />
      <TextField
        label="Vote Options (comma separated)"
        value={voteOptions}
        onChange={(e) => setVoteOptions(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
        helperText="Default: Standard Fibonacci sequence"
        FormHelperTextProps={{ style: { color: '#95a5a6' } }}
        InputLabelProps={{ style: { color: '#bdc3c7' } }}
        sx={{
          input: { color: '#ecf0f1' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#34495e' },
            '&:hover fieldset': { borderColor: '#7f8c8d' },
            '&.Mui-focused fieldset': { borderColor: '#3498db' },
            backgroundColor: '#34495e'
          },
          mb: 2 // Adjusted margin
        }}
      />
      <TextField
        label="Admin Password (Required)"
        type="password"
        value={adminPassword}
        onChange={(e) => setAdminPassword(e.target.value)}
        variant="outlined"
        fullWidth
        required
        margin="normal"
        InputLabelProps={{ style: { color: '#bdc3c7' } }}
        error={!!error && error.includes("password")} // Highlight if password error
        sx={{
          input: { color: '#ecf0f1' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#34495e' },
            '&:hover fieldset': { borderColor: '#7f8c8d' },
            '&.Mui-focused fieldset': { borderColor: '#3498db' },
            backgroundColor: '#34495e'
          },
          mb: 3 // Adjusted margin
        }}
      />
      <Button 
        variant="contained" 
        onClick={createRoom}
        fullWidth // Make button full width
        disabled={!adminPassword.trim()} // Disable if no password
        startIcon={<AddIcon />}
        sx={{
          bgcolor: '#e74c3c !important', // Added !important to override theme
          color: '#ffffff',
          '&:hover': {
            bgcolor: '#c0392b !important', // Added !important to override theme
          },
          px: 4,
          py: 1.5,
          fontSize: '1rem',
          textTransform: 'none',
          borderRadius: '30px',
          boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)',
          width: '100%',
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}
      >
        Create Room
      </Button>
    </Box>
  );
};

export default RoomCreation;