import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { Avatar1 } from "@/assets/images/users/utils";
import { TableHeaderType } from "@/app/common/types/table.types";
import { Img1, Img3, Img6, Img9 } from "@/assets/images/products/utils";
import { ProductItemType } from "@/components/eCommerce/orderOverview/types";

export const orderOverviewBreadcrumb: BreadcrumbType[] = [
  {
    title: "ecommerce",
    disabled: false,
  },
  {
    title: "order-overview",
    disabled: true,
  },
];

export const widgets = [
  {
    title: "Customer Info",
    subTitle: "Bryana Watsica",
    text1: "watsica@steex.com",
    text2: "+(253) 01234 56789",
    src: Avatar1,
    color: "secondary",
  },
  {
    title: "Shipping Info",
    subTitle: "Jennifer Mayert",
    text1: "730 Madison Ave, Covington",
    text2: "Kentucky, United States",
    icon: "ph-xl ph-truck",
    color: "primary",
  },
  {
    title: "Billing Info",
    subTitle: "Bryana Watsica",
    text1: "730 Madison Ave, Covington",
    text2: "Kentucky, United States",
    icon: "ph-xl ph-file-text",
    color: "info",
  },
  {
    title: "Payment Info",
    subTitle: "ID: #TBS3650259845",
    text1: "Payment Method: Debit Card",
    text2: "Card Number: xxxx xxxx xxxx 2456",
    icon: "ph-xl ph-currency-dollar",
    color: "warning",
  },
];

export const productsHeader: TableHeaderType[] = [
  { title: "Product items" },
  { title: "Item Price" },
  { title: "Quantity" },
  { title: "Amount", align: "right" },
];

export const productItems: ProductItemType[] = [
  {
    src: Img1,
    name: "Branded T-Shirts",
    category: "Fashion",
    price: "$161.25",
    quantity: "03",
    amount: "$483.75",
  },
  {
    src: Img3,
    name: "Fossil gen 5E smart watch",
    category: "Watch",
    price: "	$69.60",
    quantity: "02",
    amount: "$139.20",
  },
  {
    src: Img6,
    name: "Blive Printed Men Round Neck",
    category: "Fashion",
    price: "$250.00",
    quantity: "06",
    amount: "$1,500.00",
  },
  {
    src: Img9,
    name: "Flip-Flops and House Slippers",
    category: "Fashion",
    price: "$150.00",
    quantity: "01",
    amount: "$150.00",
  },
];

export const tableOverview = [
  {
    title: "Order Date",
    value: "15 Feb. 2023",
  },
  {
    title: "Delivery Date",
    value: "23 Feb, 2023",
  },
  {
    title: "Order Amount",
    value: "$2,050.18",
  },
  {
    title: "Order Status",
    status: "ood",
  },
];
