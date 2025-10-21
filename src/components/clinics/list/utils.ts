import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import { ke } from "@/assets/images/flags/utils";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "clinics",
    disabled: false,
  },
  {
    title: "clinics-list-view",
    disabled: true,
  },
];

export const clinicsHeader: DataTableHeaderType[] = [
  { title: "name", key: "name", sortable: true },
  // { title: "description", key: "description", sortable: true },
  { title: "address", key: "address", sortable: true },
  { title: "phone", key: "phone", sortable: true },
  { title: "email", key: "email", sortable: true },
  { title: "website", key: "website", sortable: true },
  { title: "availability", key: "enabled", sortable: true },
  { title: "action", sortable: false },
];



