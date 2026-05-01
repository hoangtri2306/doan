import { useState } from 'react';
import { Heart, Bookmark, AlertTriangle } from 'lucide-react';
import { toggleInteraction, bookmarkPost, unbookmarkPost } from '../services/interaction.service';
import { useAuth } from '../hooks/useAuth';
import ReportModal from './ReportModal';

export default function InteractionBar({ targetId, targetModel, initialLikes = 0, initialBookmarks = 0, initialIsLiked = false, initialIsBookmarked = false }) {
  const [liked, setLiked] = useState(initialIsLiked);
  const [bookmarked, setBookmarked] = useState(initialIsBookmarked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [bookmarksCount, setBookmarksCount] = useState(initialBookmarks);
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
