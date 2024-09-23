import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="logo">
        <img src="/mental.png" alt="MyMentor Logo" className="header-icon" />
        <Link to="/">MyMentor</Link>
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <nav className={isMenuOpen ? 'open' : ''}>
        <ul>
          <li><Link to="/" onClick={toggleMenu}>Inicio</Link></li>
          {isAuthenticated && (
            <>
              <li><Link to="/chat" onClick={toggleMenu}>Chat</Link></li>
              {user?.admin && (
                <li><Link to="/users" onClick={toggleMenu}>Usuarios</Link></li>
              )}
              <li>
                <button onClick={() => { handleLogout(); toggleMenu(); }} className="logout-button">
                  Cerrar Sesión
                </button>
              </li>
              <li className="user-info">
                Hola, {user?.name}
              </li>
            </>
          )}
          {!isAuthenticated && (
            <li><Link to="/login" onClick={toggleMenu}>Iniciar Sesión</Link></li>
          )}
        </ul>
      </nav>
      {isAuthenticated && (
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          ☰
        </button>
      )}
    </header>
  );
};

export default Header;