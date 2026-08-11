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
import { AlertTriangle } from 'lucide-react';

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);

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

  if (loading) return <div className="text-center py-20 text-text-secondary">Loading post...</div>;
  if (!post) return <div className="text-center py-20 text-text-secondary">Post not found.</div>;

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
    <article className="max-w-[680px] mx-auto py-8 px-4 sm:px-0">
      <div className="flex justify-end items-center mb-6">
        {user?.id === post.author?._id && (
          <div className="flex space-x-4 shrink-0">
            <button
              onClick={() => router.push(`/edit/${post.slug}`)}
              className="focus-ring text-accent-text hover:text-accent-hover text-sm font-medium"
            >
              Edit Post
            </button>
            <button
              onClick={handleDelete}
              className="focus-ring text-danger hover:opacity-80 text-sm font-medium"
            >
              Delete Post
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 mb-8">
        <Link href={`/u/${post.author?.username}`} className="focus-ring w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl text-text-secondary">{post.author?.username?.charAt(0).toUpperCase()}</span>
          )}
        </Link>
        <div>
          <Link href={`/u/${post.author?.username}`} className="focus-ring text-text-primary font-medium hover:text-accent-text transition-colors">{post.author?.username}</Link>
          <div className="flex text-sm text-text-secondary space-x-2 mt-0.5">
            <span>
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Vừa xong'}
            </span>
          </div>
        </div>
      </div>

      {post.is_sensitive && !revealed ? (
        <div className="my-8 p-8 border border-border bg-surface rounded-lg text-center relative overflow-hidden">
          <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">Nội dung nhạy cảm</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-4">
            Bài viết này chứa nội dung nhạy cảm được đánh dấu bởi quản trị viên. Bạn vẫn muốn xem?
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="btn btn-primary px-6 py-2"
          >
            Hiển thị nội dung
          </button>
        </div>
      ) : (
        <>
          <div
            className="prose-reader max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          {post.media && post.media.length > 0 && (
            <div className="mb-8">
              <MediaGrid media={post.media} />
            </div>
          )}
        </>
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
      <section className="mt-12 pt-8 border-t border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Responses ({comments.length})</h3>

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
