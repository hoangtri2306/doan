"use client";

import { useState, useEffect } from 'react';
import { getConversations } from '../../services/message.service';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Search } from 'lucide-react';

export default function MessagesLayout({ children }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ⚠️ FIX: wait for auth to finish loading before fetching
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Don't fetch until auth is resolved
    if (authLoading) return;

    // Redirect if not logged in
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const { data } = await getConversations();
        setConversations(data.data || []);
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [authLoading, isAuthenticated, params.id]); // Re-fetch when switching conversations

  // Filter conversations by search
  const filtered = conversations.filter(conv => {
    if (!search.trim()) return true;
    const other = conv.participants.find(p => p._id !== user?.id);
    return other?.username?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      {/* ── Sidebar: Conversations List ── */}
      <aside
        className={`flex w-full flex-col border-r border-border bg-surface md:w-[320px] md:flex-shrink-0 ${
          params.id ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border px-5 py-4">
          <h1
            className="mb-3 text-lg font-bold tracking-tight text-text-primary"
            style={{ fontFamily: 'var(--playfair-font), Georgia, serif' }}
          >
            Messages
          </h1>
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-subtle py-2 pl-8 pr-3 text-xs font-medium text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent focus:bg-surface"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {authLoading || loading ? (
            /* Skeleton */
            <div className="space-y-1 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3">
                  <div className="skeleton h-11 w-11 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-2/3 rounded" />
                    <div className="skeleton h-2.5 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle">
                <MessageSquare className="h-6 w-6 text-accent-text" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-semibold text-text-primary">No conversations yet</p>
              <p className="mt-1 text-xs text-text-tertiary">Visit someone's profile to start a chat.</p>
              <Link
                href="/"
                className="mt-4 rounded-lg bg-accent-subtle px-4 py-2 text-xs font-semibold text-accent-text transition-colors hover:bg-accent hover:text-white"
              >
                Browse writers →
              </Link>
            </div>
          ) : (
            filtered.map(conv => {
              const otherUser = conv.participants.find(p => p._id !== user?.id);
              if (!otherUser) return null;
              const isActive = params.id === conv._id;
              const hasUnread = conv.unread_count > 0;

              return (
                <Link
                  key={conv._id}
                  href={`/messages/${conv._id}`}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-150 ${
                    isActive
                      ? 'bg-accent-subtle'
                      : 'hover:bg-surface-hover'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative h-11 w-11 shrink-0">
                    <div className="h-11 w-11 overflow-hidden rounded-full border border-border-subtle bg-surface-hover">
                      {otherUser.avatar ? (
                        <img src={otherUser.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center text-sm font-bold ${isActive ? 'bg-accent text-white' : 'text-accent'}`}>
                          {otherUser.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Online dot */}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-success" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className={`truncate text-[13px] font-semibold ${isActive ? 'text-accent-text' : 'text-text-primary'}`}>
                        {otherUser.username}
                      </p>
                      {conv.last_message && (
                        <span className={`ml-2 shrink-0 text-[10px] font-medium ${isActive ? 'text-accent-text' : 'text-text-tertiary'}`}>
                          {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className={`truncate text-xs leading-snug ${isActive ? 'font-medium text-accent-text' : hasUnread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                        {conv.last_message?.content || 'Start a conversation'}
                      </p>
                      {hasUnread && !isActive && (
                        <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main: Chat Window ── */}
      <main className={`flex flex-1 flex-col bg-surface ${!params.id ? 'hidden md:flex' : 'flex'}`}>
        {children}
      </main>
    </div>
  );
}
