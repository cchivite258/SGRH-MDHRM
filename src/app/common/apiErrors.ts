type ErrorMessagesMap = Record<string, string[] | string | null | undefined>;

interface ApiErrorShape {
  message?: string;
  detail?: string;
  errors?: ErrorMessagesMap;
  error?: ApiErrorShape;
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
  if (nestedError?.message || nestedError?.detail || nestedError?.errors) {
    return nestedError as ApiErrorShape;
  }

  if (root.message || root.detail || root.error) {
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

const resolveValidationErrors = (payload: ApiErrorShape | null): Record<string, string[]> => {
  return normalizeValidationErrors(
    payload?.error?.errors
    ?? payload?.errors
    ?? payload?.error?.error?.errors
  );
};

export const getApiErrorMessages = (error: unknown, fallbackMessage?: string): string[] => {
  const payload = resolveApiPayload(error);
  const validationErrors = resolveValidationErrors(payload);

  const validationMessages = Object.values(validationErrors).flat();
  if (validationMessages.length > 0) {
    return [validationMessages[0]];
  }

  if (payload?.message && payload.message.trim().length > 0) {
    return [payload.message];
  }

  if (payload?.detail && payload.detail.trim().length > 0) {
    return [payload.detail];
  }

  if (payload?.error?.message && payload.error.message.trim().length > 0) {
    return [payload.error.message];
  }

  if (payload?.error?.detail && payload.error.detail.trim().length > 0) {
    return [payload.error.detail];
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
  return resolveValidationErrors(payload);
};
