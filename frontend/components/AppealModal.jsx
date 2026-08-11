"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, X, AlertTriangle, CheckCircle, Loader2, FileText, MessageSquare } from 'lucide-react';
import api from '../services/api';

export default function AppealModal({ target, onClose, onSuccess }) {
  const [reason, setReason]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState('');
  const [displayContent, setDisplayContent] = useState(null);
  const [fetchingContent, setFetchingContent] = useState(true);

  const { entity_id, entity_model, ai_label, spam_score, toxicity_score, content_preview } = target;
  const targetType = entity_model === 'Post' ? 'bài viết' : 'bình luận';
  const scoreValue = ai_label === 'SPAM' ? spam_score : toxicity_score;
  const scorePct   = Math.round((scoreValue || 0) * 100);
  const isSpam     = ai_label === 'SPAM';

  useEffect(() => {
    const fetchContent = async () => {
      // Nếu không có entity_id, dùng content_preview từ metadata
      if (!entity_id) {
        setDisplayContent(content_preview || null);
        setFetchingContent(false);
        return;
      }
      try {
        let text = '';
        if (entity_model === 'Post') {
          const res = await api.get(`/posts/${entity_id}/content`);
          const post = res.data.data;
          const title = post.title && post.title !== 'No Title' ? post.title : '';
          const body  = post.content_html
            ? post.content_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
            : '';
          text = [title, body].filter(Boolean).join('\n').trim();
        } else {
          const res = await api.get(`/comments/${entity_id}`);
          text = res.data.data?.content || '';
        }
        setDisplayContent(text || content_preview || null);
      } catch {
        setDisplayContent(content_preview || null);
      } finally {
        setFetchingContent(false);
      }
    };
    fetchContent();
  }, [entity_id, entity_model, content_preview]);

  const handleSubmit = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Vui lòng nhập lý do kháng cáo (tối thiểu 10 ký tự).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/appeals', {
        target_id: entity_id,
        target_model: entity_model,
        ai_label,
        ai_spam_score: spam_score || 0,
        ai_toxicity_score: toxicity_score || 0,
        reason: reason.trim()
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Portal: render vào document.body để thoát khỏi stacking context của navbar
  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div className="flex min-h-full items-center justify-center p-4 py-8">
        <div className="card elevated-lg animate-scale-in w-full max-w-lg">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-warning" />
              <h2 className="text-base font-semibold text-text-primary">Gửi kháng cáo</h2>
            </div>
            <button onClick={onClose} className="btn btn-ghost h-8 w-8 p-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle className="w-14 h-14 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Đã gửi kháng cáo!</h3>
              <p className="text-sm text-text-secondary mb-5">
                Admin sẽ xem xét và thông báo kết quả sớm nhất có thể.
              </p>
              <a href="/appeals" className="btn btn-primary inline-flex px-5 py-2.5">
                Xem kháng cáo của tôi →
              </a>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-4">

              {/* 1. AI verdict */}
              <div className={`rounded-lg p-4 flex gap-3 border ${isSpam ? 'bg-warning-subtle border-warning/25' : 'bg-danger-subtle border-danger/25'}`}>
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSpam ? 'text-warning' : 'text-danger'}`} />
                <div>
                  <p className={`text-sm font-semibold ${isSpam ? 'text-warning' : 'text-danger'}`}>
                    {targetType.charAt(0).toUpperCase() + targetType.slice(1)} của bạn bị hệ thống phát hiện là{' '}
                    <span className="font-bold">{ai_label || 'vi phạm'}</span>
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Độ tin cậy: <span className="font-semibold">{scorePct}%</span> · Nội dung đã bị ẩn
                  </p>
                </div>
              </div>

              {/* 2. Nội dung gốc */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-subtle border-b border-border">
                  {entity_model === 'Post'
                    ? <FileText className="w-4 h-4 text-text-secondary" />
                    : <MessageSquare className="w-4 h-4 text-text-secondary" />}
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {entity_model === 'Post' ? 'Bài viết bạn đã đăng' : 'Bình luận bạn đã viết'}
                  </p>
                </div>
                <div className="px-4 py-3 min-h-[52px]">
                  {fetchingContent ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="skeleton h-3 w-full" />
                      <div className="skeleton h-3 w-4/5" />
                    </div>
                  ) : displayContent ? (
                    <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                      {displayContent.slice(0, 400)}
                      {displayContent.length > 400 && <span className="text-text-secondary italic"> ...(rút gọn)</span>}
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary italic">Không thể tải nội dung gốc.</p>
                  )}
                </div>
              </div>

              {/* 3. Lý do kháng cáo */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Lý do kháng cáo <span className="text-danger">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Giải thích tại sao bạn cho rằng AI đã nhận định sai về nội dung này..."
                  rows={3}
                  maxLength={500}
                  className="input-field resize-none"
                />
                <div className="flex justify-between mt-1">
                  {error && <p className="text-xs text-danger">{error}</p>}
                  <p className="text-xs text-text-tertiary ml-auto">{reason.length}/500</p>
                </div>
              </div>

              <p className="text-xs text-text-secondary">
                📌 Admin sẽ xem xét trong vòng 24 giờ và thông báo kết quả qua hệ thống.
              </p>

              <div className="flex items-center justify-end gap-2 border-t border-border-subtle -mx-5 px-5 pt-4">
                <button onClick={onClose} className="btn btn-secondary flex-1 py-2.5">
                  Huỷ
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !reason.trim()}
                  className="btn btn-primary flex-1 py-2.5"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</> : 'Gửi kháng cáo'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
