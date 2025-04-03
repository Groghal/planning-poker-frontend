import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert
} from '@mui/material';

interface AdminModeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<boolean>; // Returns true if password was correct
  isLoading: boolean;
  error: string | null;
}

const AdminModeDialog: React.FC<AdminModeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  error
}) => {
  const [adminPassword, setAdminPassword] = useState<string>('');

  const handleVerify = async () => {
    const success = await onSubmit(adminPassword);
    if (success) {
      setAdminPassword(''); // Clear password on success
      onClose(); // Close dialog on success
    }
    // If not successful, the error state will be updated by the hook and displayed
  };

  const handleDialogClose = () => {
    setAdminPassword(''); // Clear password field on close
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }}>
        Enter Admin Mode
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#1e2a38', color: '#ecf0f1', pt: '20px !important' }}>
        <Typography variant="body2" sx={{ mb: 2, color: '#bdc3c7' }}>
          Enter the admin password for this room to access admin controls.
        </Typography>
        <TextField
          autoFocus
          label="Admin Password"
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          error={!!error}
          sx={{
            input: { color: '#ecf0f1' },
            label: { color: '#bdc3c7' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#34495e' },
              '&:hover fieldset': { borderColor: '#7f8c8d' },
              '&.Mui-focused fieldset': { borderColor: '#3498db' },
            },
          }}
        />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#2c3e50', padding: '15px' }}>
        <Button 
          onClick={handleDialogClose}
          sx={{ color: '#ecf0f1' }}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleVerify}
          variant="contained"
          disabled={isLoading || !adminPassword.trim()}
          sx={{
            backgroundColor: '#3498db',
            '&:hover': { backgroundColor: '#2980b9' }
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminModeDialog; 