// src/stores/costPerEmployeeStore.ts
import { defineStore } from "pinia";
import type { CompanyCostPerEmployeeReportType } from "@/components/ammReports/types";

export const useCostPerEmployeeStore = defineStore(
  "costPerEmployeeReport",
  {
    state: () => ({
      report: undefined as CompanyCostPerEmployeeReportType | undefined,
    }),

    actions: {
      setReport(data: CompanyCostPerEmployeeReportType | undefined) {
        this.report = data;
      },

      clear() {
        this.report = undefined;
      }
    },

    persist: true, 
  }
);
