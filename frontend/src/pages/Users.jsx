import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../hooks/useUsers';
import '../styles/global.css';

const Users = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { users, loading, getAllUsers } = useUsers();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    const params = { page, limit: 10 };
    if (search) {
      params.search = search;
    }
    const result = await getAllUsers(params);
    if (result.success) {
      setTotalPages(result.pagination?.pages || 1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="navbar">
        <div className="navbar-content">
          <h1 style={{ color: '#333', margin: 0 }}>Users</h1>
          <div className="flex-gap">
            <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
        />
        <button type="submit" className="btn btn-primary">Search</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setPage(1); }} className="btn btn-secondary">
            Clear
          </button>
        )}
      </form>

      {loading && users.length === 0 ? (
        <div className="loading">Loading...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <h3>No users found</h3>
        </div>
      ) : (
        <>
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333', fontWeight: '600' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333', fontWeight: '600' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', color: '#555' }}>{user.name}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-badge status-${user.role === 'admin' ? 'published' : 'draft'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-secondary">
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                Page {page} of {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Users;

