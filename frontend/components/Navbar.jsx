"use client";

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, PenSquare } from 'lucide-react';

import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold font-serif tracking-tighter">
              Blog
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="text-violet-600 hover:text-violet-800 font-semibold text-sm px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100 transition-all">
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/create" className="text-gray-500 hover:text-gray-900 flex items-center space-x-1">
                  <PenSquare className="w-5 h-5" />
                  <span className="hidden sm:inline">Write</span>
                </Link>
                <NotificationBell />
                <Link href="/profile" className="text-gray-500 hover:text-gray-900 focus:outline-none flex items-center">
                  {user?.avatar || user?.avatar_url ? (
                    <img 
                      src={user.avatar || user.avatar_url} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 hover:ring-2 hover:ring-gray-300 transition-all" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-300 hover:ring-2 hover:ring-gray-300 transition-all">
                      {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                  )}
                </Link>
                <button onClick={logout} className="text-gray-500 hover:text-red-600">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  Sign In
                </Link>
                <Link href="/register" className="bg-[#1a8917] hover:bg-[#156d12] text-white px-4 py-2 rounded-full font-medium transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
