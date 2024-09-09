import React from 'react';
import Header from '../components/Header';
import Users from '../components/Users';
import '../styles/UsersPage.css';

const UsersPage: React.FC = () => {
  const toggleSidebar = () => {
  };

  return (
    <div className="users-page">
      <Header toggleSidebar={toggleSidebar} />
      <div className="users-content">
        <Users />
      </div>
    </div>
  );
};

export default UsersPage;