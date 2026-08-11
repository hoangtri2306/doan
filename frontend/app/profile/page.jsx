"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMyPosts, getBookmarkedPosts } from '../../services/post.service';
import PostCard from '../../components/PostCard';
import {
  Edit3, BookOpen, Bookmark, ShieldAlert,
  AlertTriangle, XCircle, FileText, BookMarked
} from 'lucide-react';

/* ── Cover gradient patterns per user initial ── */
const COVER_GRADIENTS = [
  'linear-gradient(135deg, #1A7F64 0%, #0f4c35 50%, #083327 100%)',
  'linear-gradient(135deg, #2D3748 0%, #1A202C 50%, #171923 100%)',
  'linear-gradient(135deg, #553C9A 0%, #44337A 50%, #2D2057 100%)',
  'linear-gradient(135deg, #C05621 0%, #9C4221 50%, #7B341E 100%)',
  'linear-gradient(135deg, #2B6CB0 0%, #2C5282 50%, #1A365D 100%)',
  'linear-gradient(135deg, #276749 0%, #1C4532 50%, #132E24 100%)',
];

function getCoverGradient(username = '') {
  const idx = (username.charCodeAt(0) || 0) % COVER_GRADIENTS.length;
  return COVER_GRADIENTS[idx];
}

/* ── Status badge ── */
function StatusBadge({ status }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-subtle text-success border border-success/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        Hoạt động
      </span>
    );
  }
  if (status === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-warning-subtle text-warning border border-warning/20">
        <AlertTriangle className="h-3 w-3" />
        Cảnh cáo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-danger-subtle text-danger border border-danger/20">
      <XCircle className="h-3 w-3" />
      Bị khoá
    </span>
  );
}

/* ── Stat card ── */
function StatCard({ icon: Icon, value, label, colorClass = 'text-text-primary' }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-4 bg-surface border border-border rounded-2xl shadow-elevation-sm flex-1 min-w-0 transition-all hover:shadow-elevation-md hover:-translate-y-0.5">
      <Icon className={`h-4 w-4 mb-1 ${colorClass}`} strokeWidth={2} />
      <span className={`text-2xl font-bold tracking-tight leading-none ${colorClass}`}>{value}</span>
      <span className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ tab }) {
  const isStories = tab === 'stories';
  return (
    <div className="flex flex-col items-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-surface-hover border border-border flex items-center justify-center mb-2">
        {isStories
          ? <FileText className="h-9 w-9 text-text-tertiary" strokeWidth={1.5} />
          : <BookMarked className="h-9 w-9 text-text-tertiary" strokeWidth={1.5} />
        }
      </div>
      <div>
        <p className="font-semibold text-text-primary text-base">
          {isStories ? 'Chưa có bài viết nào' : 'Chưa lưu bài viết nào'}
        </p>
        <p className="text-text-secondary text-sm mt-1 max-w-xs mx-auto">
          {isStories
            ? 'Chia sẻ những suy nghĩ và câu chuyện của bạn với cộng đồng.'
            : 'Lưu các bài viết hay để đọc lại sau.'}
        </p>
      </div>
      {isStories && (
        <Link href="/create" className="btn btn-accent px-6 py-2 mt-2">
          Viết câu chuyện đầu tiên
        </Link>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('stories');
  const [fetching, setFetching] = useState(true);
  const [counts, setCounts] = useState({ stories: 0, bookmarks: 0 });
  const [countsLoaded, setCountsLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  // Load counts once
  useEffect(() => {
    if (!isAuthenticated || countsLoaded) return;
    (async () => {
      try {
        const [s, b] = await Promise.all([getMyPosts(), getBookmarkedPosts()]);
        setCounts({
          stories: (s.data || []).length,
          bookmarks: (b.data || []).length,
        });
        setCountsLoaded(true);
      } catch { /* ignore */ }
    })();
  }, [isAuthenticated, countsLoaded]);

  const fetchData = async (tab) => {
    setFetching(true);
    try {
      const { data } = tab === 'stories' ? await getMyPosts() : await getBookmarkedPosts();
      setPosts(data || []);
    } catch (err) {
      console.error(`Failed to fetch ${tab}:`, err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData(activeTab);
  }, [isAuthenticated, activeTab]);

  if (loading || !isAuthenticated) return null;

  const violationScore = user?.violationScore || 0;
  const coverGradient = getCoverGradient(user?.username);

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Hero / Cover ── */}
      <div
        className="relative w-full h-44 sm:h-56"
        style={{ background: coverGradient }}
      >
        {/* SVG dot pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Role badge top-right */}
        {user?.role === 'ADMIN' && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
              <ShieldAlert className="h-3 w-3" />
              Admin
            </span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Avatar row ── */}
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
          {/* Avatar */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-bg shadow-elevation-lg overflow-hidden bg-surface-hover flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                style={{ background: coverGradient }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* Action buttons — desktop right */}
          <div className="flex items-center gap-2 sm:pb-2">
            <Link
              href="/profile/edit"
              className="btn btn-primary px-4 py-2 gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" strokeWidth={2.5} />
              Chỉnh sửa
            </Link>
          </div>
        </div>

        {/* ── User info ── */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {user?.username || 'User'}
            </h1>
            <StatusBadge status={user?.status} />
          </div>
          <p className="text-text-secondary text-sm mb-4">{user?.email}</p>

          {/* Bio */}
          {user?.bio ? (
            <div className="relative pl-5 border-l-2 border-accent max-w-xl">
              <p className="text-text-primary leading-relaxed italic text-[15px]">
                {user.bio}
              </p>
            </div>
          ) : (
            <p className="text-text-tertiary text-sm italic">
              Chưa có bio.{' '}
              <Link href="/profile/edit" className="text-accent hover:underline not-italic font-medium">
                Thêm ngay →
              </Link>
            </p>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="flex gap-3 mb-8">
          <StatCard
            icon={BookOpen}
            value={countsLoaded ? counts.stories : '—'}
            label="Stories"
          />
          <StatCard
            icon={Bookmark}
            value={countsLoaded ? counts.bookmarks : '—'}
            label="Saved"
          />
          <StatCard
            icon={ShieldAlert}
            value={`${violationScore}/10`}
            label="Vi phạm"
            colorClass={violationScore > 0 ? 'text-danger' : 'text-text-tertiary'}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-0 border-b border-border mb-8">
          {[
            { key: 'stories', label: 'Stories của tôi', count: counts.stories },
            { key: 'bookmarks', label: 'Đã lưu', count: counts.bookmarks },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`focus-ring relative flex items-center gap-2 px-1 pb-3 mr-6 text-sm font-medium transition-all ${
                activeTab === key
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
              {countsLoaded && count > 0 && (
                <span className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold transition-colors ${
                  activeTab === key
                    ? 'bg-accent text-white'
                    : 'bg-surface-hover text-text-secondary'
                }`}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
              {activeTab === key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── Posts list ── */}
        <div className="pb-16">
          {fetching ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
              <p className="text-text-secondary text-sm">Đang tải...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-2">
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState tab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}
