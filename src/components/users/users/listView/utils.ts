import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import { OptionType } from "@/components/users/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "users",
    disabled: false,
  },
  {
    title: "list-view",
    disabled: true,
  },
];

export const userHeader: DataTableHeaderType[] = [
  { title: "full-name", key: "firstName", sortable: true },
  { title: "email", key: "email" , sortable: true },
  { title: "status" , sortable: false },
  { title: "blocked?", sortable: false },
  { title: "action",  sortable: false  },
];

export const Options: OptionType[] = [
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
  {
    title: "change",
    icon: "ph-arrows-clockwise",
    value: "change",
  },
  {
    title: "enable",
    icon: "ph-lock",
    value: "enable",
  },
];


