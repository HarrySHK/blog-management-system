import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicPosts } from '../hooks/usePosts';
import { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import InfiniteScroll from '../components/InfiniteScroll';
import '../styles/global.css';

const PublicBlog = () => {
  const { isAuthenticated } = useAuth();
  const { posts, loading, hasMore, loadMore, search, setSearch } = usePublicPosts('');

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="container">
      <div className="navbar">
        <div className="navbar-content">
          <h1 style={{ color: '#333', margin: 0 }}>Blog</h1>
          <div className="flex-gap">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search posts..."
        />
        {search && (
          <button onClick={() => setSearch('')} className="btn btn-secondary">
            Clear
          </button>
        )}
      </div>

      {loading && posts.length === 0 ? (
        <div className="loading">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts found</h3>
          <p>Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              <h2 style={{ marginBottom: '12px' }}>
                <Link to={`/posts/${post._id}`} className="text-link">{post.title}</Link>
              </h2>
              <div className="post-meta">
                By {post.author?.name} • {new Date(post.createdAt).toLocaleDateString()} • {post.views} views
              </div>
              {post.image && (
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  className="post-image"
                />
              )}
              {post.excerpt && (
                <p style={{ marginBottom: '16px', color: '#555', lineHeight: '1.6' }}>{post.excerpt}</p>
              )}
              <div className="flex-between">
                <Link to={`/posts/${post._id}`} className="text-link">Read more →</Link>
                {post.tags && post.tags.length > 0 && (
                  <div>
                    {post.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default PublicBlog;

