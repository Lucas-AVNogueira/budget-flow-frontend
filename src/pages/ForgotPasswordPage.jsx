import { useState } from 'react';
import { apiForgotPassword, apiResetPassword } from '../services/api.js';
import BrandLogo from '../components/BrandLogo.jsx';

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestToken() {
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Informe o usuário para solicitar o token.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiForgotPassword(username.trim());
      setResetToken(data.reset_token || '');
      setSuccess('Token de recuperação gerado. Use o token abaixo para redefinir a senha.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetToken.trim()) {
      setError('Informe o token de recuperação.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas de confirmação não conferem.');
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword(username.trim(), resetToken.trim(), newPassword);
      setSuccess('Senha redefinida com sucesso. Agora você já pode entrar.');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
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
          <h2 className="login-brand-title">Recupere o acesso com segurança.</h2>
          <p className="login-brand-copy">Atualize sua senha para voltar ao painel financeiro.</p>
        </div>

        <div className="login-right-panel">
          <div className="login-form-card">
            <h1 className="login-title">Esqueceu a senha</h1>
            <p className="login-subtitle">Solicite um token e redefina sua senha sem login.</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-row login-form-row">
                <input
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="btn-neutral"
                  onClick={handleRequestToken}
                  disabled={loading}
                >
                  {loading ? 'Gerando token...' : 'Gerar token de recuperação'}
                </button>

                <input
                  type="password"
                  placeholder="Token de recuperação"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
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

              <button type="submit" className="btn-primary login-submit" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
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
