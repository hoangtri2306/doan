"use client";

import { useEffect, useState, use } from 'react';
import { getUserProfile } from '../../../services/user.service';
import { toggleFollow, getFollowers, getFollowing } from '../../../services/follow.service';
import PostCard from '../../../components/PostCard';
import UserListModal from '../../../components/UserListModal';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserPlus, UserMinus, MessageCircle, Calendar, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function UserProfile({ params }) {
  const { username } = use(params);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLimited, setIsLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const { user: currentUser, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getUserProfile(username);
        setProfile(data.user);
        setPosts(data.posts || []);
        setIsLimited(data.meta?.isLimited || false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, isAuthenticated]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users");
      router.push('/login');
      return;
    }

    try {
      setFollowLoading(true);
      const { data } = await toggleFollow(profile.id);
      const isNowFollowing = data.message.includes('followed') && !data.message.includes('unfollowed');

      setProfile(prev => ({
        ...prev,
        isFollowing: isNowFollowing,
        followersCount: isNowFollowing
          ? (prev.followersCount || 0) + 1
          : Math.max(0, (prev.followersCount || 0) - 1)
      }));

      toast.success(isNowFollowing ? `Followed ${profile.username}` : `Unfollowed ${profile.username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShowFollowers = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to see followers");
      router.push('/login');
      return;
    }
    setModalTitle('Followers');
    setModalOpen(true);
    setModalLoading(true);
    try {
      const { data } = await getFollowers(profile.id);
      setModalUsers(data.data || data);
    } catch (err) {
      toast.error("Failed to load followers");
    } finally {
      setModalLoading(false);
    }
  };

  const handleShowFollowing = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to see following list");
      router.push('/login');
      return;
    }
    setModalTitle('Following');
    setModalOpen(true);
    setModalLoading(true);
    try {
      const { data } = await getFollowing(profile.id);
      setModalUsers(data.data || data);
    } catch (err) {
      toast.error("Failed to load following list");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto py-20 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-text-primary mx-auto mb-4" />
      <p className="text-text-secondary text-sm">Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">User not found</h1>
      <p className="text-text-secondary mb-6">{error}</p>
      <button
        onClick={() => router.push('/')}
        className="btn btn-secondary px-6 py-2"
      >
        Go back home
      </button>
    </div>
  );

  const isOwnProfile = currentUser?.id === profile?.id || currentUser?.username === username;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">

        {/* ── Main content: Posts ── */}
        <main className="min-w-0 order-2 lg:order-1">
          <div className="mb-8 pb-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Stories</h2>
          </div>

          {posts.length > 0 ? (
            <div className="relative">
              <div className="space-y-2">
                {posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* Guest Limit Overlay */}
              {!isAuthenticated && isLimited && (
                <div className="relative mt-10">
                  <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-bg via-bg/95 to-transparent z-10" />
                  <div className="relative z-20 py-16 px-6 text-center card max-w-lg mx-auto">
                    <div className="w-14 h-14 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-5">
                      <Lock className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 tracking-tight">Keep reading from {profile.username}</h3>
                    <p className="text-text-secondary mb-8 text-sm leading-relaxed">
                      Follow this writer and others to get unlimited access to their latest stories and newsletters.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        href="/register"
                        className="btn btn-primary px-8 py-3"
                      >
                        Sign up for free
                      </Link>
                      <Link
                        href="/login"
                        className="btn btn-secondary px-8 py-3"
                      >
                        Sign in
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-lg bg-bg-subtle">
              <p className="text-text-secondary text-sm">No stories published yet.</p>
            </div>
          )}
        </main>

        {/* ── Sidebar: User Info ── */}
        <aside className="order-1 lg:order-2">
          <div className="sticky top-24 space-y-8">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-hover border border-border mb-5">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-text-secondary">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Identity */}
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1">{profile.username}</h1>
              <div className="flex items-center gap-1.5 text-text-secondary text-sm mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'Recently'}</span>
              </div>

              {/* Bio */}
              <p className="text-sm text-text-primary leading-relaxed mb-6">
                {profile.bio || "This user hasn't written a bio yet."}
              </p>

              {/* Actions */}
              {!isOwnProfile ? (
                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={`btn px-6 py-2.5 ${profile.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {profile.isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      if (!isAuthenticated) {
                        toast.error("Please login to send messages");
                        router.push('/login');
                        return;
                      }
                      try {
                        const { createConversation } = require('../../../services/message.service');
                        const { data } = await createConversation(profile.id);
                        router.push(`/messages/${data.data._id}`);
                      } catch (err) {
                        toast.error("Could not open messages");
                      }
                    }}
                    className="btn btn-secondary px-6 py-2.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="btn btn-secondary w-full px-6 py-2.5"
                >
                  Edit profile
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="pt-8 border-t border-border">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-lg font-semibold text-text-primary tabular-nums">{posts.length}</p>
                  <p className="text-xs text-text-secondary uppercase font-semibold">Posts</p>
                </div>
                <button onClick={handleShowFollowers} className="focus-ring text-left hover:opacity-70 transition-opacity">
                  <p className="text-lg font-semibold text-text-primary tabular-nums">{profile.followersCount || 0}</p>
                  <p className="text-xs text-text-secondary uppercase font-semibold">Followers</p>
                </button>
                <button onClick={handleShowFollowing} className="focus-ring text-left hover:opacity-70 transition-opacity">
                  <p className="text-lg font-semibold text-text-primary tabular-nums">{profile.followingCount || 0}</p>
                  <p className="text-xs text-text-secondary uppercase font-semibold">Following</p>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <UserListModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalTitle}
          users={modalUsers}
          loading={modalLoading}
        />
      </div>
    </div>
  );
}
