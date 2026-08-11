"use client";

import { X } from 'lucide-react';
import Link from 'next/link';

export default function UserListModal({ isOpen, onClose, title, users, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in p-4">
      <div className="card elevated-lg animate-scale-in w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost h-8 w-8 p-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-text-primary" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-1">
              {users.map(item => {
                const user = item.follower_id || item.following_id;
                return (
                  <Link
                    key={user._id}
                    href={`/u/${user.username}`}
                    onClick={onClose}
                    className="focus-ring flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-hover flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-text-secondary">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary group-hover:text-accent-text transition-colors">{user.username}</p>
                      {user.bio && <p className="text-xs text-text-secondary truncate">{user.bio}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-text-secondary text-sm">No users found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
