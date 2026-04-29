import { useMemo, useState } from 'react';
import Select from 'react-select';
import { apiCreateTransaction, apiUpdateTransaction } from '../services/api.js';
import { formatCategorySelectLabel } from '../utils/categoryLabels.js';

const EMPTY = {
  descricao: '',
  valor: '',
  tipo: 'SAIDA',
  categoria: '',
  responsavel: '',
  data: '',
};

function extractGroupIcon(label = '') {
  const parts = label.trim().split(' ');
  const first = parts[0] || '';
  return /[\u{1F300}-\u{1FAFF}]/u.test(first) ? first : '';
}

function extractGroupText(label = '') {
  const parts = label.trim().split(' ');
  const first = parts[0] || '';
  const hasIcon = /[\u{1F300}-\u{1FAFF}]/u.test(first);
  return hasIcon ? parts.slice(1).join(' ') : label;
}

function formatBRL(value) {
  if (!value || value === '') return '';
  const num = String(value).replace(/\D/g, '');
  if (num === '') return '';
  const numInt = parseInt(num, 10);
  if (numInt > 1000000000) return '1000000000,00';
  
  // Se é exatamente 1 bilhão (10 dígitos), formata corretamente com ,00
  if (num === '1000000000') {
    return '1.000.000.000,00';
  }
  
  const str = String(numInt);
  const len = str.length;
  if (len <= 2) return str;
  if (len === 3) return `${str.slice(0, 1)},${str.slice(1)}`;
  const inteira = str.slice(0, -2);
  const decimal = str.slice(-2);
  const formatted = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted},${decimal}`;
}

export default function TransactionForm({
  token,
  editData,
  onSaved,
  onCancel,
  defaultDate = new Date().toLocaleDateString('en-CA'),
  categoryGroups = [],
}) {
  const [form, setForm] = useState(
    editData
      ? {
          ...EMPTY,
          ...editData,
          valor: String(editData.valor),
          categoria: editData.categoria || '',
        }
      : { ...EMPTY, data: defaultDate }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryOptions = useMemo(
    () =>
      categoryGroups.map((group, index) => ({
        label: group.group,
        groupIndex: index,
        options: group.options.map((option) => ({
          value: option,
          label: formatCategorySelectLabel(option),
        })),
      })),
    [categoryGroups]
  );

  const selectedCategory = useMemo(() => {
    if (!form.categoria) return null;
    for (const group of categoryOptions) {
      const option = group.options.find((item) => item.value === form.categoria);
      if (option) return option;
    }
    return null;
  }, [form.categoria, categoryOptions]);

  const categorySelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 10,
      borderColor: state.isFocused ? '#7ea2d7' : '#ccd5e2',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(126, 162, 215, 0.2)' : 'none',
      backgroundColor: '#fbfdff',
      '&:hover': { borderColor: '#7ea2d7' },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '4px 12px',
    }),
    menu: (base) => ({
      ...base,
      width: 460,
      maxWidth: 'calc(100vw - 24px)',
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid #d2dbe8',
      boxShadow: '0 18px 42px rgba(15, 23, 42, 0.24)',
      marginTop: 6,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: 420,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    group: (base, state) => ({
      ...base,
      paddingTop: state.data.groupIndex === 0 ? 8 : 14,
      paddingBottom: 10,
      borderTop: state.data.groupIndex === 0 ? 'none' : '1px solid #d9e1ec',
    }),
    groupHeading: (base) => ({
      ...base,
      fontSize: 16,
      fontWeight: 800,
      textTransform: 'none',
      letterSpacing: 0,
      color: '#1f2d44',
      margin: '0 12px 6px',
      padding: 0,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 16,
      lineHeight: 1.15,
      fontWeight: 500,
      color: '#1f2937',
      padding: '4px 16px 4px 44px',
      backgroundColor: state.isFocused ? '#eef4ff' : '#fff',
      cursor: 'pointer',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280',
      fontSize: 16,
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: 16,
      fontWeight: 500,
      color: '#273346',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      paddingRight: 4,
    }),
  };

  function handleChange(e) {
    const { name, value } = e.target;
    // Apenas armazena o valor sem formatar enquanto digita
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    // Formata apenas quando sai do campo
    if (name === 'valor' && value) {
      const formatted = formatBRL(value);
      setForm((prev) => ({ ...prev, [name]: formatted }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.categoria) {
      setError('Selecione uma categoria.');
      return;
    }

    setLoading(true);
    try {
      const valorNumerico = parseFloat(String(form.valor).replace(/\D/g, '')) / 100;
      if (valorNumerico > 1000000000) {
        setError('Valor máximo permitido: 1.000.000.000');
        return;
      }
      const body = {
        ...form,
        valor: valorNumerico,
      };
      if (editData) {
        await apiUpdateTransaction(token, editData.id, body);
      } else {
        await apiCreateTransaction(token, body);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-row">
        <input
          name="descricao"
          placeholder="Descrição"
          value={form.descricao}
          onChange={handleChange}
          required
        />
        <input
          name="valor"
          type="text"
          placeholder="Valor"
          value={form.valor}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        <select name="tipo" value={form.tipo} onChange={handleChange}>
          <option value="SAIDA">Despesa</option>
          <option value="ENTRADA">Entrada</option>
        </select>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={(option) =>
              setForm((prev) => ({ ...prev, categoria: option ? option.value : '' }))
            }
            placeholder="Selecione a categoria"
            noOptionsMessage={() => 'Nenhuma categoria encontrada'}
            isClearable
            menuPlacement="auto"
            menuPosition="fixed"
            maxMenuHeight={360}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            formatGroupLabel={(group) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{extractGroupIcon(group.label)}</span>
                <span>{extractGroupText(group.label)}</span>
              </div>
            )}
            styles={categorySelectStyles}
          />
        </div>
      </div>
      <div className="form-row">
        <input
          name="responsavel"
          placeholder="Responsável"
          value={form.responsavel}
          onChange={handleChange}
          required
        />
        <input
          name="data"
          type="date"
          value={form.data}
          onChange={handleChange}
          required
        />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-neutral" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : editData ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
}
