import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import type { IntegrationSourceCodeListing } from "@/components/settings/integrationSourceCode/types";

export const integrationSourceCodeLabel = (code: Pick<IntegrationSourceCodeListing, "id" | "sourceLedger" | "sourceType" | "description">) => {
  const pair = [code.sourceLedger, code.sourceType].map(value => value?.trim()).filter(Boolean).join(" / ");
  const description = code.description?.trim();
  if (pair && description) return `${pair} — ${description}`;
  return pair || description || String(code.id);
};

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "settings",
    disabled: false,
  },
  {
    title: "integration-source-codes",
    disabled: true,
  },
];

export const listViewHeader: DataTableHeaderType[] = [
  { title: "payment-order-entry-source-ledger", key: "sourceLedger", sortable: true },
  { title: "payment-order-entry-source-type", key: "sourceType", sortable: true },
  { title: "description", key: "description", sortable: true },
  { title: "status", key: "enabled", sortable: true },
  { title: "action", sortable: false, align: "center" },
];
