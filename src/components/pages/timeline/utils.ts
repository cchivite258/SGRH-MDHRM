import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { Avatar2 } from "@/assets/images/users/utils";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "pages",
    disabled: false,
  },
  {
    title: "timeline",
    disabled: true,
  },
];

export const verticalTimeline2 = [
  {
    title: "Purchased by James Price",
    subTitle: "Product noise evolve smartwatch",
    time: "05:57 AM Today",
    icon: "ph-shopping-cart",
    color: "success",
  },
  {
    title: "Natasha Carey have liked the products",
    subTitle: "Allow users to like products in your WooCommerce store.",
    time: "25 Dec, 2022",
    src: Avatar2,
  },
  {
    title: "Today offers by Digitech Galaxy",
    subTitle:
      "Offer is valid on orders of $230 Or above for selected products only.",
    time: "12 Dec, 2022",
    icon: "ph-percent",
    color: "secondary",
  },
  {
    title: "Favoried Product",
    subTitle: "Esther James have favorited product.",
    time: "25 Nov, 2022",
    icon: "ph-bookmark-simple",
    color: "warning",
  },
  {
    title: `Flash sale starting <span class="text-primary">Tomorrow</span>.`,
    subTitle: `Flash sale by <span class='text-black'>Zoetic Fashion</span>`,
    time: "22 Oct, 2022",
    icon: "ph-percent",
  },
  {
    title: "Monthly sales report",
    subTitle: `<span class="text-danger">2 days left</span> notification to submit the monthly sales report. <span class="text-warning text-decoration-underline">Reports Builder</span>`,
    time: "15 Oct, 2022",
    icon: "ph-chart-line",
    color: "info",
  },
];
