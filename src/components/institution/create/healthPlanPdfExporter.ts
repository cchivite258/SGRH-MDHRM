import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { UserOptions } from "jspdf-autotable";
import { amountFormate } from "@/app/common/amountFormate";
import i18n from "@/plugins/i18n";
import type { HospitalProcedureListingType } from "@/components/institution/types";
import { healthPlanLimitOptions, limitTypeDefinitionOptions } from "@/components/institution/create/utils";
import { groupHealthPlanProcedures, orderHealthPlanProcedures } from "@/components/institution/create/healthPlanProcedureOrdering";

type DisplayValue = number | string | null | undefined;

type ExportHealthPlanPdfOptions = {
  healthPlan: any;
  procedures: HospitalProcedureListingType[];
  contextLabel?: string;
  fileName?: string;
  showUsageBalances?: boolean;
  isEmployee?: boolean;
  mainMemberName?: string;
  dependentName?: string;
  allocatedBalance?: DisplayValue;
  remainingBalance?: DisplayValue;
};

const BRAND_BLUE: [number, number, number] = [31, 58, 147];
const SOFT_BLUE: [number, number, number] = [238, 244, 255];

const tr = (key: string, fallback: string) => {
  const translated = (i18n as any).global.t(key);
  return typeof translated === "string" && translated !== key ? translated : fallback;
};

const firstDefined = (...values: DisplayValue[]): DisplayValue =>
  values.find(value => value !== null && value !== undefined && value !== "");

const humanizeEnum = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());

const getTranslatedEnum = (prefix: string, value: string | null | undefined) => {
  if (!value) return "";
  const key = `${prefix}-${value.toString().toLowerCase().replace(/_/g, "-")}`;
  return tr(key, humanizeEnum(value));
};

const getHealthPlanLimitLabel = (value: string | null | undefined) =>
  healthPlanLimitOptions.find(option => option.value === value)?.label || (value ? humanizeEnum(value) : "-");

const getLimitTypeDefinitionLabel = (value: string | null | undefined) =>
  value ? limitTypeDefinitionOptions.find(option => option.value === value)?.label || humanizeEnum(value) : "";

const getProcedureType = (procedure: HospitalProcedureListingType) =>
  procedure.hospitalProcedureType || {};

const getProcedureName = (procedure: HospitalProcedureListingType) =>
  getProcedureType(procedure).name || "-";

const getProcedureCode = (procedure: HospitalProcedureListingType) =>
  getProcedureType(procedure).code || "-";

const getProcedureCategoryName = (procedure: HospitalProcedureListingType) =>
  getProcedureType(procedure).categoryName || tr("t-procedures", "Procedimentos");

const getProcedureGroupName = (procedure: HospitalProcedureListingType) => {
  const group = procedure.hospitalProcedureGroup;
  if (!group) return "-";
  return typeof group === "object" ? group.name || "-" : String(group);
};

const getProcedureSource = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  return item.companyHealthPlanHospitalProcedures
    || item.contractHealthPlanHospitalProcedures
    || item.contractHealthPlanHospitalProcedure
    || item;
};

const getProcedureGroupIdentity = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return String(firstDefined(
    item.hospitalProcedureGroupId,
    source.hospitalProcedureGroupId,
    item.hospitalProcedureGroup?.id,
    source.hospitalProcedureGroup?.id,
    getProcedureGroupName(procedure)
  ));
};

const procedureUsesGroupLimit = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return Boolean(
    item.belongsToGroup
    || source.belongsToGroup
    || firstDefined(source.groupFixedAmount, item.groupFixedAmount, source.groupPercentage, item.groupPercentage, source.hospitalProcedureGroupLimit, item.hospitalProcedureGroupLimit)
  );
};

const getProcedureFixedAmount = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupFixedAmount, item.groupFixedAmount)
    : firstDefined(source.fixedAmount, item.fixedAmount);
};

const getProcedurePercentage = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupPercentage, item.groupPercentage)
    : firstDefined(source.percentage, item.percentage);
};

const getProcedureLimitLabel = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  const limitType = procedureUsesGroupLimit(procedure)
    ? firstDefined(source.hospitalProcedureGroupLimit, item.hospitalProcedureGroupLimit)
    : firstDefined(source.limitTypeDefinition, item.limitTypeDefinition);

  return getLimitTypeDefinitionLabel(limitType as string | null | undefined)
    || getTranslatedEnum("t-limit-type", source.limitType || item.limitType)
    || "-";
};

const formatMoney = (value: DisplayValue) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${amountFormate(Number(value))} MT`;
};

const formatPercent = (value: DisplayValue) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}%`;
};

