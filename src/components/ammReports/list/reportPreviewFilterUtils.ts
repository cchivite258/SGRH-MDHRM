import { formateDate } from "@/app/common/dateFormate";
import type { ReportPreviewParameterType } from "@/store/reports/reportPreviewFiltersStore";

type OptionLike = {
  value?: string | number;
  label?: string;
};

export const getOptionLabel = (items: OptionLike[], value: string | number | undefined) => {
  const selected = items.find((item) => String(item.value) === String(value));
  return selected?.label || String(value ?? "");
};

// Datas dos filtros podem vir de controlos ou payloads diferentes.
// Centralizar a formatacao mantem os chips de preview consistentes.
export const formatPreviewParameterDate = (date?: Date | string) => {
  return formateDate(date) || "";
};

// Cada relatorio declara apenas os parametros que se aplicam.
// Entradas false/undefined sao ignoradas para manter filtros condicionais legiveis.
export const buildPreviewParameters = (
  parameters: (ReportPreviewParameterType | false | undefined)[]
) => {
  return parameters.filter(Boolean) as ReportPreviewParameterType[];
};
