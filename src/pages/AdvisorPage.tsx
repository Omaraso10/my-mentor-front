import React from 'react';
import Header from '../components/Header';
import Advisors from '../components/Advisors';

const AdvisorPage: React.FC = () => {
  const toggleSidebar = () => {
    // Implementar la lógica para alternar la barra lateral si es necesario
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      <main className="flex-grow bg-gray-100">
        <Advisors />
      </main>
    </div>
  );
};

export default AdvisorPage;