export const formatCurrency = (val: number | string | undefined | null) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
};

export const formatPercent = (val: number | string | undefined | null) => {
  const num = Number(val) || 0;
  return `${num.toFixed(1)}%`;
};