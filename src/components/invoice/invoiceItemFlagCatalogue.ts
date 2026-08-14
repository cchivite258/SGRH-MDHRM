import type { InvoiceItemFlag } from "@/components/invoice/types";

export type InvoiceItemFlagCatalogueEntry = {
  value: InvoiceItemFlag;
  label: {
    pt: string;
    en: string;
  };
  i18nKey: string;
  isFlagged: boolean;
  color: string;
  icon: string;
};

export const invoiceItemFlagCatalogue: InvoiceItemFlagCatalogueEntry[] = [
  {
    value: "EXCEEDS_LIMIT",
    label: {
      pt: "Limite do procedimento excedido",
      en: "Procedure limit exceeded"
    },
    i18nKey: "t-exceeds-limit",
    isFlagged: true,
    color: "warning",
    icon: "ph-warning"
  },
  {
    value: "FREQUENCY_FLAGGED",
    label: {
      pt: "Frequência de utilização excedida",
      en: "Usage frequency exceeded"
    },
    i18nKey: "t-frequency-flagged",
    isFlagged: true,
    color: "info",
    icon: "ph-clock-counter-clockwise"
  },
  {
    value: "INSUFFICIENT_FUNDS",
    label: {
      pt: "Fundos insuficientes",
      en: "Insufficient funds"
    },
    i18nKey: "t-insufficient-funds",
    isFlagged: true,
    color: "error",
    icon: "ph-money"
  },
  {
    value: "UNFLAGGED",
    label: {
      pt: "Não sinalizado",
      en: "Unflagged"
    },
    i18nKey: "t-unflagged",
    isFlagged: false,
    color: "success",
    icon: "ph-check-circle"
  },
  {
    value: "WAITING_PERIOD",
    label: {
      pt: "Período de carência",
      en: "Grace period"
    },
    i18nKey: "t-waiting-period",
    isFlagged: true,
    color: "secondary",
    icon: "ph-hourglass"
  }
];

export const invoiceItemFlagCatalogueByValue = invoiceItemFlagCatalogue.reduce(
  (acc, entry) => {
    acc[entry.value] = entry;
    return acc;
  },
  {} as Record<InvoiceItemFlag, InvoiceItemFlagCatalogueEntry>
);
