import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import { ke } from "@/assets/images/flags/utils";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "employees",
    disabled: false,
  },
  {
    title: "list-view",
    disabled: true,
  },
];

export const employeeHeader: DataTableHeaderType[] = [
  // A coluna de seleção será adicionada automaticamente quando showSelect=true
  { title: "employee-number", key: "employeeNumber", sortable: true },
  { title: "employee-name", key: "firstName", sortable: true },
  { title: "phone-number", key: "phone", sortable: true },
  { title: "email", key: "email", sortable: true }, 
  { title: "is-enabled", key: "enabled", sortable: true }, 
  { title: "action", sortable: false },
];

export const dependentHeader: DataTableHeaderType[] = [
  { title: "dependent-name", key: "firstName", sortable: true},
  { title: "gender", key: "gender" , sortable: true },
  { title: "relationship", key: "relationship" , sortable: true },
  { title: "id-card-number", key: "idCardNumber" , sortable: true },
  { title: "is-enabled", key: "enabled" , sortable: true },
  { title: "action",  sortable: false,  align: "right"}
];



