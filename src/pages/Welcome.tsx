import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Vote, PenTool } from 'lucide-react';

const Welcome: React.FC = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('Cats');
  const [option2, setOption2] = useState('Dogs');
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { socket } = useSocket();
  const navigate = useNavigate();
  useEffect(() => {
    const savedUsername = localStorage.getItem('poll-username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleCreateRoom = () => {
    if (!username) {
      setErrorMessage('Please enter your name');
      return;
    }
    localStorage.setItem('poll-username', username);
    socket?.emit('create-room', { 
      username,
      question: question || 'Which do you prefer?',
      options: [option1, option2]
    });
  };

  const handleJoinRoom = () => {
    if (!username) {
      setErrorMessage('Please enter your name');
      return;
    }

    if (!roomCode) {
      setErrorMessage('Please enter a room code');
      return;
    }
    localStorage.setItem('poll-username', username);
    socket?.emit('join-room', { username, roomCode });
  };
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (data: { roomCode: string }) => {
      navigate(`/room/${data.roomCode}`);
    };

    const handleRoomJoined = (data: { roomCode: string }) => {
      navigate(`/room/${data.roomCode}`);
    };

    const handleError = (data: { message: string }) => {
      setErrorMessage(data.message);
    };

    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('error', handleError);

    return () => {
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('error', handleError);
    };
  }, [socket, navigate]);

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:shadow-xl">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-center">
          <Vote className="text-white mr-2" size={28} />
          <h1 className="text-2xl font-bold text-white">Real-time Poll App</h1>
        </div>
      </div>
      
      <div className="p-6">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>
        
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            className={`flex-1 px-4 py-2 rounded-md ${!isJoining ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setIsJoining(false)}
          >
            Create Room
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-md ${isJoining ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setIsJoining(true)}
          >
            Join Room
          </button>
        </div>
        
        {isJoining ? (
          <div className="mb-4">
            <label htmlFor="roomCode" className="block text-sm font-semibold text-gray-700 mb-1">
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter room code"
            />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-1">
                Poll Question
              </label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Which do you prefer?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="option1" className="block text-sm font-semibold text-gray-700 mb-1">
                  Option A
                </label>
                <input
                  type="text"
                  id="option1"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="option2" className="block text-sm font-semibold text-gray-700 mb-1">
                  Option B
                </label>
                <input
                  type="text"
                  id="option2"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}
        
        <button
          onClick={isJoining ? handleJoinRoom : handleCreateRoom}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          {isJoining ? 'Join Poll Room' : 'Create Poll Room'}
          {isJoining ? <Vote className="ml-2" size={18} /> : <PenTool className="ml-2" size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Welcome;