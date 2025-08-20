import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";
import { FilterType } from "@/components/realEstate/agent/gridView/type";
import { OptionType } from "@/app/common/types/option.type";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "agent",
    disabled: false,
  },
  {
    title: "grid-view",
    disabled: true,
  },
];

export const filter: FilterType = {
  query: "",
  status: "",
};

export const cardOptions: OptionType[] = [
  {
    title: "Overview",
    value: "view",
    icon: "ph-eye ph-lg",
  },
  {
    title: "Edit",
    value: "edit",
    icon: "ph-pencil ph-lg",
  },
  {
    title: "Delete",
    value: "delete",
    icon: "ph-trash ph-lg",
  },
];
