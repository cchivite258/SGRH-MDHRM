import { defineStore } from "pinia";
import type { TotalBilledMedicalAssistanceReportType } from "@/components/ammReports/types";

export const useTotalBilledMedicalAssistanceReportStore = defineStore(
  "totalBilledMedicalAssistanceReport",
  {
    state: () => ({
      report: [] as TotalBilledMedicalAssistanceReportType,
    }),

    actions: {
      setReport(data: TotalBilledMedicalAssistanceReportType | undefined) {
        this.report = data || [];
      },

      clear() {
        this.report = [];
      }
    },

    persist: true,
  }
);
