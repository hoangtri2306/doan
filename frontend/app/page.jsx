"use client";

import { useEffect, useState } from 'react';
import { getPosts } from '../services/post.service';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data } = await getPosts(0, 20, selectedTag);
        setPosts(data || []);
      } catch (error) {
        console.error("Failed to load posts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [selectedTag]);

  const uniqueTags = Array.from(new Set(posts.flatMap(post => post.tags || []))).slice(0, 10);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12 border-b border-gray-100 pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Stay curious.</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl">
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedTag ? `Posts tagged with "${selectedTag}"` : 'Latest Posts'}
            </h1>
            {selectedTag && (
              <button 
                onClick={() => setSelectedTag('')}
                className="text-sm text-[#1a8917] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
          {posts.length === 0 && <p className="text-gray-500">No posts available.</p>}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Recommended topics</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueTags.map(tag => (
                <span 
                  key={tag} 
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${selectedTag === tag ? 'bg-[#1a8917] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
