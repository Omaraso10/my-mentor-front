import React from 'react';
import Header from '../components/Header';
import Users from '../components/Users';

const UsersPage: React.FC = () => {
  const toggleSidebar = () => {
    
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      <main className="flex-grow bg-gray-100">
        <Users />
      </main>
    </div>
  );
};

export default UsersPage;