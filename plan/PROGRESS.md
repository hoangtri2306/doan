# PROGRESS — Trạng thái xử lý bug

> ⚠️ **File này là nguồn sự thật duy nhất về tiến độ.** Mọi session PHẢI đọc file này đầu tiên và cập nhật sau mỗi bug fix.
> Status: `PENDING` (chưa làm) · `IN_PROGRESS` · `DONE` (đã fix + validate) · `DEFERRED` (hoãn, có lý do)

## Bảng trạng thái

| ID | Severity | Phase | Status | Session | Ghi chú / Commit |
|----|----------|-------|--------|---------|------------------|
| BUG-001 | Critical | P0 | ✅ DONE | S1 | sanitize-html ở create/update/repost (utils/sanitize.js) |
| BUG-002 | Critical | P0 | ✅ DONE | S1 | role luôn 'USER' khi register |
| BUG-003 | Critical | P0 | ✅ DONE | S1 | JWT handshake socket + chỉ join phòng của mình (backend + frontend) |
| BUG-004 | Critical | P0 | ✅ DONE | S1 | deleteConversation check participant |
| BUG-005 | High | P1 | ✅ DONE | S1 | _canView: PRIVATE/HIDDEN chỉ tác giả (getPost/getPostBySlug) |
| BUG-006 | High | P1 | ✅ DONE | S1 | getPostsByUser: người ngoài chỉ thấy PUBLIC |
| BUG-007 | High | P1 | ✅ DONE | S1 | getPostContent/getCommentById: chỉ owner/staff |
| BUG-008 | High | P1 | ✅ DONE | S1 | notification markAsRead/delete kèm recipient |
| BUG-009 | High | P1 | ✅ DONE | S1 | reactToMessage check participant |
| BUG-010 | High | P1 | ✅ DONE | S1 | updatePost chạy lại AI + helper _flagForModeration dùng chung |
| BUG-011 | High | P1 | ✅ DONE | S1 | express-rate-limit: authLimiter/writeLimiter/aiLimiter áp các route |
| BUG-012 | High | P1 | ✅ DONE | S1 | cookie-parser + httpOnly cookie (sameSite lax) + rotation; register trả token; frontend bỏ localStorage refresh |
| BUG-013 | High | P1 | ✅ DONE | S1 | chặn SVG, MulterError→413, giữ 100MB |
| BUG-014 | High | P1 | ✅ DONE | S1 | dùng uploadToCloudinary cho media message |
| BUG-015 | High | P1 | ✅ DONE | S1 | xử lý tags dạng array |
| BUG-016 | High | P1 | ✅ DONE | S1 | giới hạn MAX_TEXT_LENGTH=10000 trong /analyze |
| BUG-017 | Medium | P2 | 🔶 PARTIAL | S1 | Đã song song hóa getPost/getPostBySlug; aggregation $group batch còn DEFERRED |
| BUG-018 | Medium | P2 | ⏳ DEFERRED | — | Refactor gộp 2 hệ auth — session riêng |
| BUG-019 | Medium | P2 | ✅ DONE | S1 | maxlength Post/Comment/Message + json limit 5mb |
| BUG-020 | Medium | P2 | ✅ DONE | S1 | helmet (tắt CSP) + cookie sameSite lax |
| BUG-021 | Medium | P2 | ✅ DONE | S1 | production không lộ message lỗi nội bộ |
| BUG-022 | Medium | P2 | ⏳ DEFERRED | — | Comment tree pagination — session riêng |
| BUG-023 | Medium | P2 | ✅ DONE | S1 | appeal check ownership target |
| BUG-024 | Medium | P2 | ⏳ DEFERRED | — | Conversation race — session riêng |
| BUG-025 | Medium | P2 | ✅ DONE | S1 | resolveReport ẩn comment (không xóa) + ghi ModerationLog |
| BUG-026 | Medium | P2 | ✅ DONE | S1 | thêm compound indexes 6 models |
| BUG-027 | Medium | P2 | ⏳ DEFERRED | — | checkStatus cache — session riêng |
| BUG-028 | Medium | P2 | ✅ DONE | S1 | validate target tồn tại + chặn REPOST qua interact |
| BUG-029 | Medium | P2 | ✅ DONE | S1 | URL relative /uploads/... |
| BUG-030 | Medium | P2 | ✅ DONE | S1 | auth.login/refresh check BANNED + checkStatus thêm vào 5 route |
| BUG-031 | Medium | P2 | ✅ DONE | S1 | moderation chỉ xử lý PENDING + target tồn tại |
| BUG-032 | Medium | P2 | ✅ DONE | S1 | dùng socketService.getIO() |
| BUG-033 | Low | P3 | ⏳ DEFERRED | — | ESLint errors pre-existing (set-state-in-effect, unescaped entities) |
| BUG-034 | Low | P3 | ⏳ DEFERRED | — | on_event deprecated |
| BUG-035 | Low | P3 | ⏳ DEFERRED | — | username random collision |
| BUG-036 | Low | P3 | ✅ DONE | S1 | validate username 3-30 ký tự + pattern |
| BUG-037 | Low | P3 | ⏳ DEFERRED | — | user enumeration register |
| BUG-038 | Low | P3 | ⏳ DEFERRED | — | admin changeRole self-protection |
| BUG-039 | Low | P3 | ✅ DONE | S1 | chặn conversation với chính mình + recipient không tồn tại |
| BUG-040 | Low | P3 | ⏳ DEFERRED | — | admin pagination |
| BUG-041 | Low | P3 | ⏳ DEFERRED | — | morgan dev trong production |
| BUG-042 | Low | P3 | ⏳ DEFERRED | — | messages mobile |
| BUG-043 | Low | P3 | ⏳ DEFERRED | — | package.json main |
| BUG-044 | Low | P3 | ⏳ DEFERRED | — | typo "Bài đă đăng" |
| Dependency | — | P3 | ✅ DONE | S2 | `npm audit fix`: backend 0 vulns; frontend nâng next 16.2.4→^16.3.0, axios lên 1.18+, còn 0 vulns. `next build` pass toàn bộ routes |

