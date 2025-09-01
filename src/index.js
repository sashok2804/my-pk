// index.js - Точка входа React-приложения с современными возможностями

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Проверяем поддержку современных возможностей браузера
const checkBrowserSupport = () => {
  const warnings = [];
  
  // Проверяем поддержку ES6+ возможностей
  if (!window.fetch) {
    warnings.push('Fetch API не поддерживается');
  }
  
  if (!window.Promise) {
    warnings.push('Promises не поддерживаются');
  }
  
  if (!window.localStorage) {
    warnings.push('LocalStorage не поддерживается');
  }
  
  // Показываем предупреждения если есть проблемы с поддержкой
  if (warnings.length > 0) {
    console.warn('Обнаружены проблемы с поддержкой браузера:', warnings);
  }
  
  return warnings.length === 0;
};

// Функция для инициализации приложения
const initializeApp = () => {
  // Проверяем поддержку браузера
  const isSupported = checkBrowserSupport();
  
  if (!isSupported) {
    console.warn('Некоторые функции могут работать некорректно в данном браузере');
  }
  
  // Создаем корневой элемент React
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  // Рендерим приложение
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Добавляем обработчик для отслеживания производительности
  reportWebVitals((metric) => {
    // Можно отправлять метрики на сервер аналитики
    console.log('Performance metric:', metric);
  });
  
  // Добавляем skip link для accessibility
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Перейти к основному содержимому';
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Добавляем метатег для viewport если его нет
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1, shrink-to-fit=no';
    document.head.appendChild(viewport);
  }
  
  // Добавляем мета-информацию для PWA
  if (!document.querySelector('meta[name="theme-color"]')) {
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#667eea';
    document.head.appendChild(themeColor);
  }
  
  // Улучшаем accessibility
  document.addEventListener('keydown', (e) => {
    // Добавляем класс для отображения фокуса при навигации с клавиатуры
    if (e.key === 'Tab') {
      document.body.classList.add('using-keyboard');
    }
  });
  
  document.addEventListener('mousedown', () => {
    // Убираем класс при использовании мыши
    document.body.classList.remove('using-keyboard');
  });
  
  // Обработка ошибок
  window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
    // Здесь можно добавить отправку ошибок на сервер
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанное отклонение Promise:', e.reason);
    // Здесь можно добавить отправку ошибок на сервер
  });
  
  // Логируем успешную инициализацию
  console.log('🚀 PK Social Network загружена успешно!');
  
  // Добавляем информацию о версии в консоль
  console.log('%cPK Social Network', 'color: #667eea; font-size: 24px; font-weight: bold;');
  console.log('%cСовременная социальная сеть на React', 'color: #764ba2; font-size: 14px;');
};

// Ждем загрузки DOM перед инициализацией
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Добавляем поддержку Service Worker для PWA (опционально)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Экспорт для тестирования
export { initializeApp, checkBrowserSupport };