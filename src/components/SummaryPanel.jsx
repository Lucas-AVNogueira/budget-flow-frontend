import { formatCategoryLabel } from '../utils/categoryLabels.js';

function fmt(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function IconChartUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="summary-svg" aria-hidden="true">
      <rect x="3.2" y="17.1" width="2.9" height="3.7" rx="0.6" fill="currentColor" />
      <rect x="8.1" y="14.2" width="2.9" height="6.6" rx="0.6" fill="currentColor" />
      <rect x="13" y="10.4" width="2.9" height="10.4" rx="0.6" fill="currentColor" />
      <path d="M3.3 13.6L8.8 9.5C9.4 9.1 10.2 9.1 10.8 9.5L12.8 11C13.4 11.4 14.2 11.4 14.8 11L20.5 6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 6.8H20.8V10.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="summary-svg" aria-hidden="true">
      <path d="M12 3.9L21 19.6C21.2 20 20.9 20.5 20.4 20.5H3.6C3.1 20.5 2.8 20 3 19.6L12 3.9Z" fill="currentColor" />
      <path d="M12 9V13.2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1.2" fill="#ffffff" />
    </svg>
  );
}

function IconWalletGroup() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="summary-svg" aria-hidden="true">
      <circle cx="8" cy="8.5" r="3" fill="currentColor" />
      <circle cx="15.5" cy="9.8" r="2.4" fill="currentColor" opacity="0.9" />
      <path d="M3.8 18.2C4.4 15.8 6.2 14.3 8.3 14.3C10.4 14.3 12.3 15.8 12.9 18.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M11.7 18.1C12.1 16.6 13.2 15.7 14.5 15.7C15.9 15.7 17 16.6 17.4 18.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.92" />
    </svg>
  );
}

function SummaryCard({ tone, icon, title, value }) {
  return (
    <div className={`summary-item summary-item-${tone}`}>
      <div className="summary-topline">
        <span className="summary-icon" aria-hidden="true">{icon}</span>
        <span className="label">{title}</span>
      </div>
      <div className="value">{value}</div>
    </div>
  );
}

export default function SummaryPanel({ summary }) {
  if (!summary) return null;

  const {
    total_entradas,
    total_despesas,
    saldo_mensal,
    is_limite_excedido,
    resumo_por_pessoa,
    resumo_por_pessoa_categoria,
  } = summary;

  return (
    <div>
      {is_limite_excedido && (
        <div className="alert-negativo">
          ⚠️ Atenção: o saldo mensal está negativo!
        </div>
      )}
      <div className="summary-grid">
        <SummaryCard tone="entrada" icon={<IconChartUp />} title="Entradas" value={fmt(total_entradas)} />
        <SummaryCard tone="despesa" icon={<IconAlert />} title="Despesas" value={fmt(total_despesas)} />
        <SummaryCard
          tone={is_limite_excedido ? 'saldo-negativo' : 'saldo'}
          icon={<IconWalletGroup />}
          title="Saldo"
          value={fmt(saldo_mensal)}
        />
      </div>

      {Object.keys(resumo_por_pessoa).length > 0 && (
        <div className="responsavel-section">
          <h3 style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>Despesas por responsável</h3>
          {Object.entries(resumo_por_pessoa).map(([nome, total]) => (
            <div key={nome} className="responsavel-group">
              <div className="responsavel-row">
                <span>{nome}</span>
                <strong>{fmt(total)}</strong>
              </div>
              {Object.entries(resumo_por_pessoa_categoria?.[nome] || {}).map(
                ([categoria, totalCategoria]) => (
                  <div key={`${nome}-${categoria}`} className="responsavel-subrow">
                    <span>{formatCategoryLabel(categoria)}</span>
                    <strong>{fmt(totalCategoria)}</strong>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
