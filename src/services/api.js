const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function apiLogin(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao fazer login.');
  return data.token;
}

export async function apiRegisterUser(username, password) {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao cadastrar usuário.');
  return data;
}

export async function apiUpdateOwnPassword(token, currentPassword, newPassword) {
  const res = await fetch(`${BASE}/users/password`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao atualizar senha.');
  return data;
}

export async function apiForgotPassword(username) {
  const res = await fetch(`${BASE}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao solicitar recuperação de senha.');
  return data;
}

export async function apiResetPassword(username, resetToken, newPassword) {
  const res = await fetch(`${BASE}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      reset_token: resetToken,
      new_password: newPassword,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao redefinir senha.');
  return data;
}

export async function apiFetchTransactions(token, mes, ano) {
  const res = await fetch(`${BASE}/transactions?mes=${mes}&ano=${ano}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao listar transações.');
  return data;
}

export async function apiCreateTransaction(token, body) {
  const res = await fetch(`${BASE}/transactions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao criar transação.');
  return data;
}

export async function apiUpdateTransaction(token, id, body) {
  const res = await fetch(`${BASE}/transactions/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao atualizar transação.');
  return data;
}

export async function apiDeleteTransaction(token, id) {
  const res = await fetch(`${BASE}/transactions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (res.status === 204) return;
  const data = await res.json();
  throw new Error(data.erro || 'Erro ao excluir transação.');
}

export async function apiFetchSummary(token, mes, ano) {
  const res = await fetch(`${BASE}/summary/${mes}/${ano}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao carregar resumo.');
  return data;
}

export async function apiFetchCategories(token) {
  const res = await fetch(`${BASE}/categories`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao carregar categorias.');
  return data;
}
