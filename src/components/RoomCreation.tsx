import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box } from '@mui/material';
import { roomApi } from '../services/api';

const RoomCreation: React.FC = () => {
  const [roomName, setRoomName] = useState<string>('');
  const [voteOptions, setVoteOptions] = useState<string>('0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?');
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      // Use the customized roomId if provided in roomName
      const customRoomId = roomName && roomName.trim() !== '' ? roomName : undefined;
      
      // Parse vote options from input
      const parsedVoteOptions = voteOptions.split(',').map(option => option.trim());
      
      // Use the API service to create a room
      const data = await roomApi.createRoom(customRoomId, parsedVoteOptions);
      console.log('Room created:', data.roomId);
      
      // After room is created, navigate to it
      navigate(`/rooms/${data.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#1a1a1a',
        color: '#ffffff',
        p: 4,
        borderRadius: 2,
        mb: 4
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          color: '#ffffff',
          mb: 3
        }}
      >
        Create a Room
      </Typography>
      <TextField
        label="Room Name (Optional)"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#333333',
            },
            '&:hover fieldset': {
              borderColor: '#666666',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4a90e2',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#999999',
          },
          '& .MuiInputBase-input': {
            color: '#ffffff',
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
        helperText="Enter comma-separated values for voting options"
        FormHelperTextProps={{
          sx: { color: '#999999' }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#333333',
            },
            '&:hover fieldset': {
              borderColor: '#666666',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4a90e2',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#999999',
          },
          '& .MuiInputBase-input': {
            color: '#ffffff',
          },
          mb: 3
        }}
      />
      <Button 
        variant="contained" 
        onClick={createRoom}
        sx={{
          bgcolor: '#4a90e2',
          color: '#ffffff',
          '&:hover': {
            bgcolor: '#357abd',
          },
          px: 4,
          py: 1.5,
          fontSize: '1rem',
          textTransform: 'none'
        }}
      >
        Create Room
      </Button>
    </Box>
  );
};

export default RoomCreation;