// Home.js - Современная главная страница с лентой постов

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Alert } from 'react-bootstrap';
import PostItem from '../posts/PostItem';
import CreatePost from '../posts/CreatePost';
import { API_URL, apiRequest, getDefaultAvatar, showNotification, decodeContent } from '../../config';

const Home = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      
      const data = await apiRequest(`${API_URL}/api/posts`, {
        method: 'GET'
      });
      
      setPosts(data);
    } catch (err) {
      setError(err.message);
      showNotification('Ошибка загрузки постов', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
    showNotification('Пост опубликован!', 'success');
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
                ? post.likes.filter(like => like.user_id !== user.id) 
                : [...post.likes, { user_id: user.id }],
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
      
      showNotification('Комментарий добавлен', 'success');
      return true;
    } catch (err) {
      console.error('Ошибка при комментировании:', err);
      showNotification('Ошибка при добавлении комментария', 'danger');
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
      showNotification('Пост репостнут!', 'success');
    } catch (err) {
      console.error('Ошибка при репосте:', err);
      showNotification('Ошибка при репосте', 'danger');
    }
  };

  const handleRefresh = () => {
    fetchPosts(false);
  };

  const sidebarStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    padding: '2rem',
    marginBottom: '1.5rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    position: 'sticky',
    top: '2rem',
  };

  const userInfoStyle = {
    textAlign: 'center',
  };

  const avatarStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    marginBottom: '1rem',
    transition: 'all 0.3s ease',
  };

  const userNameStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '0.5rem',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const userStatusStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
  };

  const profileLinkStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
  };

  const feedHeaderStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const feedTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const refreshButtonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const emptyStateStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    padding: '3rem',
    textAlign: 'center',
    marginTop: '2rem',
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
  
  return (
    <div className="fade-in">
      <Row>
        <Col lg={3} className="d-none d-lg-block">
          {/* Боковая панель с информацией о пользователе */}
          <div 
            style={sidebarStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={userInfoStyle}>
              <img 
                src={user.avatar || getDefaultAvatar()} 
                alt={user.name} 
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
              <h5 style={userNameStyle}>{user.name}</h5>
              <p style={userStatusStyle}>
                {user.status ? decodeContent(user.status) : 'Статус не указан'}
              </p>
              <Link 
                to={`/profile/${user.id}`} 
                style={profileLinkStyle}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <i className="bi bi-person-circle"></i>
                Мой профиль
              </Link>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div style={sidebarStyle}>
            <h6 style={{ color: 'white', marginBottom: '1rem', fontWeight: '600' }}>
              Быстрые ссылки
            </h6>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link 
                to="/friends" 
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                }}
              >
                <i className="bi bi-people"></i>
                Друзья
              </Link>
              <Link 
                to="/chat" 
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                }}
              >
                <i className="bi bi-chat-dots"></i>
                Сообщения
              </Link>
            </div>
          </div>
        </Col>
        
        <Col lg={9}>
          {/* Заголовок ленты */}
          <div style={feedHeaderStyle}>
            <h4 style={feedTitleStyle}>
              <i className="bi bi-house-door me-2"></i>
              Лента новостей
            </h4>
            <button
              style={refreshButtonStyle}
              onClick={handleRefresh}
              disabled={refreshing}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className={`bi bi-arrow-clockwise ${refreshing ? 'spin' : ''}`}></i>
              {refreshing ? 'Обновление...' : 'Обновить'}
            </button>
          </div>

          {/* Форма создания поста */}
          <CreatePost onPostCreated={handleNewPost} />
          
          {/* Сообщение об ошибке */}
          {error && (
            <Alert 
              variant="danger" 
              className="alert-modern"
              style={{
                background: 'rgba(229, 62, 62, 0.1)',
                border: '1px solid rgba(229, 62, 62, 0.2)',
                borderRadius: '16px',
                color: '#e53e3e',
                marginBottom: '1.5rem',
              }}
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
          
          {/* Лента постов */}
          {posts.length > 0 ? (
            <div className="posts-container">
              {posts.map((post, index) => (
                <div 
                  key={post.id}
                  className="slide-in-left"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <PostItem 
                    post={post} 
                    currentUser={user}
                    onLike={handleLike}
                    onComment={handleComment}
                    onRepost={handleRepost}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '1rem' }}>
                <i className="bi bi-newspaper"></i>
              </div>
              <h5 style={{ color: 'white', marginBottom: '1rem', fontWeight: '600' }}>
                Нет постов в ленте
              </h5>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1.5rem' }}>
                Здесь будут отображаться посты ваших друзей и ваши собственные посты.
              </p>
              <Link 
                to="/friends" 
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
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
              </Link>
            </div>
          )}
        </Col>
      </Row>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 991px) {
          .posts-container {
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;