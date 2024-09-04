import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">MY-Mentor</Link>
      </div>
      <nav>
        <ul>
          <li><Link to="/">Inicio</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/chat">Chat</Link></li>
              <li><Link to="/profile">Perfil</Link></li>
              <li>
                <button onClick={handleLogout} className="logout-button">
                  Cerrar Sesión
                </button>
              </li>
              <li className="user-info">
                Hola, {user?.name}
              </li>
            </>
          ) : (
            <li><Link to="/login">Iniciar Sesión</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;