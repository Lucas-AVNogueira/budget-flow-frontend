import { useState, useEffect, useCallback } from 'react';
import { apiFetchTransactions, apiFetchSummary, apiFetchCategories } from '../services/api.js';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';
import SummaryPanel from '../components/SummaryPanel.jsx';
import TransactionChart from '../components/TransactionChart.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

export default function DashboardPage({ token, username, onLogout, onGoChangePassword }) {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const [txs, sum] = await Promise.all([
        apiFetchTransactions(token, mes, ano),
        apiFetchSummary(token, mes, ano),
      ]);
      setTransactions(txs);
      setSummary(sum);
    } catch (err) {
      setLoadError(err.message);
    }
  }, [token, mes, ano]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categories = await apiFetchCategories(token);
        setCategoryGroups(categories);
      } catch (err) {
        setLoadError(err.message);
      }
    }

    loadCategories();
  }, [token]);

  const years = [];
  for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) years.push(y);

  const months = [
    { v: 1, l: 'Janeiro' }, { v: 2, l: 'Fevereiro' }, { v: 3, l: 'Março' },
    { v: 4, l: 'Abril' }, { v: 5, l: 'Maio' }, { v: 6, l: 'Junho' },
    { v: 7, l: 'Julho' }, { v: 8, l: 'Agosto' }, { v: 9, l: 'Setembro' },
    { v: 10, l: 'Outubro' }, { v: 11, l: 'Novembro' }, { v: 12, l: 'Dezembro' },
  ];

  const today = new Date();
  const defaultDate =
    today.getFullYear() === ano && today.getMonth() + 1 === mes
      ? today.toLocaleDateString('en-CA')
      : `${ano}-${String(mes).padStart(2, '0')}-01`;

  return (
    <>
      <nav className="navbar">
        <BrandLogo variant="dark" style={{ height: 60 }} />
        <div className="navbar-user">
          <span>Olá, <strong>{username}</strong></span>
          <span className="navbar-separator">|</span>
          <button className="navbar-link" onClick={onGoChangePassword}>
            Alterar senha
          </button>
          <span className="navbar-separator">|</span>
          <button className="navbar-logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="card card-toolbar">
          <div className="filter-row">
            <label className="filter-label">Periodo:</label>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
              {months.map((m) => (
                <option key={m.v} value={m.v}>{m.l}</option>
              ))}
            </select>
            <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={() => { setShowForm(true); }}>
              + Nova Transação
            </button>
          </div>
          {loadError && <p className="error-msg">{loadError}</p>}
        </div>

        {showForm && (
          <div className="card">
            <h2 className="section-title">Nova Transação</h2>
            <TransactionForm
              token={token}
              defaultDate={defaultDate}
              categoryGroups={categoryGroups}
              onSaved={() => { setShowForm(false); load(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div className="card">
          <h2 className="section-title">Resumo Mensal</h2>
          <SummaryPanel summary={summary} />
        </div>

        <div className="card">
          <h2 className="section-title">Gráfico de Transações</h2>
          <TransactionChart transactions={transactions} mes={mes} ano={ano} />
        </div>

        <div className="card">
          <h2 className="section-title">Transações</h2>
          <TransactionList
            token={token}
            transactions={transactions}
            categoryGroups={categoryGroups}
            onRefresh={load}
          />
        </div>
      </div>
    </>
  );
}
