import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import {
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  Avatar6,
  Avatar7,
  Avatar8,
  Avatar9,
  Avatar10,
} from "@/assets/images/users/utils";
import { InstructorDataType } from "@/components/learning/instructors/types";
import { TableHeaderType } from "@/app/common/types/table.types";
import { MenuSelectItemType } from "@/app/common/components/filters/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "instructors",
    disabled: false,
  },
  {
    title: "list-view",
    disabled: true,
  },
];

export function getCharts(getChartColorsArray: Function) {
  const totalInstructorsChart = {
    series: [84],
    chartOptions: {
      chart: {
        height: 170,
        type: "radialBar",
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: "75%",
          },
          track: {
            margin: 0,
          },
          dataLabels: {
            show: false,
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
      labels: ["Instructor Total"],
      colors: getChartColorsArray('["--tb-primary"]'),
    },
  };
  const totalCoursesChart = {
    series: [33],
    chartOptions: {
      chart: {
        height: 170,
        type: "radialBar",
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: "75%",
          },
          track: {
            margin: 0,
          },
          dataLabels: {
            show: false,
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
      labels: ["Instructor Total"],
      colors: getChartColorsArray('["--tb-secondary"]'),
    },
  };
  const instructorActivityChart = {
    series: [
      {
        name: "New Orders",
        data: [
          32, 18, 13, 17, 26, 34, 47, 51, 59, 63, 44, 38, 53, 69, 72, 83, 90, 110,
          130, 117, 103, 92, 95, 119, 80, 96, 116, 125,
        ],
      },
      {
        name: "Return Orders",
        data: [
          3, 6, 2, 4, 7, 9, 15, 10, 19, 22, 27, 21, 34, 23, 29, 32, 41, 34, 29,
          37, 70, 55, 49, 36, 30, 52, 38, 33,
        ],
      },
    ],
    chartOptions: {
      chart: {
        height: 190,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: false,
        position: "top",
        horizontalAlign: "right",
      },
      grid: {
        yaxis: {
          lines: {
            show: false,
          },
        },
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
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-light", "--tb-secondary"]'
      ),
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
      yaxis: {
        show: false,
      },
    },
  };

  return {
    totalInstructorsChart,
    totalCoursesChart,
    instructorActivityChart
  };
}

export const instructorsList: InstructorDataType[] = [
  {
    id: 1,
    img: Avatar10,
    img_alt: "avatar-10.jpg",
    name: "Domenic Dach",
    total_course: "356",
    email: "domenic@steex.com",
    experience: "9 Months",
    students: "320",
    contact: "+(532) 01523 14587",
    rating: "4.9",
    status: "active",
  },
  {
    id: 2,
    img: Avatar9,
    img_alt: "avatar-9.jpg",
    name: "Prezy Mark",
    total_course: "315",
    email: "prezy@steex.com",
    experience: "1 Years",
    students: "159",
    contact: "+(159) 65432 15987",
    rating: "4.8",
    status: "unActive",
  },
  {
    id: 3,
    img: Avatar8,
    img_alt: "avatar-8.jpg",
    name: "Nelson Schaden",
    total_course: "852",
    email: "nelson@steex.com",
    experience: "8 Months",
    students: "362",
    contact: "+(251) 12365 47896",
    rating: "4.2",
    status: "active",
  },
  {
    id: 4,
    img: Avatar7,
    img_alt: "avatar-7.jpg",
    name: "Deondre Huel",
    total_course: "485",
    email: "deondre@steex.com",
    experience: "3 Years",
    students: "321",
    contact: "+(025) 1592 15236",
    rating: "4.6",
    status: "active",
  },
  {
    id: 5,
    img: Avatar6,
    img_alt: "avatar-6.jpg",
    name: "Sarai Schmidt",
    total_course: "320",
    email: "sarai@steex.com",
    experience: "5 Years",
    students: "364",
    contact: "+(123) 01592 36544",
    rating: "4.7",
    status: "active",
  },
  {
    id: 6,
    img: Avatar5,
    img_alt: "avatar-5.jpg",
    name: "Ophelia Steuber",
    total_course: "485",
    email: "ophelia@steex.com",
    experience: "6 Years",
    students: "84",
    contact: "+(321) 01234 56987",
    rating: "4.4",
    status: "unActive",
  },
  {
    id: 7,
    img: Avatar4,
    img_alt: "avatar-4.jpg",
    name: "Nelson Schaden",
    total_course: "258",
    email: "nelson@steex.com",
    experience: "2 Years",
    students: "146",
    contact: "+(159) 98745 63210",
    rating: "4.8",
    status: "active",
  },
  {
    id: 8,
    img: Avatar3,
    img_alt: "avatar-3.jpg",
    name: "Zachary Stokes",
    total_course: "365",
    email: "zachary@steex.com",
    experience: "7 Months",
    students: "120",
    contact: "+(120) 12435 69870",
    rating: "4.9",
    status: "active",
  },
  {
    id: 9,
    img: Avatar2,
    img_alt: "avatar-2.jpg",
    name: "Ayaan Bowen",
    total_course: "162",
    email: "ayaan@steex.com",
    experience: "1 Years",
    students: "79",
    contact: "+(152) 15963 24785",
    rating: "4.7",
    status: "unActive",
  },
  {
    id: 10,
    img: Avatar1,
    img_alt: "avatar-1.jpg",
    name: "Themesbrand",
    total_course: "159",
    email: "themesbrand@steex.com",
    experience: "2 Years",
    students: "49",
    contact: "+(123) 15962 32145",
    rating: "4.9",
    status: "active",
  },
  {
    id: 11,
    img: Avatar6,
    img_alt: "avatar-6.jpg",
    name: "Sarai Schmidt",
    total_course: "320",
    email: "sarai@steex.com",
    experience: "5 Years",
    students: "364",
    contact: "+(123) 01592 36544",
    rating: "4.7",
    status: "active",
  },
];

export const listViewHeader: TableHeaderType[] = [
  { title: "", isCheck: true },
  { title: "ID" },
  { title: "Instructor" },
  { title: "Total Courses" },
  { title: "Email" },
  { title: "Experience" },
  { title: "Students" },
  { title: "Contact" },
  { title: "Rating" },
  { title: "Status" },
  { title: "Action" },
];

export const statusOptions: MenuSelectItemType[] = [
  { value: "", label: "Select Status" },
  { value: "active", label: "Active" },
  { value: "unActive", label: "UnActive" },
];
