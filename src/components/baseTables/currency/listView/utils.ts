import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "currencies",
    disabled: false,
  },
  {
    title: "view-list-currency",
    disabled: true,
  },
  
  
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "symbol",  key: "symbol", sortable: true },
  { title: "availability",  key: "enabled", sortable: true },
  { title: "action", sortable: false },
];
