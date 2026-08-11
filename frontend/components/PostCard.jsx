"use client";

import Link from 'next/link';
import { useState } from 'react';
import { toggleInteraction, bookmarkPost, unbookmarkPost } from '../services/interaction.service';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Repeat, Quote, Check, Heart, Bookmark, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import MediaGrid from './MediaGrid';

/* Estimate reading time */
function readingTime(text = '') {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function PostCard({ post: initialPost, featured = false }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(initialPost.isLiked);
  const [bookmarked, setBookmarked] = useState(initialPost.isBookmarked);
  const [likesCount, setLikesCount] = useState(initialPost.likesCount || 0);
  const [bookmarksCount, setBookmarksCount] = useState(initialPost.bookmarksCount || 0);
  const [sharesCount, setSharesCount] = useState(initialPost.sharesCount || 0);
  const [revealed, setRevealed] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);

  const isRepost = !!initialPost.original_post;
  const displayPost = isRepost ? initialPost.original_post : initialPost;

  const amIAuthorOfRepost = isRepost && isAuthenticated && user?.id === initialPost.author?._id;
  const [reposted, setReposted] = useState(amIAuthorOfRepost || initialPost.isReposted || false);

  if (deleted) return null;

  const handleLike = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error("Vui lòng đăng nhập để thích bài viết"); router.push('/login'); return; }
    try {
      const newStatus = !liked;
      setLiked(newStatus);
      setLikesCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));
      await toggleInteraction(initialPost._id, 'Post', 'LIKE');
    } catch { setLiked(liked); setLikesCount(likesCount); }
  };

  const handleBookmark = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error("Vui lòng đăng nhập để lưu bài viết"); router.push('/login'); return; }
    try {
      const newStatus = !bookmarked;
      setBookmarked(newStatus);
      setBookmarksCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));
      if (newStatus) await bookmarkPost(initialPost._id);
      else await unbookmarkPost(initialPost._id);
    } catch { setBookmarked(bookmarked); setBookmarksCount(bookmarksCount); }
  };

  const handleRepost = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error("Vui lòng đăng nhập để chia sẻ bài viết"); router.push('/login'); return; }
    try {
      const api = require('../services/api').default;
      const res = await api.post(`/posts/${displayPost._id}/repost`, {});
      if (res.data.data?.action === 'unreposted') {
        setSharesCount(prev => Math.max(0, prev - 1));
        setReposted(false);
        if (amIAuthorOfRepost) setDeleted(true);
      } else {
        setSharesCount(prev => prev + 1);
        setReposted(true);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi khi chia sẻ bài viết'); }
  };

  const plainText = displayPost.content_html
    ? displayPost.content_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  const minRead = readingTime(plainText);
  const hasMedia = displayPost.media && displayPost.media.length > 0;
  const hasCover = !hasMedia && displayPost.cover_image;

  const actionBtn = "focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium tabular-nums transition-all duration-150";

  /* ─────────────────────────────────────────
     FEATURED card (first post, larger layout)
  ───────────────────────────────────────── */
  if (featured && (hasCover || hasMedia)) {
    return (
      <article className="group relative mb-8 overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        {displayPost.is_sensitive && !revealed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl border border-border bg-surface/95 p-6 text-center backdrop-blur-sm">
            <AlertTriangle className="mb-2 h-7 w-7 text-warning" strokeWidth={1.75} />
            <h4 className="mb-1 text-sm font-semibold">Nội dung nhạy cảm</h4>
            <p className="mb-4 max-w-xs text-xs text-text-secondary">Bài viết này chứa nội dung nhạy cảm.</p>
            <button onClick={e => { e.preventDefault(); e.stopPropagation(); setRevealed(true); }} className="btn btn-primary px-4 py-1.5">
              Hiển thị nội dung
            </button>
          </div>
        )}

        {/* Cover image */}
        <Link href={`/post/${displayPost.slug}`} className="block overflow-hidden" style={{ aspectRatio: '16/7' }}>
          {hasMedia ? (
            <div onClick={e => e.stopPropagation()} className="h-full">
              <MediaGrid media={displayPost.media} />
            </div>
          ) : (
            <img
              src={displayPost.cover_image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
        </Link>

        <div className="p-6">
          {isRepost && (
            <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
              <Repeat className="h-3.5 w-3.5" strokeWidth={2} />
              <Link href={`/u/${initialPost.author?.username}`} className="hover:text-text-secondary" onClick={e => e.stopPropagation()}>
                {initialPost.author?.username} đã chia sẻ
              </Link>
            </div>
          )}

          {/* Author */}
          <div className="mb-4 flex items-center gap-2.5">
            <Link href={`/u/${displayPost.author?.username}`} className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-surface-hover" onClick={e => e.stopPropagation()}>
              {displayPost.author?.avatar ? (
                <img src={displayPost.author.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-bold text-accent">
                  {displayPost.author?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
            <div>
              <Link href={`/u/${displayPost.author?.username}`} className="block text-[13px] font-semibold text-text-primary hover:underline" onClick={e => e.stopPropagation()}>
                {displayPost.author?.username}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                <span>{displayPost.createdAt ? formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true }) : 'vừa xong'}</span>
                <span>·</span>
                <span>{minRead} phút đọc</span>
              </div>
            </div>
            {displayPost.tags?.[0] && (
              <span className="ml-auto tag-pill">{displayPost.tags[0]}</span>
            )}
          </div>

          {/* Text */}
          <Link href={`/post/${displayPost.slug}`} className="block">
            {plainText && (
              <p className="clamp-fade text-base font-medium leading-relaxed text-text-primary" style={{ WebkitLineClamp: 2 }}>
                {plainText}
              </p>
            )}
          </Link>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
            <div className="-ml-2 flex items-center gap-0.5 text-text-tertiary">
              <button onClick={handleLike} className={`${actionBtn} hover:bg-red-50 hover:text-danger ${liked ? 'text-danger' : ''}`}>
                <Heart className={`h-4 w-4 ${liked ? 'fill-danger stroke-danger' : ''}`} strokeWidth={1.75} />
                {likesCount > 0 && <span>{likesCount}</span>}
              </button>
              <Link href={`/post/${displayPost.slug}#comments`} onClick={e => e.stopPropagation()} className={`${actionBtn} hover:bg-surface-hover hover:text-text-primary`}>
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <button onClick={handleBookmark} className={`${actionBtn} hover:bg-surface-hover hover:text-text-primary ${bookmarked ? 'text-accent-text' : ''}`}>
                <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-accent stroke-accent' : ''}`} strokeWidth={1.75} />
              </button>
            </div>
            <Link href={`/post/${displayPost.slug}`} className="text-xs font-semibold text-accent-text hover:underline">
              Đọc thêm →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  /* ─────────────────────────────────────────
     STANDARD card (Medium-style: text left, thumb right)
  ───────────────────────────────────────── */
  return (
    <article className="group hairline relative -mx-3 rounded-xl px-3 py-5 transition-all duration-200 hover:bg-surface-hover/50">
      {displayPost.is_sensitive && !revealed && (
        <div className="absolute inset-3 z-10 flex flex-col items-center justify-center rounded-xl border border-border bg-surface/95 p-6 text-center backdrop-blur-sm">
          <AlertTriangle className="mb-2 h-7 w-7 text-warning" strokeWidth={1.75} />
          <h4 className="mb-1 text-sm font-semibold">Nội dung nhạy cảm</h4>
          <p className="mb-4 max-w-xs text-xs text-text-secondary">Bài viết này chứa nội dung nhạy cảm.</p>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setRevealed(true); }} className="btn btn-primary px-4 py-1.5">
            Hiển thị nội dung
          </button>
        </div>
      )}

      {isRepost && (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
          <Repeat className="h-3.5 w-3.5" strokeWidth={2} />
          <Link href={`/u/${initialPost.author?.username}`} className="hover:text-text-secondary" onClick={e => e.stopPropagation()}>
            {initialPost.author?.username} đã chia sẻ
          </Link>
        </div>
      )}

      {/* Author row */}
      <div className="mb-3 flex items-center gap-2">
        <Link href={`/u/${displayPost.author?.username}`} className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-surface-hover" onClick={e => e.stopPropagation()}>
          {displayPost.author?.avatar ? (
            <img src={displayPost.author.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-accent">
              {displayPost.author?.username?.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
        <div className="flex min-w-0 items-center gap-1.5">
          <Link href={`/u/${displayPost.author?.username}`} className="truncate text-[13px] font-semibold text-text-primary hover:underline" onClick={e => e.stopPropagation()}>
            {displayPost.author?.username}
          </Link>
          <span className="text-text-tertiary">·</span>
          <span className="whitespace-nowrap text-xs text-text-tertiary">
            {displayPost.createdAt ? formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true }) : 'vừa xong'}
          </span>
          <span className="text-text-tertiary">·</span>
          <span className="whitespace-nowrap text-xs text-text-tertiary">{minRead} phút đọc</span>
        </div>
      </div>

      {/* Repost quote */}
      {isRepost && initialPost.content_html && (
        <p className="mb-2.5 line-clamp-2 border-l-2 border-accent/40 pl-3 text-sm italic text-text-secondary">
          {initialPost.content_html.replace(/<[^>]+>/g, '')}
        </p>
      )}

      {/* Main content row: text + thumbnail */}
      <Link href={`/post/${displayPost.slug}`} className="block">
        <div className={`flex gap-4 ${hasCover ? 'items-start' : ''}`}>
          {/* Text block */}
          <div className="min-w-0 flex-1">
            {plainText && (
              <p className="clamp-fade text-[15px] leading-[1.55] text-text-primary/85" style={{ WebkitLineClamp: hasCover ? 3 : 3 }}>
                {plainText}
              </p>
            )}
          </div>

          {/* Cover thumbnail (right side) */}
          {hasCover && (
            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface-hover sm:h-24 sm:w-36">
              <img
                src={displayPost.cover_image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </div>
          )}
        </div>
      </Link>

      {/* Media grid (no thumbnail overlap) */}
      {hasMedia && (
        <div className="mt-3 overflow-hidden rounded-xl" onClick={e => e.stopPropagation()}>
          <MediaGrid media={displayPost.media} />
        </div>
      )}

      {/* Footer row */}
      <div className="mt-3.5 flex items-center justify-between">
        {/* Tags */}
        <div className="flex min-w-0 items-center gap-1.5">
          {displayPost.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="-mr-2 flex items-center gap-0.5 text-text-tertiary">
          <button onClick={handleLike} className={`${actionBtn} hover:bg-red-50 hover:text-danger ${liked ? 'text-danger' : ''}`}>
            <Heart className={`h-4 w-4 ${liked ? 'fill-danger stroke-danger' : ''}`} strokeWidth={1.75} />
            {likesCount > 0 && <span>{likesCount}</span>}
          </button>

          <Link href={`/post/${displayPost.slug}#comments`} onClick={e => e.stopPropagation()} className={`${actionBtn} hover:bg-surface-hover hover:text-text-primary`}>
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
          </Link>

          <button onClick={handleBookmark} className={`${actionBtn} hover:bg-surface-hover hover:text-text-primary ${bookmarked ? 'text-accent-text' : ''}`}>
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-accent stroke-accent' : ''}`} strokeWidth={1.75} />
            {bookmarksCount > 0 && <span>{bookmarksCount}</span>}
          </button>

          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setShowRepostMenu(!showRepostMenu); }}
              className={`${actionBtn} hover:bg-accent-subtle hover:text-accent-text ${reposted ? 'text-accent-text' : ''}`}
            >
              <Repeat className="h-4 w-4" strokeWidth={1.75} />
              {sharesCount > 0 && <span>{sharesCount}</span>}
            </button>

            {showRepostMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={e => { e.preventDefault(); e.stopPropagation(); setShowRepostMenu(false); }} />
                <div className="card elevated-md animate-scale-in absolute bottom-full right-0 z-50 mb-2 w-44 overflow-hidden py-1">
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setShowRepostMenu(false); handleRepost(e); }}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-surface-hover"
                  >
                    {reposted ? <Check className="h-4 w-4 text-success" /> : <Repeat className="h-4 w-4" />}
                    <span className={reposted ? 'font-semibold text-success' : 'font-medium'}>{reposted ? 'Bỏ chia sẻ' : 'Chia sẻ'}</span>
                  </button>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setShowRepostMenu(false); alert('Sắp ra mắt!'); }}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-surface-hover"
                  >
                    <Quote className="h-4 w-4" />
                    <span className="font-medium">Trích dẫn</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
