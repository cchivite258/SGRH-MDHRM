import { defineStore } from "pinia";
import type { InvoiceReferenceReportType } from "@/components/ammReports/types";

export const useInvoiceReferenceReportStore = defineStore(
  "invoiceReferenceReport",
  {
    state: () => ({
      report: undefined as InvoiceReferenceReportType | undefined,
    }),

    actions: {
      setReport(data: InvoiceReferenceReportType | undefined) {
        this.report = data;
      },

      clear() {
        this.report = undefined;
      },
    },

    persist: true,
  }
);
