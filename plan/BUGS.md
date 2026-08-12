# BUGS — Danh sách toàn bộ vấn đề từ Audit (2026-08-12)

> File tham chiếu tĩnh. **Trạng thái xử lý của từng bug cập nhật ở `plan/PROGRESS.md`, KHÔNG sửa file này khi fix** (tránh conflict giữa các session).
> Format mỗi bug: `ID — Severity — File — Vấn đề / Fix gợi ý`.

---

## 🔴 CRITICAL (P0)

### BUG-001 — Stored XSS qua `content_html`
- **File:** `frontend/app/post/[slug]/page.jsx` (dangerouslySetInnerHTML) · `frontend/app/create/page.jsx` · `frontend/app/edit/[slug]/page.jsx` · `controllers/post.controller.js`
- **Vấn đề:** `content_html` user nhập không được escape/sanitize → render thẳng qua `dangerouslySetInnerHTML`. Tạo bài: `content_html = '<p>' + content + '</p>'` (không escape).
- **Impact:** `<img src=x onerror=...>` chạy trong browser mọi người xem → đánh cắp token (kết hợp BUG-012), chiếm tài khoản.
- **Fix:** Sanitize server-side khi create + update post (whitelist tag/attr, VD thư viện `sanitize-html`). Không tin client.

### BUG-002 — Privilege Escalation: register tự chọn role ADMIN
- **File:** `services/auth.service.js` `register` (`role: role || 'USER'`) · `routes/auth.routes.js`
- **Vấn đề:** `POST /api/auth/register` nhận `role` từ body, gán thẳng.
- **Fix:** Bỏ field `role` khỏi input, luôn `'USER'`. (`user.service.js` đã làm đúng — thống nhất theo nó.)

### BUG-003 — Socket.io: join phòng người khác không cần xác thực
- **File:** `services/socket.service.js` (`join_user_room` không kiểm tra) · `frontend/hooks/useSocket.js` · `frontend/components/Navbar.jsx`
- **Vấn đề:** Client không cần token, emit `join_user_room` với victim id → nhận tin nhắn/thông báo riêng tư của victim.
- **Fix:** Xác thực JWT ở handshake (`io.use(...)`), gán `socket.data.userId`, chỉ join phòng khớp userId. Frontend truyền token qua `auth`.

### BUG-004 — IDOR: xóa hội thoại người khác (mất dữ liệu vĩnh viễn)
- **File:** `services/message.service.js` `deleteConversation` · `controllers/message.controller.js`
- **Vấn đề:** Không kiểm tra user có phải participant của conversation.
- **Fix:** Kiểm tra `participants` chứa `req.user.id` trước khi xóa (giống `getMessages`).

---

## 🟠 HIGH (P1)

### BUG-005 — Post HIDDEN/PRIVATE đọc được qua `/posts/:id` & `/posts/slug/:slug`
- **File:** `services/post.service.js` `getPost`/`getPostBySlug`
- **Fix:** Chỉ trả PUBLIC với mọi người; PRIVATE chỉ chủ sở hữu; HIDDEN chỉ chủ sở hữu/admin/moderator.

### BUG-006 — Profile công khai lộ bài PRIVATE/HIDDEN
- **File:** `controllers/user.controller.js` `getPublicProfile` → `services/post.service.js` `getPostsByUser` → `repositories/post.repo.js` `findByAuthor`
- **Fix:** Người xem khác chủ sở hữu → chỉ lấy `visibility: 'PUBLIC'`.

### BUG-007 — `getPostContent` / `getCommentById` lộ nội dung ẩn
- **File:** `controllers/post.controller.js` `getPostContent` · `controllers/comment.controller.js` `getCommentById`
- **Fix:** Chỉ chủ sở hữu hoặc ADMIN/MODERATOR được đọc nội dung ẩn.

### BUG-008 — Notification IDOR (mark-as-read / delete)
- **File:** `controllers/notification.controller.js` · `repositories/notification.repo.js`
- **Fix:** Query kèm `recipient: req.user.id`.

