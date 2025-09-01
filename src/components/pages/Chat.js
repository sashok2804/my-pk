// Chat.js - Современная страница чата с друзьями

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { API_URL, apiRequest, formatDate, getDefaultAvatar, showNotification, CONSTANTS } from '../../config';

const Chat = ({ currentUser }) => {
  const { friendId } = useParams();
  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const navigate = useNavigate();
  
  // Интервал для проверки новых сообщений
  const messagePollInterval = useRef(null);
  
  useEffect(() => {
    fetchFriends();
    
    // Очистка интервала при размонтировании
    return () => {
      if (messagePollInterval.current) {
        clearInterval(messagePollInterval.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (friends.length > 0) {
      // Если указан friendId в URL, открываем этот чат
      if (friendId) {
        const friend = friends.find(f => f.id.toString() === friendId);
        if (friend) {
          handleSelectChat(friend);
        } else {
          // Если друг не найден, открываем первый чат
          navigate(`/chat/${friends[0].id}`);
        }
      } else if (friends.length > 0) {
        // Если friendId не указан, открываем первый чат
        navigate(`/chat/${friends[0].id}`);
      }
    }
  }, [friends, friendId, navigate]);
  
  useEffect(() => {
    // Прокрутка чата вниз при новых сообщениях
    scrollToBottom();
  }, [messages]);

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
      messageInputRef.current.style.height = messageInputRef.current.scrollHeight + 'px';
    }
  }, [newMessage]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchFriends = async () => {
    try {
      const data = await apiRequest(`${API_URL}/api/friends`, {
        method: 'GET'
      });
      
      setFriends(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessages = async (friendId) => {
    try {
      const data = await apiRequest(`${API_URL}/api/messages/${friendId}`, {
        method: 'GET'
      });
      
      console.log('Получены сообщения:', data); // Debug log
      setMessages(data);
    } catch (err) {
      console.error('Ошибка при загрузке сообщений:', err);
      showNotification('Ошибка загрузки сообщений', 'danger');
    }
  };
  
  const handleSelectChat = (friend) => {
    // Очищаем предыдущий интервал
    if (messagePollInterval.current) {
      clearInterval(messagePollInterval.current);
    }
    
    setActiveChat(friend);
    setMessages([]);
    fetchMessages(friend.id);
    
    // Устанавливаем интервал для проверки новых сообщений
    messagePollInterval.current = setInterval(() => {
      fetchMessages(friend.id);
    }, CONSTANTS.POLL_INTERVAL);
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeChat || sending) return;

    if (newMessage.length > CONSTANTS.MAX_COMMENT_LENGTH) {
      showNotification(`Сообщение слишком длинное. Максимум ${CONSTANTS.MAX_COMMENT_LENGTH} символов`, 'danger');
      return;
    }
    
    setSending(true);
    const messageText = newMessage.trim();
    
    try {
      const sentMessage = await apiRequest(`${API_URL}/api/messages`, {
        method: 'POST',
        body: JSON.stringify({
          recipient_id: activeChat.id,
          content: messageText
        })
      });
      
      // Добавляем новое сообщение в чат
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      
      // Очищаем поле ввода
      setNewMessage('');
      
      // Сбрасываем высоту textarea
      if (messageInputRef.current) {
        messageInputRef.current.style.height = 'auto';
      }
      
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
      showNotification('Ошибка при отправке сообщения', 'danger');
    } finally {
      setSending(false);
    }
  };

  // Функция для декодирования Unicode и обработки переносов строк
  const decodeMessageContent = (content) => {
    if (!content) return '';
    
    try {
      let decodedContent = content;
      
      // Проверяем, есть ли Unicode символы для декодирования
      if (content.includes('\\u')) {
        console.log('Декодирование Unicode для:', content); // Debug log
        
        // Декодируем Unicode символы
        decodedContent = content.replace(/\\u[\dA-Fa-f]{4}/gi, (match) => {
          const charCode = parseInt(match.replace(/\\u/g, ''), 16);
          return String.fromCharCode(charCode);
        });
        
        console.log('Декодированный результат:', decodedContent); // Debug log
      }
      
      // Заменяем \\n на реальные переносы строк
      if (decodedContent.includes('\\n')) {
        console.log('Обработка переносов строк для:', decodedContent); // Debug log
        decodedContent = decodedContent.replace(/\\n/g, '\n');
      }
      
      return decodedContent;
    } catch (error) {
      console.error('Ошибка декодирования сообщения:', error, 'Оригинал:', content);
      return content;
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Имитация печати (можно расширить для real-time индикации)
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    height: 'calc(100vh - 200px)',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
    display: 'flex',
  };

  const sidebarStyle = {
    width: '350px',
    background: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    flexDirection: 'column',
  };

  const sidebarHeaderStyle = {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const contactStyle = (isActive) => ({
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: isActive ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  });

  const contactAvatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    marginRight: '1rem',
    transition: 'all 0.3s ease',
  };

  const contactInfoStyle = {
    flex: 1,
  };

  const contactNameStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'white',
    marginBottom: '0.25rem',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
  };

  const contactStatusStyle = {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
  };

  const mainChatStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 255, 255, 0.1)',
  };

  const chatHeaderStyle = {
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
  };

  const chatHeaderAvatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(255, 255, 255, 0.5)',
    marginRight: '1rem',
  };

  const chatHeaderInfoStyle = {
    flex: 1,
  };

  const chatHeaderNameStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'white',
    marginBottom: '0.25rem',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const messagesStyle = {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const messageStyle = (isOwn) => ({
    display: 'flex',
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
    alignItems: 'flex-end',
    gap: '0.5rem',
    animation: 'slideIn 0.3s ease',
    width: '100%',
    textAlign: isOwn ? 'right' : 'left',
  });

  const messageContentStyle = (isOwn) => ({
    padding: '0.875rem 1.25rem',
    borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
    background: isOwn 
       ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
       : 'rgba(255, 255, 255, 0.9)',
    color: isOwn ? 'white' : '#2d3748',
    //boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    fontSize: '0.95rem',
    lineHeight: '1.4',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
    textAlign: 'left',
    hyphens: 'auto',
    width: '100%',
  });

  const messageTimeStyle = {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '0.25rem',
    textAlign: 'center',
  };

  const chatFormStyle = {
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
  };

  const messageInputStyle = {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '20px',
    padding: '0.875rem 1.25rem',
    fontSize: '0.95rem',
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  };

  const sendButtonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  };

  const emptyStateStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    padding: '2rem',
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="loader">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="alert-modern">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }
  
  if (friends.length === 0) {
    return (
      <Container className="fade-in">
        <div style={{
          ...emptyStateStyle,
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          minHeight: '400px',
          margin: '2rem 0',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.5 }}>
            <i className="bi bi-chat-dots"></i>
          </div>
          <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: '700' }}>
            У вас пока нет друзей для общения
          </h4>
          <p style={{ marginBottom: '2rem' }}>
            Добавьте друзей, чтобы начать общение.
          </p>
          <button
            onClick={() => navigate('/friends')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.875rem 2rem',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <i className="bi bi-people"></i>
            Найти друзей
          </button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container fluid className="fade-in">
      <Row>
        <Col>
          <div style={containerStyle}>
            {/* Список чатов */}
            <div style={sidebarStyle}>
              <div style={sidebarHeaderStyle}>
                <h5 style={titleStyle}>
                  <i className="bi bi-chat-dots me-2"></i>
                  Сообщения
                </h5>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {friends.map(friend => (
                  <div 
                    key={friend.id} 
                    style={contactStyle(activeChat && activeChat.id === friend.id)}
                    onClick={() => navigate(`/chat/${friend.id}`)}
                    onMouseEnter={(e) => {
                      if (!activeChat || activeChat.id !== friend.id) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!activeChat || activeChat.id !== friend.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <img 
                      src={friend.avatar || getDefaultAvatar()} 
                      alt={friend.name} 
                      style={contactAvatarStyle}
                      onError={(e) => {
                        e.target.src = getDefaultAvatar();
                      }}
                    />
                    <div style={contactInfoStyle}>
                      <h6 style={contactNameStyle}>{friend.name}</h6>
                      <p style={contactStatusStyle}>
                        {friend.status || 'В сети'}
                      </p>
                    </div>
                    
                    {/* Индикатор активности */}
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#38a169',
                      border: '2px solid white',
                      position: 'absolute',
                      right: '1.5rem',
                      top: '1rem',
                    }}></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Область чата */}
            <div style={mainChatStyle}>
              {activeChat ? (
                <>
                  {/* Шапка чата */}
                  <div style={chatHeaderStyle}>
                    <img 
                      src={activeChat.avatar || getDefaultAvatar()} 
                      alt={activeChat.name} 
                      style={chatHeaderAvatarStyle}
                      onError={(e) => {
                        e.target.src = getDefaultAvatar();
                      }}
                    />
                    <div style={chatHeaderInfoStyle}>
                      <h5 style={chatHeaderNameStyle}>{activeChat.name}</h5>
                      <p style={{ ...contactStatusStyle, margin: 0 }}>
                        {isTyping ? 'печатает...' : 'в сети'}
                      </p>
                    </div>
                    
                    {/* Дополнительные действия */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          color: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Информация о пользователе"
                        onClick={() => navigate(`/profile/${activeChat.id}`)}
                      >
                        <i className="bi bi-info-circle"></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* Сообщения */}
                  <div style={messagesStyle}>
                    {messages.length > 0 ? (
                      messages.map(message => {
                        const isOwnMessage = message.sender_id === currentUser.id;
                        const decodedContent = decodeMessageContent(message.content);
                        
                        return (
                          <div 
                            key={message.id} 
                            style={messageStyle(isOwnMessage)}
                            className={isOwnMessage ? 'message-own' : 'message-other'}
                          >
                            <div className="message-content" style={{ maxWidth: '70%' }}>
                              <div style={messageContentStyle(isOwnMessage)}>
                                {decodedContent}
                              </div>
                              <div style={messageTimeStyle}>
                                {formatMessageTime(message.created_at)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={emptyStateStyle}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
                          <i className="bi bi-chat-heart"></i>
                        </div>
                        <h5 style={{ color: 'white', marginBottom: '0.5rem' }}>
                          Начните общение!
                        </h5>
                        <p>Отправьте первое сообщение {activeChat.name}</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Форма отправки сообщения */}
                  <div style={chatFormStyle}>
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%', gap: '1rem', alignItems: 'flex-end' }}>
                      <textarea
                        ref={messageInputRef}
                        style={messageInputStyle}
                        placeholder="Введите сообщение..."
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                          e.target.style.boxShadow = 'none';
                        }}
                        maxLength={CONSTANTS.MAX_COMMENT_LENGTH}
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        style={{
                          ...sendButtonStyle,
                          opacity: sending || !newMessage.trim() ? 0.6 : 1,
                          cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!sending && newMessage.trim()) {
                            e.target.style.transform = 'scale(1.1)';
                            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                      >
                        {sending ? (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                          }}></div>
                        ) : (
                          <i className="bi bi-send"></i>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div style={emptyStateStyle}>
                  <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.5 }}>
                    <i className="bi bi-chat-square-dots"></i>
                  </div>
                  <h4 style={{ color: 'white', marginBottom: '1rem' }}>
                    Выберите чат
                  </h4>
                  <p>Выберите друга из списка, чтобы начать общение.</p>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.5);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.7);
        }
        
        /* Фикс для правильного переноса текста в сообщениях */
        .message-content {
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
          white-space: pre-wrap !important;
          text-align: left !important;
          hyphens: auto !important;
          max-width: 100% !important;
        }
        
        /* Фикс для корректного выравнивания собственных сообщений */
        .message-own {
          justify-content: flex-end !important;
          text-align: right !important;
        }
        
        .message-other {
          justify-content: flex-start !important;
          text-align: left !important;
        }
        
        @media (max-width: 768px) {
          .chat-container {
            flex-direction: column;
            height: auto;
            min-height: calc(100vh - 160px);
          }
          
          .chat-sidebar {
            width: 100%;
            height: 300px;
            min-height: 300px;
          }
          
          .chat-main {
            min-height: 400px;
          }
          
          .message-content {
            max-width: 85% !important;
          }
        }
        
        @media (max-width: 480px) {
          .message-content {
            max-width: 90% !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default Chat;