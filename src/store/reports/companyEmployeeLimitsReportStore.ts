import { defineStore } from "pinia";
import type { CompanyEmployeeLimitsReportType } from "@/components/ammReports/types";

export const useCompanyEmployeeLimitsReportStore = defineStore(
  "companyEmployeeLimitsReport",
  {
    state: () => ({
      report: null as CompanyEmployeeLimitsReportType | null,
    }),

    actions: {
      setReport(data: CompanyEmployeeLimitsReportType | undefined) {
        this.report = data || null;
      },

      clear() {
        this.report = null;
      }
    },

    persist: true,
  }
);

