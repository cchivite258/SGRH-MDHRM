export const ERP_CODE_MAX_LENGTH = 50;
export const COST_CENTER_ACCOUNT_MAX_LENGTH = 45;

const PAYMENT_ORDER_CODE_PATTERN = /^$|^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

export const normalizePaymentOrderCode = (value?: string | null) => (value ?? "").trim();

export const shouldSavePaymentOrderCode = (
  current?: string | null,
  previous?: string | null,
  isNew = false
) => {
  const normalized = normalizePaymentOrderCode(current);
  if (isNew) return normalized.length > 0;
  return normalized !== normalizePaymentOrderCode(previous);
};

export const paymentOrderCodeRules = (
  maxLength: number,
  invalidMessage: string,
  maximumMessage: string
) => [
  (value: string | null | undefined) => {
    const normalized = normalizePaymentOrderCode(value);
    if (!normalized) return true;
    if (normalized.length > maxLength) return maximumMessage;
    return PAYMENT_ORDER_CODE_PATTERN.test(normalized) || invalidMessage;
  },
];
