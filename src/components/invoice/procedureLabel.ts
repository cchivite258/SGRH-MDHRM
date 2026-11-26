export type ProcedureOption = {
  value?: string | number | null;
  label?: string | null;
  categoryName?: string | null;
};

const text = (value: unknown) => String(value ?? "").trim();

export const readProcedureLabel = (procedure: any): string => {
  if (!procedure || typeof procedure !== "object") return "";

  const type = procedure.hospitalProcedureType || procedure.procedureType || {};
  const code = text(type.code || procedure.code || procedure.hospitalProcedureTypeCode);
  const name = text(
    type.name
    || procedure.name
    || procedure.hospitalProcedureTypeName
    || procedure.procedureName
  );

  if (code && name) return `${code} - ${name}`;
  return name || code;
};

export const readProcedureCategory = (procedure: any): string => {
  if (!procedure || typeof procedure !== "object") return "";

  const type = procedure.hospitalProcedureType || procedure.procedureType || {};
  return text(type.categoryName || procedure.categoryName || procedure.hospitalProcedureTypeCategoryName);
};

// O autocomplete junta o nome do procedimento e a categoria no texto visível.
// Esse texto não pode ser gravado como descrição da linha.
export const isGeneratedProcedureDescription = (
  description: string | null | undefined,
  option?: ProcedureOption | null
) => {
  const current = text(description);
  if (!current || !option) return false;

  const label = text(option.label);
  const category = text(option.categoryName);
  if (!label || !category || category === "-") return false;

  return current === `${label}${category}` || current === `${label} ${category}`;
};
