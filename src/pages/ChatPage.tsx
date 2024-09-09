import React, { useState, useEffect } from 'react';
import { getAdvisorys, deleteAdvice, Advice } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import AdviceList from '../components/AdviceList';
import Chat from '../components/Chat';
import '../styles/ChatPage.css';
import axios from 'axios';

const ChatPage: React.FC = () => {
  const [advisories, setAdvisories] = useState<Advice[]>([]);
  const [selectedAdvice, setSelectedAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAdvisories();
    }
  }, [user]);

  const getGeneralConsultationAsesorId = (): number | null => {
    if (user && user.asesores) {
      const generalAsesor = user.asesores.find(asesor => asesor.professional.name === "Consulta General");
      return generalAsesor ? generalAsesor.id : null;
    }
    return null;
  };

  const loadAdvisories = async () => {
    const asesorId = getGeneralConsultationAsesorId();
    if (asesorId === null) {
      setError("No se encontró el asesor de Consulta General");
      setLoading(false);
      return;
    }

    try {
      const response = await getAdvisorys(asesorId);
      setAdvisories(response.advisorys);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error loading advisories:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setAdvisories([]);
        setError("Sin asesorías aún.");
      } else {
        setError("Error al cargar las asesorías. Por favor, intente nuevamente.");
      }
      setLoading(false);
    }
  };

  const handleSelectAdvice = (advice: Advice) => {
    setSelectedAdvice(advice);
    setIsSidebarOpen(false);  // Cierra el sidebar en dispositivos móviles después de seleccionar
  };

  const handleNewAdvice = () => {
    setSelectedAdvice(null);
    setIsSidebarOpen(false);  // Cierra el sidebar en dispositivos móviles después de crear una nueva asesoría
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
      setError("Error al eliminar la asesoría");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="chat-page">
      <Header toggleSidebar={toggleSidebar} />
      <div className="chat-content">
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <button className="new-advice-button" onClick={handleNewAdvice}>
            Nueva Asesoría
          </button>
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <AdviceList 
              advisories={advisories} 
              onSelectAdvice={handleSelectAdvice}
              onDeleteAdvice={handleDeleteAdvice}
              selectedAdviceId={selectedAdvice?.id}
            />
          )}
        </div>
        <div className="chat-container">
          <Chat 
            selectedAdvice={selectedAdvice}
            onNewAdvice={(newAdvice) => {
              setAdvisories(prev => [newAdvice, ...prev]);
              setSelectedAdvice(newAdvice);
              setError(null); 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;