## Session log

### Session 1 — 2026-08-12 (audit + setup + P0 + P1 + P2 phần lớn)
- ✅ Audit toàn diện (44 bugs + dependency risks).
- ✅ Tạo process files: `plan/BUGS.md`, `plan/IMPLEMENTATION_PLAN.md`, `plan/PROGRESS.md`, `CLAUDE.md`.
- ✅ Cài deps mới: `sanitize-html`, `express-rate-limit`, `cookie-parser`, `helmet` (đã vào package.json + lockfile).
- ✅ **Fix 29/44 bugs** (toàn bộ P0, toàn bộ P1, phần lớn P2):
  - **P0 (4/4):** XSS, privesc register, socket leak, IDOR conversation.
  - **P1 (12/12):** visibility, IDOR, moderation bypass, rate limit, token cookie, upload, crash bugs, AI DoS.
  - **P2 (13/16):** helmet, length limits, error middleware, indexes, appeal ownership, banned login, moderation checks, ghost interaction, io emit, v.v.
- ✅ Validate: `node --check` toàn bộ backend pass, `py_compile` AI pass, ESLint 0 error mới (chỉ warning pre-existing), test sanitize-html thực tế (strip script + onerror).
- 🔄 **BUG-017 partial:** song song hóa count query; phần aggregate batch để DEFERRED.
- ✅ **Code review (deepseek-flash) đã chạy** → fix tiếp các vấn đề review tìm ra (commit 3):
  - Socket stale token: đổi `auth` sang dạng hàm `(cb) => cb({ token: getToken() })` ở cả 3 nơi (Navbar, useSocket, messages/[id]) — messages/[id] trước đó tạo socket KHÔNG token → sẽ vỡ; đã sửa.
  - Repost title > maxlength 255 → slice(0,255).
  - Tách `interactionLimiter` (60/phút) và `messageLimiter` (60/phút) khỏi `writeLimiter` dùng chung.
  - Thêm `app.set('trust proxy')` theo env `TRUST_PROXY` (deploy sau proxy).
  - Chặn SVG giờ trả 400 (err.status) thay vì 500.
  - `sanitize.js`: scheme `data:` chỉ còn cho img (allowedSchemesByTag).
  - `api.js`: skip refresh cho các endpoint auth (login/register/refresh) — giữ thông báo lỗi login.
  - `useSocket.js`: reset socket state khi cleanup.
### Session 2 — 2026-08-12 (vá dependency)
- ✅ `npm audit fix` backend: **0 vulnerabilities** (multer, socket.io-parser, ws, mongoose, morgan, qs... đã vá qua lockfile).
- ✅ `npm audit fix` frontend + nâng `next` 16.2.4 → `^16.3.0` (fix SSRF/DoS/middleware-bypass của next, postcss, sharp): **0 vulnerabilities**.
- ✅ Validate: `node --check` backend pass, eslint không có lỗi mới (23 errors pre-existing = BUG-033), **`next build` pass toàn bộ 20 routes**.
- ✅ Commit + push: `npm audit fix` + cập nhật PROGRESS.md.

- ⏳ Còn lại 15 DEFERRED (P2 nâng cao + P3) — xem bảng trên.
- **Bước tiếp theo cho session 2:** đọc CLAUDE.md → làm các bug DEFERRED ưu tiên: BUG-018 (gộp auth), BUG-022 (comment tree), BUG-024 (conversation race), BUG-027 (checkStatus cache), BUG-017 (aggregate), rồi tới P3.

## Ghi chú kỹ thuật quan trọng (đọc trước khi fix)
- Backend entry: `app.js` (port 5000). Frontend: `frontend/` (Next.js, port 3000). AI: `ai_service/main.py` (port 8000).
- **Auth hiện tại:** frontend dùng `/api/auth/*`. Refresh token nằm trong **httpOnly cookie** (đã cài cookie-parser, sameSite lax). Frontend KHÔNG còn lưu refreshToken trong localStorage. Cookie cũ từ trước fix sẽ hết hạn sau 7 ngày — user phải login lại 1 lần.
- Socket.io giờ **bắt buộc JWT** ở handshake (`auth: { token }`). Nếu access token hết hạn (15m) socket không tự reconnect — chấp nhận được (chưa phải bug).
- `utils/sanitize.js` là điểm sanitize HTML duy nhất — mọi nơi lưu content_html PHẢI đi qua đây.
- Rate limit: auth 20/15p, write 30/1p, AI 20/1p.
- Test thủ công bắt buộc sau các fix này: register + login + refresh (cookie), tạo post 2+ tags, gửi media message, socket join phòng người khác (phải bị từ chối), xóa hội thoại người khác (phải 403/400), post PRIVATE/HIDDEN (người khác phải 404).
