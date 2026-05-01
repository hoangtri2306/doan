# Technical Design: Hệ Thống Luồng Hoạt Động & API Chi Tiết

---

## 1. Module: Xác Thực (Register & Login)

### 1.1. Sơ đồ luồng Đăng nhập

```mermaid
sequenceDiagram
    participant C as Client (Frontend)
    participant Ctrl as AuthController
    participant S as AuthService
    participant R as UserRepository
    participant DB as MongoDB

    C->>Ctrl: POST /api/auth/login (email, password)
    Ctrl->>S: login(email, password)
    S->>R: findByEmail(email)
    R->>DB: User.findOne()
    DB-->>R: User Document
    S->>S: So sánh Password (Bcrypt)
    S->>S: Tạo AccessToken & RefreshToken
    S-->>Ctrl: { user, tokens }
    Ctrl-->>C: 200 OK + Set Cookie RefreshToken
```

### 1.2. Chi tiết API

- **Endpoint**: `POST /api/auth/login`
- **Request**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "success": true, "data": { "user": {...}, "accessToken": "..." } }`

---

## 2. Module: Bài Viết (Post Management)

### 2.1. Sơ đồ luồng Đăng bài

```mermaid
sequenceDiagram
    participant C as Client
    participant S as PostService
    participant R as PostRepository
    participant DB as MongoDB

    C->>S: createPost(userId, data)
    S->>S: Tính reading_time & slug
    S->>R: create(postData)
    R->>DB: Post.create()
    DB-->>R: Document
    S-->>C: Result Object
```

### 2.2. Chi tiết API

- **Endpoint**: `POST /api/posts`
- **Request**: `{ "title": "...", "content_html": "...", "content_json": {...} }`
- **Response**: `{ "success": true, "data": { "slug": "...", "reading_time": 5 } }`

---

## 3. Module: Bình Luận (Nested Comments)

### 3.1. Sơ đồ luồng Gửi Bình luận

```mermaid
sequenceDiagram
    participant C as Client
    participant S as CommentService
    participant F as KeywordFilter
    participant R as CommentRepository

    C->>S: createComment(userId, data)
    S->>F: Quét từ cấm
    S->>R: create(commentData)
    R-->>S: Comment Document
    S-->>C: Result
```

### 3.2. Chi tiết API

- **Endpoint**: `POST /api/comments`
- **Request**: `{ "post_id": "...", "content": "...", "parent_id": "..." }`
- **Response**: `{ "success": true, "data": { "is_hidden": false } }`

---

## 4. Module: Theo Dõi (Follow System)

### 4.1. Sơ đồ luồng Theo dõi

```mermaid
sequenceDiagram
    participant A as Người dùng A
    participant S as FollowService
    participant N as NotificationService
    participant R as FollowRepo

    A->>S: toggleFollow(UserB_Id)
    S->>R: findFollow(A, B)
    alt Chưa Follow
        S->>R: createFollow(A, B)
        S->>N: sendNotification(B, 'NEW_FOLLOWER')
        S-->>A: { action: 'followed' }
    else Đã Follow
        S->>R: deleteFollow(A, B)
        S-->>A: { action: 'unfollowed' }
    end
```

### 4.2. Chi tiết API

- **Endpoint**: `POST /api/follows`
- **Request**: `{ "following_id": "..." }`
- **Response**: `{ "success": true, "data": { "action": "followed" } }`

---

## 5. Module: Thông Báo (Notification)

### 5.1. Sơ đồ luồng Nhận thông báo

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant S as NotificationService
    participant R as NotificationRepo

    U->>S: getNotifications(userId)
    S->>R: findByRecipient(userId)
    R-->>S: Danh sách thông báo
    S-->>U: JSON Response
```

### 5.2. Chi tiết API

- **Endpoint**: `GET /api/notifications`
- **Response**: `{ "success": true, "data": [ { "type": "LIKE", "is_read": false, ... } ] }`

---

## 6. Module: Quản Trị (Admin Control)

### 6.1. Sơ đồ luồng Khóa tài khoản (Ban User)

```mermaid
sequenceDiagram
    participant Adm as Admin
    participant Ctrl as AdminController
    participant R as UserRepository

    Adm->>Ctrl: PUT /api/admin/users/:id/ban
    Ctrl->>R: update(userId, { status: 'BANNED' })
    R-->>Ctrl: Updated User
    Ctrl-->>Adm: 200 OK (User Banned)
```

### 6.2. Chi tiết API

- **Endpoint**: `PUT /api/admin/users/:id/ban` (Yêu cầu quyền ADMIN)
- **Response**: `{ "success": true, "message": "User banned" }`

---

## 7. Module: Báo Cáo (Reporting)

### 7.1. Sơ đồ luồng Gửi Báo cáo

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant S as ReportService
    participant R as ReportRepo

    U->>S: createReport(targetId, reason)
    S->>R: save(reportData)
    R-->>S: Success
    S-->>U: { success: true }
```

### 7.2. Chi tiết API

- **Endpoint**: `POST /api/reports`
- **Request**: `{ "target_id": "...", "target_model": "Post", "reason": "Spam" }`
- **Response**: `{ "success": true, "message": "Report submitted" }`

---

## 8. Tóm tắt Cấu Trúc Dự Án

- **Controllers**: Quản lý các yêu cầu HTTP.
- **Services**: Nơi thực hiện 100% logic nghiệp vụ.
- **Repositories**: Nơi tương tác trực tiếp với Database.
- **Models**: Định nghĩa cấu trúc dữ liệu Mongoose.
