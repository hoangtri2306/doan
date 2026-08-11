"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getPostBySlug, updatePost } from '../../../services/post.service';
import { useRouter, useParams } from 'next/navigation';

export default function EditPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [post, setPost] = useState(null);
  const [fetching, setFetching] = useState(true);

  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await getPostBySlug(params.slug);
        setPost(data);
        setTitle(data.title || '');
        setContent(data.content_json?.text || '');
        setTags(data.tags?.join(', ') || '');
      } catch (err) {
        alert('Failed to load post');
        router.push('/');
      } finally {
        setFetching(false);
      }
    };
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug, router]);

  if (loading || !isAuthenticated || fetching) return <div className="text-center py-20 text-text-secondary">Loading...</div>;

  if (post && user?.id !== post.author?._id) {
    return <div className="text-center py-20 text-danger">You are not authorized to edit this post.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) return;
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      await updatePost(post._id, {
        title: '', // User wants no titles
        content_html: `<p>${content.replace(/\n/g, '<br/>')}</p>`,
        content_json: { text: content },
        tags: tagArray
      });
      router.push(`/post/${post.slug}`);
    } catch (error) {
      alert("Failed to update post");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Edit Post</h1>
        <button
          onClick={handleSubmit}
          className="btn btn-primary px-4 py-2"
        >
          Save Changes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Tags (comma separated)..."
          className="input-field"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <textarea
          placeholder="Tell your story..."
          rows="15"
          className="input-field text-base leading-relaxed resize-none min-h-[300px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </form>
    </div>
  );
}
