"use client";

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';
import { getToken } from '../utils/token';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to the backend (BUG-003: phải kèm JWT để xác thực socket)
      // auth dạng hàm → lấy token MỚI mỗi lần connect/reconnect (tránh token hết hạn)
      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: (cb) => cb({ token: getToken() })
      });
      setSocket(socketRef.current);
      
      socketRef.current.on('connect', () => {
        socketRef.current.emit('join_user_room', user._id || user.id);
      });

      socketRef.current.on('new_notification', (data) => {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        // Optional: show a toast here if you have a toast library
      });

      return () => {
        socketRef.current.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated, user]);

  return { socket, notifications, unreadCount, setUnreadCount, setNotifications };
};
