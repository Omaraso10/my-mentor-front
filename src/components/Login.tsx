import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(email)) {
      setEmailError('Por favor, introduce un email válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (validateEmail(email) && validatePassword(password)) {
      try {
        await login(email, password);
        navigate('/chat');
      } catch (error) {
        console.error('Login failed:', error);
        if (error instanceof Error) {
          if (error.message.includes('No se pudo establecer conexión con el servidor')) {
            setLoginError('No se pudo conectar con el servidor. Por favor, verifique su conexión a internet e intente nuevamente.');
          } else if (error.message.includes('Sesión expirada')) {
            setLoginError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
          } else {
            setLoginError('Ocurrió un error durante el inicio de sesión. Por favor, intente nuevamente.');
          }
        } else {
          setLoginError('Email o contraseña incorrectos. Por favor, inténtalo de nuevo.');
        }
      }
    }
  };

  return (
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Iniciar Sesión</h2>
          {loginError && <div className="error-message">{loginError}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail(email)}
              required
            />
            {emailError && <div className="error-message">{emailError}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validatePassword(password)}
              required
            />
            {passwordError && <div className="error-message">{passwordError}</div>}
          </div>
          <button type="submit" className="login-button">Iniciar Sesión</button>
        </form>
      </div>
  );
};

export default Login;