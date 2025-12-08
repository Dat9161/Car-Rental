// src/api/vehicleApi.ts
import axios from 'axios';
import { getApiBaseUrl } from '../config/api.config';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

export interface VehiclePhoto {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface Vehicle {
  id: number;
  title: string;
  vehicleType: string;
  licensePlate: string;
  dailyPrice: number;
  currency: string;
  description?: string;
  status?: string;
  photos?: VehiclePhoto[];
  primaryPhotoUrl?: string;
}

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await api.get<Vehicle[]>('/api/vehicles');
    return response.data || [];
  } catch (error: any) {
    console.log('LỖI KẾT NỐI:', error.message);
    throw new Error('Không thể kết nối đến server');
  }
};
