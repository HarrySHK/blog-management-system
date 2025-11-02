import { useState, useCallback } from 'react';
import { commentAPI } from '../utils/api';

export const useComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await commentAPI.getComments(postId);
      if (response.status) {
        setComments(response.data);
        return response.data;
      }
      setError(response.message || 'Failed to fetch comments');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch comments';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const createComment = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await commentAPI.createComment(data);
      if (response.status) {
        setComments(prev => [response.data, ...prev]);
        return { success: true, comment: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create comment';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await commentAPI.updateComment(id, data);
      if (response.status) {
        setComments(prev => prev.map(c => c._id === id ? response.data : c));
        return { success: true, comment: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update comment';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await commentAPI.deleteComment(id);
      if (response.status) {
        setComments(prev => prev.filter(c => c._id !== id));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete comment';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  };
};

