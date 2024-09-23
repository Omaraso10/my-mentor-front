import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const toggleSidebar = () => {
  };

  return (
    <div className="home-page">
      <Header toggleSidebar={toggleSidebar} />
      <main className="home-content">
        <section className="hero">
          <h1>Bienvenido a MyMentor</h1>
          <p className="subtitle">Tu plataforma de asesorías profesionales con IA</p>
          
          {isAuthenticated ? (
            <div className="user-greeting">
              <p>Hola, {user?.name}!</p>
              <Link to="/chat" className="cta-button">Iniciar Chat</Link>
            </div>
          ) : (
            <div className="login-prompt">
              <p>Inicia sesión para comenzar a chatear con nuestros profesionales virtuales.</p>
              <Link to="/login" className="cta-button">Iniciar Sesión</Link>
            </div>
          )}
        </section>
        
        <section className="features">
          <h2>Características principales</h2>
          <ul>
            <li><i className="feature-icon personalized"></i>Asesorías personalizadas con IA</li>
            <li><i className="feature-icon diverse"></i>Profesionales virtuales en diversas áreas</li>
            <li><i className="feature-icon available"></i>Disponible 24/7</li>
            <li><i className="feature-icon fast"></i>Respuestas rápidas y precisas</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default HomePage;