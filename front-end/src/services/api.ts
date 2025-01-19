import axios from 'axios';

const API_URL = 'https://geo-spatial-app.onrender.com/'; // Replace with your API URL

export interface Dataset {
  id: string;
  name: string;
  file: File;
  visible: boolean;
  layerId: string;
  geojson: any;
  selected: boolean;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, password: string) => {
  const response = await api.post('/auth/register', { email, password });
  return response.data;
};

export const getDatasets = async (): Promise<Dataset[]> => {
  const response = await api.get('/datasets');
  return response.data;
};

export const createDataset = async (dataset: Omit<Dataset, 'id'>): Promise<Dataset> => {
  const formData = new FormData();
  formData.append('name', dataset.name);
  formData.append('file', dataset.file);
  formData.append('visible', String(dataset.visible));
  formData.append('layerId', dataset.layerId);
  formData.append('geojson', JSON.stringify(dataset.geojson));
  formData.append('selected', String(dataset.selected));

  const response = await api.post('/datasets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateDataset = async (id: string, dataset: Partial<Dataset>): Promise<Dataset> => {
  const response = await api.put(`/datasets/${id}`, dataset);
  return response.data;
};

export const deleteDataset = async (id: string): Promise<void> => {
  await api.delete(`/datasets/${id}`);
};

export default api;

