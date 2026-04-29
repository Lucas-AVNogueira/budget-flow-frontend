import { useState } from 'react';
import { apiLogin } from '../services/api.js';
import BrandLogo from '../components/BrandLogo.jsx';

export default function LoginPage({ onLogin, onGoRegister, onGoForgotPassword }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await apiLogin(username, password);
      onLogin(token, username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card login-card--showcase">
        <div className="login-brand-panel login-brand-panel--showcase">
          <BrandLogo variant="dark" className="login-logo" />
          <h2 className="login-brand-title">
            Controle total das suas finanças,
            <span className="login-brand-title-accent"> em família ou grupo.</span>
          </h2>
          <p className="login-brand-copy">
            Organize gastos, visualize seu saldo ou familiar e tome decisões melhores.
            Tudo em um só lugar.
          </p>
        </div>

        <div className="login-right-panel">
          <div className="login-form-card login-form-card--showcase">
            <div className="login-lock-badge" aria-hidden="true">🔒</div>
            <h1 className="login-title">Bem-vindo de volta <span aria-hidden="true"></span></h1>
            <p className="login-subtitle">Entre para continuar</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-row login-form-row">
                <label className="login-field-label" htmlFor="username">Usuário</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário ou e-mail"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <label className="login-field-label" htmlFor="password">Senha</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error-msg">{error}</p>}

              <div className="login-form-meta">
                <label className="remember-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Continuar conectado</span>
                </label>
                <button type="button" className="link-btn link-btn-muted" onClick={onGoForgotPassword}>
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                className="btn-primary login-submit"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="login-divider">ou</div>

              <p className="login-register-hint">Ainda não tem conta?</p>

              <div className="login-links-row login-links-row--single">
                <button type="button" className="link-btn link-btn-strong" onClick={onGoRegister}>
                  Criar conta grátis
                </button>
              </div>

              <p className="login-secure-note">Seus dados são criptografados e seguros.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
