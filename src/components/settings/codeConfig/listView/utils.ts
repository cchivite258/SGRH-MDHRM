import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import type { MenuSelectItemType } from "@/app/common/components/filters/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "settings",
    disabled: false,
  },
  {
    title: "contract-code-configs",
    disabled: true,
  },
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "type", key: "type", sortable: true },
  { title: "prefix", key: "prefix", sortable: true },
  { title: "separator", key: "separator", sortable: true },
  { title: "suffix", key: "suffix", sortable: true },
  { title: "sequence-length", key: "sequenceLength", sortable: true },
  { title: "pattern", key: "pattern", sortable: true },
  { title: "year", key: "includesYear", sortable: true },
  { title: "month", key: "includesMonth", sortable: true },
  { title: "action", sortable: false, align: "center" },
];

export const codeConfigTypeOptions: MenuSelectItemType[] = [
  {
    label: "t-code-config-type-service-provider",
    value: "SERVICE_PROVIDER",
  },
  {
    label: "t-code-config-type-contract",
    value: "CONTRACT",
  },
];

export const codeConfigSeparatorOptions: MenuSelectItemType[] = [
  {
    label: "t-code-config-separator-comma",
    value: "COMMA",
  },
  {
    label: "t-code-config-separator-point",
    value: "POINT",
  },
  {
    label: "t-code-config-separator-semicolon",
    value: "SEMICOLON",
  },
  {
    label: "t-code-config-separator-hyphen",
    value: "HYPHEN",
  },
  {
    label: "t-code-config-separator-space",
    value: "SPACE",
  },
  {
    label: "t-code-config-separator-none",
    value: "NONE",
  },
];
