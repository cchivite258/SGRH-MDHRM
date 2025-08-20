import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "leave-reason",
    disabled: false,
  },
  {
    title: "view-leave-reason-list",
    disabled: true,
  },
  
  
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "reason", key: "reason", sortable: true },
  { title: "description",  key: "description", sortable: true },
  { title: "availability",  key: "enabled", sortable: true },
  { title: "action", sortable: false },
];
