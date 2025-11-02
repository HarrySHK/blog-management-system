# Blog Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for managing blog posts with role-based access control.

## Features

- User authentication (register/login) with JWT
- Role-based access control (Admin and Author)
- Post management (create, edit, delete, publish/draft)
- Public blog view for published posts
- Search and pagination functionality
- Comment system for published posts
- Dashboard with statistics for authors
- User management for admins

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Joi for validation
- Winston for logging

### Frontend
- React 18
- React Router DOM
- Context API for state management
- Axios for API calls
- Vite for build tooling

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
API_VERSION=v1
```

4. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000
VITE_API_VERSION=v1
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
blog-management-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── post.js
│   │   ├── comment.js
│   │   └── user.js
│   ├── models/
│   │   ├── user.js
│   │   ├── post.js
│   │   └── comment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── post.js
│   │   ├── comment.js
│   │   └── user.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── author.js
│   ├── lib/
│   │   ├── validators/
│   │   └── ResponseHandler/
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user

### Posts
- `GET /api/v1/posts/public` - Get all published posts (public)
- `GET /api/v1/posts` - Get all posts (authenticated)
- `GET /api/v1/posts/:id` - Get a single post
- `POST /api/v1/posts` - Create a new post (author/admin)
- `PUT /api/v1/posts/:id` - Update a post (author/admin)
- `DELETE /api/v1/posts/:id` - Delete a post (author/admin)

### Comments
- `GET /api/v1/comments/post/:postId` - Get comments for a post
- `POST /api/v1/comments` - Create a comment (authenticated)
- `PUT /api/v1/comments/:id` - Update a comment
- `DELETE /api/v1/comments/:id` - Delete a comment

### Users
- `GET /api/v1/users/profile` - Get current user profile
- `GET /api/v1/users/stats` - Get user statistics
- `GET /api/v1/users` - Get all users (admin only)

## User Roles

- **Admin**: Full access to all features including user management
- **Author**: Can create, edit, and delete their own posts, and comment on published posts

## Usage

1. Register a new account or login
2. As an author, you can:
   - Create new posts
   - Edit your posts
   - Delete your posts
   - View your statistics
3. As an admin, you can:
   - All author features
   - View and manage all users
   - Access all posts
4. Public users can:
   - View all published posts
   - Search posts
   - Navigate through paginated results

## Development

To run the project in development mode:

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run dev
```

## Production Build

### Frontend Build
```bash
cd frontend
npm run build
```

The build output will be in the `frontend/dist` directory.

## License

This project is part of a MERN Stack Developer Assessment.

