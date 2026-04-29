import { formatCategoryLabel } from '../utils/categoryLabels.js';

function toCurrency(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function toPercent(val) {
  return `${Math.round(val * 100)}%`;
}

function polarToCartesian(cx, cy, radius, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function TransactionChart({ transactions }) {
  const size = 260;
  const center = size / 2;
  const radius = 92;
  const strokeWidth = 42;
  const entradaPalette = ['#22c55e', '#16a34a', '#10b981', '#059669', '#34d399'];
  const saidaPalette = ['#ef4444', '#f97316', '#f59e0b', '#dc2626', '#fb7185'];

  const grouped = {};
  transactions.forEach((item) => {
    const tipo = item.tipo;
    if (tipo !== 'ENTRADA' && tipo !== 'SAIDA') return;
    const categoria = item.categoria || 'Sem categoria';
    const key = `${tipo}::${categoria}`;

    if (!grouped[key]) {
      grouped[key] = { tipo, categoria, total: 0 };
    }

    grouped[key].total += Number(item.valor);
  });

  const entries = Object.values(grouped).sort((a, b) => b.total - a.total);
  const total = entries.reduce((acc, item) => acc + item.total, 0);

  let entradaColorIndex = 0;
  let saidaColorIndex = 0;
  let currentAngle = 0;
  const slices = entries.map((item) => {
    const pct = total > 0 ? item.total / total : 0;
    const sweep = pct * 360;
    const color = item.tipo === 'ENTRADA'
      ? entradaPalette[entradaColorIndex++ % entradaPalette.length]
      : saidaPalette[saidaColorIndex++ % saidaPalette.length];

    const slice = {
      ...item,
      start: currentAngle,
      end: currentAngle + sweep,
      pct,
      color,
    };

    currentAngle += sweep;
    return slice;
  });

  const hasValues = total > 0;

  return (
    <div className="tx-pie-wrap">
      <div className="tx-chart-legend">
        {slices.map((slice) => (
          <span key={`${slice.tipo}-${slice.categoria}`} className="tx-chart-legend-item">
            <span className="tx-chart-dot" style={{ background: slice.color }} />
            {slice.tipo === 'ENTRADA' ? 'Entrada' : 'Despesa'} - {formatCategoryLabel(slice.categoria)} {toPercent(slice.pct)} ({toCurrency(slice.total)})
          </span>
        ))}
        {!hasValues && (
          <span className="tx-chart-legend-item" style={{ color: '#6b7280' }}>
            Sem transações no período.
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="tx-pie" role="img" aria-label="Grafico de pizza consolidado por categoria">
        <circle cx={center} cy={center} r={radius} className="tx-pie-base" strokeWidth={strokeWidth} />

        {slices.map((slice) => {
          if (slice.pct >= 0.9999) {
            return (
              <circle
                key={`full-${slice.tipo}-${slice.categoria}`}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
              />
            );
          }

          if (slice.end - slice.start <= 0) return null;
          return (
            <path
              key={`slice-${slice.tipo}-${slice.categoria}`}
              d={describeArc(center, center, radius, slice.start, slice.end)}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
            />
          );
        })}

        <circle cx={center} cy={center} r={radius - strokeWidth / 2 + 2} className="tx-pie-hole" />

        <text x={center} y={center - 6} textAnchor="middle" className="tx-pie-center-label">
          Fluxo total do mês
        </text>
        <text x={center} y={center + 18} textAnchor="middle" className="tx-pie-center-value">
          {toCurrency(total)}
        </text>
      </svg>
    </div>
  );
}