### BUG-009 — React message không kiểm tra quyền tham gia hội thoại
- **File:** `services/message.service.js` `reactToMessage`
- **Fix:** Kiểm tra message thuộc conversation mà user là participant.

### BUG-010 — Update/Repost bypass AI moderation
- **File:** `services/post.service.js` `updatePost`/`repostPost`
- **Fix:** Chạy lại AI analyze khi content thay đổi; policy ẩn + queue giống createPost (dùng helper dùng chung).

### BUG-011 — Không rate limiting
- **File:** toàn bộ backend
- **Fix:** Thêm `express-rate-limit` cho auth, tạo content, gọi AI.

### BUG-012 — Refresh token trong localStorage + cookie httpOnly chết + không revoke
- **File:** `frontend/utils/token.js` · `frontend/services/api.js` · `frontend/services/auth.service.js` · `controllers/auth.controller.js` · `controllers/user.controller.js` · `app.js` (thiếu cookie-parser)
- **Vấn đề:** Cookie httpOnly được set nhưng `cookie-parser` không cài nên không bao giờ được đọc; refresh token 7 ngày trong localStorage dễ bị XSS đánh cắp; register qua `/api/auth/register` còn không trả token (đăng ký bị hỏng).
- **Fix:** Cài `cookie-parser`; set httpOnly cookie (sameSite lax) ở login/register/refresh; **không trả refreshToken trong body**; frontend refresh dựa cookie; sửa luôn flow register trả token.

### BUG-013 — Upload: memoryStorage 100MB×10 = DoS RAM + chấp nhận SVG (XSS) + 500 thay vì 413
- **File:** `middlewares/upload.middleware.js` · `middlewares/error.middleware.js` · `controllers/post.controller.js`
- **Fix:** Xử lý `MulterError` → 413; chặn `image/svg+xml`; cân nhắc giảm giới hạn.

### BUG-014 — Gửi media trong chat luôn crash (`cloudinaryService.uploadFile` không tồn tại)
- **File:** `controllers/message.controller.js`
- **Fix:** Dùng `uploadToCloudinary(file.buffer, folder, resourceType)`.

### BUG-015 — Đăng bài ≥2 tags crash (`tags.split` trên Array)
- **File:** `controllers/post.controller.js` `createPost`
- **Fix:** `Array.isArray(tags) ? tags : String(tags).split(',')`.

### BUG-016 — AI Service mở 0.0.0.0, không giới hạn text → DoS
- **File:** `ai_service/main.py`
- **Fix:** Giới hạn độ dài text (VD 10000 ký tự → 400/truncate); tùy chọn API key.

---

## 🟡 MEDIUM (P2)

### BUG-017 — N+1 query trong feed posts
- **File:** `services/post.service.js` `_enrichPosts`/`getPost`
- **Fix:** Song song hóa query; (nâng cao) aggregate `$group` đếm theo batch.

### BUG-018 — Hai hệ thống auth song song (`/api/auth` vs `/api/users`) lệch hành vi
- **File:** `routes/index.js` · `services/auth.service.js` · `services/user.service.js`
- **Fix:** (Refactor lớn — để session riêng) gộp 1 service; trước mắt thống nhất các check (role, status BANNED, register tokens).

### BUG-019 — Không giới hạn độ dài content/comment/message
- **File:** `models/Post.js` · `models/Comment.js` · `models/Message.js` · `app.js` (json limit)
- **Fix:** `maxlength` trong schema; `express.json({ limit: '5mb' })`.

### BUG-020 — CSRF + thiếu security headers (helmet), cookie không sameSite
- **File:** `app.js` · `controllers/user.controller.js`
- **Fix:** `helmet()` (tắt CSP để không vỡ inline style); `sameSite: 'lax'`.

### BUG-021 — Error middleware lộ thông tin nội bộ
- **File:** `middlewares/error.middleware.js`
- **Fix:** Production trả message chung; log chi tiết ra server.

### BUG-022 — Comment tree vỡ khi pagination
- **File:** `repositories/comment.repo.js`
- **Fix:** (Để session riêng) trả toàn bộ comment theo post và build tree client.

