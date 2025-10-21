import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import {JustifyType} from '@/app/common/types/form.type'

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "vuetify-ui",
    disabled: false,
  },
  {
    title: "grid",
    disabled: true,
  },
];

export const justify: JustifyType[] = [
  "center",
  "end",
  "start",
  "space-around",
  "space-between",
  "space-evenly",
  "stretch",
  undefined,
];

export const align = ["start", "end", "center", "baseline", "stretch"];
