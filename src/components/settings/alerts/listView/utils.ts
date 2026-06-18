import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import type { MenuSelectItemType } from "@/app/common/components/filters/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "settings",
    disabled: false,
  },
  {
    title: "alerts",
    disabled: true,
  },
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "type", key: "type", sortable: true },
  { title: "last-execution-status", key: "lastStatus", sortable: true },
  { title: "last-execution", key: "lastExecution", sortable: true },
  { title: "next-execution", key: "nextExecution", sortable: true },
  { title: "availability", key: "enabled", sortable: true },
  { title: "action", sortable: false, align: "center" },
];

export const alertTypeOptions: MenuSelectItemType[] = [
  {
    label: "t-alert-type-service-provider-contract-expiring",
    value: "SERVICE_PROVIDER_EXPIRING",
  },
  {
    label: "t-alert-type-client-contract-coverage-expiring",
    value: "COVERAGE_PERIOD_EXPIRING",
  },
];
