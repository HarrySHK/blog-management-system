import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, userAPI, getImageUrl } from '../utils/api';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (!isAdmin) {
        params.author = user.id;
      }
      const response = await postAPI.getPosts(params);
      if (response.status) {
        setPosts(response.data.posts);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      if (response.status) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postAPI.deletePost(id);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Welcome, {user?.name} ({user?.role})</span>
          <Link to="/posts/create" style={{ marginRight: '15px' }}>Create Post</Link>
          {isAdmin && <Link to="/users" style={{ marginRight: '15px' }}>Users</Link>}
          <Link to="/" style={{ marginRight: '15px' }}>Public Blog</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
            <h3>Total Posts</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalPosts}</p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
            <h3>Published</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.publishedPosts}</p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
            <h3>Drafts</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.draftPosts}</p>
          </div>
        </div>
      )}

      <h2>My Posts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <p>No posts found. <Link to="/posts/create">Create your first post</Link></p>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            {posts.map((post) => (
              <div key={post._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
                <h3>
                  <Link to={`/posts/${post._id}`}>{post.title}</Link>
                </h3>
                {post.image && (
                  <div style={{ marginBottom: '10px' }}>
                    <img
                      src={getImageUrl(post.image)}
                      alt={post.title}
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '5px' }}
                    />
                  </div>
                )}
                <p style={{ color: '#666' }}>
                  Status: <span style={{ fontWeight: 'bold', color: post.status === 'published' ? 'green' : 'orange' }}>
                    {post.status.toUpperCase()}
                  </span>
                  {' | '}
                  Author: {post.author?.name}
                  {' | '}
                  Views: {post.views}
                  {' | '}
                  Created: {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <div>
                  <Link to={`/posts/${post._id}/edit`} style={{ marginRight: '10px' }}>Edit</Link>
                  <button onClick={() => handleDelete(post._id)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

