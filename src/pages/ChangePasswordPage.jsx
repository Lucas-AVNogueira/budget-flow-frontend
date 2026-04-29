import { useState } from 'react';
import { apiUpdateOwnPassword } from '../services/api.js';
import BrandLogo from '../components/BrandLogo.jsx';

export default function ChangePasswordPage({ token, username, onBack, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('As senhas de confirmação não conferem.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('A nova senha deve ser diferente da senha atual.');
      return;
    }

    setLoading(true);
    try {
      await apiUpdateOwnPassword(token, currentPassword, newPassword);
      setSuccess('Senha atualizada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav className="navbar">
        <BrandLogo variant="dark" style={{ height: 60 }} />
        <div className="navbar-user">
          <span>Olá, <strong>{username}</strong></span>
          <span className="navbar-separator">|</span>
          <button className="navbar-link" onClick={onBack}>Voltar ao painel</button>
          <span className="navbar-separator">|</span>
          <button className="navbar-logout" onClick={onLogout}>Sair</button>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <h2 className="section-title">Alterar senha</h2>
          <p className="login-subtitle">Para usuários logados: informe a senha atual e defina a nova senha.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-row login-form-row">
              <input
                type="password"
                placeholder="Senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Atualizando...' : 'Atualizar senha'}
              </button>
              <button type="button" className="btn-neutral" onClick={onBack}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
