import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import CountdownTimer from '../components/CountdownTimer';
import PollResults from '../components/PollResults';
import VoteOptions from '../components/VoteOptions';
import { Users, ArrowLeft, Share2 } from 'lucide-react';

interface User {
  id: string;
  username: string;
  voted: boolean;
  choice: string | null;
}

interface Room {
  creator: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  users: Record<string, User>;
  active: boolean;
  endTime: number;
}

const PollRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isActive, setIsActive] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!roomCode) return;
    
    const savedVote = localStorage.getItem(`poll-vote-${roomCode}`);
    if (savedVote) {
      setHasVoted(true);
      setUserChoice(savedVote);
    }
  }, [roomCode])
  useEffect(() => {
    if (!socket || !roomCode) return;
    if (!room) {
      const storedRoom = localStorage.getItem(`poll-room-${roomCode}`);
      if (storedRoom) {
        try {
          const parsedRoom = JSON.parse(storedRoom);
          setRoom(parsedRoom);
          setVotes(parsedRoom.votes);
          setUsers(Object.values(parsedRoom.users));
          setIsActive(parsedRoom.active);
        } catch (e) {
          console.error('Failed to parse stored room data');
        }
      }
      const username = localStorage.getItem('poll-username');
      if (username) {
        socket.emit('join-room', { username, roomCode });
      } else {
        navigate('/');
      }
    }

    const handleRoomJoined = (data: { roomCode: string; room: Room }) => {
      setRoom(data.room);
      setVotes(data.room.votes);
      setUsers(Object.values(data.room.users));
      setIsActive(data.room.active);
      localStorage.setItem(`poll-room-${roomCode}`, JSON.stringify(data.room));
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((data.room.endTime - now) / 1000));
      setTimeRemaining(timeLeft);
    };

    const handleVoteUpdate = (data: { votes: Record<string, number>; users: User[] }) => {
      setVotes(data.votes);
      setUsers(data.users);
      const userId = socket.id;
      const currentUser = data.users.find(user => user.id === userId);
      if (currentUser) {
        setHasVoted(currentUser.voted);
        setUserChoice(currentUser.choice);
          if (currentUser.voted && currentUser.choice) {
          localStorage.setItem(`poll-vote-${roomCode}`, currentUser.choice);
        }
      }
    };

    const handleCountdownUpdate = (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
    };

    const handleVotingEnded = (data: { votes: Record<string, number> }) => {
      setVotes(data.votes);
      setIsActive(false);
    };

    const handleUserJoined = (data: { users: User[]; votes: Record<string, number> }) => {
      setUsers(data.users);
      setVotes(data.votes);
    };

    const handleUserLeft = (data: { users: User[] }) => {
      setUsers(data.users);
    };

    socket.on('room-joined', handleRoomJoined);
    socket.on('vote-update', handleVoteUpdate);
    socket.on('countdown-update', handleCountdownUpdate);
    socket.on('voting-ended', handleVotingEnded);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('room-joined', handleRoomJoined);
      socket.off('vote-update', handleVoteUpdate);
      socket.off('countdown-update', handleCountdownUpdate);
      socket.off('voting-ended', handleVotingEnded);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, roomCode, navigate, room]);

  const handleVote = (option: string) => {
    if (!socket || !roomCode || hasVoted || !isActive) return;
    
    socket.emit('submit-vote', { roomCode, choice: option });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleCopyRoomCode = () => {
    if (!roomCode) return;
    
    navigator.clipboard.writeText(roomCode).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy room code: ', err);
      }
    );
  };

  if (!room) {
    return (
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <p>Loading poll room...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={handleBackToHome}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">Poll Room: {roomCode}</h1>
        <button 
          onClick={handleCopyRoomCode}
          className="text-white hover:text-gray-200 transition-colors relative"
          title="Copy room code"
        >
          <Share2 size={20} />
          {copied && (
            <span className="absolute top-full right-0 text-xs bg-black text-white px-2 py-1 rounded">
              Copied!
            </span>
          )}
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{room.question}</h2>
            <p className="text-sm text-gray-600">Created by {room.creator}</p>
          </div>
          <button 
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Users size={16} className="mr-1" />
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </button>
        </div>
        
        {showUsers && (
          <div className="mb-4 p-3 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2">Users in this room:</h3>
            <ul className="max-h-32 overflow-y-auto">
              {users.map(user => (
                <li key={user.id} className="flex items-center">
                  <span>{user.username}</span>
                  {user.voted && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Voted
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mb-4">
          <CountdownTimer 
            timeRemaining={timeRemaining}
            isActive={isActive}
          />
        </div>
        
        {isActive ? (
          <VoteOptions 
            options={room.options}
            onVote={handleVote}
            hasVoted={hasVoted}
            userChoice={userChoice}
          />
        ) : (
          <div className="text-center p-4 bg-gray-100 rounded-md mb-4">
            <p className="font-semibold">Voting has ended!</p>
          </div>
        )}
        
        <PollResults 
          votes={votes}
          options={room.options}
          userChoice={userChoice}
        />
      </div>
    </div>
  );
};

export default PollRoom;