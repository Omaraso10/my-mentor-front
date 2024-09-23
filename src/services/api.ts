import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}`

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: Number(import.meta.env.TIME_OUT), 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    };

    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        handleLogout();
        return Promise.reject(new Error('Sesión expirada. Por favor, inicie sesión nuevamente.'));
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor:', error.request);
      handleLogout();
      return Promise.reject(new Error('No se pudo establecer conexión con el servidor. Por favor, intente más tarde.'));
    } else {
      console.error('Error en la configuración de la solicitud:', error.message);
      handleLogout();
      return Promise.reject(new Error('Ocurrió un error al procesar su solicitud. Por favor, intente más tarde.'));
    }

    return Promise.reject(error);
  }
);

export interface AdviceRequest {
  user_professional_id: number;
  ask: string;
}

export interface Advice {
  id: number;
  description: string;
  advisorys_details: AdviceDetail[];
}

export interface AdviceDetail {
  id: number;
  line_number: number;
  question: string;
  answer: string;
  model: string;
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

export interface CreateUserRequest {
  name: string;
  last_name: string;
  password: string;
  phone_number: number;
  email: string;
  admin: boolean;
  enabled: boolean;
}

export interface CreateUserResponse {
  usuario: User;
  mensaje: string;
}

export interface UsersResponse {
  mensaje: string;
  usuarios: User[];
}

export interface UpdateUserRequest {
  name: string;
  last_name: string;
  phone_number: number;
  admin: boolean;
  enabled: boolean;
}

export const getUsers = async (): Promise<UsersResponse> => {
  try {
    const response = await api.get<UsersResponse>('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    const response = await api.post<CreateUserResponse>('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (uuid: string, userData: UpdateUserRequest): Promise<UserResponse> => {
  try {
    const response = await api.put<UserResponse>(`/users/${uuid}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (uuid: string): Promise<void> => {
  try {
    await api.delete(`/users/${uuid}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<UserResponse> => {
  try {
    const response = await api.get<UserResponse>(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const createAdvice = async (user_professional_id: number, ask: string, api_type: string): Promise<AdviceResponse> => {
  try {
    const response = await api.post<AdviceResponse>('/gpt/professional/advice', {
      user_professional_id,
      ask,
      api_type
    });
    return response.data;
  } catch (error) {
    console.error('Error creating advice:', error);
    throw error;
  }
};

export const updateAdvice = async (id: number, user_professional_id: number, ask: string, api_type: string): Promise<AdviceResponse> => {
  try {
    const response = await api.put<AdviceResponse>(`/gpt/professional/advice/${id}`, {
      user_professional_id,
      ask,
      api_type
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
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return { advisorys: [], mensaje: "No hay asesorías disponibles." };
      }
      throw new Error(`Error al obtener asesorías: ${error.message}`);
    }
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