import type { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import type { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "access-management",
    disabled: false,
  },
  {
    title: "modules",
    disabled: true,
  },
];

export const moduleHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "description", key: "description", sortable: true },
  { title: "availability", key: "enabled", sortable: true },
  { title: "action", sortable: false, align: "center" },
];
