import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";
import { OptionType } from "@/components/baseTables/country/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "countries",
    disabled: false,
  },
  {
    title: "view-list-country",
    disabled: true,
  },
  {
    title: "edit-country",
    disabled: true,
  },
];

export const listViewHeader: TableHeaderType[] = [
  { title: "province-name", key: "name", sortable: true },
  { title: "province-code",  key: "code", sortable: true },
  { title: "availability",  key: "enabled", sortable: true },
  { title: "action", sortable: false },
];

export const provinceOptions: OptionType[] = [
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
