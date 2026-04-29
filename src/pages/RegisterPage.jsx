import { useState } from 'react';
import { apiRegisterUser } from '../services/api.js';
import BrandLogo from '../components/BrandLogo.jsx';

export default function RegisterPage({ onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('As senhas de confirmação não conferem.');
      return;
    }

    setLoading(true);
    try {
      await apiRegisterUser(username, password);
      setSuccess('Cadastro realizado com sucesso. Faça login para continuar.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand-panel">
          <BrandLogo variant="dark" className="login-logo" />
          <h2 className="login-brand-title">Crie seu acesso em poucos segundos.</h2>
          <p className="login-brand-copy">Novo cadastro para começar a controlar as finanças compartilhadas.</p>
        </div>

        <div className="login-right-panel">
          <div className="login-form-card">
            <h1 className="login-title">Novo cadastro</h1>
            <p className="login-subtitle">Preencha os dados para criar sua conta.</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-row login-form-row">
                <input
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error-msg">{error}</p>}
              {success && <p className="success-msg">{success}</p>}

              <button type="submit" className="btn-primary login-submit" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>

              <div className="login-links-row">
                <button type="button" className="link-btn link-btn-muted" onClick={onBackToLogin}>
                  Voltar para entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
