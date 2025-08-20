import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "tables",
    disabled: false,
  },
  {
    title: "basic-tables",
    disabled: true,
  },
];

export const tableHeader: TableHeaderType[] = [
  { title: "ID" },
  { title: "Customer" },
  { title: "Date" },
  { title: "Invoice" },
  { title: "Action" },
];

export const checkedTableHeader: TableHeaderType[] = [
  { title: "", isCheck: true },
  { title: "ID" },
  { title: "Customer" },
  { title: "Date" },
  { title: "Invoice" },
  { title: "Action" },
];

export const tableData = [
  {
    id: "10",
    name: "Bobby Davis",
    date: "October 15, 2021",
    price: "$2,300",
  },
  {
    id: "09",
    name: "Christopher Neal",
    date: "October 7, 2021",
    price: "$5,500",
    isCheck: true,
  },
  {
    id: "08",
    name: "Monkey Karry",
    date: "October 5, 2021",
    price: "$2,420",
  },
  {
    id: "07",
    name: "James White",
    date: "October 2, 2021",
    price: "$7,452",
    isCheck: true,
  },
];
