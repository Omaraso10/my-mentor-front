import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';
import { LogIn, LogOut, Home } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

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
          {!isHomePage && (isLoginPage || !isAuthenticated) && (
            <li>
              <Link to="/" onClick={toggleMenu} className="nav-link">
                <Home size={18} /> Home
              </Link>
            </li>
          )}
          {isAuthenticated && (
            <>
              <li><Link to="/chat" onClick={toggleMenu} className="nav-link">Chat</Link></li>
              {user?.admin && (
                <li><Link to="/users" onClick={toggleMenu} className="nav-link">Usuarios</Link></li>
              )}
              {user?.admin && (
                <li><Link to="/advisors" onClick={toggleMenu} className="nav-link">Asesores</Link></li>
              )}
              <li>
                <Link to="/" onClick={() => { handleLogout(); toggleMenu(); }} className="auth-link">
                  <LogOut size={18} /> Log Out
                </Link>
              </li>
              <li className="user-info">
                Hola, {user?.name}
              </li>
            </>
          )}
          {!isAuthenticated && !isLoginPage && (
            <li>
              <Link to="/login" onClick={toggleMenu} className="auth-link">
                <LogIn size={18} /> Iniciar Sesión
              </Link>
            </li>
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