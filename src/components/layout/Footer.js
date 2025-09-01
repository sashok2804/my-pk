// Footer.js - Современный компонент подвала с glassmorphism эффектами

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const year = new Date().getFullYear();
  
  const footerStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    marginTop: 'auto',
    padding: '2rem 0',
    position: 'relative',
    overflow: 'hidden',
  };

  const containerStyle = {
    position: 'relative',
    zIndex: 2,
  };

  const textStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: '400',
  };

  const linkStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    position: 'relative',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
  };

  const socialLinkStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.25rem',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '0 0.5rem',
  };

  const brandStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    margin: '0 0 0.5rem 0',
  };

  const handleLinkHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.color = '#ffffff';
    } else {
      e.target.style.background = 'transparent';
      e.target.style.transform = 'translateY(0)';
      e.target.style.color = 'rgba(255, 255, 255, 0.9)';
    }
  };

  const handleSocialHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
      e.target.style.transform = 'translateY(-3px) scale(1.1)';
      e.target.style.color = '#ffffff';
    } else {
      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
      e.target.style.transform = 'translateY(0) scale(1)';
      e.target.style.color = 'rgba(255, 255, 255, 0.8)';
    }
  };

  return (
    <footer style={footerStyle}>
      {/* Декоративные элементы */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-10%',
        width: '120%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'floating 6s ease-in-out infinite',
      }}></div>
      
      <Container style={containerStyle}>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <h5 style={brandStyle}>PK</h5>
            <p style={{...textStyle, fontSize: '0.85rem', opacity: 0.8}}>
              Современная социальная сеть
            </p>
          </Col>
          
          <Col md={4} className="text-center mb-3 mb-md-0">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a 
                href="/about" 
                style={linkStyle}
                onMouseEnter={(e) => handleLinkHover(e, true)}
                onMouseLeave={(e) => handleLinkHover(e, false)}
              >
                О нас
              </a>
              <a 
                href="/privacy" 
                style={linkStyle}
                onMouseEnter={(e) => handleLinkHover(e, true)}
                onMouseLeave={(e) => handleLinkHover(e, false)}
              >
                Конфиденциальность
              </a>
              <a 
                href="/terms" 
                style={linkStyle}
                onMouseEnter={(e) => handleLinkHover(e, true)}
                onMouseLeave={(e) => handleLinkHover(e, false)}
              >
                Условия
              </a>
              <a 
                href="/support" 
                style={linkStyle}
                onMouseEnter={(e) => handleLinkHover(e, true)}
                onMouseLeave={(e) => handleLinkHover(e, false)}
              >
                Поддержка
              </a>
            </div>
          </Col>
          
          <Col md={4} className="text-center text-md-end">
            <div style={{ marginBottom: '1rem' }}>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={socialLinkStyle}
                onMouseEnter={(e) => handleSocialHover(e, true)}
                onMouseLeave={(e) => handleSocialHover(e, false)}
                aria-label="GitHub"
              >
                <i className="bi bi-github"></i>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={socialLinkStyle}
                onMouseEnter={(e) => handleSocialHover(e, true)}
                onMouseLeave={(e) => handleSocialHover(e, false)}
                aria-label="Twitter"
              >
                <i className="bi bi-twitter"></i>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={socialLinkStyle}
                onMouseEnter={(e) => handleSocialHover(e, true)}
                onMouseLeave={(e) => handleSocialHover(e, false)}
                aria-label="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={socialLinkStyle}
                onMouseEnter={(e) => handleSocialHover(e, true)}
                onMouseLeave={(e) => handleSocialHover(e, false)}
                aria-label="LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
            <p style={textStyle}>
              &copy; {year} PK. Все права защищены.
            </p>
          </Col>
        </Row>
        
        {/* Дополнительная информация */}
        <Row className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Col className="text-center">
            <p style={{...textStyle, fontSize: '0.8rem', opacity: 0.7}}>
              Сделано с ❤️ для лучшего социального взаимодействия
            </p>
          </Col>
        </Row>
      </Container>
      
      <style jsx>{`
        @keyframes floating {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        
        @media (max-width: 768px) {
          .social-links {
            margin-bottom: 1rem;
          }
          
          .footer-links {
            flex-direction: column;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;