import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";
import { OptionType } from "@/app/common/types/option.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "institution-list",
    disabled: false,
  },
  {
    title: "add-institution",
    disabled: true,
  },
];

export const breadcrumbDepartmet: BreadcrumbType[] = [
  {
    title: "department-list",
    disabled: false,
  },
  {
    title: "edit-department",
    disabled: true,
  },
];

export const breadcrumbHealthPlan: BreadcrumbType[] = [
  {
    title: "health-plan-list",
    disabled: false,
  },
  {
    title: "edit-health-plan",
    disabled: true,
  },
];

export const healthPlanLimitOptions: MenuSelectItemType[] = [
  {
    label: "Valor Fixo",
    value: "FIXED_AMOUNT"
  },
  {
    label: "Salário Anual",
    value: "ANUAL_SALARY"
  }
];

export const limitTypeDefinitionOptions: MenuSelectItemType[] = [
  {
    label: "Valor Fixo",
    value: "FIXED_AMOUNT"
  },
  {
    label: "Percentagem",
    value: "PERCENTAGE"
  }
];

export const salaryComponentOptions: MenuSelectItemType[] = [
  {
    value: undefined,
    label: "Selecione a Componente Salarial"
  },
  {
    label: "Salário Base",
    value: "BASE_SALARY"
  },
  {
    label: "Salário Bruto",
    value: "GROSS_SALARY"
  },
  {
    label: "Salário Líquido",
    value: "NET_SALARY"
  }
];


export const statusOptions: MenuSelectItemType[] = [
  { value: "", label: "Select status" },
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" },
  { value: "Refund", label: "Refund" },
  { value: "UnPaid", label: "UnPaid" },
];

export const contactPersonHeader: DataTableHeaderType[] = [
  { title: "full-name", key: "fullname", sortable: true },
  { title: "email", key: "email", sortable: true },
  { title: "phone", key: "phone", sortable: true },
  { title: "is-enabled", key: "enabled", sortable: true },
  { title: "action", sortable: false }
];

export const departmentHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "description", key: "description", sortable: true },
  { title: "is-enabled", key: "enabled", sortable: true },
  { title: "action", sortable: false }
];

export const positionHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "description", key: "description", sortable: true },
  { title: "is-enabled", key: "enabled", sortable: true },
  { title: "action", sortable: false, }
];

export const coveragePeriodHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "start-date", key: "startDate", sortable: true },
  { title: "end-date", key: "endDate", sortable: true },
  { title: "status", key: "status", sortable: true },
  { title: "is-enabled", key: "enabled", sortable: true },
  { title: "action", sortable: false, align: "end" }
];


export const healthPlanHeader: DataTableHeaderType[] = [
  { title: "max-number-of-dependents", key: "maxNumberOfDependents", sortable: true },
  { title: "children-max-age", key: "childrenMaxAge", sortable: true },
  { title: "children-in-university-max-age", key: "childrenInUniversityMaxAge", sortable: true },
  { title: "health-plan-limit", key: "healthPlanLimit", sortable: true },
  { title: "fixed-amount", key: "fixedAmount", sortable: true },
  { title: "status", key: "status", sortable: true },
  { title: "is-enabled", key: "enabled", sortable: true },
  { title: "action", sortable: false, align: "end" }
];

export const serviceProviderHeader: TableHeaderType[] = [
  //{ title: "id" },
  { title: "service-provider", sortable: true },
  { title: "action", align: 'end' },
];


export const budgetHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  { title: "coverage-period", key: "coveragePeriod", sortable: true },
  { title: "budget-amount", key: "budgetAmount", sortable: true },
  { title: "is-enabled", key: "enabled", sortable: true },
  { title: "action", sortable: false, }
];

export const contactOptions: OptionType[] = [
  {
    title: "view",
    icon: "ph-eye",
    value: "view",
  },
  {
    title: "edit",
    icon: "ph-pencil",
    value: "edit",
  },
  {
    title: "delete",
    icon: "ph-trash",
    value: "delete",
  },
];


export const coverageperiodOptions: OptionType[] = [
  {
    title: "view",
    icon: "ph-eye",
    value: "view",
  },
  {
    title: "edit",
    icon: "ph-pencil",
    value: "edit",
  },
  {
    title: "start",
    icon: "ph-play-circle",
    value: "start",
  },
  {
    title: "close",
    icon: "ph-stop-circle",
    value: "close",
  },
  {
    title: "delete",
    icon: "ph-trash",
    value: "delete",
  },
];


export const healthPlanOptions: OptionType[] = [
  {
    title: "view",
    icon: "ph-eye",
    value: "view",
  },
  {
    title: "edit",
    icon: "ph-pencil",
    value: "edit",
  },
  {
    title: "clone",
    icon: "ph-copy",
    value: "clone",
  },
  {
    title: "delete",
    icon: "ph-trash",
    value: "delete",
  },
];


export const statusContactOptions: MenuSelectItemType[] = [
  { value: "", label: "All Select" },
  { value: "active", label: "Active" },
  { value: "block", label: "Block" },
  { value: "unActive", label: "UnActive" },
];


export const filters = {
  query: "",
  status: "",
  date: "",
};

export const contactHeader: TableHeaderType[] = [
  //{ title: "id" },
  { title: "name" },
  { title: "email" },
  { title: "phone-number" },
  { title: "created-date" },
  { title: "status" },
  { title: "is-enabled" },
  { title: "action" },
];

export const historyHeader: TableHeaderType[] = [
  //{ title: "id" },
  { title: "interaction" },
  { title: "interaction-type" },
  { title: "date" },
  { title: "document-type" },
  { title: "action" },
];



export const hospitalProcedureHeader: TableHeaderType[] = [
  //{ title: "id" },
  { title: "hospital-procedure-type", key: "hospitalProcedureType", sortable: true },
  { title: "limit-type-definition", key: "limitTypeDefinition", sortable: true },
  { title: "fixed-amount", key: "fixedAmount", sortable: true },
  { title: "percentage", key: "percentage", sortable: true },
  { title: "enabled", key: "enabled", sortable: true },
  { title: "action", sortable: false, align: "center" }
];

