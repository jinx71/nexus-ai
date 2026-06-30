import client from './client';

export const registerRequest = async (payload) => {
  const { data } = await client.post('/auth/register', payload);
  return data.data; // { token, user }
};

export const loginRequest = async (payload) => {
  const { data } = await client.post('/auth/login', payload);
  return data.data; // { token, user }
};

export const meRequest = async () => {
  const { data } = await client.get('/auth/me');
  return data.data.user;
};
