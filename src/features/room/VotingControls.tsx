import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, Divider, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface VotingControlsProps {
  voteOptions: string[];
  onVote: (vote: string) => void;
  onReveal: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onDeleteRoom?: () => void;
  selectedVote?: string;
  votesVisible: boolean;
  isDeletingRoom?: boolean;
  isAdmin: boolean;
  hasVoted: boolean;
}

export const VotingControls: React.FC<VotingControlsProps> = ({
  voteOptions,
  onVote,
  onReveal,
  onRefresh,
  onReset,
  onDeleteRoom,
  selectedVote,
  votesVisible,
  isDeletingRoom = false,
  isAdmin,
  hasVoted = false
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  
  // Update selected when selectedVote from props changes
  useEffect(() => {
    // Clear selection if selectedVote became undefined
    if (selectedVote === undefined) {
      setSelected(null);
      return;
    }
    
    if (selectedVote && selectedVote !== "voted" && selectedVote !== "not_voted") {
      // If we have an actual vote value, use it
      setSelected(selectedVote);
    } else if (hasVoted && selected === null) {
      // If user has voted but we don't know the value, maintain the locally selected value
      // This maintains the visual selection of the card they clicked
    } else if (!hasVoted) {
      // If user hasn't voted, clear selection
      setSelected(null);
    }
  }, [selectedVote, hasVoted, selected]);
  
  // Reset selected vote when votes are reset
  useEffect(() => {
    if (!votesVisible && !hasVoted) {
      // Only clear if not voted
      setSelected(null);
    }
  }, [votesVisible, hasVoted]);
  
  const handleVote = (vote: string) => {
    // First update local state immediately to give visual feedback
    setSelected(vote);
    
    // Then call the parent's vote handler
    onVote(vote);
    
    // Remove the immediate refresh - the Room component will handle this
  };
  
  const handleReset = () => {
    setSelected(null);  // Explicitly clear selection
    onReset();
  };
  
  // Also add useEffect to reset on props change
  useEffect(() => {
    if (!hasVoted) {
      setSelected(null);
    }
  }, [hasVoted]);
  
  // Dynamically split vote options into rows if there are many
  const votesPerRow = 10;
  const chunks = [];
  
  for (let i = 0; i < voteOptions.length; i += votesPerRow) {
    chunks.push(voteOptions.slice(i, i + votesPerRow));
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Delete room button (bottom left) */}
      {onDeleteRoom && (
        <Button
          variant="contained"
          startIcon={<DeleteForeverIcon />}
          onClick={onDeleteRoom}
          disabled={isDeletingRoom || !isAdmin}
          sx={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            backgroundColor: isDeletingRoom ? '#7f8c8d' : '#c0392b',
            color: '#ecf0f1',
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: isDeletingRoom ? '#7f8c8d' : '#e74c3c',
            },
            zIndex: 1000
          }}
        >
          {isDeletingRoom ? 'Deleting...' : 'Delete Room'}
        </Button>
      )}
      
      {/* Vote cards */}
      <Paper
        elevation={3}
        sx={{
          backgroundColor: '#2c3e50', // Darker background to match central theme
          borderRadius: '15px',
          padding: '20px',
          mb: 3,
          mt: 2
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#ecf0f1', 
            mb: 2, 
            textAlign: 'center',
            fontWeight: 'bold' 
          }}
        >
          SELECT YOUR VOTE
        </Typography>
        
        <Divider sx={{ backgroundColor: '#3498db', mb: 3 }} />
        
        {chunks.map((chunk, chunkIndex) => (
          <Box 
            key={chunkIndex}
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center',
              mb: 2
            }}
          >
            {chunk.map((option) => (
              <Paper
                key={option}
                elevation={4}
                onClick={() => handleVote(option)}
                sx={{
                  width: '50px',
                  height: '75px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: selected === option ? '#27ae60' : '#2980b9', // Highlight selected
                  color: '#ffffff',
                  borderRadius: '8px',
                  margin: '0 10px 10px 0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: selected === option ? '2px solid #2ecc71' : '2px solid #3498db',
                  transform: selected === option ? 'translateY(-5px)' : 'none',
                  boxShadow: selected === option ? '0 8px 15px rgba(0,0,0,0.3)' : 'none',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    backgroundColor: selected === option ? '#2ecc71' : '#3498db',
                    boxShadow: '0 8px 15px rgba(0,0,0,0.3)'
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: option.length > 2 ? '1.2rem' : '1.5rem' 
                  }}
                >
                  {option}
                </Typography>
              </Paper>
            ))}
          </Box>
        ))}
      </Paper>
      
      {/* Action buttons will now be passed from Room component to be placed in the center of the table */}
      <Box sx={{ 
        display: 'none', // Hide these buttons here
      }}>
        {!votesVisible && (
          <Button
            variant="contained"
            startIcon={<VisibilityIcon />}
            onClick={onReveal}
            disabled={!isAdmin}
            sx={{
              backgroundColor: '#27ae60',
              color: '#ecf0f1',
              fontWeight: 'bold',
              padding: '10px 20px',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#2ecc71',
              }
            }}
          >
            Reveal Votes
          </Button>
        )}
        
        <Button
          variant="contained"
          startIcon={<RestartAltIcon />}
          onClick={() => {
            setSelected(null); // Directly clear selected
            handleReset();
          }}
          disabled={!isAdmin}
          sx={{
            backgroundColor: '#d35400',
            color: '#ecf0f1',
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#e67e22',
            }
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};