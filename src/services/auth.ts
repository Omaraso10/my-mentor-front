import api, { getUserByEmail, UserResponse } from './api';

interface LoginResponse {
  message: string;
  email: string;
  token: string;
}

export const login = async (email: string, password: string): Promise<{ loginResponse: LoginResponse, userResponse: UserResponse }> => {
  try {
    const loginResponse = await api.post<LoginResponse>('/login', { email, password });
    
    // Guardar el token en localStorage
    localStorage.setItem('token', loginResponse.data.token);
    
    // Obtener los datos completos del usuario
    const userResponse = await getUserByEmail(loginResponse.data.email);
    
    return {
      loginResponse: loginResponse.data,
      userResponse: userResponse
    };
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await api.post<{ token: string }>('/refresh-token', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};