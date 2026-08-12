# CLAUDE.md — Quy trình làm việc chuẩn (đọc file này khi bắt đầu mọi session)

Đây là **hợp đồng làm việc** giữa user và coding agent. Khi user nói "đọc CLAUDE.md" hoặc "continue", agent PHẢI tuân theo quy trình dưới đây để đảm bảo các session làm việc nhất quán, không đụng nhau, không regression.

---

## 1. Bắt buộc đọc trước khi làm (theo đúng thứ tự)

1. `plan/PROGRESS.md` — **nguồn sự thật về tiến độ**. Xác định bug PENDING có ưu tiên cao nhất.
2. `plan/BUGS.md` — danh sách 44 bug + hướng fix gợi ý.
3. `plan/IMPLEMENTATION_PLAN.md` — thứ tự phase, cách tiếp cận, validation, git convention.
4. `README.md` — kiến trúc tổng quan.

> Nếu file nào thiếu → dừng lại báo user, KHÔNG tự suy đoán.

## 2. Quy trình fix 1 bug

1. **Chỉ làm 1 bug tại một thời điểm** (trừ khi bug phụ thuộc nhau thì làm chung nhưng ghi rõ).
2. Đọc code hiện tại xung quanh vùng sửa **trước khi** đổi (controllers/services/repos/models/routes liên quan, cả frontend nếu cần).
3. Implement **thay đổi tối thiểu, chính xác**:
   - Không refactor vô can, không đổi tên hàm/biến ngoài scope, không "làm đẹp" code không liên quan.
   - Tuân thủ convention hiện có (class service singleton, repository pattern, camelCase, Vietnamese messages hiện có giữ nguyên).
   - Nếu cần thư viện mới → cài qua npm (có ghi vào package.json), ưu tiên thư viện phổ biến, kiểm tra version tương thích.
4. **Validate ngay sau khi sửa:**
   - Backend: `node --check <file>` cho từng file đã đổi.
   - Trước khi kết thúc phase: chạy toàn bộ validation trong IMPLEMENTATION_PLAN.md.
5. **Cập nhật `plan/PROGRESS.md` ngay lập tức**: đổi status → DONE, ghi session + commit hash + ghi chú ngắn.
6. **Commit + push** theo quy ước trong IMPLEMENTATION_PLAN.md sau mỗi phase (không commit giữa chừng 1 bug).

## 3. Những điều TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM

- ❌ Sửa code khi chưa đọc PROGRESS.md (dễ đụng việc session trước).
- ❌ Xóa/sửa nội dung `plan/BUGS.md` và `plan/IMPLEMENTATION_PLAN.md` khi đang fix (chỉ PROGRESS.md được cập nhật).
- ❌ Commit `.env`, `uploads/`, `final_model/`, `node_modules/` (đã gitignore — kiểm tra `git status` trước commit).
- ❌ Vô hiệu hóa hoặc "làm nhẹ" các fix bảo mật đã làm (P0/P1) vì tiện lợi — nếu cần thay đổi, phải báo user.
- ❌ `git push --force` lên main.
- ❌ Giữ nguyên lỗi đã biết khi sửa file chạm tới vùng đó (nếu gặp bug khác liên quan → ghi chú vào PROGRESS.md, không lơ đi).

## 4. Các lỗi bảo mật đã sửa — CẤM tái xuất hiện

- **Register không được nhận role từ client** (luôn `'USER'`).
- **`content_html` PHẢI được sanitize server-side** trước khi lưu (không render HTML user nhập trực tiếp).
- **Socket.io PHẢI xác thực token** và chỉ join phòng của chính user.
- **Mọi thao tác theo id (xóa/sửa/đọc chi tiết) PHẢI kiểm tra quyền sở hữu / membership.**
- **Post PRIVATE/HIDDEN không được hiển thị cho người ngoài.**
- **Refresh token không được trả về trong JSON body / không lưu localStorage.**

## 5. Stack & cấu trúc

- **Backend:** Node.js + Express 5 + Mongoose 8. Entry `app.js`. Layered: `routes/ → controllers/ → services/ → repositories/ → models/`.
- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind 4. `frontend/app/**`, `frontend/components/**`, `frontend/services/**`, `frontend/hooks/**`.
- **AI Service:** FastAPI (`ai_service/main.py`), XLM-Roberta, port 8000.
- **Run:** `start_all.ps1` (PowerShell) hoặc chạy 3 service riêng (xem README.md).

## 6. Khi kết thúc session

- Tóm tắt ngắn cho user: bug nào DONE, bug nào còn PENDING, commit hash, việc cần làm tiếp theo.
- Đảm bảo `plan/PROGRESS.md` đã được cập nhật và **đã commit + push** (user yêu cầu tự động commit/push).
- Đề xuất bước tiếp theo (dựa vào bug PENDING ưu tiên cao nhất).
