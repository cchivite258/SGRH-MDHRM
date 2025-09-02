// src/app/common/currencyFormat.ts
export function formatCurrency(value: number | string): string {
  if (value === null || value === undefined || value === '') return '0,00';

  const number = Number(value);

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(number);
}
