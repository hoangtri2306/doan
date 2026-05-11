import { useState } from 'react';
import { Heart, Bookmark, AlertTriangle, Repeat, Quote, Check } from 'lucide-react';
import { toggleInteraction, bookmarkPost, unbookmarkPost } from '../services/interaction.service';
import { useAuth } from '../hooks/useAuth';
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

  const handleLike = async () => {
    if (!isAuthenticated) return alert('Please login first');
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
    if (!isAuthenticated) return alert('Please login first');
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
    if (!isAuthenticated) return alert('Please login first');
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
      alert(err.response?.data?.message || 'Error reposting');
    }
  };

  const handleReport = () => {
    if (!isAuthenticated) return alert('Please login first');
    setIsReportModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between py-4 border-y border-gray-100 my-6">
        <div className="flex items-center space-x-6">
          <button onClick={handleLike} className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors">
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>
          <button onClick={handleBookmark} className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors">
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-gray-900 text-gray-900' : ''}`} />
            <span className="text-sm font-medium">{bookmarksCount}</span>
          </button>
          
          {targetModel === 'Post' && (
            <div className="relative">
              <button 
                onClick={() => setShowRepostMenu(!showRepostMenu)} 
                className={`flex items-center space-x-2 transition-colors ${reposted ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
              >
                <Repeat className={`w-5 h-5 ${reposted ? 'text-green-600' : ''}`} />
                <span className="text-sm font-medium">{sharesCount > 0 ? sharesCount : ''}</span>
              </button>
              
              {showRepostMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRepostMenu(false)}></div>
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden py-1 z-50">
                    <button 
                      onClick={(e) => {
                        setShowRepostMenu(false);
                        handleRepost(e);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                    >
                      {reposted ? <Check className="w-4 h-4 text-green-600" /> : <Repeat className="w-4 h-4" />}
                      <span className={reposted ? "text-green-600" : ""}>{reposted ? 'Unrepost' : 'Repost'}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowRepostMenu(false);
                        alert('Quote feature is coming soon!');
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                    >
                      <Quote className="w-4 h-4" />
                      <span>Quote Repost</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <button onClick={handleReport} className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-medium">Report</span>
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
