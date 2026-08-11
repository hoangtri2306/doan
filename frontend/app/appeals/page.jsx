"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ShieldAlert, CheckCircle, XCircle, Clock, FileText, MessageSquare } from 'lucide-react';
import Link from 'next/link';

function StatusCard({ appeal }) {
  const statusConfig = {
    PENDING:  { icon: <Clock className="w-4 h-4" />, textClass: 'text-warning', bgClass: 'bg-warning-subtle', label: 'Đang chờ xét' },
    APPROVED: { icon: <CheckCircle className="w-4 h-4" />, textClass: 'text-success', bgClass: 'bg-success-subtle', label: 'Được chấp nhận' },
    REJECTED: { icon: <XCircle className="w-4 h-4" />, textClass: 'text-danger', bgClass: 'bg-danger-subtle', label: 'Bị từ chối' },
  };
  const cfg = statusConfig[appeal.status] || statusConfig.PENDING;
  const isPost = appeal.target_model === 'Post';

  // Lấy nội dung gốc
  const originalContent = isPost
    ? (appeal.target_id?.title
        ? `${appeal.target_id.title}\n\n${appeal.target_id?.content_html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || ''}`
        : appeal.target_id?.content_html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Nội dung không còn khả dụng')
    : (appeal.target_id?.content || 'Nội dung không còn khả dụng');

  const aiScorePct = Math.round(
    (appeal.ai_label === 'SPAM' ? appeal.ai_spam_score : appeal.ai_toxicity_score) * 100
  );

  const aiBadgeClass = appeal.ai_label === 'SPAM' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger';
  const resultClass = appeal.status === 'APPROVED' ? 'bg-success-subtle border-success/20 text-success' : 'bg-danger-subtle border-danger/20 text-danger';

  return (
    <div className="card overflow-hidden">

      {/* Status bar */}
      <div className={`flex items-center justify-between px-5 py-3 border-b border-border-subtle ${cfg.bgClass}`}>
        <div className={`flex items-center gap-2 ${cfg.textClass}`}>
          {cfg.icon}
          <span className="text-sm font-semibold">{cfg.label}</span>
        </div>
        <span className="text-xs text-text-secondary">
          {formatDistanceToNow(new Date(appeal.createdAt), { addSuffix: true, locale: vi })}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Thông tin AI phán quyết */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-hover text-text-primary">
            {isPost ? <FileText className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
            {isPost ? 'Bài viết' : 'Bình luận'}
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${aiBadgeClass}`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            AI phát hiện: {appeal.ai_label}
          </div>
          <span className="text-xs text-text-secondary">Độ tin cậy: <strong className="text-text-primary">{aiScorePct}%</strong></span>
        </div>

        {/* Nội dung gốc của user */}
        <div className="rounded-lg p-4 bg-bg-subtle border border-border">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            {isPost ? '📝 Bài viết của bạn' : '💬 Bình luận của bạn'}
          </p>
          <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
            {originalContent}
          </p>
        </div>

        {/* Lý do kháng cáo của user */}
        <div className="rounded-lg p-4 bg-bg-subtle border border-border">
          <p className="text-xs font-semibold text-accent-text uppercase tracking-wider mb-2">🗣️ Lý do kháng cáo của bạn</p>
          <p className="text-sm text-text-primary italic">"{appeal.reason}"</p>
        </div>

        {/* Kết quả (nếu đã xử lý) */}
        {appeal.status !== 'PENDING' && (
          <div className={`rounded-lg p-4 border ${resultClass}`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2">
              {appeal.status === 'APPROVED' ? '✅ Phản hồi từ Admin' : '❌ Phản hồi từ Admin'}
            </p>
            <p className="text-sm text-text-primary">
              {appeal.admin_note || (appeal.status === 'APPROVED'
                ? 'Nội dung của bạn đã được khôi phục và hiển thị lại bình thường.'
                : 'Kháng cáo không được chấp nhận sau khi xem xét.')}
            </p>
          </div>
        )}

        {/* PENDING: thông báo đang chờ */}
        {appeal.status === 'PENDING' && (
          <p className="text-xs text-text-secondary text-center">
            ⏳ Admin sẽ xem xét và phản hồi trong vòng 24 giờ
          </p>
        )}
      </div>
    </div>
  );
}

export default function MyAppealsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/appeals/my')
      .then(res => setAppeals(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const pending  = appeals.filter(a => a.status === 'PENDING').length;
  const approved = appeals.filter(a => a.status === 'APPROVED').length;
  const rejected = appeals.filter(a => a.status === 'REJECTED').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="focus-ring text-sm text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1">
            ← Về trang chủ
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary mt-2">Kháng cáo của tôi</h1>
          <p className="text-text-secondary text-sm mt-1">
            Xem lại nội dung bạn đã kháng cáo và kết quả từ admin
          </p>

          {/* Stats */}
          {appeals.length > 0 && (
            <div className="flex gap-4 mt-4">
              {pending  > 0 && <span className="text-xs font-semibold text-warning bg-warning-subtle border border-border px-3 py-1 rounded-full">⏳ {pending} đang chờ</span>}
              {approved > 0 && <span className="text-xs font-semibold text-success bg-success-subtle border border-border px-3 py-1 rounded-full">✅ {approved} được chấp nhận</span>}
              {rejected > 0 && <span className="text-xs font-semibold text-danger bg-danger-subtle border border-border px-3 py-1 rounded-full">❌ {rejected} bị từ chối</span>}
            </div>
          )}
        </div>

        {appeals.length === 0 ? (
          <div className="text-center py-20 card">
            <ShieldAlert className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="font-semibold text-text-primary">Chưa có kháng cáo nào</p>
            <p className="text-sm text-text-secondary mt-1">
              Khi nội dung của bạn bị hệ thống flag, bạn có thể gửi kháng cáo từ thông báo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appeals.map(appeal => (
              <StatusCard key={appeal._id} appeal={appeal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
