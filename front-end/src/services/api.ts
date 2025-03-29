import axios from 'axios';
import { type Dataset } from '@/stores/useDatasetStore';

const API_URL = 'http://localhost:3000'; // Replace with your API URL

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
  withCredentials: true
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
    // Always send as an array, even if empty
    const datasetsArray = Array.isArray(datasets) ? datasets : [datasets];
    const response = await api.post('/datasets', { datasets: datasetsArray });
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

export const fetchDatasets = async (): Promise<Dataset[]> => {
  try {
    const response = await api.get('/datasets');
    console.log('API Response:', response.data);

    // Check the actual structure of your response
    const datasets = response.data.datasets || response.data;

    if (!Array.isArray(datasets)) {
      console.error('Invalid response format:', datasets);
      throw new Error('Invalid response format');
    }

    return datasets;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    throw error;
  }
};

export default api;

