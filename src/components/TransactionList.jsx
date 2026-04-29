import { useState } from 'react';
import { apiDeleteTransaction } from '../services/api.js';
import TransactionForm from './TransactionForm.jsx';
import { formatCategoryLabel } from '../utils/categoryLabels.js';

function fmt(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="action-svg" aria-hidden="true">
      <path d="M4 20L8.2 19.1L18.8 8.5C19.7 7.6 19.7 6.2 18.8 5.3C17.9 4.4 16.5 4.4 15.6 5.3L5 15.9L4 20Z" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.8 6.1L18 9.3" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="action-svg" aria-hidden="true">
      <path d="M5 7.5H19" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M9 7.5V6.1C9 5.5 9.5 5 10.1 5H13.9C14.5 5 15 5.5 15 6.1V7.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M7.3 7.5L8.1 18.2C8.2 19 8.8 19.6 9.6 19.6H14.4C15.2 19.6 15.8 19 15.9 18.2L16.7 7.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.2 10.4V16" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M13.8 10.4V16" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

export default function TransactionList({ token, transactions, onRefresh, categoryGroups }) {
  const [editId, setEditId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete(id) {
    if (!confirm('Confirmar exclusão?')) return;
    setDeleteError('');
    try {
      await apiDeleteTransaction(token, id);
      onRefresh();
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  if (transactions.length === 0) {
    return <p style={{ color: '#6b7280', fontSize: 14 }}>Nenhuma transação encontrada para o período.</p>;
  }

  return (
    <>
      {deleteError && <p className="error-msg">{deleteError}</p>}
      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Responsável</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) =>
            editId === t.id ? (
              <tr key={t.id}>
                <td colSpan={7}>
                  <TransactionForm
                    token={token}
                    editData={t}
                    categoryGroups={categoryGroups}
                    onSaved={() => { setEditId(null); onRefresh(); }}
                    onCancel={() => setEditId(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={t.id}>
                <td>{formatDate(t.data)}</td>
                <td>{t.descricao}</td>
                <td>{formatCategoryLabel(t.categoria)}</td>
                <td>{t.responsavel}</td>
                <td>
                  <span className={`badge badge-${t.tipo === 'ENTRADA' ? 'entrada' : 'saida'}`}>
                    {t.tipo === 'ENTRADA' ? 'Entrada' : 'Despesa'}
                  </span>
                </td>
                <td>{fmt(t.valor)}</td>
                <td className="actions-cell">
                  <button className="btn-icon btn-edit" onClick={() => setEditId(t.id)} title="Editar">
                    <PencilIcon />
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(t.id)} title="Excluir">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      </div>
    </>
  );
}
