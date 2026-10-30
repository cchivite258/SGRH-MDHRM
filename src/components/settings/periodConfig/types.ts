export type PeriodConfigId = string | number;

export type PeriodConfigType = "PAYMENT_ORDER";

export type PeriodMonthReference = "PREVIOUS" | "CURRENT";

export type PeriodConfigForm = {
  id?: PeriodConfigId;
  type: PeriodConfigType;
  description: string;
  startDayOfMonth: number | null;
  startMonthReference: PeriodMonthReference;
  endDayOfMonth: number | null;
  endMonthReference: PeriodMonthReference;
  endDayLastDayOfMonth: boolean;
};

export type PeriodConfigListing = PeriodConfigForm & {
  id: PeriodConfigId;
  active?: boolean;
  removable?: boolean;
  enabled?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
};

export type PeriodConfigOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: "asc" | "desc" }[];
  search: string;
};

export type ResolvedPeriod = {
  type: PeriodConfigType;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  periodConfigId: number;
};
