import { useState } from 'react';
import { Heart, Bookmark, AlertTriangle, Repeat, Quote, Check } from 'lucide-react';
import { toggleInteraction, bookmarkPost, unbookmarkPost } from '../services/interaction.service';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ReportModal from './ReportModal';

export default function InteractionBar({ targetId, targetModel, initialLikes = 0, initialBookmarks = 0, initialIsLiked = false, initialIsBookmarked = false, initialShares = 0, initialIsReposted = false }) {
  const [liked, setLiked] = useState(initialIsLiked);
  const [bookmarked, setBookmarked] = useState(initialIsBookmarked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [bookmarksCount, setBookmarksCount] = useState(initialBookmarks);
  const [sharesCount, setSharesCount] = useState(initialShares);
  const [reposted, setReposted] = useState(initialIsReposted);
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleAuthRedirect = (action) => {
    toast.error(`Vui lòng đăng nhập để thực hiện thao tác này`);
    router.push('/login');
  };

  const handleLike = async () => {
    if (!isAuthenticated) return handleAuthRedirect('like stories');
    try {
      const newStatus = !liked;
      setLiked(newStatus);
      setLikesCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));
      await toggleInteraction(targetId, targetModel, 'LIKE');
    } catch (error) {
      setLiked(liked);
      setLikesCount(likesCount);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return handleAuthRedirect('bookmark stories');
    try {
      const newStatus = !bookmarked;
      setBookmarked(newStatus);
      setBookmarksCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));

      if (newStatus) {
        await bookmarkPost(targetId);
      } else {
        await unbookmarkPost(targetId);
      }
    } catch (error) {
      setBookmarked(bookmarked);
      setBookmarksCount(bookmarksCount);
    }
  };

  const handleRepost = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) return handleAuthRedirect('repost stories');
    try {
      const api = require('../services/api').default;
      const res = await api.post(`/posts/${targetId}/repost`, {});
      if (res.data.data?.action === 'unreposted') {
        setSharesCount(prev => Math.max(0, prev - 1));
        setReposted(false);
      } else {
        setSharesCount(prev => prev + 1);
        setReposted(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi chia sẻ bài viết');
    }
  };

  const handleReport = () => {
    if (!isAuthenticated) return handleAuthRedirect('report stories');
    setIsReportModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between py-4 border-y border-border my-6">
        <div className="flex items-center space-x-6">
          <button onClick={handleLike} className={`focus-ring flex items-center space-x-2 transition-colors ${liked ? 'text-danger' : 'text-text-secondary hover:text-danger'}`}>
            <Heart className={`w-5 h-5 ${liked ? 'fill-danger' : ''}`} strokeWidth={1.8} />
            <span className="text-sm font-semibold tabular-nums">{likesCount}</span>
          </button>
          <button onClick={handleBookmark} className={`focus-ring flex items-center space-x-2 transition-colors ${bookmarked ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-text-primary' : ''}`} strokeWidth={1.8} />
            <span className="text-sm font-semibold tabular-nums">{bookmarksCount}</span>
          </button>

          {targetModel === 'Post' && (
            <div className="relative">
              <button
                onClick={() => setShowRepostMenu(!showRepostMenu)}
                className={`focus-ring flex items-center space-x-2 transition-colors ${reposted ? 'text-accent-text' : 'text-text-secondary hover:text-accent-text'}`}
              >
                <Repeat className={`w-5 h-5`} strokeWidth={1.8} />
                <span className="text-sm font-semibold tabular-nums">{sharesCount > 0 ? sharesCount : ''}</span>
              </button>

              {showRepostMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRepostMenu(false)}></div>
                  <div className="card elevated-md animate-scale-in absolute bottom-full left-0 mb-2 w-48 overflow-hidden py-1 z-50">
                    <button
                      onClick={(e) => {
                        setShowRepostMenu(false);
                        handleRepost(e);
                      }}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-surface-hover text-sm font-medium text-text-primary transition-colors"
                    >
                      {reposted ? <Check className="w-4 h-4 text-accent-text" /> : <Repeat className="w-4 h-4" />}
                      <span className={reposted ? "text-accent-text font-semibold" : "font-semibold"}>{reposted ? 'Bỏ chia sẻ' : 'Chia sẻ'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowRepostMenu(false);
                        toast('Tính năng trích dẫn sắp ra mắt!');
                      }}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-surface-hover text-sm font-medium text-text-primary transition-colors"
                    >
                      <Quote className="w-4 h-4" />
                      <span className="font-semibold">Trích dẫn</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <button onClick={handleReport} className="focus-ring flex items-center space-x-2 text-text-secondary hover:text-danger transition-colors group">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Báo cáo</span>
        </button>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={targetId}
        targetModel={targetModel}
      />
    </>
  );
}
