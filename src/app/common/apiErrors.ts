type ErrorMessagesMap = Record<string, string[] | string | null | undefined>;

interface ApiErrorShape {
  message?: string;
  error?: {
    errors?: ErrorMessagesMap;
  };
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
};

const resolveApiPayload = (input: unknown): ApiErrorShape | null => {
  const root = asRecord(input);
  if (!root) return null;

  const response = asRecord(root.response);
  const responseData = asRecord(response?.data);
  if (responseData) return responseData as ApiErrorShape;

  const nestedError = asRecord(root.error);
  if (nestedError?.message || nestedError?.errors) {
    return nestedError as ApiErrorShape;
  }

  if (root.message || root.error) {
    return root as ApiErrorShape;
  }

  return null;
};

const normalizeValidationErrors = (errors?: ErrorMessagesMap): Record<string, string[]> => {
  if (!errors || typeof errors !== "object") return {};

  return Object.entries(errors).reduce<Record<string, string[]>>((acc, [field, item]) => {
    if (Array.isArray(item)) {
      const messages = item.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
      if (messages.length > 0) {
        acc[field] = messages;
      }
      return acc;
    }

    if (typeof item === "string" && item.trim().length > 0) {
      acc[field] = [item];
    }

    return acc;
  }, {});
};

export const getApiErrorMessages = (error: unknown, fallbackMessage?: string): string[] => {
  const payload = resolveApiPayload(error);
  const validationErrors = normalizeValidationErrors(payload?.error?.errors);

  if (payload?.message && payload.message.trim().length > 0) {
    return [payload.message];
  }

  const validationMessages = Object.values(validationErrors).flat();
  if (validationMessages.length > 0) {
    return [validationMessages[0]];
  }

  if (typeof fallbackMessage === "string" && fallbackMessage.trim().length > 0) {
    return [fallbackMessage];
  }

  return [];
};

export const getFirstApiErrorMessage = (error: unknown, fallbackMessage?: string): string | undefined => {
  return getApiErrorMessages(error, fallbackMessage)[0];
};

export const getApiValidationErrors = (error: unknown): Record<string, string[]> => {
  const payload = resolveApiPayload(error);
  return normalizeValidationErrors(payload?.error?.errors);
};
