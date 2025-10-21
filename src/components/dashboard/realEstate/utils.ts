import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import {
  img08,
  img07,
  img05,
  img04,
  img03,
  img01,
  img02,
} from "@/assets/images/real-estate/utils";
import { PropertyType } from "@/components/dashboard/realEstate/types";

export const realEstateBreadcrumb: BreadcrumbType[] = [
  {
    title: "dashboards",
    disabled: false,
    to: "/",
  },
  {
    title: "real-estate",
    disabled: true,
  },
];

export const sales: PropertyType[] = [
  {
    src: img08,
    title: "Crystal House",
    bedroom: 2,
    bathRoom: 1,
    sqft: 1039,
    rating: 4.5,
  },
  {
    src: img07,
    title: "Whitespace Vintage Villa",
    bedroom: 4,
    bathRoom: 2,
    sqft: 1145,
    rating: 4.9,
  },
  {
    src: img05,
    title: "Northlight Residency",
    bedroom: 3,
    bathRoom: 3,
    sqft: 1859,
    rating: 4.7,
  },
  {
    src: img08,
    title: "Park Side Colonial",
    bedroom: 5,
    bathRoom: 3,
    sqft: 5643,
    rating: 4.7,
  },
  {
    src: img04,
    title: "Marina Hill Vintage",
    bedroom: 4,
    bathRoom: 3,
    sqft: 1145,
    rating: 4.9,
  },
  {
    src: img07,
    title: "Grand Cub Hotel",
    bedroom: 3,
    bathRoom: 1,
    sqft: 1543,
    rating: 4.4,
  },
  {
    src: img03,
    title: "Evergreen Villa with Residency",
    bedroom: 5,
    bathRoom: 3,
    sqft: 3652,
    rating: 4.5,
  },
];

export const rent: PropertyType[] = [
  {
    src: img01,
    title: "Liberty Property",
    bedroom: 1,
    bathRoom: 1,
    sqft: 958,
    rating: 4.3,
  },
  {
    src: img02,
    title: "Duplex Square Valley",
    bedroom: 3,
    bathRoom: 2,
    sqft: 2659,
    rating: 3.8,
  },
  {
    src: img03,
    title: "Small house on an autumn’s",
    bedroom: 2,
    bathRoom: 1,
    sqft: 2230,
    rating: 4.3,
  },
  {
    src: img07,
    title: "New Grand Hotel Room",
    bedroom: 3,
    bathRoom: 2,
    sqft: 2785,
    rating: 4.9,
  },
  {
    src: img08,
    title: "Park Side Colonial",
    bedroom: 5,
    bathRoom: 3,
    sqft: 5643,
    rating: 4.7,
  },
  {
    src: img07,
    title: "Whitespace Vintage Villa",
    bedroom: 4,
    bathRoom: 2,
    sqft: 1145,
    rating: 4.9,
  },
  {
    src: img05,
    title: "Nightlight Residency",
    bedroom: 2,
    bathRoom: 1,
    sqft: 1324,
    rating: 4.9,
  },
];

