type ErrorMessagesMap = Record<string, string[] | string | null | undefined>;

export interface ApiRecordError {
  recordType: string;
  recordId: string;
  recordName?: string | null;
  field?: string | null;
  message: string;
}

interface ApiErrorShape {
  message?: string;
  detail?: string;
  errors?: ErrorMessagesMap | unknown[];
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

const isApiRecordError = (value: unknown): value is ApiRecordError => {
  const item = asRecord(value);
  return !!item
    && typeof item.recordType === "string"
    && item.recordId !== undefined
    && item.recordId !== null
    && typeof item.message === "string";
};

const resolveRawErrors = (payload: ApiErrorShape | null) =>
  payload?.error?.errors
  ?? payload?.errors
  ?? payload?.error?.error?.errors;

const normalizeRecordErrors = (errors: unknown[]): Record<string, string[]> =>
  errors.reduce<Record<string, string[]>>((acc, item) => {
    if (typeof item === "string" && item.trim().length > 0) {
      (acc._ ??= []).push(item);
      return acc;
    }

    if (isApiRecordError(item) && item.message.trim().length > 0) {
      const key = item.field || item.recordType;
      (acc[key] ??= []).push(item.message);
    }

    return acc;
  }, {});

const normalizeValidationErrors = (errors?: ErrorMessagesMap | unknown[]): Record<string, string[]> => {
  if (!errors || typeof errors !== "object") return {};
  if (Array.isArray(errors)) return normalizeRecordErrors(errors);

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
  return normalizeValidationErrors(resolveRawErrors(payload));
};

const resolveRecordErrors = (payload: ApiErrorShape | null): ApiRecordError[] => {
  const errors = resolveRawErrors(payload);
  if (!Array.isArray(errors)) return [];

  return errors
    .filter(isApiRecordError)
    .map(item => ({ ...item, recordId: String(item.recordId) }));
};

const resolveSummaryMessage = (payload: ApiErrorShape | null): string | undefined =>
  [payload?.message, payload?.detail, payload?.error?.message, payload?.error?.detail]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);

export const getApiErrorMessages = (error: unknown, fallbackMessage?: string): string[] => {
  const payload = resolveApiPayload(error);

  if (resolveRecordErrors(payload).length > 0) {
    const summary = resolveSummaryMessage(payload);
    if (summary) return [summary];
  }

  const validationErrors = resolveValidationErrors(payload);

  const validationMessages = Object.values(validationErrors).flat();
  if (validationMessages.length > 0) {
    return [validationMessages[0]];
  }

  const summary = resolveSummaryMessage(payload);
  if (summary) {
    return [summary];
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

export const getApiRecordErrors = (error: unknown): ApiRecordError[] => {
  return resolveRecordErrors(resolveApiPayload(error));
};
