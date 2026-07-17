import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "service-provider-list",
    disabled: false,
  },
  {
    title: "add-service-provider",
    disabled: true,
  },
];

export const serviceProviderContractExtensionHeader: DataTableHeaderType[] = [
  { title: "contract-start-date", key: "contractStartDate", sortable: true },
  { title: "contract-end-date", key: "contractEndDate", sortable: true },
  { title: "notes", key: "notes", sortable: false },
  { title: "status", key: "status", sortable: true },
  { title: "action", sortable: false, align: "end", width: "110px" }
];
