import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";
import { ReportType } from "@/components/ammReports/types";
import { OptionType } from "@/app/common/types/option.type";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "reports",
    disabled: false,
  },
  {
    title: "reports-list",
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
    title: "report-100001-title",
  },
  {
    id: "100002",
    img: "ph-file-text ph-lg",
    title: "report-100002-title",
  },
  {
    id: "100003",
    img: "ph-file-text ph-lg",
    title: "report-100003-title",
  },
  {
    id: "100004",
    img: "ph-file-text ph-lg",
    title: "report-100004-title",
  },
  {
    id: "100005",
    img: "ph-file-text ph-lg",
    title: "report-100005-title",
  },
];

export const reportAction: OptionType[] = [
  {
    title: "preview",
    icon: "ph-eye",
    value: "preview",
  },
  {
    title: "generate",
    icon: "ph ph-printer",
    value: "generate",
  }
];
