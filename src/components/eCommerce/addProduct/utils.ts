import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { MenuSelectItemType } from "@/app/common/components/filters/types";

export const addProductBreadcrumb: BreadcrumbType[] = [
  {
    title: "ecommerce",
    disabled: false,
  },
  {
    title: "create-product",
    disabled: true,
  },
];

export const categoriesOptions: MenuSelectItemType[] = [
  { value: "", label: "Select categories" },
  { value: "Appliances", label: "Appliances" },
  { value: "Automotive Accessories", label: "Automotive Accessories" },
  { value: "Electronics", label: "Electronics" },
  { value: "Fashion", label: "Fashion" },
  { value: "Furniture", label: "Furniture" },
  { value: "Footwear", label: "Footwear" },
  { value: "Sportswear", label: "Sportswear" },
  { value: "Watches", label: "Watches" },
  { value: "Headphones", label: "Headphones" },
  { value: "Other Accessories", label: "Other Accessories" },
];

export const productOptions: MenuSelectItemType[] = [
  { value: "", label: "Select Type" },
  { value: "Simple", label: "Simple" },
  { value: "Classified", label: "Classified" },
];

export const unitOptions: MenuSelectItemType[] = [
  { value: "", label: "Select Unit" },
  { value: "Kilogram", label: "Kilogram" },
  { value: "Pieces", label: "Pieces" },
];

export const brandOptions: MenuSelectItemType[] = [
  { value: "Fashion", label: "Fashion" },
  { value: "Style", label: "Style" },
  { value: "Brands", label: "Brands" },
  { value: "Puma", label: "Puma" },
];

export const statusOptions: MenuSelectItemType[] = [
  { value: "", label: "Select Status" },
  { value: "Published", label: "Published" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Draft", label: "Draft" },
];

export const visibilityOptions: MenuSelectItemType[] = [
  { value: "", label: "Select Visibility" },
  { value: "Public", label: "Public" },
  { value: "Hidden", label: "Hidden" },
];
