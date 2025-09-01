// Profile.js - Современная страница профиля пользователя

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Alert, Tabs, Tab, Modal, Form } from 'react-bootstrap';
import PostItem from '../posts/PostItem';
import { API_URL, apiRequest, TokenService, getDefaultAvatar, showNotification, validateName, isValidImageUrl, decodeContent } from '../../config';

const Profile = ({ currentUser }) => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    avatar: ''
  });
  const [updating, setUpdating] = useState(false);
  
  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest(`${API_URL}/api/users/${userId}`, {
          method: 'GET'
        });
        
        setProfile(data);
        setFormData({
          name: data.name,
          status: data.status || '',
          avatar: data.avatar || ''
        });
        
        // Проверяем, является ли пользователь другом
        if (currentUser && currentUser.id !== data.id) {
          try {
            const friendData = await apiRequest(`${API_URL}/api/friends/status/${data.id}`, {
              method: 'GET'
            });
            
            setIsFriend(friendData.status === 'friends');
            setFriendRequestSent(friendData.status === 'pending_sent');
          } catch (err) {
            console.error('Ошибка получения статуса дружбы:', err);
          }
        }
        
        // Загружаем посты пользователя
        try {
          const postsData = await apiRequest(`${API_URL}/api/posts/user/${userId}`, {
            method: 'GET'
          });
          
          setPosts(postsData);
        } catch (err) {
          console.error('Ошибка загрузки постов:', err);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId, currentUser]);
  
  const handleFriendRequest = async () => {
    try {
      await apiRequest(`${API_URL}/api/friends/request/${profile.id}`, {
        method: 'POST'
      });
      
      setFriendRequestSent(true);
      showNotification('Запрос в друзья отправлен', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при отправке запроса', 'danger');
    }
  };
  
  const handleRemoveFriend = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя из друзей?')) {
      return;
    }
    
    try {
      await apiRequest(`${API_URL}/api/friends/${profile.id}`, {
        method: 'DELETE'
      });
      
      setIsFriend(false);
      showNotification('Пользователь удален из друзей', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при удалении из друзей', 'danger');
    }
  };
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!validateName(formData.name)) {
      showNotification('Имя должно содержать минимум 2 символа', 'danger');
      return;
    }
    
    if (formData.avatar && !isValidImageUrl(formData.avatar)) {
      showNotification('Введите корректный URL изображения', 'danger');
      return;
    }
    
    setUpdating(true);
    
    try {
      const response = await apiRequest(`${API_URL}/api/users/${currentUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      // Если в ответе есть новый токен, обновляем его
      if (response.token) {
        TokenService.setToken(response.token);
      }
      
      setProfile(response.user || response);
      setShowEditModal(false);
      showNotification('Профиль обновлен', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка при обновлении профиля', 'danger');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleLike = async (postId) => {
    try {
      await apiRequest(`${API_URL}/api/posts/${postId}/like`, {
        method: 'POST'
      });
      
      // Обновляем состояние, чтобы отразить лайк
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.liked_by_current_user 
                ? post.likes.filter(like => like.user_id !== currentUser.id) 
                : [...post.likes, { user_id: currentUser.id }],
              liked_by_current_user: !post.liked_by_current_user
            } 
          : post
      ));
    } catch (err) {
      console.error('Ошибка при лайке:', err);
      showNotification('Ошибка при лайке', 'danger');
    }
  };
  
  const handleComment = async (postId, commentText) => {
    try {
      const newComment = await apiRequest(`${API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText })
      });
      
      // Обновляем посты с новым комментарием
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] } 
          : post
      ));
      
      return true;
    } catch (err) {
      console.error('Ошибка при комментировании:', err);
      return false;
    }
  };
  
  const handleRepost = async (postId) => {
    try {
      const newPost = await apiRequest(`${API_URL}/api/posts/${postId}/repost`, {
        method: 'POST'
      });
      
      // Добавляем новый репост в начало ленты
      setPosts([newPost, ...posts]);
      showNotification('Пост репостнут', 'success');
    } catch (err) {
      console.error('Ошибка при репосте:', err);
      showNotification('Ошибка при репосте', 'danger');
    }
  };

  const profileHeaderStyle = {
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

  const avatarStyle = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '6px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem',
  };

  const nameStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'white',
    marginBottom: '0.5rem',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    letterSpacing: '-0.02em',
  };

  const statusStyle = {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '2rem',
    fontStyle: 'italic',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const statsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    marginBottom: '2rem',
  };

  const statStyle = {
    textAlign: 'center',
  };

  const statCountStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'white',
    display: 'block',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const statLabelStyle = {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '500',
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0.875rem 2rem',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    margin: '0 0.5rem',
  };

  const secondaryButtonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '0.875rem 2rem',
    color: 'black',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    margin: '0 0.5rem',
  };

  const dangerButtonStyle = {
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0.875rem 2rem',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    margin: '0 0.5rem',
  };

  const tabsStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    padding: '1.5rem',
    marginBottom: '2rem',
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
  
  if (!profile) {
    return (
      <Container>
        <Alert variant="warning" className="alert-modern">
          <i className="bi bi-person-x me-2"></i>
          Профиль не найден
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="fade-in">
      {/* Шапка профиля */}
      <div style={profileHeaderStyle}>
        {/* Декоративные элементы */}
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

        <Row className="align-items-center" style={{ position: 'relative', zIndex: 2 }}>
          <Col md={4} className="text-center">
            <img 
              src={profile.avatar || getDefaultAvatar()} 
              alt={profile.name} 
              style={avatarStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              onError={(e) => {
                e.target.src = getDefaultAvatar();
              }}
            />
          </Col>
          <Col md={8}>
            <h1 style={nameStyle}>{profile.name}</h1>
            <p style={statusStyle}>
              {profile.status ? decodeContent(profile.status) : 'Статус не указан'}
            </p>
            
            <div style={statsStyle}>
              <div style={statStyle}>
                <span style={statCountStyle}>{profile.friends_count || 0}</span>
                <div style={statLabelStyle}>Друзей</div>
              </div>
              <div style={statStyle}>
                <span style={statCountStyle}>{posts.length}</span>
                <div style={statLabelStyle}>Постов</div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              {isOwnProfile ? (
                <button 
                  style={buttonStyle}
                  onClick={() => setShowEditModal(true)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <i className="bi bi-pencil"></i>
                  Редактировать профиль
                </button>
              ) : (
                <>
                  {isFriend ? (
                    <>
                      <Link 
                        to={`/chat/${profile.id}`} 
                        style={buttonStyle}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-chat-dots"></i>
                        Написать сообщение
                      </Link>
                      <button 
                        style={dangerButtonStyle}
                        onClick={handleRemoveFriend}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 10px 25px rgba(250, 112, 154, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-person-dash"></i>
                        Удалить из друзей
                      </button>
                    </>
                  ) : friendRequestSent ? (
                    <button 
                      style={{...secondaryButtonStyle, opacity: 0.7, cursor: 'not-allowed'}}
                      disabled
                    >
                      <i className="bi bi-clock"></i>
                      Запрос отправлен
                    </button>
                  ) : (
                    <button 
                      style={buttonStyle}
                      onClick={handleFriendRequest}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
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
                </>
              )}
            </div>
          </Col>
        </Row>
      </div>
      
      {/* Вкладки профиля */}
      <div style={tabsStyle}>
        <Tabs defaultActiveKey="posts" className="nav-tabs-modern">
          <Tab eventKey="posts" title={
            <span>
              <i className="bi bi-newspaper me-2"></i>
              Посты ({posts.length})
            </span>
          }>
            <div style={{ marginTop: '1.5rem' }}>
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <div 
                    key={post.id}
                    className="slide-in-left"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <PostItem 
                      post={post} 
                      currentUser={currentUser}
                      onLike={handleLike}
                      onComment={handleComment}
                      onRepost={handleRepost}
                    />
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
                    <i className="bi bi-file-post"></i>
                  </div>
                  <h5 style={{ color: 'white', marginBottom: '1rem' }}>
                    Нет постов
                  </h5>
                  <p>
                    {isOwnProfile ? 
                      'У вас пока нет постов. Создайте свой первый пост!' : 
                      'У пользователя пока нет постов.'
                    }
                  </p>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab eventKey="friends" title={
            <span>
              <i className="bi bi-people me-2"></i>
              Друзья ({profile.friends_count || 0})
            </span>
          }>
            <div style={{ marginTop: '1.5rem' }}>
              {profile.friends && profile.friends.length > 0 ? (
                <Row className="friends-grid">
                  {profile.friends.map(friend => (
                    <Col key={friend.id} sm={6} md={4} lg={3} className="mb-4">
                      <div className="friend-card glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <img 
                          src={friend.avatar || getDefaultAvatar()} 
                          alt={friend.name} 
                          className="friend-avatar"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginBottom: '1rem',
                            border: '3px solid rgba(255, 255, 255, 0.5)',
                          }}
                          onError={(e) => {
                            e.target.src = getDefaultAvatar();
                          }}
                        />
                        <h6 style={{ color: 'black', marginBottom: '1rem', fontWeight: '600' }}>
                          {friend.name}
                        </h6>
                        <Link 
                          to={`/profile/${friend.id}`} 
                          style={{
                            ...secondaryButtonStyle,
                            fontSize: '0.8rem',
                            padding: '0.5rem 1rem',
                            margin: 0,
                          }}
                        >
                          Профиль
                        </Link>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
                    <i className="bi bi-people"></i>
                  </div>
                  <h5 style={{ color: 'white', marginBottom: '1rem' }}>
                    Нет друзей
                  </h5>
                  <p>
                    {isOwnProfile ? 
                      'У вас пока нет друзей. Найдите интересных людей и добавьте их в друзья!' : 
                      'У пользователя пока нет друзей.'
                    }
                  </p>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
      
      {/* Модальное окно редактирования профиля */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        className="modal-modern"
        centered
      >
        <Modal.Header 
          closeButton 
          style={{
            border: 'none',
            paddingBottom: 0,
          }}
        >
          <Modal.Title style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#2d3748',
          }}>
            <i className="bi bi-pencil me-2"></i>
            Редактирование профиля
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleProfileUpdate}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                Имя
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-control-modern"
                style={{
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                Статус
              </Form.Label>
              <Form.Control
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                placeholder="Расскажите о себе"
                className="form-control-modern"
                style={{
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                URL аватара
              </Form.Label>
              <Form.Control
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="URL изображения"
                className="form-control-modern"
                style={{
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                }}
              />
              <Form.Text style={{ color: '#718096', fontSize: '0.85rem' }}>
                Введите URL изображения для вашего аватара
              </Form.Text>
              
              {/* Предварительный просмотр аватара */}
              {formData.avatar && isValidImageUrl(formData.avatar) && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <img 
                    src={formData.avatar} 
                    alt="Предварительный просмотр" 
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid rgba(102, 126, 234, 0.3)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  color: '#718096',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                }}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={updating}
                style={{
                  ...buttonStyle,
                  margin: 0,
                  opacity: updating ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!updating) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {updating ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check"></i>
                    Сохранить
                  </>
                )}
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .profile-stats {
            flex-direction: column;
            gap: 1rem;
          }
          
          .friends-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }
      `}</style>
    </Container>
  );
};

export default Profile;