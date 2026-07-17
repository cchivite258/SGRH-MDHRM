import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import type { ReasonType } from "@/components/baseTables/reason/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "reasons",
    disabled: false,
  },
  {
    title: "view-reason-list",
    disabled: true,
  },
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "type", key: "type", sortable: true },
  { title: "description", key: "description", sortable: true },
  { title: "availability", key: "enabled", sortable: true },
  { title: "action", sortable: false, align: "center" },
];

export const reasonTypeOptions: { label: string; value: ReasonType }[] = [
  { label: "t-reason-type-invoice-posting-flagged", value: "INVOICE_POSTING_FLAGGED" },
  { label: "t-reason-type-invoice-reversal", value: "INVOICE_REVERSAL" },
  { label: "t-reason-type-invoice-cancelation", value: "INVOICE_CANCELATION" },
  { label: "t-reason-type-employee-change-base-salary", value: "EMPLOYEE_CHANGE_BASE_SALARY" },
  { label: "t-reason-type-employee-termination", value: "EMPLOYEE_TERMINATION" },
  { label: "t-reason-type-coverage-period-extension", value: "COVERAGE_PERIOD_EXTENSION" },
  { label: "t-reason-type-service-provider-contract-extension", value: "SERVICE_PROVIDER_CONTRACT_EXTENSION" },
];
