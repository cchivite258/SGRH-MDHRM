import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "agent",
    disabled: false,
  },
  {
    title: "list-view",
    disabled: true,
  },
];

export const listViewHeader: TableHeaderType[] = [
  { title: "", isCheck: true },
  { title: "#" },
  { title: "Date" },
  { title: "Agent Name" },
  { title: "Address" },
  { title: "Email" },
  { title: "Contacts" },
  { title: "Status" },
  { title: "Action" },
];
