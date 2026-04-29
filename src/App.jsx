import { useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [authPage, setAuthPage] = useState('login');
  const [appPage, setAppPage] = useState('dashboard');

  function handleLogin(tok, user) {
    setToken(tok);
    setUsername(user);
    setAppPage('dashboard');
  }

  function handleLogout() {
    setToken(null);
    setUsername('');
    setAppPage('dashboard');
    setAuthPage('login');
  }

  if (!token) {
    if (authPage === 'register') {
      return <RegisterPage onBackToLogin={() => setAuthPage('login')} />;
    }

    if (authPage === 'forgot') {
      return <ForgotPasswordPage onBackToLogin={() => setAuthPage('login')} />;
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setAuthPage('register')}
        onGoForgotPassword={() => setAuthPage('forgot')}
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
      />
    );
  }

  return (
    <DashboardPage
      token={token}
      username={username}
      onLogout={handleLogout}
      onGoChangePassword={() => setAppPage('change-password')}
    />
  )
  return <DashboardPage token={token} username={username} onLogout={handleLogout} />;
}
