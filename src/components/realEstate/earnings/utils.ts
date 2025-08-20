import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "real-estate",
    disabled: false,
  },
  {
    title: "earnings",
    disabled: true,
  },
];

export const dashboardList = [
  {
    title: "Total Revenue",
    countTo: 798.97,
    prefix: "$",
    suffix: "M",
    progress: "+9.3%",
    isSuccess: true,
    decimals: 2,
    color: "secondary",
  },
  {
    title: "Daily Earning",
    countTo: 2356,
    prefix: "$",
    suffix: "k",
    progress: "+20.8%",
    isSuccess: true,
    color: "primary",
  },
  {
    title: "Total Balance",
    countTo: 337.32,
    prefix: "$",
    suffix: "M",
    progress: "+12.6%",
    isSuccess: true,
    decimals: 2,
    color: "warning",
  },
  {
    title: "On hold",
    countTo: 365.32,
    prefix: "$",
    suffix: "M",
    progress: "+18.7%",
    isSuccess: true,
    decimals: 2,
    color: "success",
  },
  {
    title: "Expenses",
    countTo: 247.19,
    prefix: "$",
    suffix: "M",
    progress: "-7.1%",
    isSuccess: false,
    decimals: 2,
    color: "danger",
  },
];

export function getCharts(getChartColorsArray: Function) {
  const realEstateEarningsChart = {
    series: [
      {
        name: "Daily Earning",
        data: [
          32, 43, 48, 35, 26, 34, 47, 51, 59, 63, 44, 38, 53, 69, 72, 83, 90,
          110, 130, 117, 111, 97, 89, 119, 80, 96, 116, 124,
        ],
      },
      {
        name: "Expenses",
        data: [
          15, 35, 18, 4, 7, 9, 15, 10, 19, 22, 27, 21, 34, 23, 29, 32, 41, 34,
          29, 37, 70, 55, 49, 37, 21, 54, 36, 45,
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
      colors: getChartColorsArray('["--tb-primary", "--tb-danger"]'),
      xaxis: {
        type: "datetime",
        categories: [
          "03/01/2023 GMT",
          "03/02/2023 GMT",
          "03/03/2023 GMT",
          "03/04/2023 GMT",
          "03/05/2023 GMT",
          "03/06/2023 GMT",
          "03/07/2023 GMT",
          "03/08/2023 GMT",
          "03/09/2023 GMT",
          "03/10/2023 GMT",
          "03/11/2023 GMT",
          "03/12/2023 GMT",
          "03/13/2023 GMT",
          "03/14/2023 GMT",
          "03/15/2023 GMT",
          "03/16/2023 GMT",
          "03/17/2023 GMT",
          "03/18/2023 GMT",
          "03/19/2023 GMT",
          "03/20/2023 GMT",
          "03/21/2023 GMT",
          "03/22/2023 GMT",
          "03/23/2023 GMT",
          "03/24/2023 GMT",
          "03/25/2023 GMT",
          "03/26/2023 GMT",
          "03/27/2023 GMT",
          "03/28/2023 GMT",
        ],
      },
      yaxis: {
        show: false,
      },
    },
  };

  return { realEstateEarningsChart };
}

export const realEstateEarningHeader: TableHeaderType[] = [
  { title: "", isCheck: true },
  { title: "#" },
  { title: "Transaction ID" },
  { title: "Timestamp" },
  { title: "Details" },
  { title: "Type" },
  { title: "Amount" },
  { title: "Status" },
];

export const earningData = [
  {
    id: 1,
    transactionID: "147852369012",
    date: "14 Nov, 2022",
    timestamp: "12:38PM",
    details: "Membership Fees",
    type: "Debit",
    amount: "236.41",
    status: "pending",
    isSuccess: false,
  },
  {
    id: 2,
    transactionID: "147852363645",
    date: "02 Jan, 2023 ",
    timestamp: "11:22PM",
    details: "British Pound Sterling Block",
    type: "Credit",
    amount: "875.32",
    status: "Successful",
    isSuccess: true,
  },
  {
    id: 3,
    transactionID: "147852362451",
    date: "27 Jan, 2023 ",
    timestamp: "03:19AM",
    details: "Fashion T-Shirts Purchase",
    type: "   Credit",
    amount: "214.00",
    status: "Successful",
    isSuccess: true,
  },
  {
    id: 4,
    transactionID: "147852315960",
    date: "28 Jan, 2023",
    timestamp: "05:36AM",
    details: "The Country House",
    type: "Credit",
    amount: "1470.50",
    status: "pending",
    isSuccess: true,
  },
  {
    id: 5,
    transactionID: "147852319632",
    date: "01 Feb, 2023",
    timestamp: "07:19PM",
    details: "Vintage Apartment",
    type: "Debit",
    amount: "3526.00",
    status: "Successful",
    isSuccess: false,
  },
  {
    id: 6,
    transactionID: "147852310391",
    date: "04 Feb, 2023 ",
    timestamp: "07:19PM",
    details: "Duplex Square Valley",
    type: "Debit",
    amount: "215.00",
    status: "Successful",
    isSuccess: false,
  },
  {
    id: 7,
    transactionID: "147852310298",
    date: "22 Feb, 2023",
    timestamp: "07:19PM",
    details: "Crystal House",
    type: "Credit",
    amount: "678.00",
    status: "cancel",
    isSuccess: true,
  },
  {
    id: 8,
    transactionID: "147852310341",
    date: "12 Dec, 2022",
    timestamp: "01:57PM",
    details: "Swimming pool side of the residential Ascot home.",
    type: "Debit",
    amount: "1024.00",
    status: "Successful",
    isSuccess: false,
  },
  {
    id: 9,
    transactionID: "147852310003",
    date: "19 Dec, 2022",
    timestamp: "10:33AM",
    details: "Small house on an autumn’s day",
    type: "  Credit",
    amount: "1024.00",
    status: "pending",
    isSuccess: true,
  },
  {
    id: 10,
    transactionID: "147852310298",
    date: "22 Feb, 2023",
    timestamp: "07:19PM",
    details: "Crystal House",
    type: " Credit",
    amount: "678.00",
    status: "cancel",
    isSuccess: true,
  },
];
