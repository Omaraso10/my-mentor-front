import React, { useState, useEffect } from 'react';
import { getAdvisorys, deleteAdvice, Advice } from '../services/api';
import Header from '../components/Header';
import AdviceList from '../components/AdviceList';
import Chat from '../components/Chat';
import '../styles/ChatPage.css';

const ChatPage: React.FC = () => {
  const [advisories, setAdvisories] = useState<Advice[]>([]);
  const [selectedAdvice, setSelectedAdvice] = useState<Advice | null>(null);

  useEffect(() => {
    loadAdvisories();
  }, []);

  const loadAdvisories = async () => {
    try {
      const response = await getAdvisorys(1); // Usar el ID del asesor que estás usando
      setAdvisories(response.advisorys);
    } catch (error) {
      console.error('Error loading advisories:', error);
    }
  };

  const handleSelectAdvice = (advice: Advice) => {
    setSelectedAdvice(advice);
  };

  const handleNewAdvice = () => {
    setSelectedAdvice(null);
  };

  const handleDeleteAdvice = async (adviceId: number) => {
    try {
      await deleteAdvice(adviceId);
      setAdvisories(advisories.filter(advice => advice.id !== adviceId));
      if (selectedAdvice && selectedAdvice.id === adviceId) {
        setSelectedAdvice(null);
      }
    } catch (error) {
      console.error('Error deleting advice:', error);
      // Aquí podrías añadir una notificación de error al usuario
    }
  };

  return (
    <div className="chat-page no-scroll">
      <Header />
      <div className="chat-content">
        <div className="sidebar">
          <button className="new-advice-button" onClick={handleNewAdvice}>
            Nueva Asesoría
          </button>
          <AdviceList 
            advisories={advisories} 
            onSelectAdvice={handleSelectAdvice}
            onDeleteAdvice={handleDeleteAdvice}
            selectedAdviceId={selectedAdvice?.id}
          />
        </div>
        <div className="chat-container">
          <Chat 
            selectedAdvice={selectedAdvice}
            onNewAdvice={(newAdvice) => {
              setAdvisories(prev => [newAdvice, ...prev]);
              setSelectedAdvice(newAdvice);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;