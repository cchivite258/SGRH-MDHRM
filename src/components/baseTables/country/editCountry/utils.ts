import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/components/baseTables/country/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "countries",
    disabled: false,
  },
  {
    title: "view-list-country",
    disabled: false,
  },
  
];

export const listViewHeader: TableHeaderType[] = [
  { title: "", isCheck: true },
  { title: "province-name" },
  { title: "province-code" },
  { title: "action" },
];
