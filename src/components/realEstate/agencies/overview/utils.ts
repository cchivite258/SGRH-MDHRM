import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "agencies",
    disabled: false,
  },
  {
    title: "overview",
    disabled: true,
  },
];

export const basicDetail = [
  {
    title: "Agency",
    value: "Themesbrand",
    isLink: true,
  },
  {
    title: "Email",
    value: "jacinthe@steex.com",
  },
  {
    title: "Contact Number",
    value: "+(27) 3041-1766",
  },
  {
    title: "Website",
    value: "https://Themesbrand.com/",
  },
];

export const socialMedias = [
  { icon: "bx bxl-meta", color: "primary" },
  { icon: "bx bxl-whatsapp", color: "success" },
  { icon: "bx bxl-twitter", color: "info" },
  { icon: "bx bxl-instagram", color: "danger" },
];
