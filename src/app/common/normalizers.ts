export type StringNormalizationMode = "trim" | "trimToEmpty" | "trimToNull";

export const normalizeStringValue = (
  value: unknown,
  mode: StringNormalizationMode = "trim"
): string | null => {
  if (value === null || value === undefined) {
    if (mode === "trimToEmpty") return "";
    if (mode === "trimToNull") return null;
    return "";
  }

  const normalized = String(value).trim();

  if (mode === "trimToNull") {
    return normalized === "" ? null : normalized;
  }

  return normalized;
};

export const normalizeObjectStringFieldsInPlace = <T extends Record<string, any>>(
  target: T,
  rules: Partial<Record<keyof T, StringNormalizationMode>>
): void => {
  (Object.keys(rules) as Array<keyof T>).forEach((field) => {
    const mode = rules[field];
    if (!mode) return;
    target[field] = normalizeStringValue(target[field], mode) as T[keyof T];
  });
};
