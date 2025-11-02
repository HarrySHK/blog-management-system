import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { useComments } from '../hooks/useComments';
import { getImageUrl } from '../utils/api';
import '../styles/global.css';

const PostDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { getPost } = usePosts();
  const { comments, loading: commentsLoading, fetchComments, createComment } = useComments(id);
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    const result = await getPost(id);
    if (result.success) {
      setPost(result.post);
    }
    setLoading(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setCommentLoading(true);
    const result = await createComment({ post: id, content: newComment });
    if (result.success) {
      setNewComment('');
    }
    setCommentLoading(false);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Post not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" className="text-link">← Back to Blog</Link>
      </div>
      <article className="card">
        <h1 style={{ marginBottom: '16px', color: '#333' }}>{post.title}</h1>
        <div className="post-meta" style={{ marginBottom: '20px' }}>
          <span>By {post.author?.name}</span>
          {' • '}
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          {' • '}
          <span>{post.views} views</span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {post.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
        {post.image && (
          <img
            src={getImageUrl(post.image)}
            alt={post.title}
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }}
          />
        )}
        {post.excerpt && (
          <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '20px', fontSize: '18px' }}>
            {post.excerpt}
          </p>
        )}
        <div
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{ lineHeight: '1.8', color: '#333' }}
        />
      </article>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Comments ({comments.length})</h3>
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '24px' }}>
            <textarea
              className="textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              required
              rows={4}
            />
            <button type="submit" disabled={commentLoading} className="btn btn-primary" style={{ marginTop: '12px' }}>
              {commentLoading ? 'Submitting...' : 'Submit Comment'}
            </button>
          </form>
        ) : (
          <p style={{ marginBottom: '20px' }}>
            <Link to="/login" className="text-link">Login</Link> to add a comment
          </p>
        )}
        <div>
          {commentsLoading && comments.length === 0 ? (
            <div className="loading">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="empty-state">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="comment-card">
                <div className="comment-author">{comment.author?.name}</div>
                <div className="comment-content">{comment.content}</div>
                <div className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

