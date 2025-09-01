// Header.js - Современный компонент навигации с glassmorphism эффектами

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { getDefaultAvatar } from '../../config';

const Header = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Отслеживаем скролл для изменения стиля навбара
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navbarStyle = {
    background: scrolled 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${scrolled ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
    boxShadow: scrolled 
      ? '0 8px 32px rgba(0, 0, 0, 0.1)' 
      : '0 4px 16px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000,
    position: 'sticky',
    top: 0,
  };

  const brandStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '1.8rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  };

  const navLinkStyle = (isActive) => ({
    color: scrolled 
      ? (isActive ? '#667eea' : '#2d3748')
      : (isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'),
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.95rem',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  });

  const iconStyle = {
    fontSize: '1.1rem',
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  };

  const dropdownStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
    padding: '0.5rem 0',
    marginTop: '0.5rem',
  };

  return (
    <Navbar 
      expand="lg" 
      style={navbarStyle}
      expanded={expanded}
      onToggle={setExpanded}
      className="py-3"
    >
      <Container>
        <Navbar.Brand 
          as={Link} 
          to="/" 
          style={brandStyle}
          className="floating"
          onClick={handleNavClick}
        >
          PK
        </Navbar.Brand>

        <Navbar.Toggle 
          aria-controls="basic-navbar-nav"
          style={{
            border: 'none',
            padding: '4px 8px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <span style={{
            display: 'block',
            width: '25px',
            height: '3px',
            background: scrolled ? '#2d3748' : '#ffffff',
            margin: '5px 0',
            transition: 'all 0.3s ease',
            borderRadius: '2px',
          }}></span>
          <span style={{
            display: 'block',
            width: '25px',
            height: '3px',
            background: scrolled ? '#2d3748' : '#ffffff',
            margin: '5px 0',
            transition: 'all 0.3s ease',
            borderRadius: '2px',
          }}></span>
          <span style={{
            display: 'block',
            width: '25px',
            height: '3px',
            background: scrolled ? '#2d3748' : '#ffffff',
            margin: '5px 0',
            transition: 'all 0.3s ease',
            borderRadius: '2px',
          }}></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          {isAuthenticated ? (
            <>
              <Nav className="me-auto">
                <Nav.Link 
                  as={Link} 
                  to="/" 
                  style={navLinkStyle(isActiveLink('/'))}
                  onClick={handleNavClick}
                  className="nav-link-hover"
                >
                  <i className="bi bi-house-door" style={iconStyle}></i>
                  Главная
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/friends" 
                  style={navLinkStyle(isActiveLink('/friends'))}
                  onClick={handleNavClick}
                  className="nav-link-hover"
                >
                  <i className="bi bi-people" style={iconStyle}></i>
                  Друзья
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/chat" 
                  style={navLinkStyle(isActiveLink('/chat'))}
                  onClick={handleNavClick}
                  className="nav-link-hover"
                >
                  <i className="bi bi-chat-dots" style={iconStyle}></i>
                  Сообщения
                </Nav.Link>
              </Nav>
              
              <Nav>
                {user && user.role === 'admin' && (
                  <Nav.Link 
                    as={Link} 
                    to="/admin" 
                    style={navLinkStyle(isActiveLink('/admin'))}
                    onClick={handleNavClick}
                    className="nav-link-hover"
                  >
                    <i className="bi bi-gear" style={iconStyle}></i>
                    Админ
                  </Nav.Link>
                )}
                
                <NavDropdown
                  title={
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: scrolled ? '#2d3748' : 'rgba(255, 255, 255, 0.9)'
                    }}>
                      <img 
                        src={user?.avatar || getDefaultAvatar()} 
                        alt={user?.name || 'User'} 
                        style={avatarStyle}
                        onError={(e) => {
                          e.target.src = getDefaultAvatar();
                        }}
                      />
                      <span style={{ fontWeight: '500' }}>
                        {user?.name || 'Пользователь'}
                      </span>
                    </span>
                  } 
                  id="user-dropdown"
                  align="end"
                  drop="down"
                >
                  <div style={dropdownStyle}>
                    <NavDropdown.Item 
                      as={Link} 
                      to={`/profile/${user?.id}`}
                      onClick={handleNavClick}
                      style={{
                        padding: '0.75rem 1.5rem',
                        color: '#2d3748',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        borderRadius: '8px',
                        margin: '0 0.5rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      <i className="bi bi-person-circle"></i>
                      Мой профиль
                    </NavDropdown.Item>
                    
                    <NavDropdown.Divider style={{
                      margin: '0.5rem 1rem',
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    }} />
                    
                    <NavDropdown.Item 
                      onClick={handleLogout}
                      style={{
                        padding: '0.75rem 1.5rem',
                        color: '#e53e3e',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        borderRadius: '8px',
                        margin: '0 0.5rem',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(229, 62, 62, 0.1)';
                        e.target.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Выйти
                    </NavDropdown.Item>
                  </div>
                </NavDropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link 
                as={Link} 
                to="/login" 
                style={navLinkStyle(isActiveLink('/login'))}
                onClick={handleNavClick}
                className="nav-link-hover"
              >
                <i className="bi bi-box-arrow-in-right" style={iconStyle}></i>
                Вход
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/register" 
                style={navLinkStyle(isActiveLink('/register'))}
                onClick={handleNavClick}
                className="nav-link-hover"
              >
                <i className="bi bi-person-plus" style={iconStyle}></i>
                Регистрация
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>

      <style jsx>{`
        .nav-link-hover:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.2) !important;
        }
        
        .floating:hover {
          transform: translateY(-2px);
        }
        
        .dropdown-toggle::after {
          display: none !important;
        }
        
        @media (max-width: 991px) {
          .navbar-collapse {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            margin-top: 1rem;
            padding: 1rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .nav-link {
            margin: 0.25rem 0;
          }
        }
      `}</style>
    </Navbar>
  );
};

export default Header;