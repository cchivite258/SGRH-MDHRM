import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { MenuSelectItemType } from "@/app/common/components/filters/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "instructors",
    disabled: false,
  },
  {
    title: "create-instructors",
    disabled: true,
  },
];

export const skillOptions: MenuSelectItemType[] = [
  { value: "Marketing", label: "Marketing" },
  { value: "Management", label: "Management" },
  { value: "Shopify Development", label: "Shopify Development" },
  { value: "Content SEO", label: "Content SEO" },
];

export const languageOptions: MenuSelectItemType[] = [
  { value: "English", label: "English" },
  { value: "France", label: "France" },
];
