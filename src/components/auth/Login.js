// Login.js - Современная страница входа с glassmorphism дизайном

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { API_URL, validateEmail, showNotification } from '../../config';

const Login = ({ setAuth }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  
  const { email, password } = formData;

  // Анимация при загрузке
  useEffect(() => {
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
      loginCard.style.opacity = '0';
      loginCard.style.transform = 'translateY(30px)';
      setTimeout(() => {
        loginCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        loginCard.style.opacity = '1';
        loginCard.style.transform = 'translateY(0)';
      }, 100);
    }
  }, []);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Очищаем ошибку при вводе
    if (error) setError('');
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Валидация на клиенте
    if (!validateEmail(email)) {
      setError('Введите корректный email адрес');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }
      
      // Сохраняем токен и пользователя
      setAuth(data.token, data.user);
      showNotification(`Добро пожаловать, ${data.user.name}!`, 'success');
      navigate('/');
    } catch (err) {
      setError(err.message);
      showNotification('Ошибка входа', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const titleStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
  };

  const subtitleStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.1rem',
    fontWeight: '400',
    margin: 0,
  };

  const formGroupStyle = {
    marginBottom: '1.5rem',
    position: 'relative',
  };

  const labelStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    display: 'block',
  };

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    width: '100%',
    transition: 'all 0.3s ease',
    color: '#2d3748',
  };

  const inputFocusStyle = {
    outline: 'none',
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    transform: 'translateY(-2px)',
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0.875rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    width: '100%',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  };

  const linkStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <div className="login-card" style={cardStyle}>
            {/* Декоративные элементы */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}></div>
            
            <div style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-30%',
              width: '60%',
              height: '60%',
              background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}></div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={headerStyle}>
                <h1 style={titleStyle}>Добро пожаловать</h1>
                <p style={subtitleStyle}>Войдите в свой аккаунт PK</p>
              </div>
              
              {error && (
                <Alert 
                  variant="danger" 
                  className="alert-modern"
                  style={{
                    background: 'rgba(229, 62, 62, 0.1)',
                    border: '1px solid rgba(229, 62, 62, 0.2)',
                    borderRadius: '12px',
                    color: '#e53e3e',
                    marginBottom: '1.5rem',
                  }}
                >
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={onSubmit}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Email адрес</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Введите ваш email"
                    required
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>
                
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Пароль</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={onChange}
                      placeholder="Введите ваш пароль"
                      required
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    />
                    <button
                      type="button"
                      style={passwordToggleStyle}
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#4c51bf';
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#667eea';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Входим...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Войти
                    </>
                  )}
                </button>
              </Form>
              
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 0.5rem 0' }}>
                  Нет аккаунта?{' '}
                  <Link 
                    to="/register" 
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#ffffff';
                      e.target.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.textDecoration = 'none';
                    }}
                  >
                    Зарегистрироваться
                  </Link>
                </p>
                <Link 
                  to="/forgot-password" 
                  style={{...linkStyle, fontSize: '0.9rem', opacity: 0.8}}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '0.8';
                    e.target.style.textDecoration = 'none';
                  }}
                >
                  Забыли пароль?
                </Link>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;