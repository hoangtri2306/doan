// BUG-027: cache TTL ngắn cho user status — tránh query DB mỗi request trong checkStatus.
// Status thay đổi hiếm khi (admin ban/mute, auto-status theo violation score) và cần áp dụng
// nhanh khi đổi → invalidate ngay tại chỗ ghi. TTL 30s là dung hòa giữa tốc độ và độ tươi.

const TTL_MS = 30 * 1000;
const MAX_ENTRIES = 10000; // review S4: chống Map phình vô hạn

// userId (String) -> { status, expiresAt }
const cache = new Map();

/**
 * Lấy status đã cache (undefined nếu chưa có hoặc hết hạn).
 * @param {string} userId
 * @returns {string|undefined}
 */
function getCachedStatus(userId) {
  const key = String(userId);
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.status;
}

/**
 * Ghi status vào cache.
 * @param {string} userId
 * @param {string} status
 */
function setCachedStatus(userId, status) {
  const key = String(userId);
  cache.set(key, {
    status,
    expiresAt: Date.now() + TTL_MS
  });
  // Review S4: dọn khi vượt ngưỡng — entry cũ (expiresAt nhỏ) bị xóa trước
  if (cache.size > MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expiresAt < now) cache.delete(k);
      if (cache.size <= MAX_ENTRIES) break;
    }
    // Vẫn quá ngưỡng (toàn entry tươi) → xóa entry lâu đời nhất
    if (cache.size > MAX_ENTRIES) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)[0];
      if (oldest) cache.delete(oldest[0]);
    }
  }
}

/**
 * Xóa cache của user — gọi ngay sau khi status bị thay đổi (admin ban/mute, auto-status).
 * @param {string|object} userId (có thể là ObjectId)
 */
function invalidateStatus(userId) {
  if (userId == null) return;
  cache.delete(String(userId));
}

module.exports = {
  getCachedStatus,
  setCachedStatus,
  invalidateStatus
};
