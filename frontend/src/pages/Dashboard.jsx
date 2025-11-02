import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { useUsers } from '../hooks/useUsers';
import { getImageUrl } from '../utils/api';
import InfiniteScroll from '../components/InfiniteScroll';
import '../styles/global.css';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { posts, loading, hasMore, loadMore, deletePost, refresh } = usePosts({
    ...(!isAdmin && { author: user?.id }),
  });
  const { stats, getUserStats } = useUsers();

  useEffect(() => {
    getUserStats();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(id);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="navbar">
        <div className="navbar-content">
          <h1 style={{ color: '#333', margin: 0 }}>Dashboard</h1>
          <div className="flex-gap">
            <span style={{ color: '#666' }}>Welcome, {user?.name} ({user?.role})</span>
            <Link to="/posts/create" className="btn btn-primary">Create Post</Link>
            {isAdmin && <Link to="/users" className="btn btn-secondary">Users</Link>}
            <Link to="/" className="btn btn-secondary">Public Blog</Link>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Posts</h3>
            <p>{stats.totalPosts}</p>
          </div>
          <div className="stat-card">
            <h3>Published</h3>
            <p>{stats.publishedPosts}</p>
          </div>
          <div className="stat-card">
            <h3>Drafts</h3>
            <p>{stats.draftPosts}</p>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '20px', color: '#333' }}>My Posts</h2>
      {loading && posts.length === 0 ? (
        <div className="loading">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts found</h3>
          <p><Link to="/posts/create" className="text-link">Create your first post</Link></p>
        </div>
      ) : (
        <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              <h3 style={{ marginBottom: '12px' }}>
                <Link to={`/posts/${post._id}`} className="text-link">{post.title}</Link>
              </h3>
              {post.image && (
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  className="post-image"
                />
              )}
              <div className="post-meta">
                <span className={`status-badge status-${post.status}`}>{post.status}</span>
                {' • '}
                <span>By {post.author?.name}</span>
                {' • '}
                <span>{post.views} views</span>
                {' • '}
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex-gap" style={{ marginTop: '12px' }}>
                <Link to={`/posts/${post._id}/edit`} className="btn btn-secondary">Edit</Link>
                <button onClick={() => handleDelete(post._id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Dashboard;

