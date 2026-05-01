"use client";

import { useState, useEffect } from 'react';
import { getAllPosts, hidePost } from '../../../services/admin.service';
import Link from 'next/link';

const VISIBILITY_STYLE = {
  PUBLIC: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  HIDDEN: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  PRIVATE: { bg: 'rgba(107,114,128,0.2)', color: '#9ca3af' },
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getAllPosts();
      setPosts(res.data || []);
    } catch {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleHide = async (id, title) => {
    if (!confirm(`Hide "${title}"?`)) return;
    setActionLoading(id);
    try {
      await hidePost(id);
      showToast('Post hidden successfully');
      fetchPosts();
    } catch {
      showToast('Failed to hide post', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = posts.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.author?.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl" style={{ background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`, color: toast.type === 'error' ? '#f87171' : '#34d399' }}>
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white">Content Management</h2>
        <p className="text-slate-500 text-sm mt-0.5">{posts.length} total posts on platform</p>
      </div>

      <div className="relative">
        <input type="text" placeholder="Search by title or author email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-4 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="col-span-6">Post Title</div>
          <div className="col-span-3">Author</div>
          <div className="col-span-2 text-center">Visibility</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading posts...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">No posts found.</div>
        ) : (
          filtered.map((post, idx) => {
            const visStyle = VISIBILITY_STYLE[post.visibility] || VISIBILITY_STYLE.PRIVATE;
            return (
              <div key={post._id} className="grid grid-cols-12 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors" style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="col-span-6 pr-4">
                  <p className="text-white text-sm font-medium line-clamp-1">{post.title}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-slate-300 text-sm truncate">{post.author?.username || post.author?.email}</p>
                </div>
                <div className="col-span-2 flex justify-center">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: visStyle.bg, color: visStyle.color }}>{post.visibility}</span>
                </div>
                <div className="col-span-1 flex justify-end gap-2">
                   {post.visibility === 'PUBLIC' && (
                     <button onClick={() => handleHide(post._id, post.title)} disabled={actionLoading === post._id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                     </button>
                   )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
