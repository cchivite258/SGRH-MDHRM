/**
 * Formata uma data de acordo com o padrão especificado
 * @param amount - Valor a ser formatado (número)
 * @returns Valor formatado como string
 */
export const amountFormate = (amount: number | undefined) => {
  if (amount === null || amount === undefined ) return 'N/A';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};