import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { CoursesType } from "@/components/learning/students/courses/types";
import { core, laravel, react, shopify } from "@/assets/images/learning/utils";
import {
  Avatar10,
  Avatar2,
  Avatar3,
  Avatar6,
} from "@/assets/images/users/utils";

export const courseBreadcrumb: BreadcrumbType[] = [
  {
    title: "students",
    disabled: false,
  },
  {
    title: "my-courses",
    disabled: true,
  },
];

export const courseList: CoursesType[] = [
  {
    src: react,
    title: "Advanced React and Redux",
    badge: "beginner",
    price: "$425.36",
    time: "6 Months",
    students: "256",
    lessons: "15 Lessons",
    languages: "English, France",
    rating: "4.5",
    user: "Ayaan Bowen",
    userLogo: Avatar2,
    progress: 74,
    color: "bg-info-subtle",
    course: "React Development",
    progressColor: "primary",
  },
  {
    src: laravel,
    title: "Master Laravel for Beginners & Intermediate",
    badge: "advance",
    price: "$264.71",
    time: "1 Year",
    students: "84",
    lessons: "57 Lessons",
    languages: "English",
    rating: "4.8",
    user: "Ophelia Steuber",
    userLogo: Avatar6,
    progress: 53,
    color: "bg-danger-subtle",
    course: "Laravel Development",
    progressColor: "warning",
  },
  {
    src: core,
    title: "Asp.Net Core 7 True Ultimate Guide",
    badge: "intermediate",
    price: "$249.99",
    time: "8 Years",
    students: "321",
    lessons: "95 Lessons",
    languages: "English, France",
    rating: "4.7",
    user: "Deondre Huel",
    userLogo: Avatar10,
    progress: 87,
    color: "bg-primary-subtle",
    course: "Asp.Net Development",
    progressColor: "success",
  },
  {
    src: shopify,
    title: "The Complete Shopify Dropship Course",
    badge: "beginner",
    price: "$134.69",
    time: "9 Months",
    students: "134",
    lessons: "36 Lessons",
    languages: "English, France",
    rating: "4.9",
    user: "Nelson Schaden",
    userLogo: Avatar3,
    progress: 30,
    color: "bg-success-subtle",
    course: "Shopify Development",
    progressColor: "secondary",
  },
];

export const schedule = [
  {
    date: 16,
    month: "Feb",
    title: "React Development",
    currentCount: 9,
    total: 15,
    time: "08:54 AM",
  },
  {
    date: 28,
    month: "Jan",
    title: "Shopify Development",
    currentCount: 18,
    total: 43,
    time: "10:49 PM",
  },
  {
    date: 19,
    month: "Jan",
    title: "Laravel Development",
    currentCount: 3,
    total: 68,
    time: "03:24 PM",
  },
];
