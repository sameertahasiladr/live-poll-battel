# Real-time Polling Application

A modern, real-time polling application built with React and Socket.IO that allows users to create and participate in live polls with instant results.

## Features

- **Real-time Updates**: Instant vote synchronization across all connected users
- **Room Management**: Create or join poll rooms using unique room codes
- **Live Voting**: Vote on binary choices (e.g., "Cats vs Dogs")
- **Real-time Results**: See voting results update instantly as votes come in
- **Multi-user Support**: Multiple users can join the same room and vote simultaneously
- **User Tracking**: View active participants in each poll room with real-time join/leave updates
- **Countdown Timer**: 60-second voting window with live countdown
- **Vote Persistence**: Votes are preserved across page refreshes
- **Responsive Design**: Beautiful UI that works on all devices
- **Share Functionality**: Easily copy and share room codes with other users

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Start the WebSocket server:
   ```bash
   npm run server
   ```

The application will be available at `http://localhost:5173`

## Multi-user Testing

To test the multi-user functionality:

1. Open the application in multiple browser windows or devices
2. Create a room in one window
3. Copy the room code
4. Join the room from other windows/devices using the code
5. Watch as votes and user lists update in real-time across all instances

## Architecture

### State Management and Room Structure

The application uses a WebSocket-based architecture for real-time communication:

- **Room Management**: Each poll room is managed through a unique room code and stored in server memory using a rooms object. Each room contains:
  - Creator information
  - Poll question
  - Voting options
  - Current vote tallies
  - Connected users and their status
  - Room status (active/inactive)
  - Timer information

- **Vote State Sharing**: Real-time updates are handled through Socket.IO events:
  - `create-room`: Initializes a new poll room
  - `join-room`: Adds users to existing rooms
  - `submit-vote`: Processes and broadcasts vote updates
  - `user-joined`: Notifies when new users enter the room
  - `user-left`: Updates when users disconnect
  - `countdown-update`: Synchronizes timer across all users
  - `voting-ended`: Notifies all users when voting period ends

- **Concurrent User Management**:
  - Each user gets a unique socket ID
  - User states are tracked individually within each room
  - Vote validation prevents duplicate voting
  - Real-time user list updates for joins/leaves
  - Automatic room cleanup when empty

Local storage is used to persist user votes and room information across page refreshes, ensuring a seamless experience even if users temporarily disconnect.

## Tech Stack

- **Frontend**: React, TailwindCSS, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO
- **State Management**: React Context API
- **UI Components**: Custom components with Lucide React icons

## Images
![alt text](<Screenshot 2025-05-10 112856.png>) ![alt text](<Screenshot 2025-05-10 112925.png>) ![alt text](<Screenshot 2025-05-10 113025.png>) ![alt text](<Screenshot 2025-05-10 113049.png>) ![alt text](<Screenshot 2025-05-10 113107.png>) ![alt text](<Screenshot 2025-05-10 113203.png>)