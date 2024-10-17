import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, refreshToken } from '../services/auth';
import { User, getUserByEmail } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getGeneralAsesorId: () => number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      if (token && email) {
        try {
          await refreshUserSession();
        } catch (error) {
          console.error('Error loading user data:', error);
          handleLogout();
        }
      }
    };

    loadUser();

    // Configurar un intervalo para refrescar la sesión cada 14 minutos
    const refreshInterval = setInterval(refreshUserSession, 14 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const refreshUserSession = async () => {
    try {
      const newToken = await refreshToken();
      if (newToken) {
        localStorage.setItem('token', newToken);
        const email = localStorage.getItem('userEmail');
        if (email) {
          const userResponse = await getUserByEmail(email);
          setUser(userResponse.usuario);
          setIsAuthenticated(true);
        }
      } else {
        throw new Error('No se pudo refrescar el token');
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      handleLogout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { loginResponse, userResponse } = await apiLogin(email, password);
      localStorage.setItem('userEmail', loginResponse.email);
      localStorage.setItem('token', loginResponse.token);
      setIsAuthenticated(true);
      setUser(userResponse.usuario);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUser(null);
  };

  const logout = async () => {
    try {
      await apiLogout();
      handleLogout();
    } catch (error) {
      console.error('Error during logout:', error);
      handleLogout(); // Asegurarse de limpiar el estado local incluso si falla la llamada al API
    }
  };

  const getGeneralAsesorId = (): number | null => {
    if (user && user.asesores) {
      const generalAsesor = user.asesores.find(asesor => asesor.professional.name === "Consulta General");
      return generalAsesor ? generalAsesor.id : null;
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getGeneralAsesorId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};