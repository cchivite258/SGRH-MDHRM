import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { Img1, Img7, Img8, Img10, Img6 } from "@/assets/images/products/utils";
import { ProductReviewsType } from "@/components/eCommerce/ProductDetails/types";

export const productOverviewBreadcrumb: BreadcrumbType[] = [
  {
    title: "ecommerce",
    disabled: false,
  },
  {
    title: "products-Details",
    disabled: true,
  },
];

export const productImages = [
  { src: Img1, id: "Img1" },
  { src: Img7, id: "Img7" },
  { src: Img8, id: "Img8" },
  { src: Img10, id: "Img10" },
  { src: Img6, id: "Img6" },
];

export const productSize = [
  { size: "S", disabled: true, tooltip: "Out of Stock" },
  { size: "M", tooltip: "04 items available" },
  { size: "L", tooltip: "06 items available" },
  { size: "XL", disabled: true, tooltip: "Out of Stock" },
  { size: "2xl", tooltip: "08 items available" },
];

export const productColors = [
  { color: "primary", tooltip: "Out of Stock" },
  { color: "black", tooltip: "03 items available" },
  { color: "success", tooltip: "04 items available" },
  { color: "info", tooltip: "02 items available" },
  { color: "warning", tooltip: "01 items available" },
  { color: "danger", tooltip: "03 items available" },
  { color: "light", tooltip: "03 items available" },
  { color: "black", tooltip: "04 items available" },
];

export const productOverview = [
  {
    title: "PRICE",
    value: "$243.99",
  },
  {
    title: "No. of Orders",
    value: "3.7k",
  },
  {
    title: "Available Stocks",
    value: "764",
  },
  {
    title: "Total Revenue",
    value: "$59,239",
  },
];

export const productDetail = [
  { title: "Type", value: "Stripped shirts" },
  { title: "Sleeve", value: "Full Sleeve" },
  { title: "Country of Origin", value: "California" },
  { title: "Pack of", value: "1" },
  { title: "Style", value: "Modern" },
  { title: "Style Code", value: "TBS037" },
  { title: "Generic Name", value: "Formal Shirt" },
  { title: "Ideal For	", value: "Men" },
  { title: "Size", value: "All Available" },
  { title: "Suitable For", value: "Formal Wear,Party Wear" },
  { title: "Seller", value: "Zibra Fashion" },
  { title: "Fabric", value: "Cotton" },
];

export const productReviews: ProductReviewsType[] = [
  {
    id: 1,
    rating: "4.5",
    name: "Jansh Brown",
    date: "08 Mar, 2023",
    title: "Product Quality",
    desc: '"This is an incredible framework worth so much in the right hands! Nowhere else are you going to get so much flexibility and great code for a few dollars. Highly recommend purchasing today! Like right now! "',
    img: [
      {
        id: 1,
        src: Img1,
        formattedSize: "7.87 KB",
        path: "img-1.png",
        size: "6000",
      },
      {
        id: 2,
        src: Img6,
        formattedSize: "5.87 KB",
        path: "img-6.png",
        size: "3000",
      },
      {
        id: 3,
        src: Img7,
        formattedSize: "7.00 KB",
        path: "img-7.png",
        size: "6800",
      },
    ],
  },
  {
    id: 2,
    rating: "4.0",
    name: "Camilla Harber",
    date: "03 Mar, 2023",
    title: "Product Quality",
    desc: `We have used your other templates as well and seems it's amazing with the design and code quality. Wish you best for the future updates. Keep updated you will be #1 in near future. `,
  },
  {
    id: 3,
    rating: "5.0",
    name: "Kaylin Bechtelar",
    date: "28 Feb, 2023",
    title: "Design Quality",
    desc: `" This template is incredibly comprehensive considering how new and modern it is! I bought 8 different admin templates recently and all of them had some good features, but were always missing stuff that you only realise after purchase. I've migrated my site to this template and have yet to find anything missing or lacking! Plus, the online documentation is really easy to use and access and very comprehensive! Well done guys and thank you! "`,
  },
  {
    id: 4,
    rating: "3.5",
    name: "Dedrick Shields",
    date: "24 Feb, 2023",
    title: "Feature Availability",
    desc: `" Hello everyone, I would like to suggest here two contents that you could create. Course pages and blog pages. In them you could insert the listing and management of courses and listing and management of blog. The theme is perfect, one of the best purchases I've ever made. "`,
  },
];