const getFrequencyLabel = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  const allowedFrequencyUse = firstDefined(source.allowedFrequencyUse, procedure.allowedFrequencyUse);
  const frequencyInterval = firstDefined(source.frequencyInterval, procedure.frequencyInterval);
  if (!allowedFrequencyUse || !frequencyInterval) return "-";

  return `${allowedFrequencyUse}/${frequencyInterval}`;
};

const getWaitingPeriodDays = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  return firstDefined(source.waitingPeriodDays, (procedure as any).waitingPeriodDays) ?? "-";
};

const hasBalanceColumns = (procedures: HospitalProcedureListingType[]) =>
  procedures.some((procedure) => {
    const item = procedure as any;
    return firstDefined(
      item.allocatedBalance,
      item.usedBalance,
      item.totalUsedBalance,
      item.remainingBalance,
      item.groupAllocatedBalance,
      item.groupUsedBalance,
      item.groupRemainingBalance
    ) !== undefined;
  });

const getBalanceValue = (
  procedure: HospitalProcedureListingType,
  individualKey: "allocatedBalance" | "usedBalance" | "remainingBalance",
  groupKey: "groupAllocatedBalance" | "groupUsedBalance" | "groupRemainingBalance"
) => {
  const item = procedure as any;
  const value = procedureUsesGroupLimit(procedure)
    ? item[groupKey] as DisplayValue
    : item[individualKey] as DisplayValue;

  return Number(value || 0);
};

const getProcedureAllocatedBalance = (procedure: HospitalProcedureListingType) =>
  getBalanceValue(procedure, "allocatedBalance", "groupAllocatedBalance");

const getProcedureRemainingBalance = (procedure: HospitalProcedureListingType) =>
  getBalanceValue(procedure, "remainingBalance", "groupRemainingBalance");

const getProcedureTotalUsedBalance = (procedure: HospitalProcedureListingType) =>
  Number(firstDefined((procedure as any).totalUsedBalance, (procedure as any).usedBalance) || 0);

const hasProcedureTotalUsedBalance = (procedure: HospitalProcedureListingType) =>
  getProcedureTotalUsedBalance(procedure) !== 0;

const getGroupLimitProcedure = (procedures: HospitalProcedureListingType[]) =>
  procedures.find(procedure => procedureUsesGroupLimit(procedure)) || procedures[0];

const groupUsesGroupLimit = (procedures: HospitalProcedureListingType[]) =>
  procedures.some(procedure => procedureUsesGroupLimit(procedure));

const getGroupFixedAmount = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureFixedAmount(procedure) : null;
};

const getGroupPercentage = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedurePercentage(procedure) : null;
};

const getGroupAllocatedBalance = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureAllocatedBalance(procedure) : null;
};

const getGroupUsedBalance = (procedures: HospitalProcedureListingType[]) => {
  const groupUsedBalances = procedures.map(procedure => Number((procedure as any).groupUsedBalance || 0));
  const groupUsedBalance = groupUsedBalances.find(value => value !== 0);
  if (groupUsedBalance !== undefined) return groupUsedBalance;

  return procedures.reduce((total, procedure) => total + getProcedureTotalUsedBalance(procedure), 0);
};

const getGroupRemainingBalance = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureRemainingBalance(procedure) : null;
};

const getGroupLimitLabel = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureLimitLabel(procedure) : "-";
};

const getGroupFrequencyLabel = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getFrequencyLabel(procedure) : "-";
};

const getGroupWaitingPeriodDays = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getWaitingPeriodDays(procedure) : "-";
};

const getPlanUsedBalanceTotal = (procedures: HospitalProcedureListingType[]) => {
  const groupedProcedures = new Map<string, HospitalProcedureListingType[]>();
  let total = 0;

  procedures.forEach((procedure) => {
    if (procedureUsesGroupLimit(procedure)) {
      const groupKey = getProcedureGroupIdentity(procedure);
      groupedProcedures.set(groupKey, [...(groupedProcedures.get(groupKey) || []), procedure]);
      return;
    }

    total += getProcedureTotalUsedBalance(procedure);
  });

  groupedProcedures.forEach((groupProcedures) => {
    total += Number(getGroupUsedBalance(groupProcedures) || 0);
  });

  return total;
};

const getPlanName = (healthPlan: any) =>
  healthPlan?.coveragePeriod?.name
  || healthPlan?.coveragePeriodName
  || healthPlan?.name
  || tr("t-health-plan", "Plano de Saude");

