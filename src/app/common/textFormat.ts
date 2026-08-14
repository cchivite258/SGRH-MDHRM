export const toUpperCaseText = (value: unknown, fallback = ""): string => {
  if (value === null || value === undefined) return fallback;

  const text = String(value).trim();
  if (!text) return fallback;

  return text.toLocaleUpperCase("pt-PT");
};
