import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { TableHeaderType } from "@/app/common/types/table.types";
import	 { OptionType } from "@/app/common/types/option.type";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "pages",
    disabled: false,
  },
  {
    title: "profile-setting",
    disabled: true,
  },
];

export const portfolio = [
  {
    color: "secondary",
    icon: "bx bxl-github",
    value: "@richardmarshall",
  },
  {
    color: "primary",
    icon: "bx bxl-facebook-circle",
    value: "www.steex.com",
  },
  {
    color: "success",
    icon: "bx bxl-dribbble",
    value: "@richard_marshall",
  },
  {
    color: "danger",
    icon: "bx bxl-instagram",
    value: "Richard Marshall",
  },
];

export const tabs = [
  { title: "personal-details", value: "personal" },
  { title: "change-password", value: "password" },
  //{ title: "education", value: "education" },
  { title: "security-privacy", value: "security" },
];

export const skillsOptions: MenuSelectItemType[] = [
  { value: "illustrator", label: "Illustrator" },
  { value: "photoshop", label: "Photoshop" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "javascript", label: "Javascript" },
  { value: "python", label: "Python" },
  { value: "php", label: "PHP" },
];

export const productsHeader: TableHeaderType[] = [
  { title: "device" },
  { title: "ip-address" },
  { title: "date" },
  { title: "address" },
  { title: "action" },
];

export const loginHistory = [
  {
    product: "iPhone 12 Pro",
    ip_address: "192.44.234.160",
    date: "18 Dec, 2023",
    location: "Los Angeles, United States",
  },
  {
    product: "Apple iPad Pro",
    ip_address: "192.44.234.162",
    date: "03 Jan, 2023",
    location: "Phoenix, United States",
  }
];

export const security = [
  {
    title: "two-factor-authentication",
    description:
      "two-factor-description",
    btnText: "enable-two-factor-authentication",
  },
  {
    title: "secondary-verification",
    description:
      "secondary-verification-description",
    btnText: "set-up-secondary-method",
  },
];

export const notifications = [
  {
    title: "Direct messages",
    value: "Messages from people you follow",
    isActive: true,
  },
  {
    title: "Show desktop notifications",
    value: `Choose the option you want as your default setting. Block a site: Next to "Not allowed to send notifications," click Add.`,
    isActive: true,
  },
  {
    title: "Show email notifications",
    value:
      "Under Settings, choose Notifications. Under Select an account, choose the account to enable notifications for.",
    isActive: true,
  },
  {
    title: "Show chat notifications",
    value:
      "To prevent duplicate mobile notifications from the Gmail and Chat apps, in settings, turn off Chat notifications.",
    isActive: false,
  },
  {
    title: "Show purchase notifications",
    value:
      "Get real-time purchase alerts to protect yourself from fraudulent charges.",
    isActive: false,
  },
];


export const menuOptions: OptionType[] = [
  {
    title: "Facebook",
    icon: "bx bxl-facebook-circle ",
    value: "facebook",
  },
  {
    title: "Whatsapp",
    icon: "bx bxl-whatsapp",
    value: "whatsapp",
  },
  {
    title: "Instagram",
    icon: "bx bxl-instagram ",
    value: "instagram",
  },
];

export const information = [
  {
    title: "designation",
    value: "Web Developer",
  },
  {
    title: "repartition",
    value: "617 219 6245",
  },
  {
    title: "joining-date",
    value: "24 June, 1998",
  },
];

export const socialMedias = [
  {
    color: "secondary",
    icon: "bx bxl-github",
  },
  {
    color: "primary",
    icon: "bx bxl-facebook-circle",
  },
  {
    color: "success",
    icon: "bx bxl-dribbble",
  },
  {
    color: "danger",
    icon: "bx bxl-instagram",
  },
];

export const documents = [
  {
    icon: "ph-file-zip",
    title: "Artboard.zip",
    size: "2.02MB",
  },
  {
    icon: "ph-article",
    title: "steex.txt",
    size: "1.49MB",
  },
  {
    icon: "ph-file-image",
    title: "Progile bg.png",
    size: "325kb",
  },
  {
    icon: "ph-file-pdf",
    title: "Steex Docs.pdf",
    size: "2.06MB",
  },
];