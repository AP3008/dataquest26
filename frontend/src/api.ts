import axios from 'axios';
import type { PredictionResult } from './types';

const client = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
});

export async function predict(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post<PredictionResult>('/predict', formData);
  return data;
}
