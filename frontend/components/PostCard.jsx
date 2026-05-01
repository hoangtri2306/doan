"use client";

import Link from 'next/link';
import { useState } from 'react';
import { toggleInteraction, bookmarkPost, unbookmarkPost } from '../services/interaction.service';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle } from 'lucide-react';

export default function PostCard({ post: initialPost }) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(initialPost.isLiked);
  const [bookmarked, setBookmarked] = useState(initialPost.isBookmarked);
  const [likesCount, setLikesCount] = useState(initialPost.likesCount || 0);
  const [bookmarksCount, setBookmarksCount] = useState(initialPost.bookmarksCount || 0);
  const [revealed, setRevealed] = useState(false);

  const isSensitive = initialPost.is_sensitive && !revealed;

  // Simple reading time estimator if not provided
  const readingTime = initialPost.reading_time || Math.ceil(JSON.stringify(initialPost.content_json).length / 1000) || 1;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return alert('Please login first');
    try {
      const newStatus = !liked;
      setLiked(newStatus);
      setLikesCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));
      await toggleInteraction(initialPost._id, 'Post', 'LIKE');
    } catch (error) {
      setLiked(liked);
      setLikesCount(likesCount);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return alert('Please login first');
    try {
      const newStatus = !bookmarked;
      setBookmarked(newStatus);
      setBookmarksCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));
      if (newStatus) await bookmarkPost(initialPost._id);
      else await unbookmarkPost(initialPost._id);
    } catch (error) {
      setBookmarked(bookmarked);
      setBookmarksCount(bookmarksCount);
    }
  };

  return (
    <div className="group/card border-b border-gray-100 py-8 mb-4 transition-all hover:bg-gray-50/50 -mx-4 px-4 rounded-2xl relative">
      {isSensitive && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-2xl cursor-pointer p-6 text-center" onClick={() => setRevealed(true)}>
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-gray-900 font-bold">Sensitive Content</p>
          <p className="text-gray-500 text-xs mt-1">This post may contain sensitive material. Click to view.</p>
        </div>
      )}
      <div className={`flex items-center space-x-2 mb-3 ${isSensitive ? 'blur-sm select-none' : ''}`}>
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-gray-100 group-hover/card:ring-gray-200 transition-all">
          {initialPost.author?.avatar ? (
            <img src={initialPost.author.avatar} alt={initialPost.author.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-500 font-bold">{initialPost.author?.username?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-sm text-gray-800 font-semibold hover:underline cursor-pointer">{initialPost.author?.username}</span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">{new Date(initialPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
      
      <div className={`flex gap-6 ${isSensitive ? 'blur-sm select-none' : ''}`}>
        <div className="flex-1 min-w-0">
          <Link href={`/post/${initialPost.slug}`} className="block">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover/card:text-gray-700 leading-tight transition-colors">
              {initialPost.title}
            </h2>
            <div className="text-gray-600 line-clamp-2 mb-4 text-sm md:text-base leading-relaxed">
              {initialPost.content_html ? initialPost.content_html.replace(/<[^>]+>/g, ' ').substring(0, 200) + '...' : 'Read more...'}
            </div>
          </Link>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              {initialPost.tags && initialPost.tags.length > 0 && (
                <div className="flex space-x-2">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full whitespace-nowrap group-hover/card:bg-gray-200 transition-colors">
                    {initialPost.tags[0]}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-400 whitespace-nowrap font-medium">{initialPost.reading_time || readingTime} min read</span>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-400">
               <button onClick={handleLike} className="flex items-center space-x-1.5 transition-colors hover:text-red-500">
                  <svg className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium">{likesCount}</span>
               </button>
               <button onClick={handleBookmark} className="flex items-center space-x-1.5 transition-colors hover:text-gray-900">
                  <svg className={`w-5 h-5 ${bookmarked ? 'fill-gray-900 text-gray-900' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="text-sm font-medium">{bookmarksCount}</span>
               </button>
            </div>
          </div>
        </div>

        {initialPost.cover_image && (
          <div className="hidden sm:block w-24 h-24 md:w-40 md:h-28 rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-100 flex-shrink-0">
            <img src={initialPost.cover_image} alt="" className="w-full h-full object-cover transition-transform group-hover/card:scale-105" />
          </div>
        )}
      </div>
    </div>
  );
}
