import { defineStore } from "pinia";
import type { TopServiceTypesByClinicReportType } from "@/components/ammReports/types";

export const useTopServiceTypesByClinicReportStore = defineStore(
  "topServiceTypesByClinicReport",
  {
    state: () => ({
      report: [] as TopServiceTypesByClinicReportType,
    }),

    actions: {
      setReport(data: TopServiceTypesByClinicReportType | undefined) {
        this.report = data || [];
      },

      clear() {
        this.report = [];
      }
    },

    persist: true,
  }
);
