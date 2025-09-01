// PostItem.js - Современный компонент отдельного поста с анимациями

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, getDefaultAvatar, CONSTANTS, decodeContent } from '../../config';

const PostItem = ({ post, currentUser, onLike, onComment, onRepost }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(post.liked_by_current_user);
  const [likesCount, setLikesCount] = useState(post.likes ? post.likes.length : 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const commentInputRef = useRef(null);
  
  useEffect(() => {
    setIsLiked(post.liked_by_current_user);
    setLikesCount(post.likes ? post.likes.length : 0);
  }, [post]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    if (commentText.length > CONSTANTS.MAX_COMMENT_LENGTH) {
      alert(`Комментарий слишком длинный. Максимум ${CONSTANTS.MAX_COMMENT_LENGTH} символов`);
      return;
    }
    
    setSubmittingComment(true);
    
    const success = await onComment(post.id, commentText);
    
    if (success) {
      setCommentText('');
      if (commentInputRef.current) {
        commentInputRef.current.style.height = 'auto';
      }
    }
    
    setSubmittingComment(false);
  };

  const handleLike = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Оптимистичное обновление UI
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    
    try {
      await onLike(post.id);
    } catch (error) {
      // Откатываем изменения при ошибке
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleCommentTextChange = (e) => {
    setCommentText(e.target.value);
    
    // Автоматически изменяем высоту textarea
    if (commentInputRef.current) {
      commentInputRef.current.style.height = 'auto';
      commentInputRef.current.style.height = commentInputRef.current.scrollHeight + 'px';
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
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

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  };

  const avatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(102, 126, 234, 0.2)',
    transition: 'all 0.3s ease',
  };

  const userInfoStyle = {
    marginLeft: '1rem',
    flex: 1,
  };

  const usernameStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    marginBottom: '0.25rem',
    display: 'block',
  };

  const timeStyle = {
    fontSize: '0.85rem',
    color: '#718096',
    margin: 0,
  };

  const contentStyle = {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#2d3748',
    marginBottom: '1rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  };

  const imageStyle = {
    width: '100%',
    borderRadius: '16px',
    marginBottom: '1rem',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const statsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    marginBottom: '0.75rem',
    fontSize: '0.85rem',
    color: '#718096',
  };

  const actionsStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0.5rem 0',
  };

  const actionButtonStyle = (isActive = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: 'none',
    background: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
    color: isActive ? '#667eea' : '#718096',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.9rem',
    fontWeight: '500',
  });

  const commentsStyle = {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  };

  const commentStyle = {
    display: 'flex',
    marginBottom: '1rem',
    animation: 'slideIn 0.3s ease',
  };

  const commentAvatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid rgba(102, 126, 234, 0.2)',
  };

  const commentContentStyle = {
    flex: 1,
    marginLeft: '0.75rem',
    background: 'rgba(0, 0, 0, 0.05)',
    padding: '0.75rem 1rem',
    borderRadius: '16px',
    fontSize: '0.9rem',
  };

  const commentUserStyle = {
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '0.25rem',
    textDecoration: 'none',
  };

  const commentFormStyle = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
    alignItems: 'flex-end',
  };

  const commentInputStyle = {
    flex: 1,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '20px',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
  };

  const submitButtonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Заголовок поста */}
      <div style={headerStyle}>
        <Link to={`/profile/${post.user.id}`}>
          <img 
            src={post.user.avatar || getDefaultAvatar()} 
            alt={post.user.name} 
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
        </Link>
        <div style={userInfoStyle}>
          <Link 
            to={`/profile/${post.user.id}`} 
            style={usernameStyle}
            onMouseEnter={(e) => {
              e.target.style.color = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#2d3748';
            }}
          >
            {post.user.name}
          </Link>
          <p style={timeStyle}>{formatDate(post.created_at)}</p>
        </div>
      </div>
      
      {/* Репост */}
      {post.original_post && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            fontSize: '0.85rem',
            color: '#718096',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <i className="bi bi-arrow-repeat"></i>
            Репост от {post.user.name}
          </div>
          
          <div style={headerStyle}>
            <Link to={`/profile/${post.original_post.user.id}`}>
              <img 
                src={post.original_post.user.avatar || getDefaultAvatar()} 
                alt={post.original_post.user.name} 
                style={{...avatarStyle, width: '40px', height: '40px'}}
                onError={(e) => {
                  e.target.src = getDefaultAvatar();
                }}
              />
            </Link>
            <div style={userInfoStyle}>
              <Link 
                to={`/profile/${post.original_post.user.id}`} 
                style={{...usernameStyle, fontSize: '1rem'}}
              >
                {post.original_post.user.name}
              </Link>
              <p style={timeStyle}>{formatDate(post.original_post.created_at)}</p>
            </div>
          </div>
          
          <div style={contentStyle}>
            {decodeContent(post.original_post.content)}
          </div>
          
          {post.original_post.image && (
            <img 
              src={post.original_post.image} 
              alt="Изображение к посту" 
              style={imageStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>
      )}
      
      {/* Содержимое поста */}
      {post.content && (
        <div style={contentStyle}>
          {decodeContent(post.content)}
        </div>
      )}
      
      {/* Изображение */}
      {post.image && (
        <img 
          src={post.image} 
          alt="Изображение к посту" 
          style={imageStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      
      {/* Статистика */}
      <div style={statsStyle}>
        <span>{likesCount} лайков</span>
        <span>{post.comments ? post.comments.length : 0} комментариев</span>
      </div>
      
      {/* Кнопки действий */}
      <div style={actionsStyle}>
        <button 
          style={actionButtonStyle(isLiked)}
          onClick={handleLike}
          disabled={isAnimating}
          onMouseEnter={(e) => {
            if (!isLiked) {
              e.target.style.background = 'rgba(102, 126, 234, 0.1)';
              e.target.style.color = '#667eea';
            }
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            if (!isLiked) {
              e.target.style.background = 'transparent';
              e.target.style.color = '#718096';
            }
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} ${isAnimating ? 'pulse' : ''}`}></i>
          Нравится
        </button>
        
        <button 
          style={actionButtonStyle(showComments)}
          onClick={toggleComments}
          onMouseEnter={(e) => {
            if (!showComments) {
              e.target.style.background = 'rgba(102, 126, 234, 0.1)';
              e.target.style.color = '#667eea';
            }
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            if (!showComments) {
              e.target.style.background = 'transparent';
              e.target.style.color = '#718096';
            }
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <i className="bi bi-chat"></i>
          Комментировать
        </button>
        
        <button 
          style={actionButtonStyle()}
          onClick={() => onRepost(post.id)}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(102, 126, 234, 0.1)';
            e.target.style.color = '#667eea';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#718096';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <i className="bi bi-arrow-repeat"></i>
          Поделиться
        </button>
      </div>
      
      {/* Комментарии */}
      {(showComments || (post.comments && post.comments.length > 0)) && (
        <div style={commentsStyle} className="fade-in">
          {post.comments && post.comments.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {post.comments.map(comment => (
                <div key={comment.id} style={commentStyle}>
                  <Link to={`/profile/${comment.user.id}`}>
                    <img 
                      src={comment.user.avatar || getDefaultAvatar()} 
                      alt={comment.user.name} 
                      style={commentAvatarStyle}
                      onError={(e) => {
                        e.target.src = getDefaultAvatar();
                      }}
                    />
                  </Link>
                    <div style={commentContentStyle}>
                      <Link 
                        to={`/profile/${comment.user.id}`} 
                        style={commentUserStyle}
                      >
                        {comment.user.name}
                      </Link>
                      <div style={{
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        marginBottom: '0.25rem',
                      }}>
                        {decodeContent(comment.content)}
                      </div>
                      <small style={{ color: '#a0aec0' }}>{formatDate(comment.created_at)}</small>
                    </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Форма добавления комментария */}
          <form onSubmit={handleCommentSubmit} style={commentFormStyle}>
            <textarea
              ref={commentInputRef}
              placeholder="Напишите комментарий..."
              style={commentInputStyle}
              value={commentText}
              onChange={handleCommentTextChange}
              disabled={submittingComment}
              maxLength={CONSTANTS.MAX_COMMENT_LENGTH}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button 
              type="submit" 
              style={{
                ...submitButtonStyle,
                opacity: !commentText.trim() || submittingComment ? 0.6 : 1,
                cursor: !commentText.trim() || submittingComment ? 'not-allowed' : 'pointer',
              }}
              disabled={!commentText.trim() || submittingComment}
              onMouseEnter={(e) => {
                if (commentText.trim() && !submittingComment) {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {submittingComment ? (
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
      )}

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
        
        textarea::placeholder {
          color: #a0aec0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default PostItem;