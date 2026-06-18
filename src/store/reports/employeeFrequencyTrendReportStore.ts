import { defineStore } from "pinia";
import type { EmployeeFrequencyTrendReportType } from "@/components/ammReports/types";

export const useEmployeeFrequencyTrendReportStore = defineStore(
  "employeeFrequencyTrendReport",
  {
    state: () => ({
      report: null as EmployeeFrequencyTrendReportType | null,
    }),

    actions: {
      setReport(data: EmployeeFrequencyTrendReportType | undefined) {
        this.report = data || null;
      },

      clear() {
        this.report = null;
      }
    },

    persist: true,
  }
);
