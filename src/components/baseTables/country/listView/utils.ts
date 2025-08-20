import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "countries",
    disabled: false,
  },
  {
    title: "view-list-country",
    disabled: true,
  },
  
  
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "country-name", key: "name", sortable: true },
  { title: "country-code",  key: "code", sortable: true },
  { title: "iso2Code", sortable: false },
  { title: "iso3Code", sortable: false },
  { title: "phone-code", sortable: false },
  { title: "currency", sortable: false },
  { title: "currency-symbol", sortable: false },
  { title: "currency-code", sortable: false },
  { title: "enabled", sortable: false },
  { title: "action", sortable: false },
];
