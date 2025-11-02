import { useState, useEffect, useCallback } from 'react';
import { postAPI } from '../utils/api';

export const usePosts = (initialFilters = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);

  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postAPI.getPosts({ ...filters, page: pageNum, limit: 10 });
      if (response.status) {
        if (reset) {
          setPosts(response.data.posts);
        } else {
          setPosts(prev => [...prev, ...response.data.posts]);
        }
        setHasMore(pageNum < response.data.pagination.pages);
        setPage(pageNum);
        return response.data;
      }
      setError(response.message || 'Failed to fetch posts');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch posts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, false);
    }
  }, [page, loading, hasMore, fetchPosts]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    fetchPosts(1, true);
  }, [filters]);

  const createPost = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postAPI.createPost(data);
      if (response.status) {
        return { success: true, post: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create post';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postAPI.updatePost(id, data);
      if (response.status) {
        return { success: true, post: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update post';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postAPI.deletePost(id);
      if (response.status) {
        setPosts(prev => prev.filter(post => post._id !== id));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete post';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const getPost = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postAPI.getPost(id);
      if (response.status) {
        return { success: true, post: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch post';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    createPost,
    updatePost,
    deletePost,
    getPost,
    loadMore,
    setFilters,
    refresh: () => fetchPosts(1, true),
  };
};

export const usePublicPosts = (initialSearch = '') => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);

  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pageNum, limit: 10 };
      if (search) params.search = search;
      const response = await postAPI.getPublicPosts(params);
      if (response.status) {
        if (reset) {
          setPosts(response.data.posts);
        } else {
          setPosts(prev => [...prev, ...response.data.posts]);
        }
        setHasMore(pageNum < response.data.pagination.pages);
        setPage(pageNum);
        return response.data;
      }
      setError(response.message || 'Failed to fetch posts');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch posts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, false);
    }
  }, [page, loading, hasMore, fetchPosts]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    fetchPosts(1, true);
  }, [search]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    search,
    setSearch,
    refresh: () => fetchPosts(1, true),
  };
};

