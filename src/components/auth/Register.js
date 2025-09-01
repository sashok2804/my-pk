// Register.js - Современная страница регистрации с glassmorphism дизайном

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Alert, Container, Row, Col } from 'react-bootstrap';
import { API_URL, validateEmail, validatePassword, validateName, showNotification } from '../../config';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const navigate = useNavigate();
  
  const { name, email, password, passwordConfirm } = formData;

  // Анимация при загрузке
  useEffect(() => {
    const registerCard = document.querySelector('.register-card');
    if (registerCard) {
      registerCard.style.opacity = '0';
      registerCard.style.transform = 'translateY(30px)';
      setTimeout(() => {
        registerCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        registerCard.style.opacity = '1';
        registerCard.style.transform = 'translateY(0)';
      }, 100);
    }
  }, []);

  // Проверка силы пароля
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Очищаем ошибки при вводе
    if (error) setError('');
    if (success) setSuccess('');
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Валидация на клиенте
    if (!validateName(name)) {
      setError('Имя должно содержать минимум 2 символа');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Введите корректный email адрес');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (password !== passwordConfirm) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }
      
      // Успешная регистрация
      setSuccess('Регистрация прошла успешно! Теперь вы можете войти в систему.');
      showNotification('Регистрация успешна!', 'success');
      
      // Через 2 секунды перенаправляем на страницу входа
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
      showNotification('Ошибка регистрации', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: case 1: return '#e53e3e';
      case 2: return '#ed8936';
      case 3: return '#ecc94b';
      case 4: case 5: return '#38a169';
      default: return '#e53e3e';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return '';
      case 1: return 'Слабый';
      case 2: return 'Средний';
      case 3: return 'Хороший';
      case 4: case 5: return 'Отличный';
      default: return '';
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

  const strengthBarStyle = {
    height: '4px',
    borderRadius: '2px',
    marginTop: '0.5rem',
    background: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  };

  const strengthFillStyle = {
    height: '100%',
    borderRadius: '2px',
    background: getPasswordStrengthColor(),
    width: `${(passwordStrength / 5) * 100}%`,
    transition: 'all 0.3s ease',
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <div className="register-card" style={cardStyle}>
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
                <h1 style={titleStyle}>Присоединяйтесь</h1>
                <p style={subtitleStyle}>Создайте аккаунт в PK</p>
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

              {success && (
                <Alert 
                  variant="success" 
                  className="alert-modern"
                  style={{
                    background: 'rgba(56, 161, 105, 0.1)',
                    border: '1px solid rgba(56, 161, 105, 0.2)',
                    borderRadius: '12px',
                    color: '#38a169',
                    marginBottom: '1.5rem',
                  }}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </Alert>
              )}
              
              <Form onSubmit={onSubmit}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Имя</label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    placeholder="Введите ваше имя"
                    required
                    minLength="2"
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
                      placeholder="Введите пароль"
                      required
                      minLength="6"
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
                  {password && (
                    <div>
                      <div style={strengthBarStyle}>
                        <div style={strengthFillStyle}></div>
                      </div>
                      <p style={{
                        fontSize: '0.8rem',
                        color: getPasswordStrengthColor(),
                        margin: '0.5rem 0 0 0',
                        fontWeight: '500',
                      }}>
                        {getPasswordStrengthText() && `Сила пароля: ${getPasswordStrengthText()}`}
                      </p>
                    </div>
                  )}
                </div>
                
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Подтверждение пароля</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      name="passwordConfirm"
                      value={passwordConfirm}
                      onChange={onChange}
                      placeholder="Повторите пароль"
                      required
                      minLength="6"
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
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#4c51bf';
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#667eea';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <i className={`bi ${showPasswordConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {passwordConfirm && password && (
                    <p style={{
                      fontSize: '0.8rem',
                      color: password === passwordConfirm ? '#38a169' : '#e53e3e',
                      margin: '0.5rem 0 0 0',
                      fontWeight: '500',
                    }}>
                      {password === passwordConfirm ? (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          Пароли совпадают
                        </>
                      ) : (
                        <>
                          <i className="bi bi-x-circle me-1"></i>
                          Пароли не совпадают
                        </>
                      )}
                    </p>
                  )}
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
                      Регистрация...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Зарегистрироваться
                    </>
                  )}
                </button>
              </Form>
              
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                  Уже есть аккаунт?{' '}
                  <Link 
                    to="/login" 
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
                    Войти
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;