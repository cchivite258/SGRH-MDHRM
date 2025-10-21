import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "apexcharts",
    disabled: false,
  },
  {
    title: "funnel",
    disabled: true,
  },
];

// Mixed - Line Column Chart

export const getCharts = (getChartColorsArray: Function) => {
  // Funnel Chart
  const funnelChart = {
    series: [
      {
        name: "Funnel Series",
        data: [1380, 1100, 990, 880, 740, 548, 330, 200],
      },
    ],
    chartOptions: {
      chart: {
        type: "bar",
        height: 350,
      },
      colors: getChartColorsArray('["--tb-primary"]'),
      plotOptions: {
        bar: {
          borderRadius: 0,
          horizontal: true,
          barHeight: "80%",
          isFunnel: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: any, opt: any) {
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
        },
        dropShadow: {
          enabled: true,
        },
      },
      title: {
        text: "Recruitment Funnel",
        align: "middle",
      },
      xaxis: {
        categories: [
          "Sourced",
          "Screened",
          "Assessed",
          "HR Interview",
          "Technical",
          "Verify",
          "Offered",
          "Hired",
        ],
      },
      legend: {
        show: false,
      },
    },
  };

  const pyramidChart = {
    series: [
      {
        name: "",
        data: [200, 330, 548, 740, 880, 990, 1100, 1380],
      },
    ],
    chartOptions: {
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          borderRadius: 0,
          horizontal: true,
          distributed: true,
          barHeight: "80%",
          isFunnel: true,
        },
      },
      colors: getChartColorsArray('["--tb-primary", "--tb-secondary", "--tb-success", "--tb-warning", "--tb-info", "--tb-danger", "--tb-primary", "--tb-secondary"]'),
      dataLabels: {
        enabled: true,
        formatter: function (val: any, opt: any) {
          return opt.w.globals.labels[opt.dataPointIndex];
        },
        dropShadow: {
          enabled: true,
        },
      },
      title: {
        text: "Pyramid Chart",
        align: "middle",
      },
      xaxis: {
        categories: [
          "Sweets",
          "Processed Foods",
          "Healthy Fats",
          "Meat",
          "Beans & Legumes",
          "Dairy",
          "Fruits & Vegetables",
          "Grains",
        ],
      },
      legend: {
        show: false,
      },
    },
  };

  return {
    funnelChart,
    pyramidChart,
  };
};