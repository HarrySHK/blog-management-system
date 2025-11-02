import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postAPI, getImageUrl } from '../utils/api';

const PostForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (isEdit) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postAPI.getPost(id);
      if (response.status) {
        const post = response.data;
        setFormData({
          title: post.title || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          status: post.status || 'draft',
          tags: post.tags?.join(', ') || '',
          image: null,
        });
        if (post.image) {
          setImagePreview(post.image);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
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
    setLoading(true);

    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      let response;
      if (isEdit) {
        response = await postAPI.updatePost(id, data);
      } else {
        response = await postAPI.createPost(data);
      }

      if (response.status) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Failed to save post');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h2>{isEdit ? 'Edit Post' : 'Create Post'}</h2>
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <div style={{ marginBottom: '15px' }}>
          <label>Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {imagePreview && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={imagePreview.startsWith('data:') ? imagePreview : getImageUrl(imagePreview)}
                alt="Preview"
                style={{ maxWidth: '300px', maxHeight: '300px', borderRadius: '5px', marginTop: '10px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Excerpt:</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Content:</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={15}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Status:</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Tags (comma-separated):</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="tag1, tag2, tag3"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
            {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;

