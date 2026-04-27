import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "languages",
    disabled: false,
  },
  {
    title: "view-languages-list",
    disabled: true,
  },
  
  
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "language",  key: "language", sortable: true },
  { title: "code", key: "code", sortable: true },
  { title: "localized-name",  key: "localized-name", sortable: true },
  { title: "region",  key: "region", sortable: true },
  { title: "right-to-left", key: "right-to-left", sortable: false },
  { title: "availability", key: "enable", sortable: false },
  { title: "action", sortable: false, align: "center" },
];


export const propertyTypes = [
  { value: undefined, label: "Selecione o RTL" },
  { label: 'Não', value: false },
  { label: 'Sim', value: true },
];
