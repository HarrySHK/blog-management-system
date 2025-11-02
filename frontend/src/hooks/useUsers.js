import { useState, useCallback } from 'react';
import { userAPI } from '../utils/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getProfile();
      if (response.status) {
        return { success: true, user: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch profile';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getUserStats();
      if (response.status) {
        setStats(response.data);
        return { success: true, stats: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch stats';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getAllUsers(params);
      if (response.status) {
        setUsers(response.data.users);
        return { success: true, users: response.data.users, pagination: response.data.pagination };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch users';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    stats,
    loading,
    error,
    getProfile,
    getUserStats,
    getAllUsers,
  };
};

