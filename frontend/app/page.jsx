"use client";

import { useEffect, useState } from 'react';
import { getPosts } from '../services/post.service';
import PostCard from '../components/PostCard';
import Link from 'next/link';
import { PenLine, Lock, TrendingUp, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function SkeletonCard() {
  return (
    <div className="hairline -mx-3 px-3 py-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="skeleton h-7 w-7 rounded-full" />
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-14 rounded" />
      </div>
      <div className="flex gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
        <div className="skeleton h-20 w-28 shrink-0 rounded-lg sm:w-36" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="skeleton h-3 w-14 rounded" />
        <div className="skeleton h-3 w-10 rounded" />
      </div>
    </div>
  );
}

/* ── Guest hero section ── */
function HeroSection() {
  return (
    <section className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-surface px-8 py-12 sm:px-12 sm:py-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-subtle opacity-60" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-accent-subtle opacity-40" />
      </div>

      <div className="relative mx-auto max-w-xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-4 py-1.5 text-xs font-semibold text-accent-text">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Nơi để ý tưởng bay xa
        </div>

        <h1
          className="mb-4 text-4xl font-bold leading-tight text-text-primary sm:text-5xl"
          style={{ fontFamily: 'var(--playfair-font), Georgia, serif', letterSpacing: '-0.025em' }}
        >
          Những câu chuyện đáng để{' '}
          <span className="gradient-text">đọc</span>.
        </h1>

        <p className="mb-8 text-[17px] leading-relaxed text-text-secondary">
          Khám phá những bài viết sâu sắc, chia sẻ ý tưởng và kết nối với cộng đồng độc giả và tác giả đam mê.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn btn-accent px-6 py-3 text-[15px]">
            Bắt đầu đọc miễn phí
          </Link>
          <Link href="/login" className="btn btn-secondary px-6 py-3 text-[15px]">
            Đăng nhập
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-10 flex items-center justify-center gap-8 border-t border-border-subtle pt-8">
          {[
            { icon: <BookOpen className="h-4 w-4" />, label: 'Stories' },
            { icon: <Users className="h-4 w-4" />, label: 'Writers' },
            { icon: <TrendingUp className="h-4 w-4" />, label: 'Topics' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-sm text-text-tertiary">
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Write CTA for authenticated users ── */
function WriteCTA() {
  return (
    <div className="mb-8 flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4">
      <div>
        <p className="text-[14px] font-semibold text-text-primary">Sẵn sàng chia sẻ câu chuyện của bạn?</p>
        <p className="text-xs text-text-secondary">Ý tưởng của bạn xứng đáng được lêng nghe.</p>
      </div>
      <Link href="/create" className="btn btn-accent px-4 py-2">
        <PenLine className="h-4 w-4" strokeWidth={2} />
        Viết
      </Link>
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLimited, setIsLimited] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await getPosts(0, 20, selectedTags);
        setPosts(res.data || []);
        setIsLimited(res.meta?.isLimited || false);
      } catch (error) {
        console.error('Failed to load posts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [selectedTags, isAuthenticated]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const uniqueTags = Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 14);

  const [featuredPost, ...restPosts] = posts;

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_260px]">

      {/* ── Main column ── */}
      <main className="min-w-0">
        {/* Hero (guests only) */}
        {!isAuthenticated && <HeroSection />}

        {/* Write CTA (auth users) */}
        {isAuthenticated && <WriteCTA />}

        {/* Feed */}
        {loading ? (
          <div>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-hover">
              <BookOpen className="h-7 w-7 text-text-tertiary" strokeWidth={1.5} />
            </div>
            <p className="text-base font-medium text-text-secondary">Chưa có stories nào.</p>
            {isAuthenticated && (
              <Link href="/create" className="link-accent mt-3 inline-block text-sm">
                Hãy là người viết đầu tiên →
              </Link>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Featured first post */}
            {featuredPost && (
              <PostCard key={featuredPost._id} post={featuredPost} featured />
            )}

            {/* Rest of feed */}
            {restPosts.length > 0 && (
              <div>
                {restPosts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}

            {/* Guest limit overlay */}
            {!isAuthenticated && isLimited && (
              <div className="relative mt-10">
                <div className="absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-bg via-bg/90 to-transparent" />
                <div className="card elevated-lg relative z-20 mx-auto max-w-md px-8 py-12 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle">
                    <Lock className="h-6 w-6 text-accent-text" strokeWidth={1.75} />
                  </div>
                  <h3
                    className="mb-3 text-2xl font-bold text-text-primary"
                    style={{ fontFamily: 'var(--playfair-font), Georgia, serif' }}
                  >
                    Xem toàn bộ bài viết
                  </h3>
                  <p className="mb-7 text-[15px] leading-relaxed text-text-secondary">
                    Tham gia cùng hàng ngàn độc giả. Truy cập mọi bài viết, theo dõi tác giả bạn yêu thích và không bỏ lỡ cập nhật nào.
                  </p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href="/register" className="btn btn-accent px-6 py-2.5">
                      Đăng ký miễn phí
                    </Link>
                    <Link href="/login" className="btn btn-secondary px-6 py-2.5">
                      Đăng nhập
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Sidebar ── */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          {/* Topics filter */}
          {uniqueTags.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Topics</h3>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="focus-ring rounded text-[11px] font-semibold text-accent-text hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uniqueTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`focus-ring tag-pill cursor-pointer ${selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA card */}
          {!isAuthenticated && (
            <div className="auth-panel-left rounded-xl p-5 text-white">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                    <line x1="16" y1="8" x2="2" y2="22"/>
                    <line x1="17.5" y1="15" x2="9" y2="15"/>
                  </svg>
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: 'var(--playfair-font), Georgia, serif' }}>Inkwell</span>
              </div>
              <p className="mb-4 text-sm text-white/80 leading-relaxed">
                Viết câu chuyện đầu tiên của bạn hôm nay. Hoàn toàn miễn phí.
              </p>
              <Link
                href="/register"
                className="block w-full rounded-lg bg-white/20 py-2 text-center text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
              >
                Bắt đầu →
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
