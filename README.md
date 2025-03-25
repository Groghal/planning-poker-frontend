# Planning Poker Frontend

## Overview

A modern, responsive React application for Planning Poker, built with TypeScript and Material-UI. This frontend provides an intuitive interface for agile estimation sessions with real-time updates and a dark theme design.

## Features

- **Room Management:**
  - Create rooms with custom vote options
  - Join existing rooms with unique usernames
  - Real-time room state updates
  - Room deletion with confirmation

- **Voting Interface:**
  - Intuitive card-based voting system
  - Configurable vote options
  - Real-time vote status updates
  - Vote reveal/hide animations
  - Round reset functionality

- **User Experience:**
  - Modern dark theme UI
  - Responsive design for all devices
  - Username persistence across sessions
  - Real-time participant list
  - Vote summary with statistics

## Tech Stack

- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- Vite
- CSS Modules

## Project Structure

```
src/
├── assets/              # Static assets and images
│
├── components/          # Reusable UI components
│   ├── DeleteRoomDialog.tsx
│   ├── RoomCreation.tsx
│   ├── RoomNotFoundDialog.tsx
│   ├── UsernameDialog.tsx
│   └── VotingSummary.tsx
│
├── features/           # Feature-specific components
│   └── room/          # Room feature components
│       ├── Room.tsx
│       ├── UserList.tsx
│       └── VotingControls.tsx
│
├── hooks/             # Custom React hooks
│   └── useRoom.ts    # Room state management hook
│
├── services/         # API and service layer
│   └── api.ts       # API client configuration
│
├── types/           # TypeScript type definitions
│   └── room.ts     # Room-related types
│
├── utils/          # Utility functions
│   └── calculateSummary.ts  # Vote calculation utilities
│
├── App.tsx        # Root application component
├── config.ts      # Application configuration
└── main.tsx       # Application entry point
```

## Components

### Core Components
- **RoomCreation**: Home page component for creating new rooms
- **Room**: Main room component managing the poker session
- **UserList**: Displays participants and their vote status
- **VotingControls**: Card-based voting interface
- **VotingSummary**: Statistical summary of voting results

### Dialog Components
- **UsernameDialog**: Username input and validation
- **DeleteRoomDialog**: Room deletion confirmation
- **RoomNotFoundDialog**: Room creation when ID not found

## Features

### Room Management
- Create rooms with custom vote options
- Join existing rooms with unique usernames
- Real-time updates of room state
- Room deletion with confirmation dialog

### Voting System
- Intuitive card selection interface
- Real-time vote status updates
- Vote reveal/hide functionality
- Round reset capability
- Vote statistics and summaries

## Setup and Installation

1. **Prerequisites:**
   - Node.js (v14 or higher)
   - npm or yarn

2. **Installation:**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd planning-poker-frontend

   # Install dependencies
   npm install
   ```

3. **Environment Setup:**
   - Copy `.env.example` to `.env` if needed
   - Configure API endpoint in `src/config.ts`

4. **Running the Application:**
   ```bash
   # Development
   npm run dev

   # Production Build
   npm run build
   npm run preview
   ```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for React
- Consistent code formatting with Prettier

## Browser Support

The application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

P.S. this project is fully created by Cursor + Claude with almost 0 human lines of code.