### BUG-023 — Appeal không kiểm tra quyền sở hữu target + client tự khai ai_label
- **File:** `services/appeal.service.js` `createAppeal`
- **Fix:** Kiểm tra chủ sở hữu; lấy label/score từ DB.

### BUG-024 — Race condition tạo conversation trùng
- **File:** `repositories/conversation.repo.js`
- **Fix:** Catch E11000 + re-query (unique index 2 phần tử khó — để session riêng).

### BUG-025 — Admin resolveReport xóa hẳn comment (data loss)
- **File:** `controllers/admin.controller.js` `resolveReport`
- **Fix:** `is_hidden: true` thay vì `findByIdAndDelete`; ghi ModerationLog.

### BUG-026 — Thiếu index cho query hot
- **File:** `models/Post.js` · `Comment.js` · `Follow.js` · `Interaction.js` · `Notification.js` · `Message.js`
- **Fix:** Bổ sung compound indexes.

### BUG-027 — `checkStatus` query DB mỗi request
- **File:** `middlewares/auth.middleware.js`
- **Fix:** (Để session riêng) cache trạng thái ngắn hạn.

### BUG-028 — Ghost interactions lên target không tồn tại + type REPOST lạm dụng
- **File:** `services/interaction.service.js`
- **Fix:** Validate target tồn tại; chặn REPOST qua endpoint interact.

### BUG-029 — Fallback upload local: URL hardcode `localhost:5000` + file rác
- **File:** `controllers/post.controller.js`
- **Fix:** URL relative `/uploads/...`; dọn file khi xóa post (để session riêng phần dọn).

### BUG-030 — Banned user vẫn login qua `/api/auth/login`; một số route thiếu checkStatus
- **File:** `services/auth.service.js` · `routes/moderation.routes.js` · `report.routes.js` · `notification.routes.js` · `appeal.routes.js`
- **Fix:** Check status BANNED trong login/refresh; thêm checkStatus các route.

### BUG-031 — Moderation approve/hide/warn không kiểm tra PENDING + target tồn tại
- **File:** `services/moderation.service.js`
- **Fix:** Check status + target còn tồn tại.

### BUG-032 — `req.app.get('io')` luôn undefined (emit new_post chết)
- **File:** `controllers/post.controller.js`
- **Fix:** Dùng `socketService.getIO()`.

---

## 🔵 LOW (P3)

- **BUG-033** — ESLint fail ở admin pages (`react-hooks/set-state-in-effect`, `no-unescaped-entities`).
- **BUG-034** — `ai_service/main.py`: `@app.on_event("startup")` deprecated.
- **BUG-035** — `auth.service.js` register: username random dễ trùng → 500 duplicate key.
- **BUG-036** — `updateProfile` không validate username (rỗng/trùng/format).
- **BUG-037** — Register trả "User already exists" → user enumeration.
- **BUG-038** — `admin.changeRole` không bảo vệ admin cuối cùng.
- **BUG-039** — `getOrCreateConversation` cho tạo conversation với chính mình/user không tồn tại.
- **BUG-040** — Admin list (users/posts/reports) load toàn bộ, không pagination.
- **BUG-041** — `morgan('dev')` log chi tiết trong production.
- **BUG-042** — Trang `/messages` placeholder `hidden md:flex` — mobile không hiển thị.
- **BUG-043** — `package.json` `"main": "index.js"` nhưng entry là `app.js`.
- **BUG-044** — Typo "Bài đă đăng" trong admin dashboard.

---

## Dependency risks (tham chiếu)
- Backend `npm audit`: 10 vulns (4 High: multer, socket.io-parser, ws, brace-expansion; 5 Moderate: mongoose, morgan, qs, engine.io, socket.io-adapter; 1 Low).
- Frontend `npm audit`: 12 vulns (10 High: next <16.3.0, axios <1.18.0, postcss, sharp, form-data, js-yaml, nanoid, ws, socket.io-parser, brace-expansion).
- Hành động: `npm audit fix` sau khi các fix code ổn định.
