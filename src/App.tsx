import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Typography, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import RoomCreation from './components/RoomCreation';
import JoinRoom from './components/JoinRoom';
import Room from './features/room/Room';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1a1a1a',
    },
    primary: {
      main: '#4a90e2',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            bgcolor: 'background.default',
            minHeight: '100vh',
            py: 4
          }}
        >
          <Container maxWidth="md">
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{
                color: '#ffffff',
                textAlign: 'center',
                mb: 6,
                fontWeight: 'bold'
              }}
            >
              Planning Poker
            </Typography>
            <Routes>
              <Route path="/" element={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <RoomCreation />
                  <JoinRoom />
                </Box>
              } />
              <Route path="/rooms/:roomId" element={<Room />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
