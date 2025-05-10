import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Welcome from './pages/Welcome';
import PollRoom from './pages/PollRoom';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/room/:roomCode" element={<PollRoom />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;