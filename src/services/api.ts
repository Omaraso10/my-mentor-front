import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AdviceRequest {
  user_professional_id: number;
  ask: string;
}

export interface Advice {
  id: number;
  description: string;
  model: string;
  advisorys_details: AdviceDetail[];
}

export interface AdviceDetail {
  id: number;
  line_number: number;
  question: string;
  answer: string;
}
  
export interface AdviceResponse {
  advice: Advice;
  mensaje: string;
}

export interface AdviceListResponse {
  advisorys: Advice[];
  mensaje: string;
}

export interface Professional {
  id: number;
  name: string;
  description: string;
}

export interface Asesor {
  id: number;
  advisorys: Advice[];
  professional: Professional;
}

export interface UserResponse {
  usuario: User;
  mensaje: string;
}

export interface User {
  uuid: string;
  name: string;
  last_name: string;
  phone_number: number;
  email: string;
  admin: boolean;
  enabled: boolean;
  asesores: Asesor[];
}

export const getUserByEmail = async (email: string): Promise<UserResponse> => {
  try {
    const response = await api.get<UserResponse>(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const createAdvice = async (user_professional_id: number, ask: string): Promise<AdviceResponse> => {
  try {
    const response = await api.post<AdviceResponse>('/gpt/professional/advice', {
      user_professional_id,
      ask
    });
    return response.data;
  } catch (error) {
    console.error('Error creating advice:', error);
    throw error;
  }
};

export const updateAdvice = async (id: number, user_professional_id: number, ask: string): Promise<AdviceResponse> => {
  try {
    const response = await api.put<AdviceResponse>(`/gpt/professional/advice/${id}`, {
      user_professional_id,
      ask
    });
    return response.data;
  } catch (error) {
    console.error('Error updating advice:', error);
    throw error;
  }
};

export const getAdvisorys = async (professionalId: number): Promise<AdviceListResponse> => {
    try {
        const response = await api.get<AdviceListResponse>(`/gpt/professional/${professionalId}`);
        return response.data;
    } catch (error) {
        console.error('Error get advisorys:', error);
        throw error;
    }
  };

export const getAdviceDetails = async (adviceId: number): Promise<AdviceResponse> => {
  try {
    const response = await api.get<AdviceResponse>(`/gpt/professional/advice/${adviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting advice details:', error);
    throw error;
  }
};

export const deleteAdvice = async (adviceId: number): Promise<void> => {
  try {
    await api.delete(`/gpt/professional/advice/${adviceId}`);
  } catch (error) {
    console.error('Error deleting advice:', error);
    throw error;
  }
};

export default api;