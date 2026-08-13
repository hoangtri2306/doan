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
| BUG-018 | Medium | P2 | ✅ DONE | S4 | Gộp auth về /api/auth/*: bỏ /users/register|login|refresh, xóa code chết user.controller/user.service, dọn AUTH_PATHS frontend |
| BUG-019 | Medium | P2 | ✅ DONE | S1 | maxlength Post/Comment/Message + json limit 5mb |
| BUG-020 | Medium | P2 | ✅ DONE | S1 | helmet (tắt CSP) + cookie sameSite lax |
| BUG-021 | Medium | P2 | ✅ DONE | S1 | production không lộ message lỗi nội bộ |
| BUG-022 | Medium | P2 | ✅ DONE | S4 | Comment ẩn vẫn trả về (content=null, hiddenByModeration) để cây không vỡ; frontend render placeholder thay return null |
| BUG-023 | Medium | P2 | ✅ DONE | S1 | appeal check ownership target |
| BUG-024 | Medium | P2 | ✅ DONE | S4 | participant_key unique (partial index cho doc cũ) + retry E11000 + dedupe conversations cũ trước khi build index |
| BUG-025 | Medium | P2 | ✅ DONE | S1 | resolveReport ẩn comment (không xóa) + ghi ModerationLog |
| BUG-026 | Medium | P2 | ✅ DONE | S1 | thêm compound indexes 6 models |
| BUG-027 | Medium | P2 | ✅ DONE | S4 | utils/statusCache.js TTL 30s; checkStatus dùng cache; invalidate khi admin ban/mute/reset + auto-status post/comment |
| BUG-028 | Medium | P2 | ✅ DONE | S1 | validate target tồn tại + chặn REPOST qua interact |
| BUG-029 | Medium | P2 | ✅ DONE | S1 | URL relative /uploads/... |
| BUG-030 | Medium | P2 | ✅ DONE | S1 | auth.login/refresh check BANNED + checkStatus thêm vào 5 route |
| BUG-031 | Medium | P2 | ✅ DONE | S1 | moderation chỉ xử lý PENDING + target tồn tại |
| BUG-032 | Medium | P2 | ✅ DONE | S1 | dùng socketService.getIO() |
| BUG-033 | Low | P3 | ✅ DONE | S5 | ESLint 0 errors: inline async effect + ignore flag, unescaped entities, NotificationBell hoisting, profile/edit adjusting-state-during-render |
| BUG-034 | Low | P3 | ✅ DONE | S5 | ai_service/main.py: @app.on_event → lifespan context manager |
| BUG-035 | Low | P3 | ✅ DONE | S5 | register retry 3 lần + suffix khi username trùng (giữ username user chọn) |
| BUG-036 | Low | P3 | ✅ DONE | S1 | validate username 3-30 ký tự + pattern |
| BUG-037 | Low | P3 | ✅ DONE | S5 | register trả message chung 'Registration failed' thay 'User already exists' |
| BUG-038 | Low | P3 | ✅ DONE | S5 | changeRole: validate role + chặn hạ quyền admin cuối cùng |
| BUG-039 | Low | P3 | ✅ DONE | S1 | chặn conversation với chính mình + recipient không tồn tại |
| BUG-040 | Low | P3 | ✅ DONE | S5 | pagination users/posts/reports (?page&limit + meta) — AdminPagination component, dashboard không truyền page vẫn lấy đủ data |
| BUG-041 | Low | P3 | ✅ DONE | S5 | morgan: dev khi NODE_ENV != production, combined khi production |
| BUG-042 | Low | P3 | ✅ DONE | S5 | messages placeholder hiện mobile khi không có conversation (layout showListOnMobile + bỏ hidden) |
| BUG-043 | Low | P3 | ✅ DONE | S5 | package.json main → app.js |
| BUG-044 | Low | P3 | ✅ DONE | S5 | typo "Bài đă đăng" → "Bài đã đăng" |
| Dependency | — | P3 | ✅ DONE | S2 | `npm audit fix`: backend 0 vulns; frontend nâng next 16.2.4→^16.3.0, axios lên 1.18+, còn 0 vulns. `next build` pass toàn bộ routes |
| BUG-045 | High | P1 | ✅ DONE | S3 | Media message fallback local khi thiếu Cloudinary (controllers/message.controller.js) |
| BUG-046 | Medium | P2 | ✅ DONE | S3 | Authorization error trả 403/404 qua utils/httpError.js thay vì 500 |
| BUG-047 | Critical | P0 | ✅ DONE | S3 | Auth hỏng do `this._setRefreshCookie` (method extraction) — smoke test phát hiện, đã fix |

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
### Session 3 — 2026-08-12 (chạy 3 service + test end-to-end)
- ✅ Khởi động cả 3 service: AI (8000, model loaded), Backend (5000, kết nối Atlas), Frontend (3000, `next start -p 3000` — lưu ý env `PORT=5000` global gây xung đột, phải ép port).
- ✅ **Smoke test API: 23/23 PASS** — register role (BUG-002), post 3 tags (BUG-015), XSS sanitize create+update (BUG-001), PRIVATE/HIDDEN visibility (BUG-005/006), media message (BUG-014/045), IDOR conversation/message 403 (BUG-004/009), notification IDOR 404 (BUG-008), socket auth + chống rò rỉ tin nhắn (BUG-003). Script: `logs/smoke-api.js` (gitignored).
- ✅ Phát hiện & fix **BUG-047** (auth hỏng hoàn toàn — code đã commit), **BUG-045**, **BUG-046**.
- ✅ Frontend: 6 route chính trả 200, không lỗi log, `next build` pass.
- ⚠️ Browser automation (browser-use) KHÔNG khả dụng trong môi trường này — UI interactions không test trực quan được; đã thay bằng test API = đúng các network call UI gọi. Test data (u1_/u2_/u3_/evil_, post test, conversation) còn trong DB Atlas — dev data.
- **Bước tiếp theo:** fix 15 DEFERRED còn lại (xem CLAUDE.md).

### Session 2 — 2026-08-12 (vá dependency)
- ✅ `npm audit fix` backend: **0 vulnerabilities** (multer, socket.io-parser, ws, mongoose, morgan, qs... đã vá qua lockfile).
- ✅ `npm audit fix` frontend + nâng `next` 16.2.4 → `^16.3.0` (fix SSRF/DoS/middleware-bypass của next, postcss, sharp): **0 vulnerabilities**.
- ✅ Validate: `node --check` backend pass, eslint không có lỗi mới (23 errors pre-existing = BUG-033), **`next build` pass toàn bộ 20 routes**.
- ✅ Commit + push: `npm audit fix` + cập nhật PROGRESS.md.

- ⏳ Còn lại 15 DEFERRED (P2 nâng cao + P3) — xem bảng trên.
- **Bước tiếp theo cho session 2:** đọc CLAUDE.md → làm các bug DEFERRED ưu tiên: BUG-018 (gộp auth), BUG-022 (comment tree), BUG-024 (conversation race), BUG-027 (checkStatus cache), BUG-017 (aggregate), rồi tới P3.

### Session 4 — 2026-08-12 (fix 4 bug DEFERRED P2)
- ✅ **BUG-018** — gộp 2 hệ auth: bỏ `/users/register|login|refresh` (frontend đã dùng `/api/auth/*` từ S1), xóa `register/login/refreshToken/_generateTokens` khỏi `user.controller.js` + `user.service.js`, dọn AUTH_PATHS trong `frontend/services/api.js`. Endpoint cũ giờ trả 404.
- ✅ **BUG-022** — comment tree: `comment.repo.findByPostId` không còn filter `is_hidden:false` (reply của comment ẩn từng bị đẩy lên root → cây vỡ). Comment ẩn trả về với `content: null` + `hiddenByModeration: true` (không leak nội dung SPAM/TOXIC); `CommentItem.jsx` render placeholder "Bình luận đã bị ẩn..." thay vì `return null` (vốn cũng làm mất cha của reply).
- ✅ **BUG-024** — conversation race: thêm `participant_key` (participants đã sort, nối `:`) với **partial unique index** (`participant_key: {$exists:true}`) — bắt buộc vì conversations cũ có key null khiến unique thường fail khi build; `findOrCreate` dùng key + retry E11000 + backfill key cho conversation cũ + fallback tìm theo participants array.
  - ⚠️ Trong lúc test phát hiện DB đã có 2 conversation trùng key (tạo khi index chưa có) → chạy `logs/dedupe-conversations.js` gộp trước khi sync index. Script hữu ích: `logs/dedupe-conversations.js`, `logs/sync-index.js` (đều trong logs/ — gitignored).
- ✅ **BUG-027** — checkStatus cache: tạo `utils/statusCache.js` (Map + TTL 30s, `getCachedStatus/setCachedStatus/invalidateStatus`). `checkStatus` chỉ query DB khi cache miss; `invalidateStatus` gọi ở: admin ban/mute/resetScore, auto-status trong `post.service._flagForModeration` và `comment.service.createComment`.
- ✅ **Smoke test S4: 14/14 PASS** (`logs/smoke-s4.js`): register `/auth/*` 201 + legacy `/users/*` 404, `/users/me` OK, getOrCreate song song → cùng conversation + participant_key, send message, create post qua checkStatus, comment ẩn giữ cây + content null + reply đúng parent.
- ✅ Validate: `node --check` 11 file backend pass, ESLint frontend 0 lỗi mới.
- ✅ Commit + push (xem git log).

### Session 5 — 2026-08-13 (fix toàn bộ bug P3 còn lại)
- ✅ **BUG-034** — `ai_service/main.py`: thay `@app.on_event("startup")` (deprecated) bằng `lifespan` context manager (FastAPI hiện đại).
- ✅ **BUG-035 + BUG-037** — `services/auth.service.js` register: retry 3 lần khi username trùng (giữ username user chọn + suffix `_xxxx` thay vì bỏ hẳn); email check chuyển ra ngoài loop; trả message chung `'Registration failed'` thay `'User already exists'` (chống user enumeration).
- ✅ **BUG-038** — `controllers/admin.controller.js` changeRole: validate role ∈ {USER, MODERATOR, ADMIN}, check target tồn tại, chặn hạ quyền ADMIN cuối cùng (countDocuments role ADMIN).
- ✅ **BUG-040** — pagination admin: `getPaginationParams` (function NGOÀI class — tránh lỗi `this` kiểu BUG-047), users/posts/reports nhận `?page=&limit=` + trả `pagination` meta khi có page, không truyền page → trả toàn bộ (dashboard giữ nguyên). Frontend: `admin.service.js` nhận page, component `AdminPagination.jsx` mới (kèm auto-clamp page khi xóa item cuối trang), 3 trang admin dùng.
- ✅ **BUG-041** — `app.js`: morgan `'dev'` chỉ khi không phải production; production dùng `'combined'`.
- ✅ **BUG-042** — messages: layout tính `showListOnMobile` — mobile hiện placeholder khi không có conversation (tránh aside w-full + main tràn màn hình); `messages/page.jsx` bỏ `hidden`.
- ✅ **BUG-043** — `package.json`: `main` → `app.js` (entry thực tế).
- ✅ **BUG-044** — typo "Bài đă đăng" → "Bài đã đăng" (admin dashboard).
- ✅ **BUG-033** — **ESLint 0 errors** (trước 23):
  - `set-state-in-effect`: refactor các `useEffect(() => { fetchX(); }, [])` sang **inline async + ignore flag** (pattern React khuyến nghị) ở admin page/appeals/moderation/posts/reports/users/violations, post/[slug], profile, NotificationBell; `fetchX` giữ lại cho event handlers.
  - `login/page.jsx`: đọc query param `?error=` qua setTimeout(0) thay setState đồng bộ.
  - `profile/edit`: sync user→form bằng pattern **adjusting state during render** (setPrevUser) thay effect.
  - `no-unescaped-entities`: escape `"` → `&ldquo;&rdquo;`, `'` → `&apos;` ở 6 file.
  - `NotificationBell`: khai báo `fetchNotifications` trước effect (accessed-before-declared).
- ✅ **Smoke test S5: 10/10 PASS** (register không username, email trùng message chung, pagination 3 endpoint + dashboard full-data, changeRole chặn role lạ + hành vi admin count).
- ✅ **Code review (deepseek-flash)** → phát hiện & fix 1 regression High: `profile/edit` dùng initial-state thuần sẽ rỗng vì `user` load async → chuyển sang adjusting-state-during-render; + fix register email-check ngoài loop, clamp page pagination.
- ✅ Validate: `node --check` backend pass, `py_compile` AI pass, ESLint 0 errors, **`next build` pass toàn bộ routes**.
- ✅ Commit + push (xem git log).

### Session 6 — 2026-08-13 (chạy lại 3 service + test UI bằng Chrome CDP)
- ✅ Khởi động lại 3 service: AI (8000, model loaded), Backend (5000), Frontend (3000 — **rebuild lại `next build` trước khi start**: build cũ lúc 00:22 thiếu fix profile/edit lúc 00:23).
- ⚠️ **Phát hiện vấn đề quan trọng:** `next build` ở S5 chạy TRƯỚC khi code-review fix profile/edit → build đang serve là bản CŨ (initial-state-only) → form profile/edit rỗng. Sau khi rebuild + restart, form điền đúng username. **Bài học: phải rebuild sau mọi thay đổi source trước khi `next start`.**
- ✅ Browser automation (browser-use) không khả dụng (thiếu `navigate_page`) → dùng **Chrome headless + CDP (chrome-remote-interface qua `ws`)** test UI thật: `logs/cdp-test.js` (gitignored).
- ✅ **CDP UI test: 17/17 PASS** (mobile viewport 390x844):
  1. **UI Register**: điền form #username/#email/#password → submit → redirect `/` + token + localStorage user + navbar đã đăng nhập (hết nút Bắt đầu/Đăng nhập, avatar initial đúng).
  2. **BUG-042**: /messages mobile hiển thị placeholder/empty state (không màn hình trống) + có nội dung thật.
  3. **BUG-033**: /profile/edit form KHÔNG rỗng — username input = user.username (regression S5 đã fix đúng).
  4. **BUG-040**: /admin/users hiển thị bảng + pagination "Trang 1".
- ✅ Xác nhận fix S5 đều nằm trong build mới (AdminPagination, "Bài đã đăng", "No conversations yet" trong chunks).
- ✅ Backend log không có error trong lúc test; cả 3 service healthy (AI model_loaded, backend/frontend HTTP 200).
- 📌 Không có source change mới trong session này (chỉ rebuild + test script); không cần commit mới.

### Session 7 — 2026-08-13 (fix status codes + validation còn sót + 2 Low)
> Nguồn phát hiện: scan lại toàn bộ project sau S6 (không phải từ bộ bug gốc 44 — đã sạch 100%).
> **Nguyên nhân gốc:** BUG-046 chỉ chuyển một phần sang `httpError()` — các service còn lại vẫn `throw new Error()` → errorMiddleware map mọi error không có `.status` thành **500**. Cũng có **ghost follow** (follow user không tồn tại vẫn 200 → dữ liệu rác).

#### 🟠 Medium — status code & validation (xác nhận bằng API thật)
| # | Vấn đề | Fix | Smoke test |
|---|--------|-----|-----------|
| 1 | Like/bookmark target không tồn tại → 500 (nên 404); type lạ → 500 (nên 400) | `services/interaction.service.js`: `httpError(404/400)` | 404 & 400 ✅ |
| 2 | Self-follow → 500 (nên 400) | `services/follow.service.js`: `httpError(400)` | 400 ✅ |
| 3 | **Ghost follow**: follow user không tồn tại → vẫn 200 | `follow.service.js`: kiểm tra `User.findById(following_id)` + `isDeleted` → `httpError(404)` | 404 ✅ (+ follow thật vẫn 200) |
| 4 | Appeal: nội dung không tồn tại → 500; trùng appeal / đã xử lý / target_model lạ → 500 | `services/appeal.service.js`: `httpError(404/400)` (cả approveAppeal + rejectAppeal) | 404 ✅ |
| 5 | Moderation: queue item không tồn tại / đã review / target đã xóa → 500 | `services/moderation.service.js` `_assertProcessable`: `httpError(404/400)` | 404 ✅ |
| 6 | Conversation/message không tồn tại → 500 (getMessages, reactToMessage) | `services/message.service.js`: `httpError(404)` | 404 ✅ |
| 7 | Repost post gốc không tồn tại / PRIVATE / bài của mình → 500 | `services/post.service.js` `repostPost`: `httpError(404/400)` | 404 ✅ |
| 8 | Update profile username sai format → 500 (nên 400) | `services/user.service.js`: `httpError(400)` | 400 ✅ |

#### 🔵 Low
| # | Vấn đề | Fix | Smoke test |
|---|--------|-----|-----------|
| 9 | **JWT secrets yếu trong `.env`** (`access_secret_key`) | Xoay thành secret ngẫu nhiên 64 ký tự (script `logs/rotate-env.js`); tạo `.env.example` + `frontend/.env.local.example` (docs env vars) | — |
| 10 | **AI service chưa có API key** (phần tùy chọn của BUG-016 chưa làm) | `ai_service/main.py`: nếu set `AI_API_KEY` thì `/analyze` bắt buộc header `X-API-Key` (đọc từ env, fallback root `.env`; `/health` vẫn mở); `services/ai.service.js` gửi header khi backend có key | no key→401, sai→401, đúng→200 ✅ |

- ⚠️ **JWT secrets đã xoay → toàn bộ token cũ hết hạn, mọi user phải login lại 1 lần** (refresh cookie cũng vô hiệu — ký bằng secret cũ).
- ✅ **Smoke test S7: 13/13 PASS** (`logs/smoke-s7.js`): 8 case status code + 3 case AI key + create post qua AI có key → 201. Follow/unfollow user thật vẫn 200.
- ✅ Validate: `node --check` 8 file backend + `py_compile` AI pass. Backend log không có error.
- 📌 Lưu ý vận hành: khởi động AI service phải dùng `env AI_PORT=8000 python ai_service/main.py` (nếu shell có biến `PORT` khác sẽ làm backend bind sai port — dotenv không ghi đè env đã tồn tại).

## Ghi chú kỹ thuật quan trọng (đọc trước khi fix)
- Backend entry: `app.js` (port 5000). Frontend: `frontend/` (Next.js, port 3000). AI: `ai_service/main.py` (port 8000).
- **Auth hiện tại:** frontend dùng `/api/auth/*`. Refresh token nằm trong **httpOnly cookie** (đã cài cookie-parser, sameSite lax). Frontend KHÔNG còn lưu refreshToken trong localStorage. Cookie cũ từ trước fix sẽ hết hạn sau 7 ngày — user phải login lại 1 lần.
- Socket.io giờ **bắt buộc JWT** ở handshake (`auth: { token }`). Nếu access token hết hạn (15m) socket không tự reconnect — chấp nhận được (chưa phải bug).
- `utils/sanitize.js` là điểm sanitize HTML duy nhất — mọi nơi lưu content_html PHẢI đi qua đây.
- Rate limit: auth 20/15p, write 30/1p, AI 20/1p.
- Test thủ công bắt buộc sau các fix này: register + login + refresh (cookie), tạo post 2+ tags, gửi media message, socket join phòng người khác (phải bị từ chối), xóa hội thoại người khác (phải 403/400), post PRIVATE/HIDDEN (người khác phải 404).
