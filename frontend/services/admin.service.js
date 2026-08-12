import api from './api';

export const getViolations = async () => {
  const { data } = await api.get('/admin/violations');
  return data;
};

// BUG-040: pagination — truyền page/limit để chỉ lấy 1 trang
const paginate = (page, limit = 20) => {
  const params = {};
  if (page) {
    params.page = page;
    params.limit = limit;
  }
  return params;
};

export const getUsers = async (page) => {
  const { data } = await api.get('/admin/users', { params: paginate(page) });
  return data;
};

export const changeRole = async (id, role) => {
  const { data } = await api.put(`/admin/users/${id}/role`, { role });
  return data;
};

export const getAllPosts = async (page) => {
  const { data } = await api.get('/admin/posts', { params: paginate(page) });
  return data;
};

export const hidePost = async (id) => {
  const { data } = await api.put(`/admin/posts/${id}/hide`);
  return data;
};

export const unhidePost = async (id) => {
  const { data } = await api.put(`/admin/posts/${id}/unhide`);
  return data;
};

export const markSensitive = async (id) => {
  const { data } = await api.put(`/admin/posts/${id}/mark-sensitive`);
  return data;
};

export const unmarkSensitive = async (id) => {
  const { data } = await api.put(`/admin/posts/${id}/unmark-sensitive`);
  return data;
};

export const deletePostByAdmin = async (id) => {
  const { data } = await api.delete(`/admin/posts/${id}`);
  return data;
};

export const getReports = async (page) => {
  const { data } = await api.get('/admin/reports', { params: paginate(page) });
  return data;
};

export const resolveReport = async (id, action = 'HIDE') => {
  const { data } = await api.put(`/admin/reports/${id}/resolve`, { action });
  return data;
};

export const muteUser = async (id) => {
  const { data } = await api.put(`/admin/users/${id}/mute`);
  return data;
};

export const banUser = async (id) => {
  const { data } = await api.put(`/admin/users/${id}/ban`);
  return data;
};

export const resetScore = async (id) => {
  const { data } = await api.put(`/admin/users/${id}/reset-score`);
  return data;
};
