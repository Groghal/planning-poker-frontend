import React from 'react';
import { Box, Paper, Typography, Divider, Grid, Chip } from '@mui/material';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface VotingSummaryProps {
  avgVote: number;
  sortedVotes: [string, number][];
}

export const VotingSummary: React.FC<VotingSummaryProps> = ({ avgVote, sortedVotes }) => {
  // Get the consensus vote (most common)
  const consensusVote = sortedVotes.length > 0 ? sortedVotes[0][0] : 'None';
  
  // Determine if all votes are the same
  const unanimous = sortedVotes.length === 1;
  
  // Total votes
  const totalVotes = sortedVotes.reduce((sum, [_, count]) => sum + count, 0);
  
  // Percentage of majority vote
  const majorityPercentage = sortedVotes.length > 0 
    ? Math.round((sortedVotes[0][1] / totalVotes) * 100) 
    : 0;

  return (
    <Paper
      elevation={3}
      sx={{
        backgroundColor: '#2c3e50',
        borderRadius: '15px',
        padding: '20px',
        mt: 4,
        mb: 3,
        color: '#ecf0f1',
        border: '1px solid #3498db'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <EqualizerIcon sx={{ fontSize: 28, mr: 2, color: '#3498db' }} />
        <Typography variant="h5" fontWeight="bold">
          Voting Results
        </Typography>
      </Box>
      
      <Divider sx={{ backgroundColor: '#3498db', mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* Average score */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2}
            sx={{ 
              backgroundColor: '#34495e', 
              p: 2, 
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
            <ShowChartIcon sx={{ fontSize: 30, color: '#3498db', mb: 1 }} />
            <Typography variant="subtitle1" color="#bdc3c7">
              Average Score
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="#ecf0f1">
              {!isNaN(avgVote) ? avgVote.toFixed(1) : '0'}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Consensus vote */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2}
            sx={{ 
              backgroundColor: '#34495e', 
              p: 2, 
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 30, color: '#2ecc71', mb: 1 }} />
            <Typography variant="subtitle1" color="#bdc3c7">
              Most Common Vote
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="#ecf0f1">
              {consensusVote}
            </Typography>
            {unanimous && (
              <Chip 
                label="Unanimous!" 
                size="small" 
                sx={{ 
                  backgroundColor: '#2ecc71', 
                  color: 'white',
                  mt: 1,
                  fontWeight: 'bold'
                }} 
              />
            )}
          </Paper>
        </Grid>
        
        {/* Agreement level */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2}
            sx={{ 
              backgroundColor: '#34495e', 
              p: 2, 
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
            <Box sx={{ position: 'relative', height: '80px', mt: 1 }}>
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '20px',
                backgroundColor: '#7f8c8d',
                borderRadius: '10px',
              }} />
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${majorityPercentage}%`,
                height: '20px',
                backgroundColor: majorityPercentage > 70 ? '#2ecc71' : 
                                majorityPercentage > 40 ? '#f39c12' : '#e74c3c',
                borderRadius: '10px',
                transition: 'width 1s ease-in-out'
              }} />
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                color="#ecf0f1"
                sx={{ position: 'absolute', bottom: 0, width: '100%' }}
              >
                {majorityPercentage}%
              </Typography>
            </Box>
            <Typography variant="subtitle1" color="#bdc3c7" mt={1}>
              Agreement Level
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Vote distribution */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Vote Distribution:
        </Typography>
        <Grid container spacing={1}>
          {sortedVotes.map(([vote, count]) => (
            <Grid item key={vote}>
              <Chip 
                label={`${vote}: ${count} ${count === 1 ? 'vote' : 'votes'}`} 
                sx={{ 
                  backgroundColor: vote === consensusVote ? '#3498db' : '#7f8c8d',
                  color: 'white',
                  fontWeight: 'bold',
                  mr: 1,
                  mb: 1
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};