import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "invoices",
    disabled: false,
  },
  {
    title: "list-overview",
    disabled: true,
  },
];

export const topData = [
  {
    title: "Invoice No",
    value: "#TBS24301901",
  },
  {
    title: "Date",
    value: "10 April, 2024",
  },
  {
    title: "Due Date",
    value: "10, April, 2024",
  },
  {
    title: "Payment Status",
    value: "paid",
    isChip: true,
  },
  {
    title: "Total Amount",
    value: "$2,050.18",
  },
];

export const invoiceOverviewHeader: TableHeaderType[] = [
  { title: "#" },
  { title: "Product Details", align: "center" },
  { title: "Rate", align: "center" },
  { title: "Quantity", align: "center" },
  { title: "Amount", align: "right" },
];

export const productItems = [
  {
    id: "01",
    name: "Branded T-Shirts",
    category: "Fashion",
    rate: "$161.25",
    quantity: "03",
    amount: "$483.75",
  },
  {
    id: "02",
    name: "Fossil gen 5E smart watch",
    category: "32.5mm (1.28 Inch) TFT Color Touch Display",
    rate: "$69.60",
    quantity: "02",
    amount: "$139.20",
  },
  {
    id: "03",
    name: "Blive Printed Men Round Neck",
    category: "Fashion",
    rate: "$250.00",
    quantity: "06",
    amount: "$1,500.00",
  },
  {
    id: "04",
    name: "Flip-Flops and House Slippers",
    category: "Footwear",
    rate: "$150.00",
    quantity: "01",
    amount: "$150.00",
  },
];
