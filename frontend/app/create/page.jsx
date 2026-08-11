"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Video, X, Loader2, Globe, Lock, ChevronDown, Tag } from 'lucide-react';
import api from '../../services/api';

/* ── Thumb: preview ô ảnh/video ── */
function Thumb({ item, idx, total, onRemove }) {
  return (
    <div className="relative w-full h-full group bg-surface-hover overflow-hidden">
      {item.type === 'IMAGE' ? (
        <img src={item.url} className="w-full h-full object-cover" alt="" />
      ) : (
        <>
          <video src={item.url} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/25">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
            </div>
          </div>
        </>
      )}
      <button
        type="button"
        onClick={() => onRemove(idx)}
        className="focus-ring absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
      <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none select-none">
        {idx + 1}/{total}
      </div>
    </div>
  );
}

/* ── PreviewGrid ── */
function PreviewGrid({ previews, onRemove }) {
  const n = previews.length;
  if (n === 0) return null;

  const T = (idx) => (
    <Thumb key={idx} item={previews[idx]} idx={idx} total={n} onRemove={onRemove} />
  );

  let grid;
  if (n === 1) {
    grid = <div className="h-64 sm:h-96 rounded-xl overflow-hidden border border-border">{T(0)}</div>;
  } else if (n === 2) {
    grid = <div className="grid grid-cols-2 gap-1 h-56 sm:h-72 rounded-xl overflow-hidden border border-border">{T(0)}{T(1)}</div>;
  } else if (n === 3) {
    grid = (
      <div className="grid grid-cols-2 gap-1 h-56 sm:h-72 rounded-xl overflow-hidden border border-border">
        {T(0)}
        <div className="grid grid-rows-2 gap-1 h-full">{T(1)}{T(2)}</div>
      </div>
    );
  } else if (n === 4) {
    grid = (
      <div className="grid grid-cols-2 grid-rows-2 gap-1 h-56 sm:h-72 rounded-xl overflow-hidden border border-border">
        {T(0)}{T(1)}{T(2)}{T(3)}
      </div>
    );
  } else {
    grid = (
      <div className="grid grid-cols-2 gap-1 h-56 sm:h-72 rounded-xl overflow-hidden border border-border">
        <div className="grid grid-rows-2 gap-1 h-full">{T(0)}{T(1)}</div>
        <div className="grid grid-rows-3 gap-1 h-full">
          {T(2)}{T(3)}
          <div className="relative w-full h-full overflow-hidden">
            {T(4)}
            {n > 5 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold pointer-events-none">
                +{n - 5}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-tertiary">
          {n} file{n > 1 ? 's' : ''} đã chọn
        </span>
        <button
          type="button"
          onClick={() => onRemove('all')}
          className="focus-ring text-xs text-danger hover:text-danger/80 font-semibold transition-colors"
        >
          Xóa tất cả
        </button>
      </div>
      {grid}
    </div>
  );
}

/* ── Visibility selector ── */
function VisibilitySelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const opts = [
    { value: 'PUBLIC', label: 'Công khai', icon: <Globe className="h-3.5 w-3.5" />, desc: 'Mọi người đều xem được' },
    { value: 'PRIVATE', label: 'Chỉ mình tôi', icon: <Lock className="h-3.5 w-3.5" />, desc: 'Chỉ bạn xem được' },
  ];
  const current = opts.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="focus-ring flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-all hover:border-text-tertiary hover:text-text-primary"
      >
        {current.icon}
        {current.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="card elevated-md animate-scale-in absolute left-0 top-full z-50 mt-1.5 w-52 overflow-hidden py-1">
            {opts.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-hover ${value === opt.value ? 'bg-accent-subtle' : ''}`}
              >
                <span className={`mt-0.5 ${value === opt.value ? 'text-accent-text' : 'text-text-secondary'}`}>{opt.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${value === opt.value ? 'text-accent-text' : 'text-text-primary'}`}>{opt.label}</p>
                  <p className="text-[11px] text-text-tertiary">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Tag input ── */
function TagInput({ value, onChange }) {
  const [input, setInput] = useState('');
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const addTag = (raw) => {
    const tag = raw.trim().replace(/^#/, '');
    if (!tag || tags.includes(tag) || tags.length >= 5) return;
    onChange([...tags, tag].join(', '));
    setInput('');
  };

  const removeTag = (tag) => {
    onChange(tags.filter(t => t !== tag).join(', '));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-2.5 py-1 text-[12px] font-semibold text-accent-text">
          #{tag}
          <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-accent-text/60 hover:text-accent-text">
            <X size={11} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      {tags.length < 5 && (
        <input
          type="text"
          placeholder={tags.length === 0 ? "Thêm tag (vd: công nghệ)..." : "Thêm tag..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
            if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags[tags.length - 1]);
          }}
          className="min-w-24 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder-text-tertiary"
        />
      )}
    </div>
  );
}

/* ── CreatePost ── */
export default function CreatePost() {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  // Auto-focus textarea
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) return null;

  const addFiles = (fileList) => {
    const valid = Array.from(fileList).filter(f => {
      if (f.type.startsWith('video/') && f.size > 100 * 1024 * 1024) return false;
      if (f.type.startsWith('image/') && f.size > 10 * 1024 * 1024) return false;
      return f.type.startsWith('image/') || f.type.startsWith('video/');
    });
    const newPreviews = valid.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
    }));
    setMediaFiles(prev => [...prev, ...valid]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeMedia = (idx) => {
    if (idx === 'all') { setMediaFiles([]); setPreviews([]); return; }
    setMediaFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!content && mediaFiles.length === 0) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', '');
      fd.append('content', content);
      fd.append('content_html', `<p>${content.replace(/\n/g, '<br/>')}</p>`);
      fd.append('content_json', JSON.stringify({ text: content }));
      fd.append('visibility', visibility);
      tags.split(',').filter(t => t.trim()).forEach(t => fd.append('tags', t.trim()));
      mediaFiles.forEach(f => fd.append('media', f));

      const { data } = await api.post('/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push(`/post/${data.data.slug}`);
    } catch (err) {
      alert('Đăng bài thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPost = content.trim() || mediaFiles.length > 0;
  const charCount = content.length;

  return (
    <div
      className={`mx-auto max-w-2xl py-8 px-4 sm:px-0 transition-all duration-200 ${isDragging ? 'scale-[0.99]' : ''}`}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
      onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
    >
      {/* Page title */}
      <div className="mb-6 animate-fade-in-up">
        <h1
          className="text-2xl font-bold text-text-primary"
          style={{ fontFamily: 'var(--playfair-font), Georgia, serif', letterSpacing: '-0.02em' }}
        >
          Chia sẻ câu chuyện của bạn
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Viết điều gì đó đáng để đọc.</p>
      </div>

      {/* Card */}
      <div
        className={`card overflow-hidden animate-fade-in-up delay-100 relative transition-all duration-200 ${
          isDragging ? 'border-2 border-dashed border-accent shadow-lg' : 'elevated-sm'
        }`}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 backdrop-blur-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-subtle animate-float">
              <ImageIcon size={28} className="text-accent" />
            </div>
            <p className="text-lg font-bold text-text-primary">Thả ảnh / video vào đây</p>
            <p className="mt-1 text-sm text-text-tertiary">JPG, PNG, GIF, MP4, MOV · tối đa 10MB / 100MB</p>
          </div>
        )}

        {/* ── Header: author + actions ── */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {user?.avatar ? (
              <img src={user.avatar} className="h-10 w-10 rounded-full border border-border object-cover" alt="" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-text-primary leading-tight">{user?.username}</p>
              <VisibilitySelector value={visibility} onChange={setVisibility} />
            </div>
          </div>

          {/* Post button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !canPost}
            className="btn btn-accent px-5 py-2 text-sm"
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin" /> Đang đăng...</>
            ) : (
              'Đăng bài'
            )}
          </button>
        </div>

        {/* ── Content area ── */}
        <div className="px-5 pt-5 pb-3">
          <textarea
            ref={textareaRef}
            placeholder="Bạn đang nghĩ gì? Hãy chia sẻ với mọi người..."
            className="w-full resize-none border-none bg-transparent text-[16px] leading-relaxed text-text-primary outline-none placeholder-text-tertiary"
            style={{ minHeight: '140px' }}
            value={content}
            onChange={e => {
              setContent(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />

          {/* Media preview */}
          <PreviewGrid previews={previews} onRemove={removeMedia} />
        </div>

        {/* ── Tags row ── */}
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-lg border border-border-subtle bg-bg-subtle px-3.5 py-2.5">
          <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={2} />
          <TagInput value={tags} onChange={setTags} />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between border-t border-border bg-bg-subtle px-5 py-3">
          <div className="flex items-center gap-1">
            <span className="mr-2 text-xs font-semibold text-text-tertiary">Thêm:</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Thêm ảnh"
              className="btn btn-ghost gap-1.5 px-3 py-1.5 text-text-secondary hover:text-accent-text"
            >
              <ImageIcon size={17} strokeWidth={2} />
              <span className="hidden sm:inline text-xs">Ảnh</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Thêm video"
              className="btn btn-ghost gap-1.5 px-3 py-1.5 text-text-secondary hover:text-accent-text"
            >
              <Video size={17} strokeWidth={2} />
              <span className="hidden sm:inline text-xs">Video</span>
            </button>
            <input
              type="file"
              multiple
              hidden
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={e => addFiles(e.target.files)}
            />
          </div>

          {/* Character count */}
          {charCount > 0 && (
            <span className={`text-xs font-medium tabular-nums ${charCount > 2000 ? 'text-danger' : 'text-text-tertiary'}`}>
              {charCount.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Tips */}
      <p className="mt-4 text-center text-xs text-text-tertiary animate-fade-in-up delay-200">
        Kéo và thả ảnh / video vào đây · Tối đa 5 tags · Enter hoặc dấu phẩy để thêm tag
      </p>
    </div>
  );
}
