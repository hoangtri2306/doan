"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { updateProfile } from '../../../services/user.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, ArrowLeft, Check, Loader2, AlertCircle, X } from 'lucide-react';

function getCoverGradient(username = '') {
  const GRADIENTS = [
    'linear-gradient(135deg, #1A7F64 0%, #0f4c35 100%)',
    'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
    'linear-gradient(135deg, #553C9A 0%, #44337A 100%)',
    'linear-gradient(135deg, #C05621 0%, #9C4221 100%)',
    'linear-gradient(135deg, #2B6CB0 0%, #2C5282 100%)',
    'linear-gradient(135deg, #276749 0%, #1C4532 100%)',
  ];
  const idx = (username.charCodeAt(0) || 0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

export default function EditProfile() {
  const { user, login, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const inputRef = useRef(null);

  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarInput, setAvatarInput] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [username, setUsername] = useState(user?.username || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);

  // BUG-033: sync user→form bằng pattern "adjusting state during render" của React
  // (thay cho useEffect cũ — tránh rule react-hooks/set-state-in-effect).
  // Quan trọng: user load async (auth context), nên KHÔNG chỉ dùng initial state
  // — phải cập nhật lại khi user xuất hiện (review S5 phát hiện regression).
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    setAvatar(user?.avatar || '');
    setAvatarInput(user?.avatar || '');
    setBio(user?.bio || '');
    setUsername(user?.username || '');
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) return null;

  const coverGradient = getCoverGradient(username || user?.username);

  const handleAvatarApply = () => {
    setImgError(false);
    setAvatar(avatarInput.trim());
  };

  const handleAvatarClear = () => {
    setAvatar('');
    setAvatarInput('');
    setImgError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const res = await updateProfile({ avatar, bio, username });
      const updatedUser = res.data;
      const normalizedUser = {
        id: updatedUser.id || updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar || '',
        bio: updatedUser.bio || '',
      };
      login(normalizedUser);
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Top bar ── */}
      <div className="sticky top-16 z-10 border-b border-border bg-bg/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/profile"
            className="focus-ring inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
          <h1 className="text-sm font-semibold text-text-primary">Chỉnh sửa hồ sơ</h1>
          <button
            form="edit-profile-form"
            type="submit"
            disabled={isSubmitting}
            className="btn btn-accent px-4 py-1.5 text-xs gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : success ? (
              <Check className="h-3.5 w-3.5" />
            ) : null}
            {isSubmitting ? 'Đang lưu...' : success ? 'Đã lưu!' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2.5 mb-6 px-4 py-3 rounded-xl bg-danger-subtle border border-danger/20 text-danger text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-8">

          {/* ── Avatar section ── */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-elevation-sm">
            {/* Mini cover preview */}
            <div
              className="h-24 w-full relative"
              style={{ background: coverGradient }}
            >
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots2)" />
              </svg>
            </div>

            <div className="px-6 pb-6">
              {/* Avatar preview — overlaps cover */}
              <div className="relative -mt-12 mb-4 flex items-end gap-4">
                <div className="relative w-24 h-24 rounded-full ring-4 ring-surface shadow-elevation-md overflow-hidden bg-surface-hover flex-shrink-0">
                  {avatar && !imgError ? (
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                      style={{ background: coverGradient }}
                    >
                      {(username || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Camera overlay */}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.focus()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                    title="Đổi ảnh"
                  >
                    <Camera className="h-6 w-6 text-white" strokeWidth={1.8} />
                  </button>
                </div>

                {imgError && (
                  <p className="text-xs text-danger flex items-center gap-1 mt-8">
                    <AlertCircle className="h-3 w-3" /> URL ảnh không hợp lệ
                  </p>
                )}
              </div>

              {/* URL input */}
              <label className="block text-sm font-medium text-text-primary mb-2">
                URL ảnh đại diện
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  className="input-field flex-1 text-sm"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAvatarApply())}
                />
                {avatarInput && (
                  <button
                    type="button"
                    onClick={handleAvatarClear}
                    className="focus-ring flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-danger hover:border-danger/40 hover:bg-danger-subtle transition-all"
                    title="Xóa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAvatarApply}
                  className="btn btn-primary px-4 py-2 flex-shrink-0 text-sm"
                >
                  Áp dụng
                </button>
              </div>
              <p className="mt-2 text-xs text-text-tertiary">
                Nhập URL ảnh rồi nhấn <strong>Áp dụng</strong> để xem preview.
              </p>
            </div>
          </div>

          {/* ── Info section ── */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-elevation-sm space-y-5">
            <h2 className="text-sm font-semibold text-text-primary border-b border-border pb-3">
              Thông tin cá nhân
            </h2>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Tên người dùng
              </label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Giới thiệu bản thân
              </label>
              <textarea
                rows={4}
                className="input-field resize-none leading-relaxed"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Kể về bản thân bạn..."
              />
              <p className="mt-1.5 text-xs text-text-tertiary text-right">
                {bio.length} ký tự
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
