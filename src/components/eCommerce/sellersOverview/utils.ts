import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";

export const sellersOverviewBreadcrumb: BreadcrumbType[] = [
  {
    title: "ecommerce",
    disabled: false,
  },
  {
    title: "sellers-overview",
    disabled: true,
  },
];

export const filter = {
  query: "",
};

export function getCharts(getChartColorsArray: Function) {
  const sellersOverviewChart = {
    series: [
      {
        name: "Earnings",
        type: "column",
        data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 21, 37, 23, 11, 22],
      },
      {
        name: "Orders",
        type: "line",
        data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43, 45, 64, 44, 55, 41],
      },
      {
        name: "Refunds",
        type: "line",
        data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 25, 21, 30, 25, 36],
      },
    ],
    chartOptions: {
      chart: {
        height: 400,
        type: "line",
        stacked: false,
        toolbar: {
          show: false,
        },
      },
      stroke: {
        width: [0, 2, 3],
        curve: "smooth",
      },
      plotOptions: {
        bar: {
          columnWidth: "25%",
        },
      },
      fill: {
        opacity: [1, 0.08, 1],
        gradient: {
          inverseColors: false,
          shade: "light",
          type: "vertical",
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [0, 100, 100, 100],
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
      },
      labels: [
        "01/01/2022",
        "02/01/2022",
        "03/01/2022",
        "04/01/2022",
        "05/01/2022",
        "06/01/2022",
        "07/01/2022",
        "08/01/2022",
        "09/01/2022",
        "10/01/2022",
        "11/01/2022",
        "12/01/2022",
        "01/01/2023",
        "02/01/2023",
        "03/01/2023",
        "04/01/2023",
      ],
      markers: {
        size: 0,
      },
      xaxis: {
        type: "datetime",
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y: any) {
            if (typeof y !== "undefined") {
              return "$" + y.toFixed(0);
            }
            return y;
          },
        },
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-light", "--tb-secondary"]'
      ),
    },
  };

  return { sellersOverviewChart };
}

export const overviews = [
  {
    value: 7585,
    title: "Orders",
  },
  {
    value: 750.36,
    prefix: "$",
    suffix: "M",
    decimals: 2,
    title: "Earnings",
  },
  {
    value: 328,
    title: "Refunds",
  },
  {
    value: 18.92,
    decimals: 2,
    suffix: "%",
    color: "success",
    title: "Conversation Ratio",
  },
];

export const reviews = [
  {
    title: "5 star",
    value: 2758,
    color: "primary",
  },
  {
    title: "4 star",
    value: 1063,
    color: "secondary",
  },
  {
    title: "3 star",
    value: 997,
    color: "success",
  },
  {
    title: "2 star",
    value: 227,
    color: "warning",
  },
  {
    title: "1 star",
    value: 408,
    color: "danger",
  },
];

export const details = [
  {
    title: "Owner Value",
    value: "Lenna Labadie",
  },
  {
    title: "Company Type",
    value: "Partnership",
  },
  {
    title: "Location",
    value: "United States",
  },
  {
    title: "Website",
    value: "steex@themesbrand.com",
  },
  {
    title: "Phone Number",
    value: "+(542) 95135 74123",
    color: "primary",
  },
  {
    title: "Since",
    value: "1995",
  },
];
