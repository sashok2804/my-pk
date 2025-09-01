// App.js - Главный компонент приложения с современным дизайном

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Компоненты
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/pages/Home';
import Profile from './components/pages/Profile';
import Friends from './components/pages/Friends';
import Chat from './components/pages/Chat';
import AdminPanel from './components/admin/AdminPanel';
import NotFound from './components/pages/NotFound';
import { API_URL, TokenService, apiRequest } from './config';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка авторизации пользователя при загрузке
    const checkAuth = async () => {
      try {
        // Проверяем, есть ли токен в localStorage
        if (!TokenService.hasToken()) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        // Проверяем валидность токена через API
        const data = await apiRequest(`${API_URL}/api/auth/check`, {
          method: 'GET'
        });
        
        if (data.authenticated) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
        } else {
          // Токен недействителен, удаляем его
          TokenService.removeToken();
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        // В случае ошибки удаляем токен и сбрасываем состояние
        TokenService.removeToken();
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Функция для установки авторизации (вызывается после успешного входа)
  const setAuth = (token, user) => {
    TokenService.setToken(token);
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  // Приватный маршрут для защиты страниц, требующих авторизации
  const PrivateRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="loader">
            <div className="spinner"></div>
          </div>
        </div>
      );
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  // Маршрут для администратора
  const AdminRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="loader">
            <div className="spinner"></div>
          </div>
        </div>
      );
    }
    return isAuthenticated && currentUser?.role === 'admin' ? children : <Navigate to="/" />;
  };

  const handleLogout = async () => {
    try {
      // Уведомляем сервер о выходе (опционально)
      await apiRequest(`${API_URL}/api/auth/logout`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      // Удаляем токен и сбрасываем состояние
      TokenService.removeToken();
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Header isAuthenticated={isAuthenticated} user={currentUser} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? 
                <div className="fade-in">
                  <Login setAuth={setAuth} />
                </div> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? 
                <div className="fade-in">
                  <Register />
                </div> : 
                <Navigate to="/" />
              } 
            />
            
            <Route path="/" element={
              <PrivateRoute>
                <div className="fade-in">
                  <Home user={currentUser} />
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/profile/:userId" element={
              <PrivateRoute>
                <div className="fade-in">
                  <Profile currentUser={currentUser} />
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/friends" element={
              <PrivateRoute>
                <div className="fade-in">
                  <Friends currentUser={currentUser} />
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/chat/:friendId?" element={
              <PrivateRoute>
                <div className="fade-in">
                  <Chat currentUser={currentUser} />
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <AdminRoute>
                <div className="fade-in">
                  <AdminPanel />
                </div>
              </AdminRoute>
            } />
            
            <Route path="*" element={
              <div className="fade-in">
                <NotFound />
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;