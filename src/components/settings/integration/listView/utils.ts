import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import type { MenuSelectItemType } from "@/app/common/components/filters/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "settings",
    disabled: false,
  },
  {
    title: "integrations",
    disabled: true,
  },
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "code", key: "code", sortable: true },
  { title: "integration-application", key: "application", sortable: true },
  { title: "name", key: "name", sortable: true },
  { title: "integration-company-code", key: "companyCode", sortable: true },
  { title: "status", key: "active", sortable: true },
  { title: "action", sortable: false, align: "center" },
];

export const integrationApplicationOptions: MenuSelectItemType[] = [
  { label: "SAGE", value: "SAGE" },
  { label: "PRIMAVERA", value: "PRIMAVERA" },
  { label: "SAPP", value: "SAPP" },
];

export const integrationUsageOptions: MenuSelectItemType[] = [
  { label: "t-integration-usage-payment-orders", value: "PAYMENT_ORDERS" },
];
