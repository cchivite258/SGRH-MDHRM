import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import { ke } from "@/assets/images/flags/utils";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "service-providers",
    disabled: false,
  },
  {
    title: "service-provider-list",
    disabled: true,
  },
];

export const serviceProviderHeader: DataTableHeaderType[] = [
  { title: "code", key: "code", sortable: true },
  { title: "name", key: "name", sortable: true },
  { title: "type-provider", key: "serviceProviderType", sortable: true },
  { title: "address", key: "address", sortable: true },
  { title: "phone", key: "phone", sortable: true },
  { title: "availability", key: "enabled", sortable: true },
  { title: "action", sortable: false, align: "center" },
];
