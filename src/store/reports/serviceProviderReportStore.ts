import { defineStore } from "pinia";
import type { ServiceProviderReportType } from "@/components/ammReports/types";

export const useServiceProviderReportStore = defineStore(
  "serviceProviderReport",
  {
    state: () => ({
      report: undefined as ServiceProviderReportType | undefined,
    }),

    actions: {
      setReport(data: ServiceProviderReportType | undefined) {
        this.report = data;
      },

      clear() {
        this.report = undefined;
      }
    },

    persist: true,
  }
);
