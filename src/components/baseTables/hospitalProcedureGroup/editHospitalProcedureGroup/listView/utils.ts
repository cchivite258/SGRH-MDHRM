import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "hospital_procedure_groups",
    disabled: false,
  },
  {
    title: "view-list-hospital_procedure_groups",
    disabled: false,
  },
  {
    title: "edit-hospital-procedure-group",
    disabled: true,
  },
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "description", key: "description", sortable: true },
];
