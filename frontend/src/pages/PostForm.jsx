import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { getImageUrl } from '../utils/api';
import RichTextEditor from '../components/RichTextEditor';
import '../styles/global.css';

const PostForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getPost, createPost, updatePost, loading } = usePosts();
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    tags: '',
    image: null,
  });
  const isDataLoaded = useRef(false);

  const fetchPost = useCallback(async () => {
    if (!id || isDataLoaded.current) return;
    try {
      setError('');
      const result = await getPost(id);
      if (result && result.success && result.post) {
        const post = result.post;
        
        const newFormData = {
          title: post.title || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          status: post.status || 'draft',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
          image: null,
        };
        
        setFormData(newFormData);
        isDataLoaded.current = true;
        
        if (post.image) {
          setImagePreview(post.image);
        }
      } else {
        setError(result?.message || 'Failed to load post');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    }
  }, [id, getPost]);

  useEffect(() => {
    if (isEdit && id) {
      isDataLoaded.current = false;
      fetchPost();
    } else if (!isEdit) {
      isDataLoaded.current = false;
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        status: 'draft',
        tags: '',
        image: null,
      });
      setImagePreview(null);
    }
  }, [isEdit, id, fetchPost]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        setError('Error reading image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const data = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    let result;
    if (isEdit) {
      result = await updatePost(id, data);
    } else {
      result = await createPost(data);
    }

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Failed to save post');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: '24px', color: '#333' }}>{isEdit ? 'Edit Post' : 'Create Post'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <div className="form-group">
            <label className="label">Title:</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="input"
            />
            {imagePreview && (
              <img
                src={imagePreview.startsWith('data:') ? imagePreview : getImageUrl(imagePreview)}
                alt="Preview"
                className="image-preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
          <div className="form-group">
            <label className="label">Excerpt:</label>
            <textarea
              className="textarea"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="label">Content:</label>
            <RichTextEditor
              key={`editor-${id || 'new'}`}
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            />
          </div>
          <div className="form-group">
            <label className="label">Status:</label>
            <select
              className="select"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Tags (comma-separated):</label>
            <input
              type="text"
              className="input"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;

