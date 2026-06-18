import { defineStore } from "pinia";
import type { HospitalProcedureTrendReportType } from "@/components/ammReports/types";

export const useHospitalProcedureTrendReportStore = defineStore(
  "hospitalProcedureTrendReport",
  {
    state: () => ({
      report: null as HospitalProcedureTrendReportType | null,
    }),

    actions: {
      setReport(data: HospitalProcedureTrendReportType | undefined) {
        this.report = data || null;
      },

      clear() {
        this.report = null;
      }
    },

    persist: true,
  }
);
