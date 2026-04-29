const CATEGORY_LABEL_MAP = {
  Condominio: 'Condomínio',
  Agua: 'Água',
  Gas: 'Gás',
  'Supermercado (Compra do mes)': 'Supermercado (Compra do mês)',
  'Padaria e Cafes': 'Padaria e Cafés',
  Combustivel: 'Combustível',
  'Transporte Publico (Onibus/Metro)': 'Transporte Público (Ônibus/Metrô)',
  Manutencao: 'Manutenção',
  'Manutencao e Seguro (Gastos fixos com carro)':
    'Manutenção e Seguro (Gastos fixos com carro)',
  Farmacia: 'Farmácia',
  'Plano de Saude / Medicos': 'Plano de Saúde / Médicos',
  'Higiene e Cosmeticos': 'Higiene e Cosméticos',
  'Roupas e Acessorios': 'Roupas e Acessórios',
  Educacao: 'Educação',
  'Compra do mes': 'Compra do mês',
  'Fatura do Cartao': 'Fatura do Cartão',
  Emprestimos: 'Empréstimos',
  'Investimentos / Poupanca': 'Investimentos / Poupança',
};

export function formatCategoryLabel(value) {
  if (!value) return value;

  const direct = CATEGORY_LABEL_MAP[value];
  if (direct) return direct;

  let formatted = value;
  Object.entries(CATEGORY_LABEL_MAP).forEach(([from, to]) => {
    formatted = formatted.replaceAll(from, to);
  });

  return formatted;
}

export function formatCategorySelectLabel(value) {
  const formatted = formatCategoryLabel(value);
  if (!formatted) return formatted;
  return formatted.split('(')[0].trim();
}
