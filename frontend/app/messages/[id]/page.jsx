"use client";

import { useState, useEffect, useRef, use } from 'react';
import { getMessages, sendMessage, deleteConversation, reactToMessage } from '../../../services/message.service';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Trash2, Image as ImageIcon, Smile, MoreVertical, X } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { io } from 'socket.io-client';

/* Format time separator */
function formatSeparator(date) {
  const d = new Date(date);
  if (isToday(d)) return `Today · ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `Yesterday · ${format(d, 'HH:mm')}`;
  return format(d, 'MMM d · HH:mm');
}

/* Emoji quick-react bar */
const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function ChatWindow({ params }) {
  const { id: conversationId } = use(params);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [sending, setSending] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const EMOJIS = ['😀', '😂', '🥰', '😎', '😭', '😡', '👍', '❤️', '🔥', '✨', '🎉', '👏'];

  /* Load messages */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await getMessages(conversationId);
        setMessages(data.data.reverse() || []);

        const api = require('../../../services/api').default;
        const convRes = await api.get('/messages/conversations');
        const conv = convRes.data.data.find(c => c._id === conversationId);
        if (conv) setRecipient(conv.participants.find(p => p._id !== user?.id));

        window.dispatchEvent(new Event('messages_read'));
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMessages();
  }, [conversationId, user]);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* Socket */
  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    socketRef.current.emit('join_user_room', user?.id);

    socketRef.current.on('new_message', (data) => {
      if (data.conversation_id === conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    socketRef.current.on('message_reaction', (data) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => prev.map(m => {
          if (m._id === data.messageId) {
            const newReactions = [...(m.reactions || [])];
            const existingIdx = newReactions.findIndex(r => r.user_id === data.userId);
            if (existingIdx > -1) {
              if (newReactions[existingIdx].emoji === data.emoji) newReactions.splice(existingIdx, 1);
              else newReactions[existingIdx].emoji = data.emoji;
            } else {
              newReactions.push({ user_id: data.userId, emoji: data.emoji });
            }
            return { ...m, reactions: newReactions };
          }
          return m;
        }));
      }
    });

    return () => socketRef.current.disconnect();
  }, [conversationId, user]);

  /* Send message */
  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!content.trim() && mediaFiles.length === 0) || !recipient || sending) return;

    const messageContent = content;
    const filesToSend = [...mediaFiles];
    setContent('');
    setMediaFiles([]);
    setShowEmojiPicker(false);
    setSending(true);

    // Optimistic update
    const tempId = Date.now().toString();
    if (messageContent && filesToSend.length === 0) {
      setMessages(prev => [...prev, {
        _id: tempId,
        sender_id: user.id,
        content: messageContent,
        createdAt: new Date().toISOString(),
        media: [],
        reactions: [],
        _optimistic: true,
      }]);
    }

    try {
      const { data } = await sendMessage(recipient._id, messageContent, filesToSend);
      if (messageContent && filesToSend.length === 0) {
        setMessages(prev => prev.map(m => m._id === tempId ? data.data : m));
      } else {
        setMessages(prev => [...prev, data.data]);
      }
    } catch (err) {
      console.error('Failed to send message', err);
      if (messageContent && filesToSend.length === 0) {
        setMessages(prev => prev.filter(m => m._id !== tempId));
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleDeleteConversation = async () => {
    if (window.confirm('Bạn có chắc muốn xóa cuộc hội thoại này?')) {
      try {
        await deleteConversation(conversationId);
        router.push('/messages');
      } catch (err) {
        console.error('Failed to delete conversation', err);
      }
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      setMessages(prev => prev.map(m => {
        if (m._id === messageId) {
          const newReactions = [...(m.reactions || [])];
          const existingIdx = newReactions.findIndex(r => r.user_id === user?.id || r.user_id?._id === user?.id);
          if (existingIdx > -1) {
            if (newReactions[existingIdx].emoji === emoji) newReactions.splice(existingIdx, 1);
            else newReactions[existingIdx].emoji = emoji;
          } else {
            newReactions.push({ user_id: user?.id, emoji });
          }
          return { ...m, reactions: newReactions };
        }
        return m;
      }));
      await reactToMessage(messageId, emoji);
    } catch (err) {
      console.error('Failed to react', err);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="space-y-1.5 text-center">
          <div className="skeleton mx-auto h-3 w-24 rounded" />
          <div className="skeleton mx-auto h-2.5 w-16 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-1 flex-col bg-surface">
      {/* ── Header ── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/messages')}
            className="btn btn-ghost h-9 w-9 p-0 md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {recipient && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-border-subtle bg-surface-hover">
                  {recipient.avatar ? (
                    <img src={recipient.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-accent">
                      {recipient.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text-primary leading-tight">{recipient.username}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-[11px] font-medium text-success">Online</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="btn btn-ghost h-9 w-9 p-0"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="card elevated-md animate-scale-in absolute right-0 top-full z-50 mt-1.5 w-48 overflow-hidden py-1">
                <button
                  onClick={() => { setShowMenu(false); handleDeleteConversation(); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-subtle"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa hội thoại
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Messages area ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm font-semibold text-text-primary">Bắt đầu cuộc trò chuyện!</p>
            <p className="mt-1 text-xs text-text-tertiary">Gửi tin nhắn đầu tiên cho {recipient?.username}.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, i) => {
              const isMine = msg.sender_id === user?.id;
              const prev = messages[i - 1];
              const showSeparator = i === 0 || (new Date(msg.createdAt) - new Date(prev.createdAt) > 1000 * 60 * 5);
              const sameGroup = prev && prev.sender_id === msg.sender_id && !showSeparator;

              return (
                <div key={msg._id}>
                  {/* Time separator */}
                  {showSeparator && (
                    <div className="my-5 flex items-center gap-3">
                      <div className="flex-1 border-t border-border-subtle" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                        {formatSeparator(msg.createdAt)}
                      </span>
                      <div className="flex-1 border-t border-border-subtle" />
                    </div>
                  )}

                  <div
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${sameGroup ? 'mt-0.5' : 'mt-3'}`}
                    onMouseEnter={() => setHoveredMessageId(msg._id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className={`relative flex max-w-[80%] flex-col ${isMine ? 'items-end' : 'items-start'} md:max-w-md`}>
                      {/* Quick react bar (hover) */}
                      {hoveredMessageId === msg._id && (
                        <div className={`absolute z-20 flex items-center gap-0.5 rounded-full border border-border bg-surface px-1.5 py-1 shadow-md ${isMine ? 'right-0 bottom-full mb-1.5' : 'left-0 bottom-full mb-1.5'}`}>
                          {QUICK_EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReact(msg._id, emoji)}
                              className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-sm transition-transform hover:scale-125"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`relative px-4 py-2.5 text-sm leading-relaxed ${
                          isMine
                            ? 'rounded-2xl rounded-br-md bg-accent text-white'
                            : 'rounded-2xl rounded-bl-md border border-border bg-surface text-text-primary'
                        } ${msg._optimistic ? 'opacity-70' : ''}`}
                      >
                        {/* Media */}
                        {msg.media && msg.media.length > 0 && (
                          <div className="mb-2.5 flex flex-wrap gap-1.5 -mx-1">
                            {msg.media.map((media, idx) =>
                              media.type === 'VIDEO' ? (
                                <video key={idx} src={media.url} controls className="max-h-52 max-w-full rounded-xl object-cover" />
                              ) : (
                                <img key={idx} src={media.url} alt="" className="max-h-52 max-w-full rounded-xl object-cover" />
                              )
                            )}
                          </div>
                        )}

                        <span className="whitespace-pre-wrap break-words">{msg.content}</span>

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`absolute -bottom-3 flex items-center gap-0.5 rounded-full border border-border bg-surface px-1.5 py-0.5 shadow-sm ${isMine ? 'right-1' : 'left-1'}`}>
                            {msg.reactions.slice(0, 3).map((r, idx) => (
                              <span key={idx} className="text-xs leading-none">{r.emoji}</span>
                            ))}
                            {msg.reactions.length > 3 && (
                              <span className="text-[10px] font-bold text-text-secondary">+{msg.reactions.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Media previews ── */}
      {mediaFiles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-3">
          {mediaFiles.map((file, idx) => (
            <div key={idx} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-hover">
              {file.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-text-primary text-[10px] font-bold text-white">
                  VIDEO
                </div>
              )}
              <button
                type="button"
                onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== idx))}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Emoji picker ── */}
      {showEmojiPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
          <div className="card elevated-lg animate-scale-in absolute bottom-20 left-4 z-50 flex flex-wrap gap-1 p-2.5" style={{ width: '248px' }}>
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => { setContent(prev => prev + emoji); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-all hover:bg-surface-hover hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Input area ── */}
      <footer className="shrink-0 border-t border-border bg-surface px-4 py-3 md:px-5 md:py-4">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 rounded-2xl border border-border bg-bg-subtle px-3 py-2 transition-all focus-within:border-accent focus-within:shadow-sm"
        >
          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(v => !v)}
            className="btn btn-ghost h-8 w-8 shrink-0 p-0 text-lg"
            title="Emoji"
          >
            <Smile className="h-4.5 w-4.5 text-text-tertiary" />
          </button>

          {/* File button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost h-8 w-8 shrink-0 p-0"
            title="Đính kèm ảnh/video"
          >
            <ImageIcon className="h-4.5 w-4.5 text-text-tertiary" />
          </button>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={e => setMediaFiles(Array.from(e.target.files))}
            className="hidden"
          />

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            placeholder={`Nhắn tin cho ${recipient?.username || '...'}...`}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm text-text-primary placeholder-text-tertiary outline-none"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={(!content.trim() && mediaFiles.length === 0) || sending}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
              content.trim() || mediaFiles.length > 0
                ? 'bg-accent text-white shadow-sm hover:bg-accent-hover hover:shadow-md'
                : 'bg-surface-hover text-text-tertiary'
            }`}
          >
            {sending ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}
