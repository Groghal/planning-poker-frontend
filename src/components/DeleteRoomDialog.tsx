import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface DeleteRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomId: string;
}

export const DeleteRoomDialog: React.FC<DeleteRoomDialogProps> = ({
  open,
  onClose,
  onConfirm,
  roomId
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="delete-room-dialog-title"
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
      id="delete-room-dialog-title"
      sx={{
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}
    >
      Delete Room
    </DialogTitle>
    <DialogContent
      sx={{
        padding: '24px',
        color: '#ecf0f1'
      }}
    >
      <Typography variant="body1" sx={{ marginBottom: '15px' }}>
        Are you sure you want to delete room "<strong>{roomId}</strong>"?
      </Typography>
      <Typography variant="body1" sx={{ color: '#e74c3c' }}>
        All users will be disconnected and all data will be lost.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ padding: '16px', justifyContent: 'space-between' }}>
      <Button
        onClick={onClose}
        variant="outlined"
        sx={{
          borderColor: '#606060',
          color: '#e0e0e0',
          '&:hover': {
            borderColor: '#808080',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        sx={{
          backgroundColor: '#e74c3c',
          color: 'white',
          '&:hover': {
            backgroundColor: '#c0392b'
          }
        }}
      >
        Delete Room
      </Button>
    </DialogActions>
  </Dialog>
); 