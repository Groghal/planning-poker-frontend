import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';

interface RoomNotFoundDialogProps {
  open: boolean;
  roomId: string;
  voteOptionsInput: string;
  onClose: () => void;
  onVoteOptionsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreate: () => void;
  onNavigateHome: () => void;
}

export const RoomNotFoundDialog: React.FC<RoomNotFoundDialogProps> = ({
  open,
  roomId,
  voteOptionsInput,
  onClose,
  onVoteOptionsChange,
  onCreate,
  onNavigateHome,
}) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    sx={{ 
      zIndex: 1500,
      '& .MuiDialog-paper': {
        backgroundColor: '#1e1e1e',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        padding: '10px',
        minWidth: '400px',
        color: '#ffffff'
      }
    }}
  >
    <DialogTitle sx={{ 
      fontSize: '1.5rem', 
      fontWeight: 'bold', 
      color: '#ff6b6b'
    }}>
      Room Not Found
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ marginBottom: '15px', color: '#e0e0e0' }}>
        Room with ID "<strong>{roomId}</strong>" was not found.
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '15px', color: '#e0e0e0' }}>
        Would you like to create this room?
      </Typography>
      <TextField
        autoFocus
        margin="dense"
        label="Vote Options (comma separated)"
        type="text"
        fullWidth
        value={voteOptionsInput}
        onChange={onVoteOptionsChange}
        variant="outlined"
        sx={{
          marginTop: '10px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#404040',
            },
            '&:hover fieldset': {
              borderColor: '#606060',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4a9eff',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#909090',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#4a9eff',
          },
          '& .MuiInputBase-input': {
            color: '#ffffff',
          },
        }}
        helperText="Enter comma-separated values for voting options"
        FormHelperTextProps={{
          sx: { color: '#909090' }
        }}
      />
    </DialogContent>
    <DialogActions sx={{ padding: '16px' }}>
      <Button 
        onClick={onNavigateHome} 
        color="secondary"
        variant="outlined"
        sx={{ 
          marginRight: '10px',
          borderColor: '#606060',
          color: '#e0e0e0',
          '&:hover': {
            borderColor: '#808080',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }
        }}
      >
        Return to Home
      </Button>
      <Button 
        onClick={onCreate} 
        color="primary"
        variant="contained"
        sx={{
          backgroundColor: '#4a9eff',
          '&:hover': {
            backgroundColor: '#3d84d6'
          }
        }}
      >
        Create Room
      </Button>
    </DialogActions>
  </Dialog>
);