"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { unreadCount, setUnreadCount, notifications, setNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      const unread = res.data.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const getNotificationText = (n) => {
    const sender = n.sender?.username || 'Ai đó';
    switch (n.type) {
      case 'LIKE': return `${sender} đã thích bài viết của bạn`;
      case 'COMMENT': return `${sender} đã bình luận bài viết của bạn`;
      case 'REPOST': return `${sender} đã chia sẻ bài viết của bạn`;
      case 'FOLLOW': return `${sender} đã theo dõi bạn`;
      default: return `${sender} đã tương tác với bạn`;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative text-gray-500 hover:text-gray-900 focus:outline-none p-1"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-violet-600 hover:text-violet-800 font-medium"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Không có thông báo nào</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  onClick={() => !notif.is_read && handleMarkAsRead(notif._id)}
                  className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex gap-3 ${!notif.is_read ? 'bg-violet-50/30' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    {notif.sender?.avatar_url || notif.sender?.avatar ? (
                      <img src={notif.sender.avatar_url || notif.sender.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-600 font-bold">
                        {notif.sender?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {getNotificationText(notif)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-violet-600 mt-1.5 shrink-0"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
