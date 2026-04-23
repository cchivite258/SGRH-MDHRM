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
  { title: "action", sortable: false, align: "center" },
];

export const dependentHeader: DataTableHeaderType[] = [
  { title: "dependent-name", key: "firstName", sortable: true},
  { title: "gender", key: "gender" , sortable: true },
  { title: "relationship", key: "relationship" , sortable: true },
  { title: "id-card-number", key: "idCardNumber" , sortable: true },
  { title: "is-enabled", key: "enabled" , sortable: true },
  { title: "action",  sortable: false,  align: "right"}
];

export const healthPlanHeader: DataTableHeaderType[] = [
  { title: "allocated-balance", key: "allocatedBalance", sortable: true },
  { title: "used-balance", key: "usedBalance", sortable: true },
  { title: "remaining-balance", key: "remainingBalance", sortable: true },
  { title: "start-date", key: "startDate", sortable: true },
  { title: "end-date", key: "endDate", sortable: true },
  //{ title: "status", key: "status", sortable: true },
  { title: "action", sortable: false, align: "right" }
];

export const salaryReviewHeader: DataTableHeaderType[] = [
  { title: "base-salary", key: "baseSalary", sortable: true },
  { title: "start-date", key: "startDate", sortable: true },
  { title: "end-date", key: "endDate", sortable: true },
  { title: "status", key: "status", sortable: true }
];

export const hospitalProcedureBalanceHeader: DataTableHeaderType[] = [
  { title: "hospital-procedure-type-name", key: "hospitalProcedureType.name", sortable: true },
  { title: "allocated-balance", key: "allocatedBalance", sortable: true },
  { title: "used-balance", key: "usedBalance", sortable: true },
  { title: "remaining-balance", key: "remainingBalance", sortable: true },
  { title: "enabled", key: "enabled", sortable: true }
];
