import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import {
  overview01,
  overview02,
  overview03,
} from "@/assets/images/real-estate/utils";
import { OptionType } from "@/app/common/types/option.type";
import {
  Avatar1,
  Avatar7,
  Avatar4,
  Avatar5,
} from "@/assets/images/users/utils";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "real-estate",
    disabled: false,
  },
  {
    title: "property-overview",
    disabled: true,
  },
];

export const galleryOptions: OptionType[] = [
  {
    title: "Edit",
    icon: "ph-pencil ",
    value: "edit",
  },
  {
    title: "Delete",
    icon: "ph-trash",
    value: "delete",
  },
];

export const galleryImages = [
  {
    src: overview02,
    label: "For Sale",
    color: "danger",
  },
  {
    src: overview01,
    label: "Front View",
    color: "primary",
  },
  {
    src: overview03,
    label: "Front View",
    color: "primary",
  },
];

export const propertyOverview = [
  {
    title: "$7000 - $8000",
    color: "secondary",
    icon: "ph-tag",
  },
  {
    title: "4 Bedroom",
    color: "warning",
    icon: "ph-house",
  },
  {
    title: "3 Bathroom",
    color: "danger",
    icon: "ph-bathtub",
  },
  {
    title: "Parking Available",
    color: "info",
    icon: "bx bxs-parking",
  },
  {
    title: "1324 SQFT",
    color: "success",
    icon: "ph-square-half",
  },
  {
    title: "United Kingdom",
    color: "secondary",
    icon: "bx bx-map-alt",
  },
  {
    title: "Residency",
    color: "primary",
    icon: "bx bx-buildings",
  },
];

export const propertyFeatures = [
  "Swimming pool",
  "Air conditioning",
  "Electricity",
  "Balcony",
  "Near Green Zone",
  "Near School",
  "Cable TV",
  "Near Shop",
  "Internet",
  "Near Shop",
];

export const ownerHistory = [
  {
    img: Avatar1,
    title: "Jerry Emard",
    date: "03 Nav, 2022 - Present",
    rating: 4.9,
  },
  {
    img: Avatar7,
    title: "Sonia Conn",
    date: "24 March,2022-03 Nav, 2022",
    rating: 4.8,
  },
  {
    img: Avatar4,
    title: "Talon Bradtke",
    date: "27 Aug, 2021-24 March, 2022",
    rating: 4.4,
  },
  {
    img: Avatar5,
    title: "Tyrell Kerluke",
    date: "09 June, 2019-27 Aug, 2021",
    rating: 4.6,
  },
];

export const socialMedias = [
  { icon: "bx bxl-meta", color: "primary" },
  { icon: "bx bxl-whatsapp", color: "success" },
  { icon: "bx bxl-twitter", color: "info" },
  { icon: "bx bxl-instagram", color: "danger" },
];
