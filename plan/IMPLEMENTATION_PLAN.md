# IMPLEMENTATION PLAN — Kế hoạch sửa lỗi theo Phase

> File này mô tả **thứ tự, cách tiếp cận và tiêu chí hoàn thành** cho từng phase. Trạng thái thực tế theo dõi ở `plan/PROGRESS.md`.

## Nguyên tắc chung (mọi session phải tuân thủ)

1. **Đọc trước khi làm:** `plan/PROGRESS.md` → `plan/BUGS.md` → `plan/IMPLEMENTATION_PLAN.md` → `CLAUDE.md`. Luôn bắt đầu từ bug có mức ưu tiên cao nhất còn `PENDING`.
2. **Thay đổi tối thiểu, chính xác:** Chỉ sửa đúng phần liên quan tới bug. Không refactor vô can, không đổi tên, không "làm đẹp" ngoài scope.
3. **Không regression:** Sau MỖI bug, chạy ít nhất `node --check` cho file đã sửa (backend). Trước khi kết thúc phase, chạy toàn bộ validation (mục bên dưới).
4. **Cập nhật PROGRESS.md ngay** sau khi fix xong từng bug (status, session, ghi chú). Không để cuối phiên.
5. **Commit + push sau mỗi phase hoàn chỉnh** (không commit nửa chừng 1 bug).
6. **Không được tự ý đổi scope:** Muốn thêm việc → thêm bug mới vào `plan/BUGS.md` (đuôi BUG-0xx) và đánh dấu trong PROGRESS.md trước khi làm.

## Cấu trúc phase

### Phase 0 — P0 (Critical security): BUG-002, BUG-001, BUG-003, BUG-004
| Bug | Cách tiếp cận | Files |
|-----|---------------|-------|
| BUG-002 | Bỏ role khỏi input register, luôn 'USER' | `services/auth.service.js` |
| BUG-001 | Cài `sanitize-html`, sanitize `content_html` ở create+update post | `services/post.service.js`, `controllers/post.controller.js`, `package.json` |
| BUG-003 | Xác thực JWT handshake socket; chỉ join phòng của chính mình; frontend truyền token | `services/socket.service.js`, `frontend/hooks/useSocket.js`, `frontend/components/Navbar.jsx` |
| BUG-004 | Ownership check khi delete conversation | `services/message.service.js` |

**Tiêu chí hoàn thành:** Không còn đường nào tạo admin qua API; content_html lưu DB đã được sanitize; socket không join được phòng người khác; không xóa được hội thoại người khác.

### Phase 1 — P1 (High security & functional): BUG-005 → BUG-016
| Bug | Cách tiếp cận | Files |
|-----|---------------|-------|
| BUG-005/006 | Filter visibility theo người xem (PUBLIC/PRIVATE/HIDDEN) | `services/post.service.js`, `repositories/post.repo.js` |
| BUG-007 | Ownership check `getPostContent` + `getCommentById` | `controllers/post.controller.js`, `controllers/comment.controller.js` |
| BUG-008 | Query notification kèm `recipient: req.user.id` | `repositories/notification.repo.js` (thêm method), `controllers/notification.controller.js` |
| BUG-009 | Check participant trước khi react | `services/message.service.js` |
| BUG-010 | AI re-check khi update post (dùng helper chung với create) | `services/post.service.js` |
| BUG-011 | Cài `express-rate-limit`; áp cho auth + tạo content + các route nhạy cảm | `middlewares/rateLimit.middleware.js` (mới), các routes |
| BUG-012 | Cài `cookie-parser`; httpOnly cookie (sameSite lax); bỏ refreshToken khỏi body; sửa flow register trả token; frontend refresh qua cookie | `app.js`, `controllers/auth.controller.js`, `controllers/user.controller.js`, `frontend/services/api.js`, `frontend/services/auth.service.js`, `frontend/utils/token.js` |
| BUG-013 | Xử lý MulterError → 413; chặn SVG | `middlewares/error.middleware.js`, `middlewares/upload.middleware.js` |
| BUG-014 | Dùng `uploadToCloudinary` cho media message | `controllers/message.controller.js` |
| BUG-015 | Xử lý tags dạng array | `controllers/post.controller.js` |
| BUG-016 | Giới hạn độ dài text trong /analyze | `ai_service/main.py` |

**Tiêu chí hoàn thành:** Không còn IDOR nào trong notification/message/post; không bypass được moderation qua update; auth có rate limit; refresh token không nằm trong localStorage; media message và tags ≥2 hoạt động.

### Phase 2 — P2 (Medium): BUG-017, BUG-019, BUG-020, BUG-021, BUG-023, BUG-025, BUG-026, BUG-028, BUG-029, BUG-030, BUG-031, BUG-032
- Ưu tiên các fix **an toàn, ít rủi ro**: index models (BUG-026), helmet (BUG-020), length limits + json limit (BUG-019), banned login (BUG-030), moderation PENDING check (BUG-031), admin resolveReport không xóa comment (BUG-025), ghost interaction (BUG-028), upload URL relative (BUG-029), io.emit (BUG-032), song song hóa getPost (BUG-017 phần nhỏ).
- Các fix lớn (N+1 triệt để, appeal ownership, error middleware chi tiết) làm trong session riêng, ghi chú rõ trong PROGRESS.md.

### Phase 3 — P3 (Low) + Refactor lớn (session riêng, mỗi session 1 chủ đề)
- BUG-018 (gộp auth), BUG-022 (comment tree), BUG-024 (conversation race), BUG-027 (checkStatus cache), BUG-017 triệt để (aggregate), BUG-040 (admin pagination).
- BUG-033 → BUG-044: fix nhanh theo list, từng bug 1.

## Validation (bắt buộc trước commit mỗi phase)

```bash
# Backend syntax (toàn bộ)
cd /f/doan
find . -name '*.js' -not -path './node_modules/*' -not -path './frontend/*' | while read f; do node --check "$f" || echo "FAIL: $f"; done

# Dependencies
cd /f/doan && npm audit --omit=dev 2>&1 | tail -5
cd /f/doan/frontend && npm audit --omit=dev 2>&1 | tail -5

# Lint frontend (chấp nhận lỗi có sẵn BUG-033, KHÔNG được tạo lỗi mới)
cd /f/doan/frontend && npx eslint . 2>&1 | grep -E "error|warning" | grep -v "BUG-033-files" | head -30

# Python syntax
python -m py_compile ai_service/main.py
```

## Git workflow
- Branch: làm trực tiếp trên `main` (theo yêu cầu commit + push lên GitHub).
- Message convention:
  - `fix(security): P0 BUG-002 role injection khi register`
  - `fix(security): P0 BUG-001 sanitize content_html chống stored XSS`
  - `fix(security): P0 BUG-003 xác thực socket.io`
  - `fix(security): P0 BUG-004 IDOR xóa conversation`
  - `fix(security): P1 ...` / `fix(bug): P1 BUG-015 tags crash` / `chore(plan): cập nhật PROGRESS.md`
- Push sau mỗi phase: `git push origin main`.
- **Tuyệt đối không commit** file `.env`, `uploads/`, `final_model/`, `node_modules/` (đã có .gitignore).

## Quy trình "continue" giữa các session
1. User mở session mới và bảo: "đọc CLAUDE.md".
2. Agent đọc 4 file plan, xác định bug PENDING ưu tiên cao nhất.
3. Implement → validate → cập nhật PROGRESS.md → commit → push.
4. Lặp lại cho đến hết phase hiện tại, rồi báo cáo cho user.
