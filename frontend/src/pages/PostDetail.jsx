import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, commentAPI } from '../utils/api';

const PostDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getPost(id);
      if (response.status) {
        setPost(response.data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(id);
      if (response.status) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setCommentLoading(true);
      const response = await commentAPI.createComment({ post: id, content: newComment });
      if (response.status) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>Loading...</div>;
  }

  if (!post) {
    return <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>Post not found</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>
      <article>
        <h1>{post.title}</h1>
        <div style={{ color: '#666', marginBottom: '20px' }}>
          <p>
            By {post.author?.name} | {new Date(post.createdAt).toLocaleDateString()} | Views: {post.views}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              Tags: {post.tags.map(tag => <span key={tag} style={{ marginRight: '5px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '3px' }}>{tag}</span>)}
            </div>
          )}
        </div>
        {post.excerpt && <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '20px' }}>{post.excerpt}</p>}
        <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{post.content}</div>
      </article>

      <div style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <h3>Comments ({comments.length})</h3>
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '20px' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              required
              rows={3}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button type="submit" disabled={commentLoading}>Submit Comment</button>
          </form>
        ) : (
          <p><Link to="/login">Login</Link> to add a comment</p>
        )}
        <div>
          {comments.length === 0 ? (
            <p>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{comment.author?.name}</div>
                <div>{comment.content}</div>
                <div style={{ color: '#666', fontSize: '0.9em', marginTop: '5px' }}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

