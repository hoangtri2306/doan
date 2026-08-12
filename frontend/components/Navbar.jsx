"use client";

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, PenSquare, Mail, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../services/message.service';
import { io } from 'socket.io-client';
import NotificationBell from './NotificationBell';
import { getToken } from '../utils/token';

/* ── Brand logo ── */
function InkwellLogo() {
  return (
    <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md group">
      {/* Feather quill icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
          <line x1="16" y1="8" x2="2" y2="22"/>
          <line x1="17.5" y1="15" x2="9" y2="15"/>
        </svg>
      </div>
      <span
        className="hidden sm:block text-[17px] font-bold tracking-tight text-text-primary transition-colors group-hover:text-accent"
        style={{ fontFamily: 'var(--playfair-font), Georgia, serif', letterSpacing: '-0.02em' }}
      >
        Inkwell
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  /* Scroll shadow */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchUnread = async () => {
        try {
          const { data } = await getUnreadCount();
          setUnreadMessages(data.data.count || 0);
        } catch (error) {
          console.error("Failed to fetch unread messages count");
        }
      };
      fetchUnread();

      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        // BUG-003: socket cần xác thực JWT; dạng hàm để lấy token mới mỗi lần reconnect
        auth: (cb) => cb({ token: getToken() })
      });
      socket.emit('join_user_room', user.id);
      socket.on('new_message', () => setUnreadMessages(prev => prev + 1));

      const handleMessagesRead = () => fetchUnread();
      window.addEventListener('messages_read', handleMessagesRead);

      return () => {
        socket.disconnect();
        window.removeEventListener('messages_read', handleMessagesRead);
      };
    }
  }, [isAuthenticated, user]);

  return (
    <nav
      className={`sticky top-0 z-50 border-b bg-bg/90 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? 'shadow-sm border-border' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <InkwellLogo />

        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="focus-ring mr-1 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-text-secondary transition-all hover:border-accent hover:bg-accent-subtle hover:text-accent-text"
                >
                  Admin
                </Link>
              )}

              {/* Write button */}
              <Link
                href="/create"
                className="focus-ring mr-1 hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary sm:flex"
              >
                <PenSquare className="h-4 w-4" strokeWidth={2} />
                Viết
              </Link>
              <Link
                href="/create"
                title="Write"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary sm:hidden"
              >
                <PenSquare className="h-4 w-4" strokeWidth={2} />
              </Link>

              <NotificationBell />

              {/* Messages */}
              <Link
                href="/messages"
                title="Messages"
                className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary"
              >
                <Mail className="h-4 w-4" strokeWidth={2} />
                {unreadMessages > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold leading-none text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>

              {/* Appeals */}
              <Link
                href="/appeals"
                title="Kháng cáo của tôi"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary"
              >
                <ShieldAlert className="h-4 w-4" strokeWidth={2} />
              </Link>

              {/* Avatar */}
              <Link
                href="/profile"
                title="Profile"
                className="focus-ring ml-1 flex items-center rounded-full ring-2 ring-transparent transition-all hover:ring-accent/30"
              >
                {user?.avatar || user?.avatar_url ? (
                  <img
                    src={user.avatar || user.avatar_url}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {user?.username ? user.username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                )}
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                title="Log out"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-danger-subtle hover:text-danger"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="focus-ring rounded-lg px-3.5 py-2 text-[13px] font-semibold text-text-secondary transition-all hover:text-text-primary"
              >
                Đăng nhập
              </Link>
              <Link href="/register" className="btn btn-accent px-4 py-2">
                Bắt đầu
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
