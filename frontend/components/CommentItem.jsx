import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import CommentForm from './CommentForm';
import ReportModal from './ReportModal';
import { useAuth } from '../hooks/useAuth';

export default function CommentItem({ comment, onReplyAdded }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const isSpam = comment.label === 'SPAM';
  const isToxic = comment.label === 'TOXIC';
  const isSensitive = comment.is_sensitive;

  // UI Logic based on rules
  const isBlurred = (isSpam || isSensitive) && !revealed;
  const blurLabel = isSensitive ? 'Sensitive content' : `Spam content (Score: ${comment.spam_score})`;
  
  return (
    <div className={`mt-4 border-l-2 border-gray-100 pl-4 ${comment.depth > 0 ? 'ml-4' : ''}`}>
      <div className="flex items-center space-x-2 mb-1">
        <span className="font-semibold text-sm text-gray-900">{comment.author?.username || 'Unknown'}</span>
        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
        
        {/* Toxic Warning */}
        {isToxic && (
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
            ⚠️ Warning: This comment contains potentially toxic language.
          </span>
        )}
      </div>

      <div className="relative">
        <p className={`text-sm text-gray-800 ${isBlurred ? 'blur-sm select-none' : ''}`}>
          {comment.content}
        </p>

        {isBlurred && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 cursor-pointer" onClick={() => setRevealed(true)}>
            <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full opacity-90 hover:opacity-100 transition-opacity">
              Show {blurLabel}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center space-x-4">
        {comment.depth < 3 && ( // Prevent infinite nesting depth
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-gray-500 hover:text-gray-900 font-medium"
          >
            Reply
          </button>
        )}
        <button 
          onClick={() => {
            if (!isAuthenticated) return alert('Please login first');
            setIsReportModalOpen(true);
          }}
          className="flex items-center space-x-1 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Report</span>
        </button>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        targetId={comment._id} 
        targetModel="Comment" 
      />

      {showReplyForm && (
        <div className="mt-3">
          <CommentForm 
            postId={comment.post_id} 
            parentId={comment._id} 
            onSuccess={() => {
              setShowReplyForm(false);
              if (onReplyAdded) onReplyAdded();
            }} 
          />
        </div>
      )}
    </div>
  );
}
