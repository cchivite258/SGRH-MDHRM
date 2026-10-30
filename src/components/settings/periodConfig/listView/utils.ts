import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import type { MenuSelectItemType } from "@/app/common/components/filters/types";
import type { PeriodMonthReference } from "@/components/settings/periodConfig/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "settings",
    disabled: false,
  },
  {
    title: "period-configs",
    disabled: true,
  },
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "type", key: "type", sortable: true },
  { title: "period-start", key: "startDayOfMonth", sortable: true },
  { title: "period-end", key: "endDayOfMonth", sortable: true },
  { title: "status", key: "active", sortable: true },
  { title: "action", sortable: false, align: "center" },
];

export const periodConfigTypeOptions: MenuSelectItemType[] = [
  {
    label: "t-period-config-type-payment-order",
    value: "PAYMENT_ORDER",
  },
];

export const periodMonthReferenceOptions: MenuSelectItemType[] = [
  {
    label: "t-period-month-previous",
    value: "PREVIOUS",
  },
  {
    label: "t-period-month-current",
    value: "CURRENT",
  },
];

export const formatPeriodBound = (
  translate: (key: string) => string,
  day: number | null | undefined,
  reference?: PeriodMonthReference | string | null,
  lastDay = false
) => {
  const monthLabel = reference === "PREVIOUS"
    ? translate("t-period-month-previous")
    : reference === "CURRENT"
      ? translate("t-period-month-current")
      : reference || "-";

  if (lastDay) {
    return `${translate("t-period-last-day")} · ${monthLabel}`;
  }

  if (day == null) {
    return "-";
  }

  return `${translate("t-period-day")} ${day} · ${monthLabel}`;
};