export const getCharts = (getChartColorsArray: Function) => {
  const propertySaleChart = {
    series: [80],
    chartOptions: {
      chart: {
        width: 100,
        height: 100,
        type: "radialBar",
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: "50%",
          },
          track: {
            margin: 0,
            background: getChartColorsArray('["--tb-primary"]'),
            opacity: 0.2,
          },
          dataLabels: {
            show: false,
          },
        },
      },
      grid: {
        padding: {
          top: -15,
          bottom: -15,
        },
      },
      stroke: {
        lineCap: "round",
      },
      labels: ["Cricket"],
      colors: getChartColorsArray('["--tb-primary"]'),
    },
  };
  const propertyRentChart = {
    series: [65],
    chartOptions: {
      chart: {
        width: 110,
        height: 110,
        type: "radialBar",
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: "50%",
          },
          track: {
            margin: 0,
            background: getChartColorsArray('["--tb-warning"]'),
            opacity: 0.2,
          },
          dataLabels: {
            show: false,
          },
        },
      },
      grid: {
        padding: {
          top: -15,
          bottom: -15,
        },
      },
      stroke: {
        lineCap: "round",
      },
      labels: ["Cricket"],
      colors: getChartColorsArray('["--tb-warning"]'),
    },
  };
  const visitorsChart = {
    series: [47],
    chartOptions: {
      chart: {
        width: 110,
        height: 110,
        type: "radialBar",
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: "50%",
          },
          track: {
            margin: 0,
            background: getChartColorsArray('["--tb-secondary"]'),
            opacity: 0.2,
          },
          dataLabels: {
            show: false,
          },
        },
      },
      grid: {
        padding: {
          top: -15,
          bottom: -15,
        },
      },
      stroke: {
        lineCap: "round",
      },
      labels: ["Cricket"],
      colors: getChartColorsArray('["--tb-secondary"]'),
    },
  };
  const residencyPropertyChart = {
    series: [43],
    chartOptions: {
      chart: {
        width: 110,
        height: 110,
        type: "radialBar",
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: "50%",
          },
          track: {
            margin: 0,
            background: getChartColorsArray('["--tb-success"]'),
            opacity: 0.2,
          },
          dataLabels: {
            show: false,
          },
        },
      },
      grid: {
        padding: {
          top: -15,
          bottom: -15,
        },
      },
      stroke: {
        lineCap: "round",
      },
      labels: ["Cricket"],
      colors: getChartColorsArray('["--tb-success"]'),
    },
  };
  const propertiesTypeChart = {
    series: [44, 55, 67, 83],
    chartOptions: {
      chart: {
        type: "donut",
      },
      plotOptions: {
        pie: {
          // startAngle: -90,
          // endAngle: 90,
        },
      },
      legend: {
        show: true,
        position: "bottom",
      },
      labels: ["Commercial", "Residential", "Villa", "Apartment"],
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-secondary", "--tb-light","--tb-danger"]'
      ),
    },
  };
  const totalRevenueChart = {
    series: [
      {
        name: "Income",
        data: [
          26, 24.65, 18.24, 29.02, 23.65, 27, 21.18, 24.65, 27.32, 25, 24.65,
          29.32,
        ],
      },
    ],
    chartOptions: {
      chart: {
        type: "bar",
        height: 328,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "30%",
          lineCap: "round",
          borderRadiusOnAllStackedSeries: true,
        },
      },
      grid: {
        padding: {
          left: 0,
          right: 0,
          top: -15,
          bottom: -15,
        },
      },
      colors: getChartColorsArray('["--tb-primary"]'),
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
  const totalIncomeChart = {
    series: [
      {
        name: "Income",
        data: [
          32, 18, 13, 17, 26, 34, 47, 51, 59, 63, 44, 38, 53, 69, 72, 83, 90, 110,
          130, 117, 103, 92, 95, 119, 80, 96, 116, 125,
        ],
      },
    ],
    chartOptions: {
      chart: {
        height: 328,
        type: "line",
        toolbar: {
          show: false,
        },
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
      colors: getChartColorsArray('["--tb-success"]'),
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
        labels: {
          show: true,
          formatter: function (y: any) {
            return "$" + y.toFixed(0);
          },
        },
      },
    },
  };
  const revenuePropertySaleChart = {
    series: [
      {
        name: "Property Rent",
        data: [
          30, 57, 25, 33, 20, 27, 38, 49, 42, 58, 33, 46, 40, 34, 41, 53, 19, 23,
          36, 52, 58, 43,
        ],
      },
    ],
    chartOptions: {
      chart: {
        height: 328,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      colors: getChartColorsArray('["--tb-danger"]'),
      plotOptions: {
        bar: {
          columnWidth: "30%",
          distributed: true,
          borderRadius: 5,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      xaxis: {
        type: "datetime",
        categories: [
          "01/01/2023 GMT",
          "01/02/2023 GMT",
          "01/03/2023 GMT",
          "01/04/2023 GMT",
          "01/05/2023 GMT",
          "01/06/2023 GMT",
          "01/07/2023 GMT",
          "01/08/2023 GMT",
          "01/09/2023 GMT",
          "01/10/2023 GMT",
          "01/11/2023 GMT",
          "01/12/2023 GMT",
          "01/13/2023 GMT",
          "01/14/2023 GMT",
          "01/15/2023 GMT",
          "01/16/2023 GMT",
          "01/17/2023 GMT",
          "01/18/2023 GMT",
          "01/19/2023 GMT",
          "01/20/2023 GMT",
          "01/21/2023 GMT",
          "01/22/2023 GMT",
        ],
      },
    },
  };
  const revenuePropertyRentChart = {
    series: [
      {
        name: "Property Rent",
        data: [31, 40, 28, 43, 59, 87, 75, 60, 51, 66, 109, 100],
      },
    ],
    chartOptions: {
      chart: {
        height: 328,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      fill: {
        opacity: "0.01",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 2,
        curve: "smooth",
      },
      colors: getChartColorsArray('["--tb-info"]'),
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
  const projectOnHoldChart = {
    series: [
      {
        data: [50, 15, 35, 62, 23, 56, 44, 12],
      },
    ],
    chartOptions: {
      chart: {
        type: "line",
        height: 50,
        sparkline: {
          enabled: true,
        },
      },
      colors: getChartColorsArray('["--tb-secondary"]'),
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
  const ongoingPropertiesChart = {
    series: [
      {
        data: [50, 15, 20, 34, 23, 56, 65, 75],
      },
    ],
    chartOptions: {
      chart: {
        type: "line",
        height: 50,
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
  const pendingPropertiesChart = {
    series: [
      {
        data: [32, 18, 29, 31, 46, 33, 39, 46],
      },
    ],
    chartOptions: {
      chart: {
        type: "line",
        height: 50,
        sparkline: {
          enabled: true,
        },
      },
      colors: getChartColorsArray('["--tb-warning"]'),
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
  const completedProjectChart = {
    series: [
      {
        data: [36, 25, 18, 34, 39, 30, 34, 42],
      },
    ],
    chartOptions: {
      chart: {
        type: "line",
        height: 50,
        sparkline: {
          enabled: true,
        },
      },
      colors: getChartColorsArray('["--tb-success"]'),
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

  const data = [
    {
      title: "Properties for sale",
      count: 3652,
      isSuccess: true,
      percent: "06.19%",
      chart: propertySaleChart,
    },
    {
      title: "Properties for rent",
      count: 1524,
      isSuccess: true,
      percent: "02.33%",
      chart: propertyRentChart,
    },
    {
      title: "Visitors",
      count: 149.36,
      suffix: "k",
      decimals: 2,
      isSuccess: true,
      percent: "12.33%",
      chart: visitorsChart,
    },
    {
      title: "Residency Property",
      count: 2376,
      isSuccess: false,
      percent: "09.57%",
      chart: residencyPropertyChart,
    },
  ];
  const briefs = [
    {
      title: "Project On Hold",
      chart: projectOnHoldChart,
      endVal: 2451,
      isSuccess: false,
      percent: "1.02%",
    },
    {
      title: "Ongoing Properties",
      chart: ongoingPropertiesChart,
      endVal: 750.36,
      decimals: 2,
      prefix: "$",
      suffix: "M",
      isSuccess: true,
      percent: "2.17%",
    },
    {
      title: "Pending Properties",
      chart: pendingPropertiesChart,
      endVal: 750.36,
      decimals: 2,
      prefix: "$",
      suffix: "M",
      isSuccess: true,
      percent: "07.26%",
    },
    {
      title: "Completed Project",
      chart: completedProjectChart,
      endVal: 4689,
      isSuccess: true,
      percent: "3.62%",
    },
  ];
  return {
    data,
    briefs,
    propertySaleChart,
    propertyRentChart,
    visitorsChart,
    residencyPropertyChart,
    propertiesTypeChart,
    totalRevenueChart,
    totalIncomeChart,
    revenuePropertySaleChart,
    revenuePropertyRentChart,
    projectOnHoldChart,
    ongoingPropertiesChart,
    pendingPropertiesChart,
    completedProjectChart
  };
};
