import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postAPI, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PublicBlog = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page, search]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) {
        params.search = search;
      }
      const response = await postAPI.getPublicPosts(params);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Blog</h1>
        <div>
          {isAuthenticated ? (
            <Link to="/dashboard">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: '15px' }}>Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          style={{ width: '300px', padding: '8px', marginRight: '10px' }}
        />
        <button type="submit">Search</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setPage(1); }} style={{ marginLeft: '10px' }}>
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            {posts.map((post) => (
              <div key={post._id} style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '5px' }}>
                <h2>
                  <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {post.title}
                  </Link>
                </h2>
                <div style={{ color: '#666', marginBottom: '10px' }}>
                  By {post.author?.name} | {new Date(post.createdAt).toLocaleDateString()} | Views: {post.views}
                </div>
                {post.image && (
                  <div style={{ marginBottom: '10px' }}>
                    <img
                      src={getImageUrl(post.image)}
                      alt={post.title}
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '5px' }}
                    />
                  </div>
                )}
                {post.excerpt && <p style={{ marginBottom: '10px' }}>{post.excerpt}</p>}
                <Link to={`/posts/${post._id}`}>Read more →</Link>
                {post.tags && post.tags.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{ marginRight: '5px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '3px', fontSize: '0.9em' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px' }}>
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

export default PublicBlog;

