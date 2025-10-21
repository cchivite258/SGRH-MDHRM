import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
export const breadcrumb: BreadcrumbType[] = [
  {
    title: "real-estate",
    disabled: false,
  },
  {
    title: "listing-map",
    disabled: true,
  },
];

export const filters = {
  query: "",
  type: "Villa",
  bedroom: "2",
  price: "all",
  date: "",
};

export const prices = [
  { value: "all", label: "Select All" },
  { value: [0, 1000], label: "0 - $1000" },
  { value: [1000, 2000], label: "$1000 - $2000" },
  { value: [2000, 3000], label: "$2000 - $3000" },
  { value: [3000, 4000], label: "$3000 - $4000" },
  { value: [4000, 5000], label: "$4000 - $5000" },
];
