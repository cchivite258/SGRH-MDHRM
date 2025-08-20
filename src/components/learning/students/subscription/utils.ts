import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";
import { SubscriptionType } from "@/components/learning/students/subscription/types";
import {
  flask,
  laravel,
  shopify,
  sketch,
} from "@/assets/images/learning/utils";
import { Firefox } from "@/assets/images/brands/utils";

export const subscriptionBreadcrumb: BreadcrumbType[] = [
  {
    title: "students",
    disabled: false,
  },
  {
    title: "my-subscriptions",
    disabled: true,
  },
];

export const subscriptionHeader: TableHeaderType[] = [
  { title: "Plan" },
  { title: "Price" },
  { title: "Duration" },
  { title: "Status" },
  { title: "Payment Due" },
  { title: "Action" },
];

export const studentsSubscriptionList: SubscriptionType[] = [
  {
    id: 1,
    category: "Shopify Development",
    course: "The Complete Shopify Dropship course",
    logoImg: shopify,
    price: "$451.32",
    backgroundColor: "bg-success-subtle",
    duration: "6 Months",
    status: "active",
    paymentDue: "2 Days ago",
    action: "Renew Now",
    students: "745",
    rating: "4.8",
    statusType: "Live",
    textColor: "text-danger",
  },
  {
    id: 2,
    category: "Graphic Design",
    course: "UI/UX Style guide With Sketch",
    backgroundColor: "bg-warning-subtle",
    logoImg: sketch,
    price: "$239.99",
    duration: "9 Months",
    status: "active",
    paymentDue: "23 March, 2023",
    action: "Pay Now",
    students: "654",
    rating: "4.3",
    statusType: "Live",
    textColor: "text-muted",
  },
  {
    id: 3,
    category: "Laravel Development",
    backgroundColor: "bg-danger-subtle",
    course: "Master Laravel for Beginners & Intermediate",
    logoImg: laravel,
    price: "$159.27",
    duration: "1 Years",
    status: "unActive",
    paymentDue: "15 June, 2022",
    action: "Pay Now",
    students: "321",
    rating: "4.9",
    statusType: "Pending",
    textColor: "text-muted",
  },
  {
    id: 4,
    category: "Flask Development",
    backgroundColor: "bg-dark-subtle",
    course: "REST APIs With Flask",
    logoImg: flask,
    price: "$198.16",
    duration: "2 Years",
    status: "active",
    paymentDue: "19 Feb, 2023",
    action: "Pay Now",
    students: "349",
    rating: "4.5",
    statusType: "Cancel",
    textColor: "text-muted",
  },
  {
    id: 5,
    category: "Marketing & Management",
    course: "Conflict Management with Emotional Intelligence",
    backgroundColor: "bg-danger-subtle",
    logoImg: Firefox,
    price: "$324.48",
    duration: "8 Months",
    status: "unActive",
    paymentDue: "24 Jan, 2023",
    action: "Pay Now",
    students: "745",
    rating: "4.6",
    statusType: "Live",
    textColor: "text-muted",
  },
];
