import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

const JoinRoom: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomId) {
      navigate(`/rooms/${roomId}`);
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        bgcolor: '#1e2a38',
        color: '#ffffff',
        p: 4,
        borderRadius: 3,
        border: '1px solid #3498db',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
        }
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          color: '#3498db',
          mb: 3,
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
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
              borderColor: '#3498db',
            },
            '&:hover fieldset': {
              borderColor: '#2980b9',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3498db',
              borderWidth: '2px',
            },
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
          },
          '& .MuiInputLabel-root': {
            color: '#bdc3c7',
          },
          '& .MuiInputBase-input': {
            color: '#ffffff',
          },
          mb: 3
        }}
      />
      <Button 
        variant="contained"
        onClick={handleJoin}
        startIcon={<LoginIcon />}
        sx={{
          bgcolor: '#e74c3c',
          color: '#ffffff',
          '&:hover': {
            bgcolor: '#c0392b',
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
        Join Room
      </Button>
    </Paper>
  );
};

export default JoinRoom;