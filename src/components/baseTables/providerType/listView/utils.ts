import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "provider-types",
    disabled: false,
  },
  {
    title: "provider-type-list",
    disabled: true,
  },
  
  
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "description",  key: "description", sortable: true },
  {title: "availability", key: "enabled", sortable: true},
  { title: "action", sortable: false },
];
