# Modern Blogging Platform (MERN Stack)

A professional, feature-rich blogging platform built with the MERN stack, featuring advanced moderation, social interactions, and a clean administrative dashboard.

## 🚀 Key Features

### For Users
*   **Authentication**: Secure registration and login using JWT (Access & Refresh Tokens).
*   **Rich Content**: Create and edit posts with a clean UI.
*   **Smart Analytics**: Automatic calculation of "Reading Time" for every post.
*   **SEO Friendly**: Auto-generated unique slugs for clean and readable URLs.
*   **Social Engagement**: 
    *   Optimistic Liking and Bookmarking system.
    *   User Follow/Unfollow mechanism.
*   **Nested Comments**: Threaded conversation support with keyword-based content filtering.
*   **Notifications**: Real-time notifications for likes, follows, and comments.

### For Administrators
*   **User Management**: Ban/Mute users, change roles (Admin/Mod/User).
*   **Content Moderation**: Review reported posts/comments, hide infringing content.
*   **Violation Tracking**: Automated tracking of user violation scores based on filtered content.

## 🛠 Technology Stack

*   **Frontend**: Next.js (React), CSS3 (Modern Glassmorphism Design).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **Security**: Bcrypt for password hashing, JWT for stateless authentication.
*   **Logging**: Morgan for HTTP request logging.

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd doan
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Create .env file and add your credentials
# PORT=5000
# MONGODB_URI=your_mongodb_atlas_uri
# ACCESS_TOKEN_SECRET=your_secret
# REFRESH_TOKEN_SECRET=your_secret
# CLIENT_URL=http://localhost:3000

# Run in development mode
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

## 📂 Project Structure

```text
├── controllers/      # Request handlers
├── services/         # Core business logic
├── repositories/     # Data access layer (Mongoose abstractions)
├── models/           # Database schemas
├── routes/           # API route definitions
├── middlewares/      # Auth & Error handling
└── frontend/         # Next.js client application
```

## 🛡 Security & Best Practices

*   **Layered Architecture**: Separation of concerns using Controller-Service-Repository pattern.
*   **Secure Auth**: HttpOnly Cookies for Refresh Tokens to prevent XSS attacks.
*   **Clean Code**: Adherence to SOLID principles and modular design.
*   **Error Handling**: Centralized global error handling middleware.

---
Developed as a Graduation Project (Đồ án).
