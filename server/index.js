import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const rooms = {};
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('create-room', ({ username, question }) => {
    const roomCode = generateRoomCode();
    
    rooms[roomCode] = {
      creator: username,
      question: question || 'Cats vs Dogs',
      options: ['Option A', 'Option B'],
      votes: { 'Option A': 0, 'Option B': 0 },
      users: {},
      active: true,
      createdAt: Date.now(),
      endTime: Date.now() + 60000 
    };

 
    rooms[roomCode].users[socket.id] = {
      id: socket.id,
      username,
      voted: false,
      choice: null
    };

    socket.join(roomCode);

    socket.emit('room-created', {
      roomCode,
      room: rooms[roomCode]
    });


    startCountdown(roomCode);
    
    console.log(`Room created: ${roomCode} by ${username}`);
  });
  socket.on('join-room', ({ username, roomCode }) => {
    roomCode = roomCode.toUpperCase();
    
    if (!rooms[roomCode]) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    rooms[roomCode].users[socket.id] = {
      id: socket.id,
      username,
      voted: false,
      choice: null
    };
    socket.join(roomCode);
    

    socket.emit('room-joined', {
      roomCode,
      room: rooms[roomCode]
    });

    io.to(roomCode).emit('user-joined', {
      username,
      userId: socket.id,
      users: Object.values(rooms[roomCode].users),
      votes: rooms[roomCode].votes
    });
    
    console.log(`User ${username} joined room: ${roomCode}`);
  });

  socket.on('submit-vote', ({ roomCode, choice }) => {
    roomCode = roomCode.toUpperCase();
    
    if (!rooms[roomCode] || !rooms[roomCode].active) {
      socket.emit('error', { message: 'Room not found or voting ended' });
      return;
    }

    const user = rooms[roomCode].users[socket.id];
    
    if (!user) {
      socket.emit('error', { message: 'User not in room' });
      return;
    }

    if (user.voted) {
      socket.emit('error', { message: 'You have already voted' });
      return;
    }
    user.voted = true;
    user.choice = choice;
    

    rooms[roomCode].votes[choice]++;

    io.to(roomCode).emit('vote-update', {
      votes: rooms[roomCode].votes,
      users: Object.values(rooms[roomCode].users)
    });
    
    console.log(`User ${user.username} voted for ${choice} in room ${roomCode}`);
  });


  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    

    for (const roomCode in rooms) {
      if (rooms[roomCode].users[socket.id]) {
        delete rooms[roomCode].users[socket.id];
        
   
        io.to(roomCode).emit('user-left', {
          userId: socket.id,
          users: Object.values(rooms[roomCode].users)
        });
        

        if (Object.keys(rooms[roomCode].users).length === 0) {
          delete rooms[roomCode];
          console.log(`Room ${roomCode} deleted (empty)`);
        }
      }
    }
  });
});


function startCountdown(roomCode) {
  const interval = 1000; 
  let timeRemaining = 60; 
  
  const timer = setInterval(() => {
    timeRemaining--;
    
    
    if (!rooms[roomCode]) {
      clearInterval(timer);
      return;
    }
    

    io.to(roomCode).emit('countdown-update', {
      timeRemaining,
      endTime: rooms[roomCode].endTime
    });
    

    if (timeRemaining <= 0) {
      clearInterval(timer);
      
      
      if (rooms[roomCode]) {
        rooms[roomCode].active = false;
        
        
        io.to(roomCode).emit('voting-ended', {
          votes: rooms[roomCode].votes,
          users: Object.values(rooms[roomCode].users)
        });
        
        console.log(`Voting ended in room ${roomCode}`);
      }
    }
  }, interval);
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});