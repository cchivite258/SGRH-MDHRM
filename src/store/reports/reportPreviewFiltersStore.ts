import { defineStore } from "pinia";

export type ReportPreviewParameterType = {
  label: string;
  value: string;
};

export const useReportPreviewFiltersStore = defineStore(
  "reportPreviewFilters",
  {
    state: () => ({
      parametersByReportId: {} as Record<string, ReportPreviewParameterType[]>,
    }),

    actions: {
      setParameters(reportId: string, parameters: ReportPreviewParameterType[]) {
        this.parametersByReportId[reportId] = parameters.filter((item) => item.value);
      },

      clearParameters(reportId: string) {
        delete this.parametersByReportId[reportId];
      },
    },

    persist: true,
  }
);