const safeFileName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const buildGroupedRows = (procedures: HospitalProcedureListingType[], includeBalances: boolean) => {
  const groupColSpan = includeBalances ? 9 : 6;
  const groupMap = procedures.reduce((groups, procedure) => {
    const group = getProcedureGroupName(procedure);
    if (!groups[group]) groups[group] = [];
    groups[group].push(procedure);
    return groups;
  }, {} as Record<string, HospitalProcedureListingType[]>);

  return Object.entries(groupMap).flatMap(([group, groupProcedures]) => {
    const categoryMap = groupProcedures.reduce((categories, procedure) => {
      const category = getProcedureCategoryName(procedure);
      if (!categories[category]) categories[category] = [];
      categories[category].push(procedure);
      return categories;
    }, {} as Record<string, HospitalProcedureListingType[]>);

    const rows: any[] = [
      [{ content: group, colSpan: groupColSpan, styles: { fillColor: SOFT_BLUE, textColor: BRAND_BLUE, fontStyle: "bold" } }]
    ];

    if (groupUsesGroupLimit(groupProcedures)) {
      rows.push(includeBalances
        ? [
          {
            content: "Limite do grupo",
            colSpan: 2,
            styles: { fillColor: [246, 249, 255], textColor: BRAND_BLUE, fontStyle: "bold" }
          },
          formatMoney(getGroupFixedAmount(groupProcedures)),
          formatPercent(getGroupPercentage(groupProcedures)),
          formatMoney(getGroupAllocatedBalance(groupProcedures)),
          formatMoney(getGroupUsedBalance(groupProcedures)),
          formatMoney(getGroupRemainingBalance(groupProcedures)),
          getGroupLimitLabel(groupProcedures),
          getGroupFrequencyLabel(groupProcedures)
        ]
        : [
          {
            content: "Limite do grupo",
            colSpan: 2,
            styles: { fillColor: [246, 249, 255], textColor: BRAND_BLUE, fontStyle: "bold" }
          },
          formatMoney(getGroupFixedAmount(groupProcedures)),
          formatPercent(getGroupPercentage(groupProcedures)),
          getGroupLimitLabel(groupProcedures),
          getGroupFrequencyLabel(groupProcedures)
        ]);
    }

    Object.entries(categoryMap).forEach(([category, categoryProcedures]) => {
      rows.push([
        {
          content: `${category} - ${categoryProcedures.length} ${tr("t-procedures", "procedimentos").toLowerCase()}`,
          colSpan: groupColSpan,
          styles: { fillColor: [245, 246, 248], textColor: [70, 70, 70], fontStyle: "bold" }
        }
      ]);

      categoryProcedures.forEach((procedure) => {
        if (procedureUsesGroupLimit(procedure)) {
          rows.push([
            getProcedureCode(procedure),
            getProcedureName(procedure),
            "-",
            "-",
            ...(includeBalances
              ? [
                "-",
                hasProcedureTotalUsedBalance(procedure) ? formatMoney(getProcedureTotalUsedBalance(procedure)) : "-",
                "-",
                "-",
                "-"
              ]
              : [
                "-",
                "-"
              ])
          ]);
          return;
        }

        rows.push(includeBalances
          ? [
            getProcedureCode(procedure),
            getProcedureName(procedure),
            formatMoney(getProcedureFixedAmount(procedure)),
            formatPercent(getProcedurePercentage(procedure)),
            formatMoney(getProcedureAllocatedBalance(procedure)),
            formatMoney(getProcedureTotalUsedBalance(procedure)),
            formatMoney(getProcedureRemainingBalance(procedure)),
            getProcedureLimitLabel(procedure),
            getFrequencyLabel(procedure)
          ]
          : [
            getProcedureCode(procedure),
            getProcedureName(procedure),
            formatMoney(getProcedureFixedAmount(procedure)),
            formatPercent(getProcedurePercentage(procedure)),
            getProcedureLimitLabel(procedure),
            getFrequencyLabel(procedure)
          ]);
      });
    });

    return rows;
  });
};

