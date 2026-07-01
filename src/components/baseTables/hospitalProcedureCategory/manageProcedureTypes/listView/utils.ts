import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "hospital_procedure_categories",
    disabled: false,
  },
  {
    title: "view-list-hospital_procedure_categories",
    disabled: false,
  },
  {
    title: "edit-hospital-procedure-category",
    disabled: true,
  },
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "code", key: "code", sortable: true },
  { title: "name", key: "name", sortable: true },
  { title: "description", key: "description", sortable: true },
];
