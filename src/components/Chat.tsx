import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { createAdvice, updateAdvice, getAdviceDetails, AdviceResponse, Advice, AdviceDetail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

interface ChatProps {
  selectedAdvice: Advice | null;
  onNewAdvice: (newAdvice: Advice) => void;
}

const Chat: React.FC<ChatProps> = ({ selectedAdvice, onNewAdvice }) => {
  const [messages, setMessages] = useState<AdviceDetail[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiType, setApiType] = useState<string>('openai');
  const { getGeneralAsesorId } = useAuth();

  useEffect(() => {
    const loadAdviceDetails = async () => {
      if (selectedAdvice) {
        try {
          const response = await getAdviceDetails(selectedAdvice.id);
          setMessages(response.advice.advisorys_details);
        } catch (error) {
          console.error('Error loading advice details:', error);
          setError('Error al cargar los detalles de la asesoría.');
        }
      } else {
        setMessages([]);
      }
    };

    loadAdviceDetails();
  }, [selectedAdvice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    const asesorId = getGeneralAsesorId();
    if (!asesorId) {
      setError('No se pudo obtener el ID del asesor general.');
      setIsLoading(false);
      return;
    }

    try {
      let response: AdviceResponse;

      if (!selectedAdvice) {
        response = await createAdvice(asesorId, input, apiType);
        onNewAdvice(response.advice);
      } else {
        response = await updateAdvice(selectedAdvice.id, asesorId, input, apiType);
      }

      // Actualizar los mensajes con los detalles más recientes
      const updatedAdvice = await getAdviceDetails(response.advice.id);
      setMessages(updatedAdvice.advice.advisorys_details);

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Hubo un error al enviar tu mensaje. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <p className="user-message">{message.question}</p>
            <div className="ai-message">
              <ReactMarkdown>{message.answer}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message">
            <p className="ai-message">
              <span className="loading-indicator">Pensando</span>
            </p>
          </div>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedAdvice ? "Escribe tu mensaje..." : "Escribe para iniciar una nueva asesoría..."}
          disabled={isLoading}
        />
        <select
          value={apiType}
          onChange={(e) => setApiType(e.target.value)}
          disabled={isLoading}
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default Chat;