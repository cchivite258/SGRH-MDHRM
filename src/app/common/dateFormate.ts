export const getAfterDateFromDay = (options: {
  date?: Date | string;
  endDay: number;
}) => {
  const { date, endDay } = options;
  const day = (date && new Date(date)) || new Date();
  const endDate = day;
  endDate.setDate(day.getDate() + endDay);
  return endDate;
};

const monthNames: string[] = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Formata uma data de acordo com o padrão especificado
 * @param dateValue - Data a ser formatada (Date ou string)
 * @param format - Formato desejado (padrão: 'dd/mm/yyyy')
 * @returns Data formatada como string
 */
export const formateDate = (
  dateValue: Date | string | undefined,
  format: string = "dd/mm/yyyy"
): string => {
  // Verifica se a data é válida
  if (!dateValue) return "";
  
  const initDate = new Date(dateValue);
  
  // Verifica se a data é inválida
  if (isNaN(initDate.getTime())) return "";
  
  const date = initDate.getDate();
  const month = initDate.getMonth();
  const fullYear = initDate.getFullYear();
  
  // Adiciona zeros à esquerda para dia e mês
  const pad = (num: number) => num.toString().padStart(2, '0');

  switch (format.toLowerCase()) {
    case "dd/mm/yyyy":
      return `${pad(date)}/${pad(month + 1)}/${fullYear}`;
      
    case "dd mmm, yyyy":
      return `${date} ${monthNames[month]}, ${fullYear}`;
      
    case "dd-mm-yyyy":
      return `${pad(date)}-${pad(month + 1)}-${fullYear}`;
      
    case "yyyy-mm-dd":
      return `${fullYear}-${pad(month + 1)}-${pad(date)}`;
      
    default:
      // Retorna no formato ISO se o padrão não for reconhecido
      return initDate.toISOString().split('T')[0];
  }
};

export const getFullYear = (date: Date | string) => {
  return new Date(date).getFullYear();
};
