import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface UserListProps {
  users: string[];
  votes: Record<string, string>;
  votesVisible: boolean;
  onReveal?: () => void;
  onReset?: () => void;
}

export const UserList: React.FC<UserListProps> = ({ 
  users, 
  votes, 
  votesVisible,
  onReveal,
  onReset 
}) => {
  const hasVoted = (user: string) => !!votes[user];
  
  // Position users around the table in alternating top/bottom pattern
  const calculatePosition = (index: number, total: number) => {
    // Simplest approach: alternate between top and bottom
    const isTopPosition = index % 2 === 0;
    
    // Calculate horizontal position
    // If few users, space them out more
    let horizontalSpacing;
    
    if (total <= 6) {
      // For fewer users, spread them out more
      const topCount = Math.ceil(total / 2);
      const bottomCount = Math.floor(total / 2);
      
      if (isTopPosition) {
        // Top position
        const topIndex = Math.floor(index / 2);
        horizontalSpacing = 100 / (topCount + 1);
        const leftPosition = (topIndex + 1) * horizontalSpacing;
        
        return {
          top: '-75px',
          left: `${leftPosition}%`,
          transform: 'translateX(-50%)'
        };
      } else {
        // Bottom position
        const bottomIndex = Math.floor(index / 2);
        horizontalSpacing = 100 / (bottomCount + 1);
        const leftPosition = (bottomIndex + 1) * horizontalSpacing;
        
        return {
          top: '140px', // Below the table
          left: `${leftPosition}%`,
          transform: 'translateX(-50%)'
        };
      }
    } else {
      // For many users, calculate position based on how many on each row
      const positionInRow = Math.floor(index / 2);
      const totalInRow = Math.ceil(total / 2);
      horizontalSpacing = 100 / (totalInRow + 1);
      const leftPosition = (positionInRow + 1) * horizontalSpacing;
      
      return {
        top: isTopPosition ? '-75px' : '140px',
        left: `${leftPosition}%`,
        transform: 'translateX(-50%)'
      };
    }
  };

  return (
    <Box sx={{ position: 'relative', mt: 4, mb: 10 }}>
      {/* Virtual table */}
      <Paper 
        elevation={3}
        sx={{
          backgroundColor: '#1e2a38', // Darker background
          height: '180px',
          borderRadius: '30px',
          border: '10px solid #2c3e50',
          position: 'relative',
          mb: 8, // Make room for names below card
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        }}
      >
        {/* Table buttons in center */}
        {(onReveal || onReset) && (
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            gap: 2,
            zIndex: 10
          }}>
            {!votesVisible && onReveal && (
              <Button
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={onReveal}
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
            
            {onReset && (
              <Button
                variant="contained"
                startIcon={<RestartAltIcon />}
                onClick={onReset}
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
            )}
          </Box>
        )}
        
        {/* Place users around the table */}
        {users.map((user, index) => {
          const position = calculatePosition(index, users.length);
          
          return (
            <Box 
              key={index} 
              sx={{ 
                position: 'absolute',
                textAlign: 'center',
                top: position.top,
                left: position.left,
                transform: position.transform,
                zIndex: 5
              }}
            >
              {/* Card (vote) */}
              <Paper
                elevation={5}
                sx={{
                  width: '60px',
                  height: '90px',
                  borderRadius: '10px',
                  backgroundColor: hasVoted(user) ? '#3498db' : '#95a5a6',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '2px solid #ecf0f1',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  transform: hasVoted(user) ? 'translateY(-10px)' : 'none',
                  cursor: 'default',
                  '&:hover': {
                    transform: 'translateY(-15px) scale(1.05)',
                  }
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{
                    color: '#ecf0f1',
                    fontWeight: 'bold',
                    fontSize: '1.8rem'
                  }}
                >
                  {votesVisible ? (votes[user] || '?') : (hasVoted(user) ? '✓' : '?')}
                </Typography>
              </Paper>
              
              {/* Username */}
              <Typography 
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  color: '#ecf0f1',
                  mt: 1,
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user}
              </Typography>
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
};