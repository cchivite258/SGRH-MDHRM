import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { Img3, Img5, Img2 } from "@/assets/images/small/utils";
export const breadcrumb: BreadcrumbType[] = [
  {
    title: "apexcharts",
    disabled: false,
  },
  {
    title: "pie",
    disabled: true,
  },
];

export const getCharts = (getChartColorsArray: Function) => {
  //  Simple Pie Charts

  const simplePieChart = {
    series: [44, 55, 13, 43, 22],
    chartOptions: {
      chart: {
        height: 300,
        type: "pie",
      },
      labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-success", "--tb-warning", "--tb-danger", "--tb-info"]'
      ),
    },
  };

  // Simple Donut Charts

  const donutChart = {
    series: [44, 55, 41, 17, 15],
    chartOptions: {
      chart: {
        height: 300,
        type: "donut",
      },
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-success", "--tb-warning", "--tb-danger", "--tb-info"]'
      ),
    },
  };

  // Updating Donut Charts
  const updatingDonutChart = {
    series: [44, 55, 13, 33],
    chartOptions: {
      chart: {
        height: 280,
        type: "donut",
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "bottom",
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-success", "--tb-warning", "--tb-danger", "--tb-info"]'
      ),
    },
  };

  // Gradient Donut Chart

  const gradientDonutChart = {
    series: [44, 55, 41, 17, 15],
    chartOptions: {
      chart: {
        height: 300,
        type: "donut",
      },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 270,
        },
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: "gradient",
      },
      legend: {
        position: "bottom",
        formatter: function (val: any, opts: any) {
          return val + " - " + opts.w.globals.series[opts.seriesIndex];
        },
      },
      title: {
        text: "Gradient Donut with custom Start-angle",
        style: {
          fontWeight: 500,
        },
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-success", "--tb-warning", "--tb-danger", "--tb-info"]'
      ),
    },
  };

  // Pattern Donut chart

  const patternDonutChart = {
    series: [44, 55, 41, 17, 15],
    chartOptions: {
      chart: {
        height: 300,
        type: "donut",
        dropShadow: {
          enabled: true,
          color: "#111",
          top: -1,
          left: 3,
          blur: 3,
          opacity: 0.2,
        },
      },
      stroke: {
        width: 0,
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
              },
            },
          },
        },
      },
      labels: ["Comedy", "Action", "SciFi", "Drama", "Horror"],
      dataLabels: {
        dropShadow: {
          blur: 3,
          opacity: 0.8,
        },
      },
      fill: {
        type: "pattern",
        opacity: 1,
        pattern: {
          enabled: true,
          style: [
            "verticalLines",
            "squares",
            "horizontalLines",
            "circles",
            "slantedLines",
          ],
        },
      },
      states: {
        hover: {
          filter: "none",
        },
      },
      theme: {
        palette: "palette2",
      },
      title: {
        text: "Favourite Movie Type",
        style: {
          fontWeight: 500,
        },
      },
      legend: {
        position: "bottom",
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-success", "--tb-warning", "--tb-danger", "--tb-info"]'
      ),
    },
  };

  // Pie Chart with Image Fill

  const imagePieChart = {
    series: [44, 33, 54, 45],
    chartOptions: {
      chart: {
        height: 300,
        type: "pie",
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-success", "--tb-warning", "--tb-info"]'
      ),
      fill: {
        type: "image",
        opacity: 0.85,
        image: {
          src: [
            // require("@/assets/images/auth-bg.jpg"),
            Img3,
            Img5,
            Img2,
          ],
          width: 25,
          imagedHeight: 25,
        },
      },
      stroke: {
        width: 4,
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ["#111"],
        },
        background: {
          enabled: true,
          foreColor: "#fff",
          borderWidth: 0,
        },
      },
      legend: {
        position: "bottom",
      },
    },
  };

  // monochrome_pie_chart
  const monochromePieChart = {
    series: [25, 15, 44, 55, 41, 17],
    chartOptions: {
      chart: {
        height: 300,
        type: "pie",
      },
      labels: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      theme: {
        monochrome: {
          enabled: true,
          color: "#3762ea",
          shadeTo: "light",
          shadeIntensity: 0.6,
        },
      },

      plotOptions: {
        pie: {
          dataLabels: {
            offset: -5,
          },
        },
      },
      title: {
        text: "Monochrome Pie",
        style: {
          fontWeight: 500,
        },
      },
      dataLabels: {
        formatter: function (val: any, opts: any) {
          var name = opts.w.globals.labels[opts.seriesIndex];
          return [name, val.toFixed(1) + "%"];
        },
        dropShadow: {
          enabled: false,
        },
      },
      legend: {
        show: false,
      },
    },
  };

  return {
    simplePieChart,
    donutChart,
    updatingDonutChart,
    gradientDonutChart,
    patternDonutChart,
    imagePieChart,
    monochromePieChart,
  };
};
