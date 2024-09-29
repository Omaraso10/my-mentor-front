import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createAdvice, updateAdvice, getAdviceDetails, Advice, AdviceDetail, AdviceRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { ImageIcon, SendIcon } from 'lucide-react';

interface ChatProps {
  selectedAdvice: Advice | null;
  selectedAsesor: { id: number, name: string } | null;
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

const Chat: React.FC<ChatProps> = ({ selectedAdvice, selectedAsesor, onNewAdvice }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdviceDetail[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiType, setApiType] = useState<string>('anthropic');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingIndicatorRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToLoadingIndicator = () => {
    setTimeout(() => {
      loadingIndicatorRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const scrollToLastMessage = () => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  useEffect(() => {
    if (isLoading) {
      scrollToLoadingIndicator();
    } else if (messages.length > 0) {
      scrollToLastMessage();
    }
  }, [isLoading, messages]);

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedAdvice, selectedAsesor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imageBase64) return;
    
    const currentImageBase64 = imageBase64;
    clearImage();
    
    setIsLoading(true);
    setError(null);

    try {
      let currentAdvice = selectedAdvice;
      
      if (!currentAdvice && selectedAsesor) {
        // Crear una nueva asesoría si no hay una seleccionada y hay un asesor seleccionado
        const newAdviceRequest: AdviceRequest = {
          user_professional_id: selectedAsesor.id,
          ask: input,
          api_type: apiType,
          image: currentImageBase64 || undefined
        };
        
        const response = await createAdvice(newAdviceRequest);
        currentAdvice = {
          ...response.advice,
          asesorName: selectedAsesor.name,
          asesorId: selectedAsesor.id
        };
        onNewAdvice(currentAdvice);
      } else if (currentAdvice) {
        // Actualizar la asesoría existente
        const adviceData: AdviceRequest = {
          user_professional_id: currentAdvice.asesorId!,
          ask: input,
          api_type: apiType,
          image: currentImageBase64 || undefined
        };
        
        const response = await updateAdvice(currentAdvice.id, adviceData);
        currentAdvice = response.advice;
      } else {
        throw new Error('No hay asesor seleccionado para crear una nueva asesoría');
      }

      const updatedAdvice = await getAdviceDetails(currentAdvice.id);
      setMessages(updatedAdvice.advice.advisorys_details);
      onNewAdvice(updatedAdvice.advice);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Hubo un error al enviar tu mensaje. Por favor, intenta de nuevo.');
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      setIsLoading(false);
      // Volver a enfocar el textarea después de enviar el mensaje
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB en bytes

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        setError('El archivo es demasiado grande. El tamaño máximo es de 10 MB.');
        e.target.value = ''; // Limpia el input
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String.split(',')[1]); // Guardamos solo la parte de datos del base64
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const renderMessage = (message: AdviceDetail) => {
    const formattedContent = formatCodeBlocks(message.answer);

    return (
      <div className="message-container">
        <div className={`model-indicator ${message.model.toLowerCase()}`}>
          {message.model}
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
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.length === 0 && !selectedAdvice ? (
          <div className="no-conversations">
            {selectedAsesor && (
              <p className="asesor-name">{selectedAsesor.name}</p>
            )}
            <p>Hola {user?.name}, estoy listo para ayudarte.</p>
            <p>¿En qué puedo asesorarte hoy?</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="message" ref={index === messages.length - 1 ? lastMessageRef : null}>
              <p className="user-message">{message.question}</p>
              <div className="ai-message">
                {renderMessage(message)}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message" ref={loadingIndicatorRef}>
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
        <div className="input-wrapper">
          <label htmlFor="image-upload" className="image-upload-label">
            <ImageIcon size={24} />
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            disabled={isLoading}
            className="hidden-file-input"
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            rows={2}
          />
          <select
            value={apiType}
            onChange={(e) => setApiType(e.target.value)}
            disabled={isLoading}
            className="api-select"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
          <button type="submit" disabled={isLoading} className="send-button">
            <SendIcon size={24} />
          </button>
        </div>
        {imageBase64 && (
          <div className="image-preview-container">
            <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Preview" className="image-preview" />
            <button type="button" onClick={clearImage} className="clear-image-button">
              &#x2715;
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Chat;