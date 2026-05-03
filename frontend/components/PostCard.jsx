"use client";

import Link from 'next/link';
import { useState } from 'react';
import { toggleInteraction, bookmarkPost, unbookmarkPost } from '../services/interaction.service';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post: initialPost }) {
  const { isAuthenticated, user } = useAuth();
  const [liked, setLiked] = useState(initialPost.isLiked);
  const [bookmarked, setBookmarked] = useState(initialPost.isBookmarked);
  const [likesCount, setLikesCount] = useState(initialPost.likesCount || 0);
  const [bookmarksCount, setBookmarksCount] = useState(initialPost.bookmarksCount || 0);
  const [sharesCount, setSharesCount] = useState(initialPost.sharesCount || 0);
  const [revealed, setRevealed] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const isRepost = !!initialPost.original_post;
  const displayPost = isRepost ? initialPost.original_post : initialPost;
  
  const amIAuthorOfRepost = isRepost && isAuthenticated && user?.id === initialPost.author?._id;
  const [reposted, setReposted] = useState(amIAuthorOfRepost || initialPost.isReposted || false);

  if (deleted) return null;
  const isSensitive = displayPost.is_sensitive && !revealed;



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
      
      {isRepost && (
        <div className="flex items-center text-xs text-gray-500 mb-3 font-medium">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{initialPost.author?.username} reposted</span>
        </div>
      )}
      
      {initialPost.content_html && isRepost && (
         <div className="mb-4 text-gray-700 text-sm italic border-l-2 border-gray-200 pl-3">
           {initialPost.content_html.replace(/<[^>]+>/g, '')}
         </div>
      )}
      <div className={`flex items-center space-x-2 mb-3 ${isSensitive ? 'blur-sm select-none' : ''}`}>
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-gray-100 group-hover/card:ring-gray-200 transition-all">
          {displayPost.author?.avatar ? (
            <img src={displayPost.author.avatar} alt={displayPost.author.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-500 font-bold">{displayPost.author?.username?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-sm text-gray-800 font-semibold hover:underline cursor-pointer">{displayPost.author?.username}</span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">
          {displayPost.createdAt ? formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true }) : 'Vừa xong'}
        </span>
        
      </div>
      
      <div className={`flex gap-6 ${isSensitive ? 'blur-sm select-none' : ''} ${isRepost ? 'border border-gray-100 p-4 rounded-xl mt-2' : ''}`}>
        <div className="flex-1 min-w-0">
          <Link href={`/post/${displayPost.slug}`} className="block">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover/card:text-gray-700 leading-tight transition-colors">
              {displayPost.title}
            </h2>
            <div className="text-gray-600 line-clamp-2 mb-4 text-sm md:text-base leading-relaxed">
              {displayPost.content_html ? displayPost.content_html.replace(/<[^>]+>/g, ' ').substring(0, 200) + '...' : 'Read more...'}
            </div>
          </Link>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              {displayPost.tags && displayPost.tags.length > 0 && (
                <div className="flex space-x-2">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full whitespace-nowrap group-hover/card:bg-gray-200 transition-colors">
                    {displayPost.tags[0]}
                  </span>
                </div>
              )}
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
               <button onClick={async (e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 if (!isAuthenticated) return alert('Please login first');
                 try {
                   const api = require('../services/api').default;
                   const res = await api.post(`/posts/${displayPost._id}/repost`, {});
                   if (res.data.data?.action === 'unreposted') {
                     setSharesCount(prev => Math.max(0, prev - 1));
                     setReposted(false);
                     if (amIAuthorOfRepost) {
                       setDeleted(true); // Hide the card immediately if unreposting from own feed
                     }
                   } else {
                     setSharesCount(prev => prev + 1);
                     setReposted(true);
                   }
                 } catch (err) {
                   alert(err.response?.data?.message || 'Error reposting');
                 }
               }} className={`flex items-center space-x-1.5 transition-colors ${reposted ? 'text-green-600' : 'hover:text-green-600'}`}>
                  <svg className={`w-5 h-5 ${reposted ? 'fill-green-600 text-green-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">{sharesCount}</span>
               </button>
            </div>
          </div>
        </div>

        {displayPost.cover_image && (
          <div className="hidden sm:block w-24 h-24 md:w-40 md:h-28 rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-100 flex-shrink-0">
            <img src={displayPost.cover_image} alt="" className="w-full h-full object-cover transition-transform group-hover/card:scale-105" />
          </div>
        )}
      </div>
    </div>
  );
}
