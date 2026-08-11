"use client";

import { useState } from 'react';
import { createComment } from '../services/comment.service';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CommentForm({ postId, parentId = null, onSuccess }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    setIsSubmitting(true);
    try {
      await createComment(postId, content, parentId);
      setContent('');
      toast.success("Bình luận đã được đăng!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Không thể đăng bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-bg-subtle border border-border rounded-lg p-6 text-center">
        <p className="text-sm text-text-secondary mb-4">Tham gia thảo luận</p>
        <Link
          href="/login"
          className="btn btn-primary inline-flex px-6 py-2"
        >
          Đăng nhập để bình luận
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <textarea
        rows="3"
        className="focus-ring w-full text-sm text-text-primary bg-transparent border-0 placeholder-text-tertiary resize-none outline-none"
        placeholder="Suy nghĩ của bạn?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <div className="flex items-center justify-end border-t border-border-subtle pt-3 mt-2">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="btn btn-primary px-6 py-2"
        >
          {isSubmitting ? 'Đang đăng...' : 'Bình luận'}
        </button>
      </div>
    </form>
  );
}