export const exportHealthPlanToPdf = async ({
  healthPlan,
  procedures,
  contextLabel,
  fileName,
  showUsageBalances,
  isEmployee = true,
  mainMemberName,
  dependentName,
  allocatedBalance,
  remainingBalance
}: ExportHealthPlanPdfOptions) => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);
  const planName = getPlanName(healthPlan);
  const generatedAt = new Date().toLocaleString("pt-PT");
  const includeBalances = showUsageBalances ?? hasBalanceColumns(procedures);
  const isDependentPlan = !isEmployee;
  const tableHead = includeBalances
    ? [[
      tr("t-code", "Codigo"),
      tr("t-procedures", "Procedimentos"),
      tr("t-fixed-amount", "Valor fixo"),
      tr("t-percentage", "Percentagem"),
      "Alocado",
      "Gasto",
      "Remanescente",
      tr("t-limit-type", "Tipo de limite"),
      tr("t-frequency-interval", "Intervalo de frequencia")
    ]]
    : [[
      tr("t-code", "Codigo"),
      tr("t-procedures", "Procedimentos"),
      tr("t-fixed-amount", "Valor fixo"),
      tr("t-percentage", "Percentagem"),
      tr("t-limit-type", "Tipo de limite"),
      tr("t-frequency-interval", "Intervalo de frequencia")
    ]];
  const columnStyles: NonNullable<UserOptions["columnStyles"]> = includeBalances
    ? {
      0: { cellWidth: 17 },
      1: { cellWidth: 54 },
      2: { cellWidth: 27 },
      3: { cellWidth: 21 },
      4: { cellWidth: 28 },
      5: { cellWidth: 27 },
      6: { cellWidth: 30 },
      7: { cellWidth: 35 },
      8: { cellWidth: 34 }
    }
    : {
      0: { cellWidth: 24 },
      1: { cellWidth: 98 },
      2: { cellWidth: 36 },
      3: { cellWidth: 27 },
      4: { cellWidth: 42 },
      5: { cellWidth: 46 }
    };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(35, 35, 35);
  pdf.text(tr("t-health-plan", "Plano de Saude"), margin, 16);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(95, 95, 95);
  pdf.text(`Periodo: ${planName}`, margin, 22);
  if (contextLabel && !isDependentPlan && !mainMemberName) {
    pdf.text(contextLabel, pageWidth - margin, 22, { align: "right" });
  }

  let dividerY = 27;
  let cardsY = 32;
  let tableStartY = 58;

  if (mainMemberName || isDependentPlan) {
    pdf.text(`${tr("t-main-member", "Membro Principal")}: ${mainMemberName || contextLabel || "-"}`, margin, 28);
    if (isDependentPlan) {
      pdf.text(`${tr("t-dependent", "Dependente")}: ${dependentName || contextLabel || "-"}`, pageWidth - margin, 28, { align: "right" });
    }
    dividerY = 33;
    cardsY = 38;
    tableStartY = 64;
  }

  const cards = includeBalances
    ? [
      ["Alocado", formatMoney(firstDefined(allocatedBalance, healthPlan?.allocatedBalance))],
      ["Gasto", formatMoney(getPlanUsedBalanceTotal(procedures))],
      ["Remanescente", formatMoney(firstDefined(remainingBalance, healthPlan?.remainingBalance))],
      [tr("t-procedures", "Procedimentos"), String(procedures.length)]
    ]
    : [
      [tr("t-health-plan-limit", "Limite do plano"), getHealthPlanLimitLabel(healthPlan?.healthPlanLimit)],
      [tr("t-fixed-amount", "Valor fixo"), formatMoney(healthPlan?.fixedAmount)],
      [tr("t-percentage", "Percentagem"), formatPercent(healthPlan?.companyContributionPercentage)],
      [tr("t-procedures", "Procedimentos"), String(procedures.length)]
    ];

  const cardGap = 4;
  const cardWidth = (contentWidth - (cardGap * (cards.length - 1))) / cards.length;
  cards.forEach(([label, value], index) => {
    const x = margin + (index * (cardWidth + cardGap));
    pdf.setDrawColor(222, 226, 232);
    pdf.setFillColor(249, 250, 252);
    pdf.roundedRect(x, cardsY, cardWidth, 18, 2, 2, "FD");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(110, 110, 110);
    pdf.text(label, x + 4, cardsY + 7);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(35, 35, 35);
    pdf.text(String(value || "-"), x + 4, cardsY + 14);
  });

  autoTable(pdf, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
    head: tableHead,
    body: buildGroupedRows(procedures, includeBalances),
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      lineWidth: 0.1,
      lineColor: [226, 226, 226],
      valign: "middle"
    },
    headStyles: {
      fillColor: BRAND_BLUE,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5
    },
    columnStyles,
    didParseCell: (data: any) => {
      if (data.section === "body" && Array.isArray(data.row.raw) && data.row.raw[0]?.colSpan === (includeBalances ? 9 : 6)) {
        data.cell.styles.cellPadding = 2.4;
        data.cell.styles.fontSize = 7.4;
      }
    }
  });

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${page}/${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    pdf.text(`${tr("t-generated-at", "Gerado em")}: ${generatedAt}`, pageWidth / 2, pageHeight - 8, { align: "center" });
    pdf.text(tr("t-health-plan", "Plano de Saude"), margin, pageHeight - 8);
  }

  pdf.save(fileName || `${safeFileName(planName || "plano_de_saude")}.pdf`);
};
