import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';

interface UsernameDialogProps {
  open: boolean;
  username: string;
  error: string | null;
  onClose: () => void;
  setUsername: (newUsername: string) => void;
  onJoin: () => void;
}

export const UsernameDialog: React.FC<UsernameDialogProps> = ({
  open,
  username,
  error,
  onClose,
  setUsername,
  onJoin
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && username.trim()) {
      onJoin();
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <Dialog 
      open={open}
      onClose={onClose}
      aria-labelledby="username-dialog-title"
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
        id="username-dialog-title"
        sx={{ 
          backgroundColor: '#2c3e50',
          color: '#ecf0f1',
          textAlign: 'center'
        }}
      >
        Enter Your Name
      </DialogTitle>
      <DialogContent sx={{ padding: '20px' }}>
        <TextField
          autoFocus
          margin="dense"
          label="Your Name"
          type="text"
          fullWidth
          value={username}
          onChange={handleUsernameChange}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error || ''}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#ecf0f1',
              '& fieldset': {
                borderColor: error ? '#e74c3c' : '#3498db',
              },
              '&:hover fieldset': {
                borderColor: error ? '#c0392b' : '#2980b9',
              },
              '&.Mui-focused fieldset': {
                borderColor: error ? '#c0392b' : '#2980b9',
              },
            },
            '& .MuiInputLabel-root': {
              color: error ? '#e74c3c' : '#3498db',
              '&.Mui-focused': {
                color: error ? '#c0392b' : '#2980b9',
              },
            },
            '& .MuiFormHelperText-root': {
              color: '#e74c3c',
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ padding: '15px', justifyContent: 'center' }}>
        <Button 
          onClick={onJoin}
          variant="contained"
          disabled={!username.trim()}
          sx={{
            backgroundColor: '#3498db',
            color: 'white',
            '&:hover': {
              backgroundColor: '#2980b9'
            },
            '&.Mui-disabled': {
              backgroundColor: '#7f8c8d',
              color: '#ecf0f1'
            }
          }}
        >
          Join Room
        </Button>
      </DialogActions>
    </Dialog>
  );
};