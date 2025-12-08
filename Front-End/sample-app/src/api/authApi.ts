// src/api/authApi.ts
import axios from 'axios';
import { getApiBaseUrl } from '../config/api.config';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    phone: string;
    roles: string[];
  };
}

// POST /api/auth/login
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/api/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Đăng nhập thất bại';
    throw new Error(msg);
  }
};
