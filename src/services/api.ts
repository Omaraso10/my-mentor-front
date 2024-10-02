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
      // Manejo especial para errores 404 en la ruta de asesorías
      if (error.response?.status === 404 && originalRequest.url?.includes('/gpt/professional')) {
        // Evita que el error se propague y se registre en la consola
        console.log("No hay asesorías disponibles para este profesional.");
        return Promise.resolve({
          data: { advisorys: [], mensaje: "No hay asesorías disponibles." },
          status: 200,
          statusText: 'OK',
          headers: error.response.headers,
          config: originalRequest,
        });
      }

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

// Interfaces (sin cambios)
export interface AdviceRequest {
  user_professional_id: number;
  ask: string;
  api_type: string;
  image?: string;
}

export interface Advice {
  id: number;
  description: string;
  advisorys_details: AdviceDetail[];
  asesorName?: string;
  asesorId?: number;
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

export interface Area {
  id: number;
  name: string;
}

export interface AreasResponse {
  areas: Area[];
  mensaje: string;
}

export interface Advisor {
  id: number;
  name: string;
  description: string;
  area: Area;
}

export interface AdvisorsResponse {
  profesiones: Advisor[];
  mensaje: string;
}

export interface AdvisorResponse {
  mensaje: string;
  profesion: Advisor;
}

export interface CreateAdvisorRequest {
  name: string;
  description: string;
  id_area: number;
}

export interface UpdateAdvisorResponse {
  mensaje: string;
  asesor?: Advisor;
}

export interface CreateAdvisorResponse {
  asesor: Advisor;
  mensaje: string;
}

export interface AdvisorsResponse {
  content: Advisor[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Funciones de API
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

export const createAdvice = async (data: AdviceRequest): Promise<AdviceResponse> => {
  try {
    const response = await api.post<AdviceResponse>('/gpt/professional/advice', data);
    return response.data;
  } catch (error) {
    console.error('Error creating advice:', error);
    throw error;
  }
};

export const updateAdvice = async (id: number, data: AdviceRequest): Promise<AdviceResponse> => {
  try {
    const response = await api.put<AdviceResponse>(`/gpt/professional/advice/${id}`, {
      user_professional_id: data.user_professional_id,
      ask: data.ask,
      api_type: data.api_type,
      image: data.image
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la asesoría:', error);
    throw error;
  }
};

export const getAdvisorys = async (professionalId: number): Promise<AdviceListResponse> => {
  try {
    const response = await api.get<AdviceListResponse>(`/gpt/professional/${professionalId}`);
    return response.data;
  } catch (error) {
    // Este bloque no debería ejecutarse para errores 404 debido al interceptor
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { advisorys: [], mensaje: "No hay asesorías disponibles." };
    }
    // Para otros tipos de errores, registra y devuelve un mensaje genérico
    console.error("Error al obtener asesorías:", error);
    return { advisorys: [], mensaje: "Error al obtener asesorías." };
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

export const getAdvisors = async (): Promise<AdvisorsResponse> => {
  try {
    const response = await api.get<AdvisorsResponse>('/professionals');
    return response.data;
  } catch (error) {
    console.error('Error fetching advisors:', error);
    throw error;
  }
};

export const getAdvisorsPaginated = async (page: number = 0, size: number = 10): Promise<AdvisorsResponse> => {
  try {
    const response = await api.get<AdvisorsResponse>(`/professionals/page/${page}?size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated advisors:', error);
    throw error;
  }
};

export const getAreas = async (): Promise<AreasResponse> => {
  try {
    const response = await api.get<AreasResponse>('/areas');
    return response.data;
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw error;
  }
};

export const getAdvisorById = async (id: number): Promise<AdvisorResponse> => {
  try {
    const response = await api.get<AdvisorResponse>(`/professional/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching advisor:', error);
    throw error;
  }
};

export const createAdvisor = async (advisorData: CreateAdvisorRequest): Promise<CreateAdvisorResponse> => {
  try {
    const response = await api.post<CreateAdvisorResponse>('/professional', advisorData);
    return response.data;
  } catch (error) {
    console.error('Error creating advisor:', error);
    throw error;
  }
};

export const updateAdvisor = async (id: number, advisorData: CreateAdvisorRequest): Promise<UpdateAdvisorResponse> => {
  try {
    const response = await api.put<UpdateAdvisorResponse>(`/professional/${id}`, advisorData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as UpdateAdvisorResponse;
    }
    throw error;
  }
};

export const deleteAdvisor = async (id: number): Promise<void> => {
  try {
    await api.delete(`/professional/${id}`);
  } catch (error) {
    console.error('Error deleting advisor:', error);
    throw error;
  }
};

export default api;