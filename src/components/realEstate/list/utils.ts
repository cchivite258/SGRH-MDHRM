import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "real-estate",
    disabled: false,
  },
  {
    title: "listing-list",
    disabled: true,
  },
];

export const dashboard = [
  {
    title: "Total Property Sale",
    endVal: 21438,
    color: "secondary",
    percent: "3.8%",
    icon: "ph-trend-up",
    isSuccess: true,
  },
  {
    title: "Total Property Rent",
    endVal: 5963,
    color: "primary",
    percent: "20.8%",
    icon: "ph-trend-up",
    isSuccess: true,
  },
  {
    title: "Sellers (Agents)",
    endVal: 4620,
    color: "warning",
    percent: "12.6%",
    icon: "ph-trend-up",
    isSuccess: true,
  },
  {
    title: "Buyers",
    endVal: 8541,
    color: "success",
    percent: "18.7%",
    icon: "ph-trend-up",
    isSuccess: true,
  },
  {
    title: "Upcoming Project",
    endVal: 2314,
    color: "danger",
    percent: "7.1%",
    icon: "ph-trend-down",
    isSuccess: false,
  },
];

export const propertyHeader: TableHeaderType[] = [
  { title: "", isCheck: true },
  { title: "#" },
  { title: "Property Name" },
  { title: "Address" },
  { title: "Beds" },
  { title: "Property Type" },
  { title: "sqft" },
  { title: "Agents" },
  { title: "Price" },
  { title: "Sale/Rent" },
  { title: "Action" },
];
