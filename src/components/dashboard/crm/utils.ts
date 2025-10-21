import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";

export const crmBreadcrumb: BreadcrumbType[] = [
  {
    title: "dashboards",
    disabled: false,
    to: "/",
  },
  {
    title: "crm",
    disabled: true,
  },
];

export const getCharts = (getChartColorsArray: Function) => {
  const realizedRateChart = {
    series: [
      {
        name: "Read",
        data: [80, 50, 30, 40, 100, 20],
      },
      {
        name: "Delivery",
        data: [20, 30, 40, 80, 20, 80],
      },
      {
        name: "Failed",
        data: [44, 76, 78, 13, 43, 10],
      },
    ],
    chartOptions: {
      chart: {
        height: 403,
        type: "radar",
        toolbar: {
          show: false,
        },
      },
      stroke: {
        width: 1,
      },
      fill: {
        opacity: 0.2,
      },
      markers: {
        size: 3,
        hover: {
          size: 4,
        },
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val;
          },
        },
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-secondary", "--tb-danger"]'
      ),
      xaxis: {
        categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
      },
    },
  };
  const balanceOverviewChart = {
    series: [
      {
        name: "Total Revenue",
        data: [49, 62, 55, 67, 73, 89, 110, 120, 115, 129, 123, 133],
      },
      {
        name: "Total Expense",
        data: [62, 76, 67, 49, 63, 77, 70, 86, 92, 103, 87, 93],
      },
      {
        name: "Profit Ratio",
        data: [12, 36, 29, 33, 37, 42, 58, 67, 49, 33, 24, 18],
      },
    ],
    chartOptions: {
      chart: {
        height: 300,
        type: "line",
        toolbar: {
          show: false,
        },
        dropShadow: {
          enabled: true,
          enabledOnSeries: undefined,
          top: 0,
          left: 0,
          blur: 3,
          color: getChartColorsArray(
            '["--tb-primary", "--tb-light","--tb-secondary"]'
          ),
          opacity: 0.25,
        },
      },
      markers: {
        size: 0,
        strokeColors: getChartColorsArray(
          '["--tb-primary", "--tb-light","--tb-secondary"]'
        ),
        strokeWidth: 2,
        strokeOpacity: 0.9,
        fillOpacity: 1,
        radius: 0,
        hover: {
          size: 5,
        },
      },
      grid: {
        show: true,
        padding: {
          top: -20,
          right: 0,
          bottom: 0,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
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
      stroke: {
        width: [2, 2, 2],
        curve: "smooth",
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-light","--tb-secondary"]'
      ),
    },
  };
  const emailSentChart = {
    series: [63, 87, 33],
    chartOptions: {
      chart: {
        height: 365,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          track: {
            background: getChartColorsArray(
              '["--tb-primary", "--tb-success", "--tb-secondary"]'
            ),
            opacity: 0.15,
          },
          dataLabels: {
            name: {
              fontSize: "22px",
            },
            value: {
              fontSize: "16px",
            },
            total: {
              show: true,
              label: "Total",
              formatter: function () {
                return 1793;
              },
            },
          },
        },
      },
      legend: {
        show: true,
        position: "bottom",
      },
      labels: ["Sent", "Received", "Failed"],
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-success", "--tb-secondary"]'
      ),
    },
  };
  const usersActivityChart = {
    series: [
      {
        name: "Activity User",
        data: [44, 55, 41, 67, 22, 43],
      },
      {
        name: "New Users",
        data: [13, 23, 20, 8, 13, 27],
      },
    ],
    chartOptions: {
      chart: {
        type: "bar",
        height: 330,
        stacked: true,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: true,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "40%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ["S", "M", "T", "W", "T", "F", "S"],
      },
      grid: {
        show: true,
        padding: {
          top: -18,
          right: 0,
          bottom: 0,
        },
      },
      legend: {
        position: "bottom",
      },
      fill: {
        opacity: 1,
      },
      colors: getChartColorsArray('["--tb-primary", "--tb-light"]'),
    },
  };
  const syncStatusBreakdownChart = {
    series: [
      {
        name: "Synced",
        data: [44, 55, 41, 37, 22, 43, 21],
      },
      {
        name: "Sync Needed",
        data: [53, 32, 33, 52, 13, 43, 32],
      },
      {
        name: "Never Synced",
        data: [12, 17, 11, 9, 15, 11, 20],
      },
      {
        name: "Review Needed",
        data: [9, 7, 5, 8, 6, 9, 4],
      },
    ],
    chartOptions: {
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnHight: "40%",
        },
      },
      grid: {
        show: true,
        padding: {
          top: -20,
          right: 0,
          bottom: -10,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      },
      yaxis: {
        title: {
          text: undefined,
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        show: false,
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-primary, 0.85", "--tb-primary, 0.60", "--tb-primary, 0.50"]'
      ),
    },
  };
  return {
    realizedRateChart,
    balanceOverviewChart,
    emailSentChart,
    usersActivityChart,
    syncStatusBreakdownChart,
  };
};
