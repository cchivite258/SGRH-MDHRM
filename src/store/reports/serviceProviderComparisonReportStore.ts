import { defineStore } from "pinia";
import type { ServiceProviderComparisonReportType } from "@/components/ammReports/types";

export const useServiceProviderComparisonReportStore = defineStore(
  "serviceProviderComparisonReport",
  {
    state: () => ({
      report: [] as ServiceProviderComparisonReportType,
    }),

    actions: {
      setReport(data: ServiceProviderComparisonReportType | undefined) {
        this.report = data || [];
      },

      clear() {
        this.report = [];
      }
    },

    persist: true,
  }
);
