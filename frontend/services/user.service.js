import api from './api';

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/users/profile', profileData);
  return data;
};
