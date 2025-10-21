import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { OptionType } from "@/app/common/types/option.type";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "agent",
    disabled: false,
  },
  {
    title: "overview",
    disabled: true,
  },
];

export function getCharts(getChartColorsArray: Function) {
  const agentOverviewChart = {
    series: [
      {
        name: "Total Property",
        type: "column",
        data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 21, 37, 23, 11, 22],
      },
      {
        name: "Property Rent",
        type: "line",
        data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43, 45, 64, 44, 55, 41],
      },
      {
        name: "Property Sold",
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
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-light", "--tb-secondary"]'
      ),
    },
  };

  return { agentOverviewChart };
}

export const agentDetailsCardOption: OptionType[] = [
  {
    title: "Edit",
    icon: "ph-pencil",
    value: "edit",
  },
  {
    title: "Delete",
    icon: "ph-trash",
    value: "delete",
  },
];

export const agentDetails = [
  {
    title: "Agency",
    value: "Themesbrand",
    isLink: true,
  },
  { title: "agent License", value: "#TBS01" },
  { title: "agent License", value: "3214 57896 5412" },
  { title: "Tax Number", value: "TBS 214513 54414" },
  { title: "Location", value: "Hamburg, Germany" },
  { title: "Email", value: "jacinthe@steex.com" },
  { title: "Contact Number", value: "+(27) 3041-1766" },
  { title: "Date", value: "11 December, 2023" },
];

export const messages = [
  {
    id: 1,
    roomId: 1,
    sender: "Lisa Parker",
    message: [
      {
        msg_id: 1,
        msg: "Good morning 😊",
        createdAt: "09:07 am",
      },
    ],
  },
  {
    id: 2,
    roomId: 1,
    sender: "Anna Adame",
    align: "right",
    message: [
      {
        msg_id: 2,
        msg: "Good morning, How are you? What about our next meeting?",
        createdAt: "09:08 am",
      },
    ],
  },
  {
    id: 3,
    roomId: 1,
    sender: "Lisa Parker",
    message: [
      {
        msg_id: 3,
        msg: "Yeah everything is fine. Our next meeting tomorrow at 10.00 AM",
        createdAt: "09:10 am",
      },
    ],
  },
  {
    id: 4,
    roomId: 1,
    sender: "Anna Adame",
    align: "right",
    message: [
      {
        msg_id: 5,
        msg: "Wow that's great",
        createdAt: "09:12 am",
      },
    ],
  },
];
