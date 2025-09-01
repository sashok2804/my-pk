// config.js - Конфигурация для React приложения с JWT

export const API_URL = "http://vk.local";

// Функции для работы с JWT токенами
export const TokenService = {
  // Получение токена из localStorage
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Сохранение токена в localStorage
  setToken(token) {
    localStorage.setItem('authToken', token);
  },

  // Удаление токена из localStorage
  removeToken() {
    localStorage.removeItem('authToken');
  },

  // Проверка наличия токена
  hasToken() {
    return !!this.getToken();
  }
};

// Функция для создания заголовков с авторизацией
export const createAuthHeaders = () => {
  const token = TokenService.getToken();
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Обертка для fetch с автоматическим добавлением JWT токена
export const apiRequest = async (url, options = {}) => {
  const token = TokenService.getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  // Добавляем токен в заголовки, если он есть
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Если получили 401 ошибку, токен недействителен
    if (response.status === 401) {
      TokenService.removeToken();
      // Перенаправляем на страницу входа
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Утилиты для уведомлений (можно использовать с react-toastify)
export const showNotification = (message, type = 'info') => {
  // Простая реализация уведомлений
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Создаем временное уведомление
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-modern position-fixed`;
  notification.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    animation: slideInRight 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Автоматическое удаление через 3 секунды
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

// Утилиты для форматирования
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // Менее минуты
  if (diff < 60000) {
    return 'только что';
  }
  
  // Менее часа
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} мин. назад`;
  }
  
  // Менее дня
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ч. назад`;
  }
  
  // Менее недели
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} дн. назад`;
  }
  
  // Более недели - показываем дату
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('ru-RU', options);
};

export const formatCount = (count) => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
};

// Утилиты для валидации
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

// Утилиты для работы с изображениями
export const isValidImageUrl = (url) => {
  return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url);
};

export const getDefaultAvatar = () => {
  return `${API_URL}/api/default-avatar.png`;
};

// Константы для приложения
export const CONSTANTS = {
  MAX_POST_LENGTH: 500,
  MAX_COMMENT_LENGTH: 200,
  POSTS_PER_PAGE: 10,
  FRIENDS_PER_PAGE: 20,
  MESSAGES_PER_PAGE: 50,
  POLL_INTERVAL: 5000, // 5 секунд для обновления сообщений
};

// Debounce функция для поиска
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Функция для декодирования контента (Unicode символы и переносы строк)
export const decodeContent = (content) => {
  if (!content) return '';
  
  try {
    let decodedContent = content;
    
    // Проверяем, есть ли Unicode символы для декодирования
    if (content.includes('\\u')) {
      // Декодируем Unicode символы
      decodedContent = content.replace(/\\u[\dA-Fa-f]{4}/gi, (match) => {
        const charCode = parseInt(match.replace(/\\u/g, ''), 16);
        return String.fromCharCode(charCode);
      });
    }
    
    // Заменяем различные варианты переносов строк
    decodedContent = decodedContent
      .replace(/\\r\\n/g, '\n')  // Windows переносы
      .replace(/\\n/g, '\n')     // Unix переносы
      .replace(/\\r/g, '\n')     // Mac переносы
      .replace(/\r\n/g, '\n')    // Реальные Windows переносы
      .replace(/\r/g, '\n');     // Реальные Mac переносы
    
    // Декодируем HTML entities если есть
    if (decodedContent.includes('&')) {
      decodedContent = decodedContent
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
    }
    
    return decodedContent.trim();
  } catch (error) {
    console.error('Ошибка декодирования контента:', error, 'Оригинал:', content);
    return content;
  }
};

// Функция для безопасного отображения контента (защита от XSS)
export const sanitizeContent = (content) => {
  if (!content) return '';
  
  // Базовая защита от XSS - удаляем потенциально опасные теги
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Функция для обрезки длинного контента с многоточием
export const truncateContent = (content, maxLength = 150) => {
  if (!content) return '';
  
  const decoded = decodeContent(content);
  if (decoded.length <= maxLength) return decoded;
  
  return decoded.substring(0, maxLength).trim() + '...';
};

// Функция для копирования в буфер обмена
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Скопировано в буфер обмена', 'success');
    return true;
  } catch (err) {
    console.error('Ошибка копирования:', err);
    showNotification('Ошибка копирования', 'danger');
    return false;
  }
};

// Функция для проверки поддержки браузером
export const browserSupport = {
  hasClipboard: () => navigator.clipboard !== undefined,
  hasNotifications: () => 'Notification' in window,
  hasGeolocation: () => navigator.geolocation !== undefined,
  hasCamera: () => navigator.mediaDevices !== undefined,
};

// Функция для безопасного отображения любого контента с fallback
export const safeDisplayContent = (content, fallback = '') => {
  try {
    if (!content) return fallback;
    return decodeContent(content);
  } catch (error) {
    console.error('Ошибка отображения контента:', error);
    return fallback || 'Ошибка отображения содержимого';
  }
};

// Экспорт всех утилит
export default {
  API_URL,
  TokenService,
  createAuthHeaders,
  apiRequest,
  showNotification,
  formatDate,
  formatCount,
  validateEmail,
  validatePassword,
  validateName,
  isValidImageUrl,
  getDefaultAvatar,
  CONSTANTS,
  debounce,
  copyToClipboard,
  browserSupport,
  decodeContent,
  sanitizeContent,
  truncateContent,
  safeDisplayContent,
};