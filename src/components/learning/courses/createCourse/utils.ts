import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { MenuSelectItemType } from "@/app/common/components/filters/types";

export const createCourseBreadcrumb: BreadcrumbType[] = [
  {
    title: "courses",
    disabled: false,
  },
  {
    title: "create-course",
    disabled: true,
  },
];

export const levelOptions: MenuSelectItemType[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Advanced", label: "Advanced" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Expert", label: "Expert" },
];

export const languageOptions: MenuSelectItemType[] = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "France", label: "France" },
  { value: "Expert", label: "Expert" },
];
