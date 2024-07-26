import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { useSocket } from './Providers/SocketProvider';

function App() {
  const [formData, setFormData] = useState({ email: "", roomId: "" });
  const navigate = useNavigate();
  const socket = useSocket();

  const handleJoinMeeting = () => {
    if (!formData.email || !formData.roomId) {
      console.log("Please provide both fields.");
      return;
    }
    socket.emit("join-room", formData);
  };

  const handleRoomJoin = useCallback(({ email, roomId }) => {
    navigate(`/room/${roomId}`);
  }, [navigate]);


  useEffect(() => {
    socket.on("join-room", handleRoomJoin);

    return () => {
      socket.off("join-room", handleRoomJoin);
    };
  }, [socket, handleRoomJoin]);

  return (
    <div className="container">
      <div className='input-container'>
        <h1>Join Meeting Now</h1>
        <input
          type='text'
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder='Enter Email'
        />
        <input
          type='text'
          onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
          placeholder='Enter Room Id'
        />
        <button onClick={handleJoinMeeting} className='button'>Join</button>
      </div>
    </div>
  );
}

export default App;
