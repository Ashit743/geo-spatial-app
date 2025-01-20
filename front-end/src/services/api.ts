import axios from 'axios';

const API_URL = 'http://localhost:3000/'; // Replace with your API URL

export interface Dataset {
  id: string;
  name: string;
  file: File;
  visible: boolean;
  layerId: string;
  geojson: any;
  selected: boolean;
}

export interface SaveDatasetDTO {
  name: string;
  file: string; // This will be the filename
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

export const createDataset = async (datasets: SaveDatasetDTO | SaveDatasetDTO[]): Promise<any> => {
  try {
    const response = await api.post('/datasets', { datasets });
    return response.data;
  } catch (error) {
    console.error('Error in createDataset:', error);
    throw error;
  }
};

export const updateDataset = async (id: string, dataset: Partial<Dataset>): Promise<Dataset> => {
  const response = await api.put(`/datasets/${id}`, dataset);
  return response.data;
};

export const deleteDataset = async (id: string): Promise<void> => {
  await api.delete(`/datasets/${id}`);
};

export default api;

