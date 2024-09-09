import React from 'react';
import Header from '../components/Header';
import Login from '../components/Login';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {

  const toggleSidebar = () => {
  };

  return (
    <div className="login-page">
      <Header toggleSidebar={toggleSidebar} />
      <div className="login-content">
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;