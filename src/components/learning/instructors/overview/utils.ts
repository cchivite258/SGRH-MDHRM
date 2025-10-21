import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";
import {
  flask,
  laravel,
  shopify,
  sketch,
} from "@/assets/images/learning/utils";
import { Firefox } from "@/assets/images/brands/utils";
import { CourseListingType } from "@/components/learning/instructors/overview/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "instructors",
    disabled: false,
  },
  {
    title: "overview",
    disabled: true,
  },
];

export const tabs = [
  {
    title: "Courses List",
    value: "course",
  },
  {
    title: "Students",
    value: "students",
  },
  {
    title: "Reviews",
    value: "reviews",
  },
];

export function getCharts(getChartColorsArray: Function) {
  const studentActivityChart = {
    series: [
      {
        name: "Active Students",
        data: [
          3, 6, 2, 4, 7, 9, 15, 10, 19, 22, 27, 21, 34, 23, 29, 32, 41, 34, 29,
          37, 64, 55, 49, 69, 78, 73, 69, 83,
        ],
      },
      {
        name: "New Enrollment",
        data: [
          10, 16, 25, 14, 29, 33, 47, 53, 41, 55, 63, 53, 66, 71, 79, 70, 73,
          84, 92, 83, 96, 93, 101, 109, 99, 87, 93, 107,
        ],
      },
    ],
    chartOptions: {
      chart: {
        height: 350,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
      },
      markers: {
        size: 0,
        hover: {
          sizeOffset: 4,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      colors: getChartColorsArray('["--tb-primary", "--tb-secondary"]'),
      xaxis: {
        type: "datetime",
        categories: [
          "02/01/2023 GMT",
          "02/02/2023 GMT",
          "02/03/2023 GMT",
          "02/04/2023 GMT",
          "02/05/2023 GMT",
          "02/06/2023 GMT",
          "02/07/2023 GMT",
          "02/08/2023 GMT",
          "02/09/2023 GMT",
          "02/10/2023 GMT",
          "02/11/2023 GMT",
          "02/12/2023 GMT",
          "02/13/2023 GMT",
          "02/14/2023 GMT",
          "02/15/2023 GMT",
          "02/16/2023 GMT",
          "02/17/2023 GMT",
          "02/18/2023 GMT",
          "02/19/2023 GMT",
          "02/20/2023 GMT",
          "02/21/2023 GMT",
          "02/22/2023 GMT",
          "02/23/2023 GMT",
          "02/24/2023 GMT",
          "02/25/2023 GMT",
          "02/26/2023 GMT",
          "02/27/2023 GMT",
          "02/28/2023 GMT",
        ],
      },
    },
  };

  return { studentActivityChart };
}

export const courseHeader: TableHeaderType[] = [
  { title: "Course title" },
  { title: "Price", align: "center" },
  { title: "Duration", align: "center" },
  { title: "Students", align: "center" },
  { title: "Ratings", align: "center" },
  { title: "Status", align: "center" },
  { title: "Action", align: "end" },
];

export const courseListing: CourseListingType[] = [
  {
    id: 1,
    category: "Shopify Development",
    course: "The Complete Shopify Dropship course",
    logoImg: shopify,
    price: "$451.32",
    color: "success",
    duration: "6 Months",
    students: "745",
    rating: "4.8",
    statusType: "live",
  },
  {
    id: 2,
    category: "Graphic Design",
    course: "UI/UX Style guide With Sketch",
    color: "warning",
    logoImg: sketch,
    price: "$239.99",
    duration: "9 Months",
    students: "654",
    rating: "4.3",
    statusType: "live",
  },
  {
    id: 3,
    category: "Laravel Development",
    color: "danger",
    course: "Master Laravel for Beginners & Intermediate",
    logoImg: laravel,
    price: "$159.27",
    duration: "1 Years",
    students: "321",
    rating: "4.9",
    statusType: "pending",
  },
  {
    id: 4,
    category: "Flask Development",
    color: "dark",
    course: "REST APIs With Flask",
    logoImg: flask,
    price: "$198.16",
    duration: "2 Years",
    students: "349",
    rating: "4.5",
    statusType: "cancel",
  },
  {
    id: 5,
    category: "Marketing & Management",
    course: "Conflict Management with Emotional Intelligence",
    color: "danger",
    logoImg: Firefox,
    price: "$324.48",
    duration: "8 Months",
    students: "745",
    rating: "4.6",
    statusType: "live",
  },
];
