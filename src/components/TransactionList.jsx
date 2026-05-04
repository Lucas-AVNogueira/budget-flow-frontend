import { useState, useEffect } from 'react';
import { apiDeleteTransaction } from '../services/api.js';
import TransactionForm from './TransactionForm.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { formatCategoryLabel } from '../utils/categoryLabels.js';

function exportCSV(rows) {
  const headers = ['Data', 'Descrição', 'Categoria', 'Responsável', 'Tipo', 'Valor'];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(';'),
    ...rows.map((t) => [
      formatDate(t.data),
      escape(t.descricao),
      escape(formatCategoryLabel(t.categoria)),
      escape(t.responsavel),
      t.tipo === 'ENTRADA' ? 'Entrada' : 'Despesa',
      String(t.valor).replace('.', ','),
    ].join(';')),
  ];
  const bom = '\uFEFF';
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transacoes.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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

const PER_PAGE = 10;

const COLUMNS = [
  { key: 'data',        label: 'Data' },
  { key: 'descricao',   label: 'Descrição' },
  { key: 'categoria',   label: 'Categoria' },
  { key: 'responsavel', label: 'Responsável' },
  { key: 'tipo',        label: 'Tipo' },
  { key: 'valor',       label: 'Valor' },
];

function SortIcon({ dir }) {
  return (
    <span className={`sort-icon${dir ? ' sort-icon--active' : ''}`} aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        {/* seta cima */}
        <path
          d="M6 1.5L9 5H3L6 1.5Z"
          fill={dir === 'asc' ? 'currentColor' : 'currentColor'}
          fillOpacity={dir === 'asc' ? 1 : 0.28}
        />
        {/* seta baixo */}
        <path
          d="M6 10.5L3 7H9L6 10.5Z"
          fill={dir === 'desc' ? 'currentColor' : 'currentColor'}
          fillOpacity={dir === 'desc' ? 1 : 0.28}
        />
      </svg>
    </span>
  );
}

export default function TransactionList({ token, transactions, onRefresh, categoryGroups }) {
  const [editId, setEditId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState('data');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setPage(0);
  }, [transactions, sortKey, sortDir, filter]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setDeleteError('');
    try {
      await apiDeleteTransaction(token, pendingDeleteId);
      setPendingDeleteId(null);
      onRefresh();
    } catch (err) {
      setDeleteError(err.message);
      setPendingDeleteId(null);
    }
  }

  if (transactions.length === 0) {
    return <p style={{ color: '#6b7280', fontSize: 14 }}>Nenhuma transação encontrada para o período.</p>;
  }

  const filterLower = filter.trim().toLowerCase().replace(/\u00a0/g, ' ');
  const filtered = filterLower
    ? transactions.filter((t) => {
        const date = t.data ? t.data.split('-').reverse().join('/') : '';
        const valor = t.valor != null ? fmt(t.valor).replace(/\u00a0/g, ' ').toLowerCase() : '';
        const categoriaLabel = formatCategoryLabel(t.categoria ?? '').toLowerCase();
        const tipo = t.tipo === 'ENTRADA' ? 'entrada' : 'despesa';
        return [
          t.descricao,
          t.categoria,
          categoriaLabel,
          t.responsavel,
          tipo,
          date,
          valor,
        ].some((v) => String(v ?? '').toLowerCase().includes(filterLower));
      })
    : transactions;

  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortKey] ?? '';
    let vb = b[sortKey] ?? '';
    if (sortKey === 'valor') {
      va = Number(va); vb = Number(vb);
      return sortDir === 'asc' ? va - vb : vb - va;
    }
    const cmp = String(va).localeCompare(String(vb), 'pt-BR', { sensitivity: 'base' });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <>
      <ConfirmModal
        open={pendingDeleteId !== null}
        title="Excluir transação"
        message="Essa ação não pode ser desfeita. Deseja realmente excluir esta transação?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      {editId !== null && (() => {
        const editData = transactions.find((t) => t.id === editId);
        return (
          <div className="modal-backdrop" onClick={() => setEditId(null)} aria-modal="true" role="dialog" aria-label="Editar transação">
            <div className="modal-box modal-box--form" onClick={(e) => e.stopPropagation()}>
              <div className="modal-form-header">
                <h3 className="modal-title" style={{ marginBottom: 0 }}>Editar transação</h3>
                <button className="modal-close-btn" onClick={() => setEditId(null)} aria-label="Fechar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <TransactionForm
                token={token}
                editData={editData}
                categoryGroups={categoryGroups}
                onSaved={() => { setEditId(null); onRefresh(); }}
                onCancel={() => setEditId(null)}
              />
            </div>
          </div>
        );
      })()}

      {deleteError && <p className="error-msg">{deleteError}</p>}
      <div className="filter-toolbar">
        <div className="filter-bar">
          <span className="filter-bar__icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar transações…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-bar__input"
          />
          {filter && (
            <span className="filter-bar__count">{filtered.length} de {transactions.length}</span>
          )}
          {filter && (
            <button className="filter-bar__clear" onClick={() => setFilter('')} title="Limpar filtro" aria-label="Limpar filtro">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button
          className="btn-export-csv"
          onClick={() => exportCSV(sorted)}
          title="Exportar CSV"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          CSV
        </button>
      </div>
      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key}>
                <button
                  className="th-sort-btn"
                  onClick={() => handleSort(col.key)}
                  title={`Ordenar por ${col.label}`}
                >
                  {col.label}
                  <SortIcon dir={sortKey === col.key ? sortDir : null} />
                </button>
              </th>
            ))}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((t) => (
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
                  <button className="btn-icon btn-delete" onClick={() => setPendingDeleteId(t.id)} title="Excluir">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            ‹ Anterior
          </button>
          <span className="pagination-info">
            Página {page + 1} de {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages - 1}
          >
            Próxima ›
          </button>
        </div>
      )}
    </>
  );
}
