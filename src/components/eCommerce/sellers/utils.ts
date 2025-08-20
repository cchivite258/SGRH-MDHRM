import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import {
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6,
  Img7,
} from "@/assets/images/companies/utils";

const getCartOptions = (color: string) => {
  return {
    colors: [color],
    chart: {
      type: "line",
      height: 10,
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function () {
            return "";
          },
        },
      },
      marker: {
        show: false,
      },
    },
  };
};

export const sellersBreadcrumb: BreadcrumbType[] = [
  {
    title: "ecommerce",
    disabled: false,
  },
  {
    title: "sellers",
    disabled: true,
  },
];

export const sellers = [
  {
    id: 1,
    img: Img4,
    img_alt: "img-7.png",
    name: "Pich Hub",
    seller: "Lenna Labadie",
    email: "lennalabadie@dayrep.com",
    phone: "+(253) 12345 67890",
    stock: "451",
    revenue: "$253.32",
    series: [
      {
        data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14],
      },
    ],
    chartOptions: getCartOptions("#ff6c6c"),
  },
  {
    id: 2,
    img: Img5,
    img_alt: "img-5.png",
    name: "Jorce Medicines",
    seller: "Dallin Schowalter",
    email: "dallinschowalter@rhyta.com",
    phone: "+(152) 32165 49873",
    stock: "1163",
    revenue: "$992.14",
    series: [
      {
        data: [12, 14, 2, 47, 42, 15, 35, 75, 20, 67, 89],
      },
    ],
    chartOptions: getCartOptions("#2dcb73"),
  },
  {
    id: 3,
    img: Img2,
    img_alt: "img-2.png",
    name: "Rotic Fashion",
    seller: "Alvina Smitham",
    email: "alvinasmitham@dayrep.com",
    phone: "+(231) 14562 32165",
    stock: "1023",
    revenue: "$954.08",
    series: [
      {
        data: [45, 20, 8, 42, 30, 5, 35, 79, 22, 54, 64],
      },
    ],
    chartOptions: getCartOptions("#2dcb73"),
  },
  {
    id: 4,
    img: Img6,
    img_alt: "img-6.png",
    name: "Terry & Jerry",
    seller: "Dallin Schowalter",
    email: "dallinschowalter@jourrapide.com",
    phone: "+(44) 98765 32104",
    stock: "357",
    revenue: "$346.35",
    series: [
      {
        data: [26, 15, 48, 12, 47, 19, 35, 19, 85, 68, 50],
      },
    ],
    chartOptions: getCartOptions("#2dcb73"),
  },
  {
    id: 5,
    img: Img3,
    img_alt: "img-3.png",
    name: "Themesbrand",
    seller: "Kenyon Nienow",
    email: "kenyonnienow@dayrep.com",
    phone: "+(251) 25874 13690",
    stock: "841",
    revenue: "$654.78",
    series: [
      {
        data: [60, 67, 12, 49, 6, 78, 63, 51, 33, 8, 16],
      },
    ],
    chartOptions: getCartOptions("#ff6c6c"),
  },
  {
    id: 6,
    img: Img2,
    img_alt: "img-2.png",
    name: "Brand Infosys",
    seller: "Alexandrea Jacobi",
    email: "alexandreajacobi@jourrapide.com",
    phone: "+(92) 67890 12345",
    stock: "395",
    revenue: "$153.84",
    series: [
      {
        data: [78, 63, 51, 33, 8, 16, 60, 67, 12, 49],
      },
    ],

    chartOptions: getCartOptions("#2dcb73"),
  },
  {
    id: 7,
    img: Img7,
    img_alt: "img-7.png",
    name: "Pich Fashion",
    seller: "Jaylon McClure",
    email: "jaylonmcclure@armyspy.com",
    phone: "+(62) 35791 15935",
    stock: "792",
    revenue: "$357.44",
    series: [
      {
        data: [15, 35, 75, 20, 67, 8, 42, 30, 5, 35],
      },
    ],
    chartOptions: getCartOptions("#2dcb73"),
  },
  {
    id: 8,
    img: Img1,
    img_alt: "img-1.png",
    name: "Zibra Fashion",
    seller: "Lenna Labadie",
    email: "lennalabadie@dayrep.com",
    phone: "+(120) 15935 32165",
    stock: "451",
    revenue: "$253.32",
    series: [
      {
        data: [45, 32, 68, 55, 36, 10, 48, 25, 74, 54],
      },
    ],
    chartOptions: getCartOptions("#ff6c6c"),
  },
];

export const categoriesOptions: string[] = [
  "Select Categories",
  "All",
  "Retailer",
  "Health & Medicine",
  "Manufacturer",
  "Food Service",
  "Computers & Electronics",
];
