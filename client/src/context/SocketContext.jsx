import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { USER_AVATARS, USER_COLORS } from '../types';

const SocketContext = createContext(null);

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

function getOrCreateLocalUser() {
  const saved = sessionStorage.getItem('syncspace_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved user from sessionStorage', e);
    }
  }

  const randomAvatar = USER_AVATARS[Math.floor(Math.random() * USER_AVATARS.length)];
  const randomColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
  const randomNum = Math.floor(100 + Math.random() * 900);
  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: `Explorer #${randomNum}`,
    avatar: randomAvatar,
    color: randomColor
  };

  sessionStorage.setItem('syncspace_user', JSON.stringify(newUser));
  return newUser;
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(getOrCreateLocalUser);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      console.log(`[Socket] Connected to server (${s.id})`);
      setIsConnected(true);
      s.emit('user:join', currentUser);
    });

    s.on('disconnect', (reason) => {
      console.warn(`[Socket] Disconnected from server (${reason})`);
      setIsConnected(false);
    });

    s.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setIsConnected(false);
    });

    s.on('presence:update', (users) => {
      setOnlineUsers(users || []);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const updateProfile = (newProfile) => {
    const updated = { ...currentUser, ...newProfile };
    setCurrentUser(updated);
    sessionStorage.setItem('syncspace_user', JSON.stringify(updated));
    if (socket && isConnected) {
      socket.emit('user:profile_update', updated);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        currentUser,
        onlineUsers,
        updateProfile
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
