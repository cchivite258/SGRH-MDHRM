import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import {
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6,
} from "@/assets/images/companies/utils";
import { TableHeaderType } from "@/app/common/types/table.types";
import { OrdersType } from "@/components/eCommerce/orders/types";
import { MenuSelectItemType } from "@/app/common/components/filters/types";

export const orderBreadcrumb: BreadcrumbType[] = [
  {
    title: "ecommerce",
    disabled: false,
  },
  {
    title: "orders",
    disabled: true,
  },
];

export function getCharts(getChartColorsArray: Function) {
  const ecommerceOrdersChart = {
    series: [
      {
        name: "New Orders",
        data: [
          32, 18, 13, 17, 26, 34, 47, 51, 59, 63, 44, 38, 53, 69, 72, 83, 90,
          110, 130, 117, 103, 92, 95, 119, 80, 96, 116, 125,
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
      yaxis: {
        show: false,
      },
    },
  };

  return {
    ecommerceOrdersChart,
  };
}

export const dashboardData = [
  {
    amount: 21438,
    title: "Total Orders",
    percent: "3.8%",
    isSuccess: true,
    color: "secondary",
    progress: 100,
  },
  {
    amount: 5963,
    title: "New Orders",
    percent: "20.8%",
    isSuccess: true,
    color: "primary",
    progress: 100,
  },
  {
    amount: 4620,
    title: "Pending Orders",
    percent: "12.6%",
    isSuccess: true,
    color: "warning",
    progress: 100,
  },
  {
    amount: 8541,
    title: "Delivered Orders",
    percent: "18.7%",
    isSuccess: true,
    color: "success",
    progress: 100,
  },
  {
    amount: 2314,
    title: "Cancelled Orders",
    percent: "7.1%",
    isSuccess: false,
    color: "danger",
    progress: 100,
  },
];

export const orders: OrdersType[] = [
  {
    id: "1",
    order_date: "02/22/2023",
    delivery_date: "03/02/2023",
    product: "Cotton collar tshirts for men",
    customer: "Deondre Fahey",
    img: Img6,
    name: "Ratke Group",
    pay_method: "COD",
    price: "$109.00",
    ratings: "-",
    delivery_status: "new",
  },
  {
    id: "2",
    order_date: "02/14/2023",
    delivery_date: "02/27/2023",
    product: "Like style travel black handbag",
    customer: "Warren Anderson",
    img: Img1,
    name: "Zibra Fashion",
    pay_method: "Mastercard",
    price: "$149.00",
    ratings: "4.5",
    delivery_status: "pending",
  },
  {
    id: "3",
    order_date: "01/30/2023",
    delivery_date: "02/10/2023",
    product: "Fossil gen 5E smart watch",
    customer: "Dianna Bogan",
    img: Img2,
    name: "Brand Infosys",
    pay_method: "Visa",
    price: "$215.00",
    ratings: "4.9",
    delivery_status: "ood",
  },
  {
    id: "4",
    order_date: "01/25/2023",
    delivery_date: "02/03/2023",
    product: "Super bass blutooth wireless headphone",
    customer: "Josefa Weissnat",
    img: Img3,
    name: "Brand Infosys",
    pay_method: "Mastercard",
    price: "$199.00",
    ratings: "4.3",
    delivery_status: "shipping",
  },
  {
    id: "5",
    order_date: "01/19/2023",
    delivery_date: "01/27/2023",
    product: "Willage volleyball ball size 4",
    customer: "Ophelia Steuber",
    img: Img4,
    name: "Themesbrand",
    pay_method: "COD",
    price: "$330.00",
    ratings: "4.7",
    delivery_status: "delivered",
  },
  {
    id: "6",
    order_date: "01/16/2023",
    delivery_date: "01/19/2023",
    product: "Branded T-Shirts",
    customer: "Federico Hand",
    img: Img5,
    name: "Zibra Fashion",
    pay_method: "Visa",
    price: "$745.11",
    ratings: "4.6",
    delivery_status: "pending",
  },
  {
    id: "7",
    order_date: "01/01/2023",
    delivery_date: "01/11/2023",
    product: "Flip-Flops and house slippers",
    customer: "Uriel King",
    img: Img1,
    name: "Zibra Fashion",
    pay_method: "Mastercard",
    price: "$99.99",
    ratings: "4.9",
    delivery_status: "new",
  },
  {
    id: "8",
    order_date: "12/27/2022",
    delivery_date: "01/02/2023",
    product: "Flip-Flops and house slippers",
    customer: "Buck Roberts",
    img: Img6,
    name: "Ratke Group",
    pay_method: "Mastercard",
    price: "$150.00",
    ratings: "4.6",
    delivery_status: "pending",
  },
  {
    id: "9",
    order_date: "12/22/2022",
    delivery_date: "12/28/2022",
    product: "Jeans blue men boxer",
    customer: "Axel Kozey",
    img: Img4,
    name: "Themesbrand",
    pay_method: "Visa",
    price: "$136.14",
    ratings: "4.6",
    delivery_status: "pending",
  },
  {
    id: "10",
    order_date: "12/21/2022",
    delivery_date: "12/29/2022",
    product: "MAG back to the future shoes",
    customer: "Dallin Schowalter",
    img: Img3,
    name: "Brand Infosys",
    pay_method: "COD",
    price: "$179.99",
    ratings: "4.7",
    delivery_status: "delivered",
  },
  {
    id: "11",
    order_date: "01/25/2023",
    delivery_date: "02/03/2023",
    product: "Super bass blutooth wireless headphone",
    customer: "Josefa Weissnat",
    img: Img3,
    name: "Brand Infosys",
    pay_method: "Mastercard",
    price: "$199.00",
    ratings: "4.3",
    delivery_status: "shipping",
  },
  {
    id: "12",
    order_date: "01/01/2023",
    delivery_date: "01/11/2023",
    product: "Flip-Flops and house slippers",
    customer: "Uriel King",
    img: Img1,
    name: "Zibra Fashion",
    pay_method: "Mastercard",
    price: "$99.99",
    ratings: "4.9",
    delivery_status: "new",
  },
];

export const ordersHeader: TableHeaderType[] = [
  { title: "", isCheck: true },
  { title: "Order Id" },
  { title: "Order Date" },
  { title: "Delivery Date" },
  { title: "Products" },
  { title: "Customers" },
  { title: "Shop" },
  { title: "Payment Method" },
  { title: "Amount" },
  { title: "Rating" },
  { title: "Delivery Status" },
  { title: "Action" },
];

export const orderProductOptions: MenuSelectItemType[] = [
  { value: "", label: "Product" },
  {
    value: "Cotton collar t-shirts for men",
    label: "Cotton collar t-shirts for men",
  },
  {
    value: "Like style travel black handbag",
    label: "Like style travel black handbag",
  },
  { value: "Fossil gen 5E smart watch", label: "Fossil gen 5E smart watch" },
  {
    value: "Super bass bluetooth wireless headphone",
    label: "Super bass bluetooth wireless headphone",
  },
  {
    value: "Willage volleyball ball size 4",
    label: "Willage volleyball ball size 4",
  },
  { value: "Branded T-Shirts", label: "Branded T-Shirts" },
  {
    value: "Flip-Flops and house slippers",
    label: "Flip-Flops and house slippers",
  },
  { value: "Jeans blue men boxer", label: "Jeans blue men boxer" },
  {
    value: "MAG back to the future shoes",
    label: "MAG back to the future shoes",
  },
  {
    value: "Super bass bluetooth wireless headphone",
    label: "Super bass bluetooth wireless headphone",
  },
];

export const orderDeliveryOptions: MenuSelectItemType[] = [
  { value: "", label: "Delivery Status" },
  { value: "new", label: "New" },
  { value: "pending", label: "Pending" },
  { value: "ood", label: "Out of Delivered" },
  { value: "shipping", label: "Shipping" },
  { value: "delivered", label: "Delivered" },
];

export const orderPaymentOptions: MenuSelectItemType[] = [
  { value: "", label: "Payment Method" },
  { value: "Mastercard", label: "Mastercard" },
  { value: "Visa", label: "Visa" },
  { value: "COD", label: "COD" },
  { value: "Paypal", label: "Paypal" },
];
