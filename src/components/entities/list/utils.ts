import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "entities",
    disabled: false
  },
  {
    title: "list-view",
    disabled: true
  }
];

export const entitiesHeader: DataTableHeaderType[] = [
  { title: "institution-name", key: "name", sortable: true },
  { title: "institution-type", key: "institutionType", sortable: true },
  { title: "email", key: "email", sortable: true },
  { title: "phone-number", key: "phone", sortable: true },
  { title: "created-date", key: "createdAt", sortable: true },
  { title: "is-enabled", key: "enabled", sortable: true },
  { title: "action", sortable: false }
];
