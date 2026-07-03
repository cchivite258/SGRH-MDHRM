import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { amountFormate } from "@/app/common/amountFormate";
import i18n from "@/plugins/i18n";
import type { HospitalProcedureListingType } from "@/components/institution/types";
import { healthPlanLimitOptions, limitTypeDefinitionOptions } from "@/components/institution/create/utils";

type DisplayValue = number | string | null | undefined;

type ExportHealthPlanPdfOptions = {
  healthPlan: any;
  procedures: HospitalProcedureListingType[];
  contextLabel?: string;
  fileName?: string;
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

const procedureUsesGroupLimit = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  return Boolean(
    source.belongsToGroup
    || firstDefined(source.groupFixedAmount, source.groupPercentage, source.hospitalProcedureGroupLimit)
  );
};

const getProcedureFixedAmount = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupFixedAmount, source.fixedAmount)
    : firstDefined(source.fixedAmount, source.groupFixedAmount);
};

const getProcedurePercentage = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupPercentage, source.percentage)
    : firstDefined(source.percentage, source.groupPercentage);
};

const getProcedureLimitLabel = (procedure: HospitalProcedureListingType) =>
  getLimitTypeDefinitionLabel(procedureUsesGroupLimit(procedure)
    ? getProcedureSource(procedure).hospitalProcedureGroupLimit
    : getProcedureSource(procedure).limitTypeDefinition)
  || getTranslatedEnum("t-limit-type", getProcedureSource(procedure).limitType)
  || "-";

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

  const limitTypeLabel = getTranslatedEnum("t-limit-type", source.limitType || (procedure as any).limitType);
  return limitTypeLabel
    ? `${allowedFrequencyUse}/${frequencyInterval} ${limitTypeLabel}`
    : `${allowedFrequencyUse}/${frequencyInterval}`;
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

const buildGroupedRows = (procedures: HospitalProcedureListingType[]) => {
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
      [{ content: group, colSpan: 6, styles: { fillColor: SOFT_BLUE, textColor: BRAND_BLUE, fontStyle: "bold" } }]
    ];

    Object.entries(categoryMap).forEach(([category, categoryProcedures]) => {
      rows.push([
        {
          content: `${category} - ${categoryProcedures.length} ${tr("t-procedures", "procedimentos").toLowerCase()}`,
          colSpan: 6,
          styles: { fillColor: [245, 246, 248], textColor: [70, 70, 70], fontStyle: "bold" }
        }
      ]);

      categoryProcedures.forEach((procedure) => {
        rows.push([
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
  fileName
}: ExportHealthPlanPdfOptions) => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);
  const planName = getPlanName(healthPlan);
  const generatedAt = new Date().toLocaleString("pt-PT");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(35, 35, 35);
  pdf.text(tr("t-health-plan", "Plano de Saude"), margin, 16);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(95, 95, 95);
  pdf.text(`Periodo: ${planName}`, margin, 22);
  if (contextLabel) {
    pdf.text(contextLabel, pageWidth - margin, 22, { align: "right" });
  }

  pdf.setDrawColor(215, 215, 215);
  pdf.line(margin, 27, pageWidth - margin, 27);

  const cards = [
    [tr("t-health-plan-limit", "Limite do plano"), getHealthPlanLimitLabel(healthPlan?.healthPlanLimit)],
    [tr("t-fixed-amount", "Valor fixo"), formatMoney(healthPlan?.fixedAmount)],
    [tr("t-percentage", "Percentagem"), formatPercent(healthPlan?.companyContributionPercentage)],
    [tr("t-procedures", "Procedimentos"), String(procedures.length)]
  ];

  const cardGap = 4;
  const cardWidth = (contentWidth - (cardGap * 3)) / 4;
  cards.forEach(([label, value], index) => {
    const x = margin + (index * (cardWidth + cardGap));
    pdf.setDrawColor(222, 226, 232);
    pdf.setFillColor(249, 250, 252);
    pdf.roundedRect(x, 32, cardWidth, 18, 2, 2, "FD");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(110, 110, 110);
    pdf.text(label, x + 4, 39);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(35, 35, 35);
    pdf.text(String(value || "-"), x + 4, 46);
  });

  autoTable(pdf, {
    startY: 58,
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
    head: [[
      tr("t-code", "Codigo"),
      tr("t-procedures", "Procedimentos"),
      tr("t-fixed-amount", "Valor fixo"),
      tr("t-percentage", "Percentagem"),
      tr("t-limit-type", "Tipo de limite"),
      tr("t-frequency-interval", "Intervalo de frequencia")
    ]],
    body: buildGroupedRows(procedures),
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
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 98 },
      2: { cellWidth: 36 },
      3: { cellWidth: 27 },
      4: { cellWidth: 42 },
      5: { cellWidth: 46 }
    },
    didParseCell: (data: any) => {
      if (data.section === "body" && Array.isArray(data.row.raw) && data.row.raw[0]?.colSpan === 6) {
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
