// NotFound.js - Современная страница 404 с анимациями

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const containerStyle = {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '32px',
    padding: '4rem 3rem',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    maxWidth: '600px',
    width: '100%',
  };

  const numberStyle = {
    fontSize: '8rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
    lineHeight: '1',
    letterSpacing: '-0.05em',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    animation: 'float 3s ease-in-out infinite',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '1rem',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    letterSpacing: '-0.02em',
  };

  const descriptionStyle = {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '2rem',
    lineHeight: '1.6',
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '16px',
    padding: '1rem 2.5rem',
    color: 'white',
    fontWeight: '600',
    fontSize: '1.1rem',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '2rem',
  };

  const secondaryButtonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '1rem 2rem',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    margin: '0 0.5rem',
  };

  const countdownStyle = {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: '2rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const iconStyle = {
    fontSize: '1.5rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '2rem',
    animation: 'bounce 2s infinite',
  };

  return (
    <Container style={containerStyle} className="fade-in">
      <Row className="justify-content-center w-100">
        <Col>
          <div style={cardStyle}>
            {/* Декоративные элементы */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'rotate 20s linear infinite',
            }}></div>
            
            <div style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-30%',
              width: '60%',
              height: '60%',
              background: 'radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'rotate 15s linear infinite reverse',
            }}></div>

            {/* Иконка */}
            <div style={iconStyle}>
              <i className="bi bi-compass"></i>
            </div>

            {/* Основной контент */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={numberStyle}>404</div>
              <h1 style={titleStyle}>Страница не найдена</h1>
              <p style={descriptionStyle}>
                Упс! Похоже, что страница, которую вы ищете, не существует или была перемещена.
              </p>

              {/* Основные действия */}
              <div style={{ marginBottom: '2rem' }}>
                <Link
                  to="/"
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    setIsHovered(true);
                    e.target.style.transform = 'translateY(-4px) scale(1.02)';
                    e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    setIsHovered(false);
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <i className="bi bi-house-door"></i>
                  Вернуться на главную
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      animation: 'shine 0.6s ease',
                    }}></div>
                  )}
                </Link>
              </div>

              {/* Дополнительные ссылки */}
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <button
                  onClick={() => window.history.back()}
                  style={secondaryButtonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="bi bi-arrow-left"></i>
                  Назад
                </button>

                <Link
                  to="/friends"
                  style={secondaryButtonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="bi bi-people"></i>
                  Друзья
                </Link>

                <Link
                  to="/chat"
                  style={secondaryButtonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="bi bi-chat-dots"></i>
                  Чат
                </Link>
              </div>

              {/* Автоматическое перенаправление */}
              <div style={countdownStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-clock"></i>
                  <span>
                    Автоматическое перенаправление через{' '}
                    <strong style={{ 
                      color: 'white',
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      display: 'inline-block',
                      minWidth: '2rem',
                      textAlign: 'center',
                    }}>
                      {countdown}
                    </strong>
                    {' '}сек.
                  </span>
                </div>
                <div style={{ 
                  marginTop: '0.75rem',
                  fontSize: '0.9rem',
                  opacity: 0.8,
                }}>
                  Нажмите любую кнопку, чтобы отменить
                </div>
              </div>

              {/* Полезные советы */}
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'left',
              }}>
                <h6 style={{ 
                  color: 'white', 
                  marginBottom: '1rem', 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <i className="bi bi-lightbulb"></i>
                  Что можно сделать:
                </h6>
                <ul style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  lineHeight: '1.8',
                  paddingLeft: '1.5rem',
                  fontSize: '0.95rem',
                }}>
                  <li>Проверьте правильность введенного URL</li>
                  <li>Воспользуйтесь навигационным меню</li>
                  <li>Вернитесь на главную страницу</li>
                  <li>Обратитесь в службу поддержки, если проблема повторяется</li>
                </ul>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -15px, 0);
          }
          70% {
            transform: translate3d(0, -7px, 0);
          }
          90% {
            transform: translate3d(0, -3px, 0);
          }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @media (max-width: 768px) {
          .card-404 {
            padding: 2rem 1.5rem;
            margin: 1rem;
          }
          
          .number-404 {
            font-size: 5rem;
          }
          
          .title-404 {
            font-size: 1.8rem;
          }
          
          .description-404 {
            font-size: 1rem;
          }
          
          .buttons-404 {
            flex-direction: column;
            align-items: center;
          }
          
          .button-404 {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .number-404 {
            font-size: 4rem;
          }
          
          .title-404 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default NotFound;