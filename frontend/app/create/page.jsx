"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createPost } from '../../services/post.service';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const { data } = await createPost({
        title,
        content_html: `<p>${content.replace(/\n/g, '<br/>')}</p>`,
        content_json: { text: content },
        tags: tagArray
      });
      router.push(`/post/${data.slug}`);
    } catch (error) {
      alert("Failed to create post");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Title"
          className="w-full text-5xl font-serif font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 px-0 outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)..."
          className="w-full text-lg font-medium text-gray-700 placeholder-gray-400 bg-transparent border-b border-gray-200 focus:border-[#1a8917] focus:outline-none pb-2 transition-colors"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <textarea
          placeholder="Tell your story..."
          rows="15"
          className="w-full text-xl font-serif text-gray-800 placeholder-gray-300 border-none focus:ring-0 px-0 resize-none outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-[#1a8917] hover:bg-[#156d12] text-white px-6 py-2 rounded-full font-medium transition-colors">
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}
