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
    // Si tu backend requiere una llamada para cerrar sesión, descomenta la siguiente línea
    // await api.post('/logout');
    
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};