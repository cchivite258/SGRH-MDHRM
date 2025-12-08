import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import { ke } from "@/assets/images/flags/utils";
import { TableHeaderType } from "@/app/common/types/table.types";
import { ReportType } from "@/components/ammReports/types";
import { OptionType } from "@/app/common/types/option.type";
export const breadcrumb: BreadcrumbType[] = [
  {
    title: "service-providers",
    disabled: false,
  },
  {
    title: "service-provider-list",
    disabled: true,
  },
];

export const reportHeader: TableHeaderType[] = [
  { title: "all", isCheck: true },
  { title: "code" },
  { title: "report" },
  { title: "action", align: "end" },
];


export const reports: ReportType[] = [
  {
    id: "100001",
    img: "ph-file-text ph-lg",
    title: "Total gasto com assistência médica",
  },
  {
    id: "100002",
    img: "ph-file-text ph-lg",
    title: "Custo por colaborador",
  },
  
];

export const reportAction: OptionType[] = [
  {
    title: "preview",
    icon: "ph-eye",
    value: "preview",
    //to: "/ecommerce/product-details",
  },
  {
    title: "generate",
    icon: "ph ph-printer",
    value: "generate",
  }
];
