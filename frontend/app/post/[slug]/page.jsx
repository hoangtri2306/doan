"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPostBySlug } from '../../../services/post.service';
import { getComments } from '../../../services/comment.service';
import { deletePost } from '../../../services/post.service';
import InteractionBar from '../../../components/InteractionBar';
import CommentForm from '../../../components/CommentForm';
import CommentItem from '../../../components/CommentItem';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import MediaGrid from '../../../components/MediaGrid';

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPostAndComments = async () => {
    try {
      const { data: postData } = await getPostBySlug(params.slug);
      setPost(postData);
      if (postData?._id) {
        const { data: commentData } = await getComments(postData._id);
        setComments(commentData || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [params.slug]);

  if (loading) return <div className="text-center py-20">Loading post...</div>;
  if (!post) return <div className="text-center py-20">Post not found.</div>;

  // Build comment tree
  const commentMap = {};
  const rootComments = [];
  comments.forEach(c => {
    commentMap[c._id] = { ...c, children: [] };
  });
  comments.forEach(c => {
    if (c.parent_id && commentMap[c.parent_id]) {
      commentMap[c.parent_id].children.push(commentMap[c._id]);
    } else {
      rootComments.push(commentMap[c._id]);
    }
  });

  const renderCommentTree = (commentNodes) => {
    return commentNodes.map(node => (
      <div key={node._id}>
        <CommentItem comment={node} onReplyAdded={fetchPostAndComments} />
        {node.children && node.children.length > 0 && (
          <div className="mt-2">
            {renderCommentTree(node.children)}
          </div>
        )}
      </div>
    ));
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post._id);
        router.push('/');
      } catch (error) {
        alert('Failed to delete post');
      }
    }
  };

  return (
    <article className="max-w-2xl mx-auto py-8">
      <div className="flex justify-end items-center mb-6">
        {user?.id === post.author?._id && (
          <div className="flex space-x-4 shrink-0">
            <button 
              onClick={() => router.push(`/edit/${post.slug}`)}
              className="text-[#1a8917] hover:text-[#156d12] text-sm font-medium"
            >
              Edit Post
            </button>
            <button 
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Delete Post
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3 mb-8">
        <Link href={`/u/${post.author?.username}`} className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl text-gray-500">{post.author?.username?.charAt(0).toUpperCase()}</span>
          )}
        </Link>
        <div>
          <Link href={`/u/${post.author?.username}`} className="text-gray-900 font-medium hover:text-[#1a8917] transition-colors">{post.author?.username}</Link>
          <div className="flex text-sm text-gray-500 space-x-2 mt-0.5">
            <span>
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Vừa xong'}
            </span>
          </div>
        </div>
      </div>

      <div 
        className="prose prose-lg max-w-none text-gray-800 font-serif leading-relaxed mb-6"
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />

      {post.media && post.media.length > 0 && (
        <div className="mb-8">
          <MediaGrid media={post.media} />
        </div>
      )}

      <InteractionBar 
        targetId={post._id} 
        targetModel="Post" 
        initialLikes={post.likesCount}
        initialBookmarks={post.bookmarksCount}
        initialIsLiked={post.isLiked}
        initialIsBookmarked={post.isBookmarked}
        initialShares={post.sharesCount}
        initialIsReposted={post.isReposted}
      />

      {/* Comments Section */}
      <section className="mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Responses ({comments.length})</h3>
        
        <div className="mb-8">
          <CommentForm postId={post._id} onSuccess={fetchPostAndComments} />
        </div>

        <div className="space-y-6">
          {renderCommentTree(rootComments)}
        </div>
      </section>
    </article>
  );
}
