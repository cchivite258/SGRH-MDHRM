import {
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6,
} from "@/assets/images/companies/utils";
export const OverviewList = [
  {
    title: "Total Revenue",
    countTo: 750.36,
    prefix: "$",
    suffix: "M",
    progress: "+19.07 %",
    isSuccess: true,
    icon: "ph ph-wallet ph-xl",
    avatarColor: "primary",
    decimals: 2,
  },
  {
    title: "Orders",
    countTo: 684,
    progress: "+8.13 %",
    isSuccess: true,
    icon: "ph ph-bag ph-xl",
    avatarColor: "secondary",
  },
  {
    title: "Product Views",
    countTo: 113870,
    progress: "+2.01 %",
    isSuccess: false,
    icon: "ph ph-eye ph-xl",
    avatarColor: "secondary",
  },
  {
    title: "Customers",
    countTo: 2500,
    suffix: "k",
    progress: "+10.42 %",
    isSuccess: true,
    icon: "ph ph-users-three ph-xl",
    avatarColor: "info",
  },
];

export const getCharts = (getChartColorsArray: Function) => {
  const revenueChart = {
    redrawOnWindowResize: true,
    series: [
      {
        name: "Earning",
        data: [
          26, 24.65, 18.24, 29.02, 23.65, 27, 21.18, 24.65, 27.32, 25, 24.65,
          29.32,
        ],
      },
      {
        name: "Expense",
        data: [
          -10, -17.32, -15.45, -12.3, -19.15, -15.45, -11, -14.32, -15.67, -10,
          -17.32, -19.2,
        ],
      },
    ],
    chartOptions: {
      chart: {
        redrawOnWindowResize: true,
        type: "bar",
        height: 328,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      stroke: {
        width: 5,
        colors: "#000",
        lineCap: "round",
      },
      grid: {
        show: true,
        borderColor: "#000",

        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "30%",
          borderRadius: 5,
          lineCap: "round",
          borderRadiusOnAllStackedSeries: true,
        },
      },
      colors: getChartColorsArray('["--tb-primary", "--tb-secondary"]'),
      fill: {
        opacity: 1,
      },
      dataLabels: {
        enabled: false,
        textAnchor: "top",
      },
      yaxis: {
        labels: {
          show: true,
          formatter: function (y: any) {
            return y.toFixed(0) + "k";
          },
        },
      },
      legend: {
        show: false,
        position: "top",
        horizontalAlign: "right",
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        labels: {
          rotate: -90,
        },
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          stroke: {
            width: 1,
          },
        },
      },
    },
  };

  const budgetChart = {
    series: [
      {
        data: [50, 15, 35, 62, 23, 56, 44, 12],
      },
    ],
    chartOptions: {
      chart: {
        type: "line",
        height: 45,
        sparkline: {
          enabled: true,
        },
      },
      colors: getChartColorsArray('["--tb-primary"]'),
      stroke: {
        curve: "smooth",
        width: 1,
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
    },
  };

  const payoutsChart = {
    series: [
      {
        data: [50, 15, 20, 34, 23, 56, 65, 41],
      },
    ],
    chartOptions: {
      chart: {
        type: "line",
        height: 45,
        sparkline: {
          enabled: true,
        },
      },
      colors: getChartColorsArray('["--tb-info"]'),
      stroke: {
        curve: "smooth",
        width: 1,
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
    },
  };

  const trafficSourceChart = {
    series: [
      {
        name: "Search Engine Traffic",
        data: [74, 83, 102, 97],
      },
      {
        name: "Direct Traffic",
        data: [46, 57, 59, 54],
      },
    ],
    chartOptions: {
      chart: {
        height: 360,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["transparent"],
      },
      legend: {
        show: true,
        position: "top",
      },
      colors: getChartColorsArray('["--tb-primary", "--tb-light"]'),
      xaxis: {
        categories: ["Feb", "Mar", "Apr", "May"],
      },
      yaxis: {
        show: false,
      },
      grid: {
        borderColor: "#f1f1f1",
      },
    },
  };

  return {
    revenueChart,
    budgetChart,
    payoutsChart,
    trafficSourceChart,
  };
};

export const headerItems = [
  { title: "Order Date" },
  { title: "Order ID" },
  { title: "Shop", align: "center" },
  { title: "Customers" },
  { title: "Products" },
  { title: "Amount" },
  { title: "Status" },
  { title: "Rating" },
];

export const orderList = [
  {
    id: 1,
    orderDate: "30 Jan, 2023",
    orderId: "#TBS250009",
    shopSrc: Img1,
    customer: "Ayaan Bowen",
    products: "Bike Accessories",
    amount: "$215.00",
    status: "ood",
    rating: 4.9,
  },
  {
    id: 2,
    orderDate: "19 Jan, 2023",
    orderId: "#TBS250007",
    shopSrc: Img2,
    customer: "Vihan Hudda",
    products: "Bags and Wallets",
    amount: "$330.00",
    status: "delivered",
    rating: 4.7,
  },
  {
    id: 3,
    orderDate: "16 Jan, 2023",
    orderId: "#TBS250006",
    shopSrc: Img3,
    customer: "Vihan Hudda",
    products: "Bags and Wallets",
    amount: "$754.11",
    status: "pending",
    rating: 4.6,
  },
  {
    id: 4,
    orderDate: "14 Feb, 2023",
    orderId: "#TBS250010",
    shopSrc: Img4,
    customer: "Jansh Brown",
    products: "Kitchen Storage",
    amount: "$149.00",
    status: "pending",
    rating: 4.5,
  },
  {
    id: 5,
    orderDate: "25 Jan, 2023",
    orderId: "#TBS250008",
    shopSrc: Img5,
    customer: "Prezy Mark",
    products: "Furniture",
    amount: "$199.00",
    status: "shipping",
    rating: 4.3,
  },
  {
    id: 6,
    orderDate: "15 Feb, 2023",
    orderId: "#TBS250011",
    shopSrc: Img6,
    customer: "Alex Smith",
    products: "Clothes",
    amount: "$109.00",
    status: "new",
    rating: null,
  },
];

export const cities = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "New York City",
      },
      geometry: {
        type: "Point",
        coordinates: [-73.778137, 40.641312],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "London",
      },
      geometry: {
        type: "Point",
        coordinates: [-0.454296, 51.47002],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Beijing",
      },
      geometry: {
        type: "Point",
        coordinates: [116.597504, 40.072498],
      },
    },
  ],
};

export const countries = [
  {
    name: "United States",
    sales: "15,364",
    color: "primary",
  },
  {
    name: "Greenland",
    sales: "12,387",
    color: "secondary",
  },
  {
    name: "Serbia",
    sales: "9,123",
    color: "info",
  },
  {
    name: "Russia",
    sales: "7,108",
    color: "success",
  },
  {
    name: "Brazil",
    sales: "6,731",
    color: "danger",
  },
  {
    name: "Sydney",
    sales: "3,023",
    color: "warning",
  },
];
