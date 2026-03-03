import { defineStore } from "pinia";
import type { TotalBilledByProviderReportType } from "@/components/ammReports/types";

export const useTotalBilledByProviderReportStore = defineStore(
  "totalBilledByProviderReport",
  {
    state: () => ({
      report: undefined as TotalBilledByProviderReportType | undefined,
    }),

    actions: {
      setReport(data: TotalBilledByProviderReportType | undefined) {
        this.report = data;
      },

      clear() {
        this.report = undefined;
      }
    },

    persist: true,
  }
);
