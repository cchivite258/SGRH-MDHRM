import { defineStore } from "pinia";
import type { EmployeeExpenseStatementReportType } from "@/components/ammReports/types";

export const useEmployeeExpenseStatementReportStore = defineStore(
  "employeeExpenseStatementReport",
  {
    state: () => ({
      report: undefined as EmployeeExpenseStatementReportType | undefined,
    }),

    actions: {
      setReport(data: EmployeeExpenseStatementReportType | undefined) {
        this.report = data;
      },

      clear() {
        this.report = undefined;
      },
    },

    persist: true,
  }
);
