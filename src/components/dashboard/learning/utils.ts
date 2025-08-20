import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";

export const learningBreadcrumb: BreadcrumbType[] = [
  {
    title: "dashboards",
    disabled: false,
    to: "/",
  },
  {
    title: "learning",
    disabled: true,
  },
];

export const getCharts = (getChartColorsArray: Function) => {
  const totalStudentsChart = {
    series: [
      {
        name: "Total Students",
        data: [33, 56, 37, 51, 42, 83, 71],
      },
    ],
    chartOptions: {
      chart: {
        height: 95,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          distributed: true,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: false,
        padding: {
          top: -15,
          right: 0,
          left: 0,
          bottom: -10,
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      stroke: {
        width: 2,
        curve: "smooth",
      },
      colors: getChartColorsArray(
        '["--tb-light", "--tb-secondary", "--tb-light", "--tb-light", "--tb-light", "--tb-light","--tb-light"]'
      ),
      xaxis: {
        categories: ["S", "M", "T", "W", "T", "F", "S"],
        labels: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
    },
  };
  const totalCoursesChart = {
    series: [
      {
        name: "Total Courses",
        data: [33, 56, 37, 51, 42, 83, 71],
      },
    ],
    chartOptions: {
      chart: {
        height: 95,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: false,
        padding: {
          top: -15,
          right: 0,
          left: 0,
          bottom: -10,
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      stroke: {
        width: 2,
        curve: "smooth",
      },
      colors: getChartColorsArray(
        '["--tb-info", "--tb-secondary", "--tb-primary", "--tb-primary", "--tb-primary", "--tb-primary","--tb-primary"]'
      ),
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        labels: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
    },
  };
  const dailyProgressChart = {
    series: [67],
    chartOptions: {
      chart: {
        height: 300,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          startAngle: -120,
          endAngle: 120,
          dataLabels: {
            name: {
              fontSize: "16px",
              color: undefined,
              offsetY: 80,
            },
            value: {
              offsetY: 30,
              fontSize: "20px",
              color: "#87888a",
              formatter: function (val: any) {
                return val + "%";
              },
            },
          },
        },
      },
      grid: {
        show: false,
        padding: {
          top: -15,
          right: 0,
          left: 0,
          bottom: -10,
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          shadeIntensity: 0.15,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 65, 91],
        },
      },
      stroke: {
        dashArray: 4,
      },
      labels: ["Daily Goal"],
      colors: getChartColorsArray('["--tb-primary"]'),
    },
  };
  const learningOverviewChart = {
    series: [
      {
        name: "This Month",
        data: [49, 54, 48, 54, 67, 88, 96, 102, 120, 133],
      },
      {
        name: "Last Month",
        data: [57, 66, 74, 63, 55, 70, 84, 97, 112, 99],
      },
    ],
    chartOptions: {
      chart: {
        height: 320,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      fill: {
        type: ["gradient", "gradient"],
        gradient: {
          shadeIntensity: 1,
          type: "vertical",
          inverseColors: false,
          opacityFrom: 0.2,
          opacityTo: 0.0,
          stops: [50, 70, 100, 100],
        },
      },
      markers: {
        size: 4,
        strokeColors: getChartColorsArray('["--tb-primary", "--tb-secondary"]'),
        strokeWidth: 1,
        strokeOpacity: 0.9,
        fillOpacity: 1,
        hover: {
          size: 6,
        },
      },
      grid: {
        show: false,
        padding: {
          top: 0,
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
        width: [2, 2],
        curve: "smooth",
      },
      colors: getChartColorsArray('["--tb-primary", "--tb-secondary"]'),
    },
  };

  return {
    totalStudentsChart,
    totalCoursesChart,
    dailyProgressChart,
    learningOverviewChart,
  };
};
