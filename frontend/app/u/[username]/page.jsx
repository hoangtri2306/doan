"use client";

import { useEffect, useState, use } from 'react';
import { getUserProfile } from '../../../services/user.service';
import PostCard from '../../../components/PostCard';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserPlus, MessageCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function UserProfile({ params }) {
  const { username } = use(params);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getUserProfile(username);
        setProfile(data.user);
        setPosts(data.posts || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return (
    <div className="max-w-3xl mx-auto py-20 text-center">
      <div className="w-10 h-10 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-neutral-500 text-sm">Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto py-20 text-center">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">User not found</h1>
      <p className="text-neutral-500 mb-6">{error}</p>
      <button 
        onClick={() => router.push('/')}
        className="text-sm font-semibold text-neutral-900 border border-neutral-200 px-6 py-2 rounded-full hover:bg-neutral-50 transition-all"
      >
        Go back home
      </button>
    </div>
  );

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">
        
        {/* ── Main content: Posts ── */}
        <main className="min-w-0 order-2 lg:order-1">
          <div className="mb-8 pb-4 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Stories</h2>
          </div>
          
          {posts.length > 0 ? (
            <div className="space-y-2">
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-neutral-100 rounded-2xl bg-neutral-50/50">
              <p className="text-neutral-400 text-sm">No stories published yet.</p>
            </div>
          )}
        </main>

        {/* ── Sidebar: User Info ── */}
        <aside className="order-1 lg:order-2">
          <div className="sticky top-24 space-y-8">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 border border-neutral-100 mb-5 shadow-sm">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-neutral-400">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Identity */}
              <h1 className="text-2xl font-bold text-neutral-900 mb-1">{profile.username}</h1>
              <div className="flex items-center gap-1.5 text-neutral-400 text-sm mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'Recently'}</span>
              </div>

              {/* Bio */}
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                {profile.bio || "This user hasn't written a bio yet."}
              </p>

              {/* Actions */}
              {!isOwnProfile ? (
                <div className="flex flex-col w-full gap-3">
                  <button className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-neutral-800 transition-all">
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </button>
                  <button className="flex items-center justify-center gap-2 border border-neutral-200 text-neutral-700 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-neutral-50 transition-all">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => router.push('/profile/edit')}
                  className="w-full text-center border border-neutral-200 text-neutral-700 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-neutral-50 transition-all"
                >
                  Edit profile
                </button>
              )}
            </div>

            {/* Stats (Placeholders for now) */}
            <div className="pt-8 border-t border-neutral-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-bold text-neutral-900">{posts.length}</p>
                  <p className="text-xs text-neutral-400 uppercase font-semibold">Posts</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-neutral-900">0</p>
                  <p className="text-xs text-neutral-400 uppercase font-semibold">Followers</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
