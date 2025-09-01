// CreatePost.js - Современная форма создания поста с glassmorphism дизайном

import React, { useState, useRef } from 'react';
import { Alert } from 'react-bootstrap';
import { API_URL, apiRequest, isValidImageUrl, CONSTANTS, showNotification, decodeContent } from '../../config';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Пост не может быть пустым');
      return;
    }
    
    if (content.length > CONSTANTS.MAX_POST_LENGTH) {
      setError(`Пост слишком длинный. Максимум ${CONSTANTS.MAX_POST_LENGTH} символов`);
      return;
    }
    
    if (image && !isValidImageUrl(image)) {
      setError('Введите корректный URL изображения');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const postData = {
        content: content.trim(),
        image: image.trim() || null
      };
      
      const newPost = await apiRequest(`${API_URL}/api/posts`, {
        method: 'POST',
        body: JSON.stringify(postData)
      });
      
      // Очищаем форму
      setContent('');
      setImage('');
      setCharCount(0);
      setIsExpanded(false);
      
      // Уведомляем родительский компонент о новом посте
      onPostCreated(newPost);
    } catch (err) {
      setError(err.message);
      showNotification('Ошибка при создании поста', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    setCharCount(value.length);
    if (error) setError('');
    
    // Автоматически изменяем высоту textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setContent('');
    setImage('');
    setCharCount(0);
    setIsExpanded(false);
    setError('');
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  };

  const textareaStyle = {
    width: '100%',
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    fontSize: '1rem',
    lineHeight: '1.5',
    color: '#2d3748',
    fontFamily: 'inherit',
    padding: '0',
    minHeight: isExpanded ? '120px' : '60px',
    transition: 'all 0.3s ease',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  };

  const imageInputStyle = {
    width: '100%',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
    marginTop: '1rem',
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const cancelButtonStyle = {
    background: 'rgba(0, 0, 0, 0.1)',
    border: 'none',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    color: '#718096',
    fontWeight: '500',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  };

  const actionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  };

  const charCountStyle = {
    fontSize: '0.8rem',
    color: charCount > CONSTANTS.MAX_POST_LENGTH ? '#e53e3e' : '#718096',
    fontWeight: '500',
  };

  const toolsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const iconButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '0.5rem',
    borderRadius: '8px',
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      {/* Декоративный элемент */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #667eea, #764ba2)',
        borderRadius: '24px 24px 0 0',
      }}></div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: isExpanded ? '1rem' : '0' }}>
          <textarea
            ref={textareaRef}
            style={textareaStyle}
            placeholder="Что у вас нового?"
            value={content}
            onChange={handleContentChange}
            onFocus={handleFocus}
            maxLength={CONSTANTS.MAX_POST_LENGTH + 50} // Небольшой запас для показа ошибки
          />
        </div>

        {error && (
          <Alert 
            variant="danger"
            style={{
              background: 'rgba(229, 62, 62, 0.1)',
              border: '1px solid rgba(229, 62, 62, 0.2)',
              borderRadius: '12px',
              color: '#e53e3e',
              marginBottom: '1rem',
              padding: '0.75rem',
              fontSize: '0.9rem',
            }}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {isExpanded && (
          <div className="fade-in">
            <input
              type="text"
              placeholder="URL изображения (необязательно)"
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
                if (error) setError('');
              }}
              style={imageInputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* Предварительный просмотр изображения */}
            {image && isValidImageUrl(image) && (
              <div style={{ marginTop: '1rem' }}>
                <img 
                  src={image} 
                  alt="Предварительный просмотр" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div style={actionsStyle}>
              <div style={toolsStyle}>
                <button
                  type="button"
                  style={iconButtonStyle}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.click();
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.transform = 'scale(1)';
                  }}
                  title="Добавить изображение"
                >
                  <i className="bi bi-image"></i>
                </button>
                
                <button
                  type="button"
                  style={iconButtonStyle}
                  onClick={() => {
                    const emoji = '😊';
                    setContent(content + emoji);
                    setCharCount(content.length + emoji.length);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.transform = 'scale(1)';
                  }}
                  title="Добавить эмодзи"
                >
                  <i className="bi bi-emoji-smile"></i>
                </button>

                <span style={charCountStyle}>
                  {charCount}/{CONSTANTS.MAX_POST_LENGTH}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={cancelButtonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.15)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Отмена
                </button>
                
                <button
                  type="submit"
                  disabled={loading || !content.trim() || charCount > CONSTANTS.MAX_POST_LENGTH}
                  style={{
                    ...buttonStyle,
                    opacity: loading || !content.trim() || charCount > CONSTANTS.MAX_POST_LENGTH ? 0.6 : 1,
                    cursor: loading || !content.trim() || charCount > CONSTANTS.MAX_POST_LENGTH ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && content.trim() && charCount <= CONSTANTS.MAX_POST_LENGTH) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}></div>
                      Публикация...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send"></i>
                      Опубликовать
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        textarea::placeholder {
          color: #a0aec0;
          font-style: italic;
        }
        
        input::placeholder {
          color: #a0aec0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default CreatePost;