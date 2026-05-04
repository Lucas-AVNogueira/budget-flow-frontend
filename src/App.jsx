import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

const STORAGE_KEY_TOKEN = 'bf_token';
const STORAGE_KEY_USER  = 'bf_username';
const STORAGE_KEY_THEME = 'bf_theme';

function readSession() {
  const tok  = localStorage.getItem(STORAGE_KEY_TOKEN)  || sessionStorage.getItem(STORAGE_KEY_TOKEN);
  const user = localStorage.getItem(STORAGE_KEY_USER)   || sessionStorage.getItem(STORAGE_KEY_USER);
  return { tok, user };
}

export default function App() {
  const saved = readSession();
  const [token, setToken] = useState(saved.tok || null);
  const [username, setUsername] = useState(saved.user || '');
  const [authPage, setAuthPage] = useState('login');
  const [appPage, setAppPage] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY_THEME) || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  function handleLogin(tok, user, remember) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY_TOKEN, tok);
    storage.setItem(STORAGE_KEY_USER, user);
    setToken(tok);
    setUsername(user);
    setAppPage('dashboard');
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    setToken(null);
    setUsername('');
    setAppPage('dashboard');
    setAuthPage('login');
  }

  if (!token) {
    if (authPage === 'register') {
      return <RegisterPage onBackToLogin={() => setAuthPage('login')} theme={theme} onToggleTheme={toggleTheme} />;
    }

    if (authPage === 'forgot') {
      return <ForgotPasswordPage onBackToLogin={() => setAuthPage('login')} theme={theme} onToggleTheme={toggleTheme} />;
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setAuthPage('register')}
        onGoForgotPassword={() => setAuthPage('forgot')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (appPage === 'change-password') {
    return (
      <ChangePasswordPage
        token={token}
        username={username}
        onBack={() => setAppPage('dashboard')}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <DashboardPage
      token={token}
      username={username}
      onLogout={handleLogout}
      onGoChangePassword={() => setAppPage('change-password')}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}
