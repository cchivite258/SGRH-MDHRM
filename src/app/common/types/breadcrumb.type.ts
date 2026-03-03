import type { RouteLocationRaw } from "vue-router";

export type BreadcrumbType = {
  title: string;
  disabled: boolean;
  to?: RouteLocationRaw;
};
