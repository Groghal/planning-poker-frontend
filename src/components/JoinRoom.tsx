import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography } from '@mui/material';

const JoinRoom: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomId) {
      navigate(`/rooms/${roomId}`);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#1a1a1a',
        color: '#ffffff',
        p: 4,
        borderRadius: 2
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
        Join a Room
      </Typography>
      <TextField
        label="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
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
      <Button 
        variant="contained"
        onClick={handleJoin}
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
        Join Room
      </Button>
    </Box>
  );
};

export default JoinRoom;