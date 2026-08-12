import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import CommentForm from './CommentForm';
import ReportModal from './ReportModal';
import { useAuth } from '../hooks/useAuth';

export default function CommentItem({ comment, onReplyAdded }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { isAuthenticated } = useAuth();

  // BUG-022: comment bị ẩn (AI/Admin) → hiển thị placeholder thay vì return null
  // (return null làm reply của comment ẩn mất cha, cây comment bị vỡ).
  // Không cho trả lời/báo cáo vào comment ẩn.
  if (comment.is_hidden) {
    return (
      <div className={`mt-4 border-l-2 border-border pl-4 ${comment.depth > 0 ? 'ml-4' : ''}`}>
        <div className="mt-1 bg-bg-subtle p-2.5 rounded-lg border border-border">
          <p className="text-xs text-text-secondary italic">Bình luận đã bị ẩn do vi phạm tiêu chuẩn cộng đồng.</p>
        </div>
      </div>
    );
  }

  const isToxic = comment.label === 'TOXIC';
  const showSensitive = comment.is_sensitive && !revealed;

  return (
    <div className={`mt-4 border-l-2 border-border pl-4 ${comment.depth > 0 ? 'ml-4' : ''}`}>
      <div className="flex items-center space-x-2 mb-1">
        <span className="font-semibold text-sm text-text-primary">{comment.author?.username || 'Unknown'}</span>
        <span className="text-xs text-text-tertiary">{new Date(comment.createdAt).toLocaleDateString()}</span>

        {/* Toxic badge (không blur, chỉ hiện badge cảnh báo nhỏ) */}
        {isToxic && (
          <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning-subtle border border-border px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Có thể không phù hợp
          </span>
        )}

        {comment.is_sensitive && (
          <span className="flex items-center gap-1 text-xs font-medium text-danger bg-danger-subtle border border-border px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Nhạy cảm
          </span>
        )}
      </div>

      {/* Nội dung hiển thị thẳng hoặc bị blur */}
      {showSensitive ? (
        <div className="mt-1 bg-bg-subtle p-2.5 rounded-lg border border-border flex items-center justify-between gap-3">
          <p className="text-xs text-text-secondary italic">Bình luận chứa nội dung nhạy cảm.</p>
          <button
            onClick={() => setRevealed(true)}
            className="focus-ring text-xs text-warning hover:opacity-80 font-semibold whitespace-nowrap active:scale-95 transition-all"
          >
            Hiển thị
          </button>
        </div>
      ) : (
        <p className="text-sm text-text-primary leading-relaxed">{comment.content}</p>
      )}

      <div className="mt-2 flex items-center space-x-4">
        {comment.depth < 3 && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="focus-ring text-xs text-text-secondary hover:text-text-primary font-medium"
          >
            Trả lời
          </button>
        )}
        <button
          onClick={() => {
            if (!isAuthenticated) return alert('Vui lòng đăng nhập trước');
            setIsReportModalOpen(true);
          }}
          className="focus-ring flex items-center space-x-1 text-xs text-text-secondary hover:text-danger font-medium transition-colors"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Báo cáo</span>
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
