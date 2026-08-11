"use client";

import { useState } from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { createReport } from '../services/report.service';

const PREDEFINED_REASONS = [
  "Spam hoặc nội dung gây hiểu lầm",
  "Quấy rối hoặc phát ngôn thù địch",
  "Nội dung không phù hợp",
  "Bạo lực hoặc hành vi nguy hiểm",
  "Vi phạm bản quyền",
  "Khác"
];

export default function ReportModal({ isOpen, onClose, targetId, targetModel }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const targetLabel = targetModel === 'Post' ? 'bài viết' : targetModel === 'Comment' ? 'bình luận' : targetModel;

  const handleSubmit = async () => {
    const finalReason = selectedReason === "Khác" ? customReason : selectedReason;
    if (!finalReason) return alert("Vui lòng chọn hoặc nhập lý do");

    setLoading(true);
    try {
      await createReport({ target_id: targetId, target_model: targetModel, reason: finalReason });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setSelectedReason("");
        setCustomReason("");
      }, 2000);
    } catch (error) {
      alert("Không thể gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in p-4">
      <div className="card elevated-lg animate-scale-in w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-semibold text-text-primary">Báo cáo {targetLabel}</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost h-8 w-8 p-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {submitted ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-success-subtle text-success rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">Cảm ơn bạn!</h4>
              <p className="text-text-secondary">Báo cáo của bạn đã được gửi và sẽ được đội ngũ xem xét.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary mb-4 font-medium italic">Lý do bạn báo cáo nội dung này?</p>

              <div className="grid grid-cols-1 gap-2">
                {PREDEFINED_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`focus-ring text-left px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                      selectedReason === reason
                        ? 'border-accent bg-accent text-white'
                        : 'border-border bg-bg-subtle text-text-primary hover:border-text-tertiary hover:bg-surface'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {selectedReason === "Khác" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề..."
                  className="input-field min-h-[100px] resize-none"
                />
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !selectedReason || (selectedReason === "Khác" && !customReason)}
                className="btn btn-primary w-full mt-6 py-3"
              >
                {loading ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
