import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createAdvice, updateAdvice, getAdviceDetails, AdviceResponse, Advice, AdviceDetail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

interface ChatProps {
  selectedAdvice: Advice | null;
  onNewAdvice: (newAdvice: Advice) => void;
}

interface LanguagePattern {
  pattern: RegExp;
  inline?: RegExp;
}

const languagePatterns: Record<string, LanguagePattern> = {
  java: {
    pattern: /^(\s*)(public\s+)?(class|interface|enum)\s+[\w_$]+\s*(\{[\s\S]*?\n\s*\})/gm,
    inline: /`([^`]+)`/g
  },
  python: {
    pattern: /^(\s*)(def|class)\s+[\w_]+[\s\S]*?:/gm,
    inline: /`([^`]+)`/g
  },
  javascript: {
    pattern: /^(\s*)(function|class|const|let|var)\s+[\w_$]+[\s\S]*?\{[\s\S]*?\}/gm,
    inline: /`([^`]+)`/g
  },
};

const Chat: React.FC<ChatProps> = ({ selectedAdvice, onNewAdvice }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdviceDetail[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiType, setApiType] = useState<string>('anthropic');
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: '¡Copiado!',
        text: 'El código ha sido copiado al portapapeles',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
    }, (err) => {
      console.error('Error al copiar el texto: ', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo copiar el código al portapapeles',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    });
  };

  const formatCodeBlocks = (text: string) => {
    let formattedText = text;

    const containsFormattedBlocks = /```[\s\S]*?```/g.test(text);

    if (!containsFormattedBlocks) {
      const javaPattern = /public\s+class\s+\w+\s*\{[\s\S]*?\n\s*\}/g;

      formattedText = formattedText.replace(javaPattern, (match) => {
        return "```java\n" + match.trim() + "\n```";
      });
    
      Object.entries(languagePatterns).forEach(([language, { pattern, inline }]) => {
        if (language !== 'java') {
          formattedText = formattedText.replace(pattern, (match, indent = '') => {
            return `${indent}\`\`\`${language}\n${match.trim()}\n${indent}\`\`\``;
          });
        }

        if (inline) {
          formattedText = formattedText.replace(inline, (_, code) => {
            return `\`${code}\``;
          });
        }
      });
    }
  
    return formattedText;
  };

  const renderMessage = (content: string, model: string) => {
    const formattedContent = formatCodeBlocks(content);

    return (
      <div className="message-container">
        <div className={`model-indicator ${model.toLowerCase()}`}>
          {model}
        </div>
        <ReactMarkdown
          components={{
            code({node, inline, className, children, ...props}: any) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <div className="code-block">
                  <div className="code-block-header">
                    <span>{match[1]}</span>
                    <button 
                      className="copy-button"
                      onClick={() => copyToClipboard(String(children).replace(/\n$/, ''))}
                    >
                      Copiar
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                    customStyle={{
                      margin: 0,
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {formattedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.length === 0 && !selectedAdvice ? (
          <div className="no-conversations">
            <p>Hola {user?.name}, estoy listo para ayudarte.</p> <p>¿En qué puedo asesorarte hoy?</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="message">
              <p className="user-message">{message.question}</p>
              <div className="ai-message">
                {renderMessage(message.answer, message.model)}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message">
            <div className="ai-message">
              <div className="loading-indicator">
                <div className="loading-indicator__dot"></div>
                <div className="loading-indicator__dot"></div>
                <div className="loading-indicator__dot"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedAdvice ? "Escribe tu mensaje..." : "Escribe aquí para iniciar una nueva asesoría..."}
          disabled={isLoading}
          rows={2}
        />
        <div className="chat-input-controls">
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
        </div>
      </form>
    </div>
  );
};

export default Chat;