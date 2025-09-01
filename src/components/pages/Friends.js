// Friends.js - Современная страница друзей и запросов в друзья

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Tabs, Tab, Alert, Form, InputGroup } from 'react-bootstrap';
import { API_URL, apiRequest, getDefaultAvatar, showNotification, debounce } from '../../config';

const Friends = ({ currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  
  useEffect(() => {
    fetchFriends();
    fetchRequests();
    fetchSuggestions();
  }, []);

  // Debounced search function
  const debouncedSearch = debounce(async (term) => {
    if (!term.trim()) {
      fetchSuggestions();
      return;
    }
    
    setSearching(true);
    try {
      const data = await apiRequest(`${API_URL}/api/users/search?q=${encodeURIComponent(term)}`, {
        method: 'GET'
      });
      
      setSuggestions(data);
    } catch (err) {
      console.error('Ошибка при поиске:', err);
      showNotification('Ошибка поиска', 'danger');
    } finally {
      setSearching(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);
  
  const fetchFriends = async () => {
    try {
      const data = await apiRequest(`${API_URL}/api/friends`, {
        method: 'GET'
      });
      
      setFriends(data);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const fetchRequests = async () => {
    try {
      const data = await apiRequest(`${API_URL}/api/friends/requests`, {
        method: 'GET'
      });
      
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const fetchSuggestions = async () => {
    try {
      const data = await apiRequest(`${API_URL}/api/friends/suggestions`, {
        method: 'GET'
      });
      
      setSuggestions(data);
    } catch (err) {
      console.error('Ошибка при загрузке рекомендаций:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptRequest = async (userId) => {
    try {
      await apiRequest(`${API_URL}/api/friends/accept/${userId}`, {
        method: 'POST'
      });
      
      // Удаляем пользователя из запросов и добавляем в друзья
      const user = requests.find(req => req.id === userId);
      setRequests(requests.filter(req => req.id !== userId));
      setFriends([...friends, user]);
      showNotification('Запрос в друзья принят', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при принятии запроса', 'danger');
    }
  };
  
  const handleRejectRequest = async (userId) => {
    try {
      await apiRequest(`${API_URL}/api/friends/reject/${userId}`, {
        method: 'POST'
      });
      
      // Удаляем пользователя из запросов
      setRequests(requests.filter(req => req.id !== userId));
      showNotification('Запрос в друзья отклонен', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при отклонении запроса', 'danger');
    }
  };
  
  const handleRemoveFriend = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя из друзей?')) {
      return;
    }
    
    try {
      await apiRequest(`${API_URL}/api/friends/${userId}`, {
        method: 'DELETE'
      });
      
      // Удаляем пользователя из друзей
      setFriends(friends.filter(friend => friend.id !== userId));
      showNotification('Пользователь удален из друзей', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при удалении из друзей', 'danger');
    }
  };
  
  const handleSendRequest = async (userId) => {
    try {
      await apiRequest(`${API_URL}/api/friends/request/${userId}`, {
        method: 'POST'
      });
      
      // Обновляем состояние, чтобы отразить отправленный запрос
      setSuggestions(suggestions.map(user => 
        user.id === userId 
          ? { ...user, request_sent: true } 
          : user
      ));
      showNotification('Запрос в друзья отправлен', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при отправке запроса', 'danger');
    }
  };

  const headerStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'white',
    marginBottom: '1rem',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    letterSpacing: '-0.02em',
    textAlign: 'center',
  };

  const searchStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '0.875rem 1.25rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  };

  const tabsContainerStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    padding: '1.5rem',
    marginBottom: '2rem',
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '20px',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  };

  const avatarStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid rgba(102, 126, 234, 0.2)',
    marginBottom: '1rem',
    transition: 'all 0.3s ease',
  };

  const nameStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1rem',
    textAlign: 'center',
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
    justifyContent: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    width: '100%',
    marginBottom: '0.5rem',
  };

  const secondaryButtonStyle = {
    background: 'rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    color: '#718096',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    width: '100%',
    marginBottom: '0.5rem',
  };

  const successButtonStyle = {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    marginBottom: '0.5rem',
  };

  const dangerButtonStyle = {
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    marginBottom: '0.5rem',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '3rem',
    color: 'rgba(255, 255, 255, 0.8)',
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

  const filteredFriends = searchTerm 
    ? friends.filter(friend => 
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : friends;
  
  return (
    <Container className="fade-in">
      {/* Заголовок */}
      <div style={headerStyle}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-30%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}></div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={titleStyle}>
            <i className="bi bi-people me-3"></i>
            Друзья
          </h1>
          
          <Form style={{ maxWidth: '500px', margin: '0 auto' }}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Поиск друзей по имени..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
              />
              <div style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#667eea',
                pointerEvents: 'none',
              }}>
                {searching ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderTop: '2px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}></div>
                ) : (
                  <i className="bi bi-search"></i>
                )}
              </div>
            </InputGroup>
          </Form>
        </div>
      </div>
      
      {error && (
        <Alert 
          variant="danger" 
          className="alert-modern"
          style={{
            background: 'rgba(229, 62, 62, 0.1)',
            border: '1px solid rgba(229, 62, 62, 0.2)',
            borderRadius: '16px',
            color: '#e53e3e',
            marginBottom: '2rem',
          }}
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}
      
      <div style={tabsContainerStyle}>
        <Tabs 
          activeKey={activeTab} 
          onSelect={setActiveTab}
          className="nav-tabs-modern"
        >
          <Tab 
            eventKey="friends" 
            title={
              <span>
                <i className="bi bi-people me-2"></i>
                Мои друзья ({friends.length})
              </span>
            }
          >
            <div style={{ marginTop: '2rem' }}>
              {filteredFriends.length > 0 ? (
                <Row>
                  {filteredFriends.map((friend, index) => (
                    <Col key={friend.id} sm={6} md={4} lg={3} className="mb-4">
                      <div 
                        style={cardStyle}
                        className="slide-in-left"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                        }}
                        style={{
                          ...cardStyle,
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <img 
                            src={friend.avatar || getDefaultAvatar()} 
                            alt={friend.name} 
                            style={avatarStyle}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.borderColor = '#667eea';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                            }}
                            onError={(e) => {
                              e.target.src = getDefaultAvatar();
                            }}
                          />
                          <h5 style={nameStyle}>{friend.name}</h5>
                        </div>
                        
                        <div>
                          <Link 
                            to={`/profile/${friend.id}`} 
                            style={secondaryButtonStyle}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(0, 0, 0, 0.15)';
                              e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            <i className="bi bi-person"></i>
                            Профиль
                          </Link>
                          <Link 
                            to={`/chat/${friend.id}`} 
                            style={buttonStyle}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <i className="bi bi-chat-dots"></i>
                            Сообщение
                          </Link>
                          <button 
                            style={dangerButtonStyle}
                            onClick={() => handleRemoveFriend(friend.id)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 8px 20px rgba(250, 112, 154, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <i className="bi bi-person-dash"></i>
                            Удалить
                          </button>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={emptyStateStyle}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
                    <i className="bi bi-people"></i>
                  </div>
                  <h5 style={{ color: 'white', marginBottom: '1rem' }}>
                    {searchTerm ? 'Друзья не найдены' : 'Нет друзей'}
                  </h5>
                  <p>
                    {searchTerm ? 
                      'Попробуйте изменить поисковый запрос' :
                      'У вас пока нет друзей. Добавьте интересных людей во вкладке "Рекомендации".'
                    }
                  </p>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab 
            eventKey="requests" 
            title={
              <span>
                <i className="bi bi-person-plus me-2"></i>
                Заявки ({requests.length})
                {requests.length > 0 && (
                  <span style={{
                    background: '#e53e3e',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    marginLeft: '0.5rem',
                  }}>
                    {requests.length}
                  </span>
                )}
              </span>
            }
          >
            <div style={{ marginTop: '2rem' }}>
              {requests.length > 0 ? (
                <Row>
                  {requests.map((request, index) => (
                    <Col key={request.id} sm={6} md={4} lg={3} className="mb-4">
                      <div 
                        style={cardStyle}
                        className="slide-in-left"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                        }}
                        style={{
                          ...cardStyle,
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <img 
                            src={request.avatar || getDefaultAvatar()} 
                            alt={request.name} 
                            style={avatarStyle}
                            onError={(e) => {
                              e.target.src = getDefaultAvatar();
                            }}
                          />
                          <h5 style={nameStyle}>{request.name}</h5>
                        </div>
                        
                        <div>
                          <Link 
                            to={`/profile/${request.id}`} 
                            style={secondaryButtonStyle}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(0, 0, 0, 0.15)';
                              e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            <i className="bi bi-person"></i>
                            Профиль
                          </Link>
                          <button 
                            style={successButtonStyle}
                            onClick={() => handleAcceptRequest(request.id)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <i className="bi bi-check-lg"></i>
                            Принять
                          </button>
                          <button 
                            style={dangerButtonStyle}
                            onClick={() => handleRejectRequest(request.id)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 8px 20px rgba(250, 112, 154, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <i className="bi bi-x-lg"></i>
                            Отклонить
                          </button>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={emptyStateStyle}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
                    <i className="bi bi-person-plus"></i>
                  </div>
                  <h5 style={{ color: 'white', marginBottom: '1rem' }}>
                    Нет запросов в друзья
                  </h5>
                  <p>У вас нет новых запросов в друзья.</p>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab 
            eventKey="suggestions" 
            title={
              <span>
                <i className="bi bi-search me-2"></i>
                Рекомендации
              </span>
            }
          >
            <div style={{ marginTop: '2rem' }}>
              {suggestions.length > 0 ? (
                <Row>
                  {suggestions.map((user, index) => (
                    <Col key={user.id} sm={6} md={4} lg={3} className="mb-4">
                      <div 
                        style={cardStyle}
                        className="slide-in-left"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                        }}
                        style={{
                          ...cardStyle,
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <img 
                            src={user.avatar || getDefaultAvatar()} 
                            alt={user.name} 
                            style={avatarStyle}
                            onError={(e) => {
                              e.target.src = getDefaultAvatar();
                            }}
                          />
                          <h5 style={nameStyle}>{user.name}</h5>
                        </div>
                        
                        <div>
                          <Link 
                            to={`/profile/${user.id}`} 
                            style={secondaryButtonStyle}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(0, 0, 0, 0.15)';
                              e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            <i className="bi bi-person"></i>
                            Профиль
                          </Link>
                          
                          {user.request_sent ? (
                            <button 
                              style={{
                                ...secondaryButtonStyle,
                                opacity: 0.7,
                                cursor: 'not-allowed',
                              }}
                              disabled
                            >
                              <i className="bi bi-clock"></i>
                              Запрос отправлен
                            </button>
                          ) : (
                            <button 
                              style={buttonStyle}
                              onClick={() => handleSendRequest(user.id)}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              <i className="bi bi-person-plus"></i>
                              Добавить в друзья
                            </button>
                          )}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={emptyStateStyle}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
                    <i className="bi bi-search"></i>
                  </div>
                  <h5 style={{ color: 'white', marginBottom: '1rem' }}>
                    {searching ? 'Поиск...' : 'Нет рекомендаций'}
                  </h5>
                  <p>
                    {searching ? 
                      'Ищем пользователей...' :
                      searchTerm ? 
                        'Попробуйте изменить поисковый запрос' :
                        'В данный момент нет рекомендаций по добавлению друзей.'
                    }
                  </p>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .friends-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default Friends;