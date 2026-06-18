import { defineStore } from "pinia";
import type { EmployeeHealthPlanLimitsTrendReportType } from "@/components/ammReports/types";

export const useEmployeeHealthPlanLimitsTrendReportStore = defineStore(
  "employeeHealthPlanLimitsTrendReport",
  {
    state: () => ({
      report: null as EmployeeHealthPlanLimitsTrendReportType | null,
    }),

    actions: {
      setReport(data: EmployeeHealthPlanLimitsTrendReportType | undefined) {
        this.report = data || null;
      },

      clear() {
        this.report = null;
      }
    },

    persist: true,
  }
);
