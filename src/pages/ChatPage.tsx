import React, { useState, useEffect, useCallback } from 'react';
import { getAdvisorys, deleteAdvice, Advice } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import AdviceList from '../components/AdviceList';
import Chat from '../components/Chat';
import '../styles/ChatPage.css';

const ChatPage: React.FC = () => {
  const [advisories, setAdvisories] = useState<Advice[]>([]);
  const [selectedAdvice, setSelectedAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const getGeneralConsultationAsesorId = useCallback((): number | null => {
    if (user && user.asesores) {
      const generalAsesor = user.asesores.find(asesor => asesor.professional.name === "Consulta General");
      return generalAsesor ? generalAsesor.id : null;
    }
    return null;
  }, [user]);

  const loadAdvisories = useCallback(async () => {
    setLoading(true);
    setError(null);
    const asesorId = getGeneralConsultationAsesorId();
    if (asesorId === null) {
      setError("No se encontró el asesor de Consulta General");
      setLoading(false);
      return;
    }

    try {
      const response = await getAdvisorys(asesorId);
      setAdvisories(response.advisorys);
    } catch (error) {
      console.error('Error loading advisories:', error);
      setError(error instanceof Error ? error.message : "Error desconocido al cargar las asesorías");
      setAdvisories([]);
    } finally {
      setLoading(false);
    }
  }, [getGeneralConsultationAsesorId]);

  useEffect(() => {
    if (user) {
      loadAdvisories();
    }
  }, [user, loadAdvisories]);

  const handleSelectAdvice = (advice: Advice) => {
    setSelectedAdvice(advice);
    setIsSidebarOpen(false);
  };

  const handleNewAdvice = () => {
    setSelectedAdvice(null);
    setIsSidebarOpen(false);
  };

  const handleDeleteAdvice = async (adviceId: number) => {
    try {
      await deleteAdvice(adviceId);
      setAdvisories(prevAdvisories => prevAdvisories.filter(advice => advice.id !== adviceId));
      if (selectedAdvice && selectedAdvice.id === adviceId) {
        setSelectedAdvice(null);
      }
    } catch (error) {
      console.error('Error deleting advice:', error);
      setError("Error al eliminar la asesoría");
    }
  };

  const handleNewOrUpdatedAdvice = (newAdvice: Advice) => {
    setAdvisories(prevAdvisories => {
      const existingIndex = prevAdvisories.findIndex(advice => advice.id === newAdvice.id);
      if (existingIndex > -1) {
        // Actualizar asesoría existente
        const updatedAdvisories = [...prevAdvisories];
        updatedAdvisories[existingIndex] = newAdvice;
        return updatedAdvisories;
      } else {
        // Añadir nueva asesoría
        return [newAdvice, ...prevAdvisories];
      }
    });
    setSelectedAdvice(newAdvice);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="chat-page">
      <Header toggleSidebar={toggleSidebar} />
      <div className={`chat-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
          {loading ? (
            <div className="loading-indicator">Cargando...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <Chat 
              selectedAdvice={selectedAdvice}
              onNewAdvice={handleNewOrUpdatedAdvice}
            />
          )}
        </div>
      </div>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>
    </div>
  );
};

export default ChatPage;