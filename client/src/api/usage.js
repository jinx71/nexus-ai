import client from './client';

export const getUsage = async () => {
  const { data } = await client.get('/usage');
  return data.data; // { totals, byTool, byDay, recent }
};

export const getAiStatus = async () => {
  const { data } = await client.get('/ai/status');
  return data.data; // { live, model }
};
