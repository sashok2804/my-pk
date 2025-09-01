// AdminPanel.js - Современная админ-панель с glassmorphism дизайном

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Tabs, Tab, Form, Alert } from 'react-bootstrap';
import { API_URL, apiRequest, formatDate, getDefaultAvatar, showNotification, formatCount, decodeContent } from '../../config';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    newUsersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchPosts, setSearchPosts] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchPosts();
  }, []);
  
  const fetchStats = async () => {
    try {
      const data = await apiRequest(`${API_URL}/api/admin/stats`, {
        method: 'GET'
      });
      
      setStats(data);
    } catch (err) {
      setError(err.message);
      showNotification('Ошибка загрузки статистики', 'danger');
    }
  };
  
  const fetchUsers = async () => {
    try {
      const data = await apiRequest(`${API_URL}/api/admin/users`, {
        method: 'GET'
      });
      
      setUsers(data);
    } catch (err) {
      setError(err.message);
      showNotification('Ошибка загрузки пользователей', 'danger');
    }
  };
  
  const fetchPosts = async () => {
    try {
      const data = await apiRequest(`${API_URL}/api/admin/posts`, {
        method: 'GET'
      });
      
      setPosts(data);
    } catch (err) {
      setError(err.message);
      showNotification('Ошибка загрузки постов', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }
    
    try {
      await apiRequest(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      // Обновляем список пользователей
      setUsers(users.filter(user => user.id !== userId));
      
      // Обновляем статистику
      fetchStats();
      showNotification('Пользователь удален', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при удалении пользователя', 'danger');
    }
  };
  
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }
    
    try {
      await apiRequest(`${API_URL}/api/admin/posts/${postId}`, {
        method: 'DELETE'
      });
      
      // Обновляем список постов
      setPosts(posts.filter(post => post.id !== postId));
      
      // Обновляем статистику
      fetchStats();
      showNotification('Пост удален', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при удалении поста', 'danger');
    }
  };
  
  const handleToggleAdmin = async (userId, isAdmin) => {
    const action = isAdmin ? 'снять права администратора' : 'назначить администратором';
    if (!window.confirm(`Вы уверены, что хотите ${action} для этого пользователя?`)) {
      return;
    }
    
    try {
      await apiRequest(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: isAdmin ? 'user' : 'admin' })
      });
      
      // Обновляем список пользователей
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: isAdmin ? 'user' : 'admin' } 
          : user
      ));
      
      showNotification(`Роль пользователя ${isAdmin ? 'снижена' : 'повышена'}`, 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при изменении роли пользователя', 'danger');
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
    marginBottom: '0.5rem',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    letterSpacing: '-0.02em',
    textAlign: 'center',
  };

  const subtitleStyle = {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    margin: 0,
  };

  const statsCardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '20px',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const statValueStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.5rem',
  };

  const statLabelStyle = {
    fontSize: '0.9rem',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
  };

  const contentCardStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    padding: '2rem',
    marginBottom: '2rem',
  };

  const tableStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  };

  const searchStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    marginBottom: '1rem',
  };

  const buttonStyle = {
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    margin: '0 0.25rem',
    cursor: 'pointer',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: 'white',
  };

  const successButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: 'white',
  };

  const warningButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: 'white',
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchPosts.toLowerCase()) ||
    post.user.name.toLowerCase().includes(searchPosts.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="loader">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  
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
            <i className="bi bi-gear me-3"></i>
            Панель администратора
          </h1>
          <p style={subtitleStyle}>
            Управление пользователями и контентом
          </p>
        </div>
      </div>

      {error && (
        <Alert 
          variant="danger"
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
      
      {/* Статистика */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <div 
            style={statsCardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={statValueStyle}>{formatCount(stats.totalUsers)}</div>
            <div style={statLabelStyle}>
              <i className="bi bi-people me-2"></i>
              Пользователей
            </div>
          </div>
        </Col>
        <Col md={3} className="mb-3">
          <div 
            style={statsCardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={statValueStyle}>{formatCount(stats.totalPosts)}</div>
            <div style={statLabelStyle}>
              <i className="bi bi-file-post me-2"></i>
              Постов
            </div>
          </div>
        </Col>
        <Col md={3} className="mb-3">
          <div 
            style={statsCardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={statValueStyle}>{formatCount(stats.totalComments)}</div>
            <div style={statLabelStyle}>
              <i className="bi bi-chat me-2"></i>
              Комментариев
            </div>
          </div>
        </Col>
        <Col md={3} className="mb-3">
          <div 
            style={statsCardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={statValueStyle}>{formatCount(stats.newUsersToday)}</div>
            <div style={statLabelStyle}>
              <i className="bi bi-person-plus me-2"></i>
              Новых сегодня
            </div>
          </div>
        </Col>
      </Row>
      
      {/* Основной контент */}
      <div style={contentCardStyle}>
        <Tabs 
          activeKey={activeTab} 
          onSelect={setActiveTab}
          className="nav-tabs-modern"
        >
          {/* Вкладка пользователей */}
          <Tab 
            eventKey="users" 
            title={
              <span>
                <i className="bi bi-people me-2"></i>
                Пользователи ({users.length})
              </span>
            }
          >
            <div style={{ marginTop: '2rem' }}>
              <Form.Control
                type="text"
                placeholder="Поиск пользователей по имени или email..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                style={searchStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              <div style={tableStyle}>
                <Table hover className="mb-0">
                  <thead style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                    <tr>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>ID</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Пользователь</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Email</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Роль</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Дата регистрации</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr 
                        key={user.id}
                        style={{ 
                          transition: 'all 0.3s ease',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none' }}>
                          #{user.id}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img 
                              src={user.avatar || getDefaultAvatar()} 
                              alt={user.name} 
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginRight: '0.75rem',
                                border: '2px solid rgba(102, 126, 234, 0.2)',
                              }}
                              onError={(e) => {
                                e.target.src = getDefaultAvatar();
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: '600', color: '#2d3748' }}>{user.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none', color: '#4a5568' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: user.role === 'admin' 
                              ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                              : 'rgba(102, 126, 234, 0.1)',
                            color: user.role === 'admin' ? 'white' : '#667eea',
                          }}>
                            {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none', color: '#4a5568' }}>
                          {formatDate(user.created_at)}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none' }}>
                          <button
                            style={user.role === 'admin' ? warningButtonStyle : successButtonStyle}
                            onClick={() => handleToggleAdmin(user.id, user.role === 'admin')}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <i className={`bi ${user.role === 'admin' ? 'bi-arrow-down' : 'bi-arrow-up'} me-1`}></i>
                            {user.role === 'admin' ? 'Снять' : 'Назначить'}
                          </button>
                          <button
                            style={dangerButtonStyle}
                            onClick={() => handleDeleteUser(user.id)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(250, 112, 154, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Tab>
          
          {/* Вкладка постов */}
          <Tab 
            eventKey="posts" 
            title={
              <span>
                <i className="bi bi-file-post me-2"></i>
                Посты ({posts.length})
              </span>
            }
          >
            <div style={{ marginTop: '2rem' }}>
              <Form.Control
                type="text"
                placeholder="Поиск постов по содержимому или автору..."
                value={searchPosts}
                onChange={(e) => setSearchPosts(e.target.value)}
                style={searchStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              <div style={tableStyle}>
                <Table hover className="mb-0">
                  <thead style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                    <tr>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>ID</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Автор</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Содержание</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Дата</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Статистика</th>
                      <th style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        color: '#667eea',
                        border: 'none',
                      }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map(post => (
                      <tr 
                        key={post.id}
                        style={{ 
                          transition: 'all 0.3s ease',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none' }}>
                          #{post.id}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img 
                              src={post.user.avatar || getDefaultAvatar()} 
                              alt={post.user.name} 
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginRight: '0.75rem',
                                border: '2px solid rgba(102, 126, 234, 0.2)',
                              }}
                              onError={(e) => {
                                e.target.src = getDefaultAvatar();
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: '600', color: '#2d3748' }}>{post.user.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                                ID: {post.user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none' }}>
                          <div style={{ 
                            maxWidth: '300px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            color: '#4a5568',
                            lineHeight: '1.4',
                          }}>
                            {decodeContent(post.content)}
                          </div>
                          {post.image && (
                            <div style={{ 
                              marginTop: '0.5rem', 
                              fontSize: '0.8rem', 
                              color: '#667eea',
                              display: 'flex',
                              alignItems: 'center',
                            }}>
                              <i className="bi bi-image me-1"></i>
                              Есть изображение
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none', color: '#4a5568' }}>
                          {formatDate(post.created_at)}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                              <i className="bi bi-heart me-1"></i>
                              {post.likes_count || 0} лайков
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                              <i className="bi bi-chat me-1"></i>
                              {post.comments_count || 0} комментариев
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', border: 'none' }}>
                          <button
                            style={dangerButtonStyle}
                            onClick={() => handleDeletePost(post.id)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(250, 112, 154, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
};

export default AdminPanel;