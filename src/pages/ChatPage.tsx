import React, { useState, useEffect, useCallback } from 'react';
import { getAdvisorys, deleteAdvice, Advice } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import AdviceList from '../components/AdviceList';
import Chat from '../components/Chat';
import { MessageSquare } from 'lucide-react';
import '../styles/ChatPage.css';

const ChatPage: React.FC = () => {
  const [advisories, setAdvisories] = useState<Advice[]>([]);
  const [selectedAsesor, setSelectedAsesor] = useState<{id: number, name: string} | null>(null);
  const [selectedAdvice, setSelectedAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const loadAdvisories = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    if (!user || !user.asesores) {
      setError("No se encontraron asesores asociados al usuario");
      setLoading(false);
      return;
    }
  
    try {
      const allAdvisories = await Promise.all(
        user.asesores.map(async (asesor) => {
          const response = await getAdvisorys(asesor.id);
          return response.advisorys.map(advice => ({
            ...advice,
            asesorName: asesor.professional.name,
            asesorId: asesor.id
          }));
        })
      );
      
      const flattenedAdvisories = allAdvisories.flat();
      setAdvisories(flattenedAdvisories);
  
      if (flattenedAdvisories.length === 0) {
        console.log("No se encontraron asesorías para ninguno de los asesores.");
      }

      // Seleccionar "Consulta General" por defecto
      const consultaGeneral = user.asesores.find(asesor => asesor.professional.name === "Consulta General");
      if (consultaGeneral) {
        setSelectedAsesor({ id: consultaGeneral.id, name: consultaGeneral.professional.name });
      }
    } catch (error) {
      console.error('Error loading advisories:', error);
      setError("Error al cargar las asesorías. Por favor, intente nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAdvisories();
    }
  }, [user, loadAdvisories]);

  const handleSelectAsesor = (asesorId: number, asesorName: string) => {
    setSelectedAsesor({ id: asesorId, name: asesorName });
    setSelectedAdvice(null);
    setIsSidebarOpen(false);
  };

  const handleSelectAdvice = (advice: Advice) => {
    setSelectedAdvice(advice);
    setSelectedAsesor({ id: advice.asesorId!, name: advice.asesorName! });
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
        updatedAdvisories[existingIndex] = {
          ...updatedAdvisories[existingIndex],
          ...newAdvice
        };
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
          <div className="new-advice-buttons">
            {user && user.asesores && user.asesores.map((asesor) => (
              <button 
                key={asesor.id}
                className={`new-advice-button ${selectedAsesor?.id === asesor.id ? 'selected' : ''}`}
                onClick={() => handleSelectAsesor(asesor.id, asesor.professional.name)}
              >
                <MessageSquare size={16} />
                <span>{asesor.professional.name}</span>
              </button>
            ))}
          </div>
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
              selectedAsesor={selectedAsesor}
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