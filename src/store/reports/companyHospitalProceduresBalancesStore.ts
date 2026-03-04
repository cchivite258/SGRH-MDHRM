// src/stores/hospitalProceduresReport.ts
import { defineStore } from "pinia";
import type { CompanyHospitalProceduresBalanceType } from "@/components/ammReports/types";

export const useHospitalProceduresReportStore = defineStore(
  "hospitalProceduresReport",
  {
    state: () => ({
      report: undefined as CompanyHospitalProceduresBalanceType | undefined,
    }),

    actions: {
      setReport(data: CompanyHospitalProceduresBalanceType | undefined) {
        this.report = data;
      },

      clear() {
        this.report = undefined;
      }
    },

    persist: true, 
  }
);
