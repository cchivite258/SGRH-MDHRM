import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { CategoryType } from "@/components/learning/courses/category/types";
import {
  core,
  flask,
  laravel,
  mysql,
  react,
  shopify,
  sketch,
  symfony,
  tailwindcss,
  webpack,
} from "@/assets/images/learning/utils";
import {
  Chrome,
  Firefox,
  Microsoft,
  dribbble,
  CloudComputing,
} from "@/assets/images/brands/utils";
export const categoryBreadcrumb: BreadcrumbType[] = [
  {
    title: "courses",
    disabled: false,
  },
  {
    title: "category",
    disabled: true,
  },
];

export const coursesCategory: CategoryType[] = [
  {
    id: 1,
    img: react,
    title: "React Development",
    courses: 250,
    backgroundColor: "info-subtle",
  },
  {
    id: 2,
    img: flask,
    title: "Flask Development",
    courses: 120,
    backgroundColor: "dark-subtle",
  },
  {
    id: 3,
    img: shopify,
    title: "Shopify Development",
    courses: 65,
    backgroundColor: "success-subtle",
  },
  {
    id: 4,
    img: Firefox,
    title: "Marketing & Management",
    courses: 50,
    backgroundColor: "danger-subtle",
  },
  {
    id: 5,
    img: tailwindcss,
    title: "Web Design",
    courses: 345,
    backgroundColor: "info-subtle",
  },
  {
    id: 6,
    img: core,
    title: "ASP.NET Development",
    courses: 69,
    backgroundColor: "primary-subtle",
  },
  {
    id: 7,
    img: laravel,
    title: "Laravel Development",
    courses: 250,
    backgroundColor: "danger-subtle",
  },
  {
    id: 8,
    img: mysql,
    title: "PHP Development",
    courses: 25,
    backgroundColor: "primary-subtle",
  },
  {
    id: 9,
    img: sketch,
    title: "Graphic Design",
    courses: 25,
    backgroundColor: "warning-subtle",
  },
  {
    id: 10,
    img: symfony,
    title: "Business & Consulting",
    courses: 90,
    backgroundColor: "dark-subtle",
  },
  {
    id: 11,
    img: webpack,
    title: "Digital Marketing",
    courses: 75,
    backgroundColor: "info-subtle",
  },
  {
    id: 12,
    img: Microsoft,
    title: "Data Science",
    courses: 69,
    backgroundColor: "success-subtle",
  },
  {
    id: 13,
    img: dribbble,
    title: "Writing & Reading",
    courses: 25,
    backgroundColor: "danger-subtle",
  },
  {
    id: 14,
    img: CloudComputing,
    title: "Self Development",
    courses: 10,
    backgroundColor: "info-subtle",
  },
  {
    id: 15,
    img: Chrome,
    title: "Computer Science",
    courses: 10,
    backgroundColor: "warning-subtle",
  },
];
