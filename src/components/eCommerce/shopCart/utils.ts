import { CartItemType } from "@/components/eCommerce/shopCart/types";
import { TableHeaderType } from "@/app/common/types/table.types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { Img1, Img2, Img3, Img6, Img9 } from "@/assets/images/products/utils";

export const productCartBreadcrumb: BreadcrumbType[] = [
  {
    title: "ecommerce",
    disabled: false,
  },
  {
    title: "shopping-cart",
    disabled: true,
  },
];

export const cartItemHeader: TableHeaderType[] = [
  { title: "Product Item" },
  { title: "Item Price" },
  { title: "Quantity" },
  { title: "Amount" },
];

export const cartItems: CartItemType[] = [
  {
    src: Img1,
    name: "Branded T-Shirts",
    category: "Fashion",
    price: 161.25,
    quantity: 3,
    size: "XL",
    color: "Blue",
  },
  {
    src: Img3,
    name: "Fossil gen 5E smart watch",
    category: "Watch",
    price: 69.6,
    quantity: 2,
    color: "White",
  },
  {
    src: Img6,
    name: "Olive Printed Men Round Neck",
    category: "Fashion",
    price: 250.0,
    quantity: 6,
    size: "M",
    color: "Brown",
  },
  {
    src: Img9,
    name: "Flip-Flops and House Slippers",
    category: "Footwear",
    price: 150.0,
    quantity: 1,
    size: '8',
    color: "Green",
  },
  {
    src: Img2,
    name: "Like style travel black handbag",
    category: "Luggage",
    price: 89.99,
    quantity: 0,
    color: "Green",
  },
];
