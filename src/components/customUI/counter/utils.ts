import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "custom-ui",
    disabled: false,
  },
  {
    title: "counter",
    disabled: true,
  },
];

export const symbolCounter = [
  {
    value: 674.3,
    prefix: "$",
    suffix: "k",
    title: "Total Earnings",
    decimals: 2,
  },
  {
    value: 365424,
    title: "Orders",
  },
  {
    value: 1030.35,
    suffix: "M",
    title: "Customers",
    decimals: 2,
  },
  {
    value: 165.89,
    prefix: "$",
    suffix: "k",
    title: "My Balance",
    decimals: 2,
  },
];

export const iconCounter = [
  {
    value: 8000,
    suffix: "k",
    title: "Happy Clients",
    color: "success",
    icon: "ph-smiley",
  },
  {
    value: 3000,
    suffix: "k",
    title: "Downloads",
    color: "secondary",
    icon: "ph-download-simple",
  },
  {
    value: 784,
    suffix: "k",
    title: "Project Completed",
    color: "danger",
    icon: "ph-desktop",
  },
  {
    value: 365,
    title: "Working Days",
    color: "primary",
    icon: "ph-clock",
  },
  {
    value: 59,
    title: "Awards",
    color: "warning",
    icon: "ph-trophy",
  },
];
