"use client";

import { useState } from 'react';
import { createComment } from '../services/comment.service';
import { useAuth } from '../hooks/useAuth';

export default function CommentForm({ postId, parentId = null, onSuccess }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!isAuthenticated) return alert("Please login to comment");

    setIsSubmitting(true);
    try {
      await createComment(postId, content, parentId);
      setContent('');
      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <textarea
        rows="3"
        className="w-full text-sm text-gray-900 bg-transparent border-0 focus:ring-0 placeholder-gray-400 resize-none outline-none"
        placeholder="What are your thoughts?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <div className="flex items-center justify-end border-t border-gray-100 pt-3 mt-2">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center py-2 px-4 text-xs font-medium text-white bg-[#1a8917] rounded-full hover:bg-[#156d12] focus:ring-4 focus:ring-green-200 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Posting...' : 'Respond'}
        </button>
      </div>
    </form>
  );
}
