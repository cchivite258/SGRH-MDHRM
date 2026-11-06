import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import i18n from "@/plugins/i18n";
import { amountFormate } from "@/app/common/amountFormate";
import {
  contractLabel,
  formatIsoDate,
  formatMonthYear,
  statusLabelKey,
} from "@/components/paymentOrderPeriod/listView/utils";
import {
  computeTotals,
  employeeName,
  employeeNumber,
  formatDateTime,
  isLineSettled,
  lineBalance,
  lineTypeLabelKey,
  settledAmount,
  settlementPercent,
  toAmount,
} from "@/components/paymentOrderPeriod/lines/utils";
import type {
  PaymentOrderLine,
  PaymentOrderLineType,
  PaymentOrderPeriodListing,
  PaymentOrderPeriodStatus,
  PaymentOrderTotals,
} from "@/components/paymentOrderPeriod/types";

export interface PaymentOrderBatchExportOptions {
  fileName?: string;
}

type Rgb = [number, number, number];

export class PaymentOrderBatchExporter {
  private static readonly SOFT_BLUE = "DCEBFF";
  private static readonly LIGHT_GRAY = "F8F9FA";
  private static readonly BORDER = "D9D9D9";
  private static readonly CARD_BORDER = "C9D3E0";

  private static readonly EXCEL_COLORS = {
    text: "212529",
    muted: "64748B",
    primary: "3577F1",
    success: "0AB39C",
    successFill: "E7F7F5",
    danger: "F06548",
    dangerFill: "FDEDE9",
    warning: "E6911E",
  };

  private static readonly EXCEL_STATUS_COLORS: Record<PaymentOrderPeriodStatus, { text: string; fill: string }> = {
    OPEN: { text: "299CDB", fill: "E5F3FB" },
    GENERATED: { text: "3577F1", fill: "E7EFFD" },
    CLOSED: { text: "C77C0E", fill: "FEF4E4" },
    POSTED: { text: "0AB39C", fill: "E7F7F5" },
  };

  private static readonly PDF_COLORS = {
    text: [33, 37, 41] as Rgb,
    muted: [100, 116, 139] as Rgb,
    border: [232, 237, 243] as Rgb,
    track: [224, 224, 224] as Rgb,
    primary: [53, 119, 241] as Rgb,
    success: [10, 179, 156] as Rgb,
    danger: [240, 101, 72] as Rgb,
    warning: [230, 145, 30] as Rgb,
    info: [41, 156, 219] as Rgb,
  };

  private static readonly PDF_STATUS_COLORS: Record<PaymentOrderPeriodStatus, Rgb> = {
    OPEN: PaymentOrderBatchExporter.PDF_COLORS.info,
    GENERATED: PaymentOrderBatchExporter.PDF_COLORS.primary,
    CLOSED: PaymentOrderBatchExporter.PDF_COLORS.warning,
    POSTED: PaymentOrderBatchExporter.PDF_COLORS.success,
  };

  private static tr(key: string, params?: Record<string, unknown>): string {
    const translated = (i18n as any).global.t(key, params);
    return typeof translated === "string" ? translated : String(translated);
  }

  private static localeCode(): string {
    const rawLocale = (i18n as any).global.locale;
    const locale = typeof rawLocale === "string" ? rawLocale : rawLocale?.value;
    return locale === "en" ? "en-US" : "pt-PT";
  }

  private static getCurrentDateTime(): string {
    return new Date().toLocaleDateString(this.localeCode(), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private static getCurrentDate(): string {
    return new Date().toLocaleDateString(this.localeCode());
  }

  private static money(value: unknown): string {
    return `${amountFormate(toAmount(value))} MT`;
  }

  private static lineType(line: PaymentOrderLine): string {
    return line.type ? this.tr(lineTypeLabelKey(line.type)) : "-";
  }

  private static title(period: PaymentOrderPeriodListing): string {
    return `${this.tr("t-payment-order-batch-report-title")} - ${formatMonthYear(period.month, period.year)}`;
  }

  static defaultFileName(period: PaymentOrderPeriodListing): string {
    const contract = contractLabel(period)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase();
    const month = String(period.month).padStart(2, "0");
    return `lote-${contract || "contrato"}-${period.year}-${month}`;
  }

  static async exportToPDF(
    period: PaymentOrderPeriodListing,
    lines: PaymentOrderLine[],
    userName: string,
    options?: PaymentOrderBatchExportOptions
  ): Promise<void> {
    const totals = computeTotals(lines);

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    const generatedAt = this.getCurrentDateTime();

    this.addPDFHeader(pdf, period, margin, pageWidth);

    const infoCardY = margin + 22;
    const infoCardHeight = this.drawPDFInfoCard(pdf, period, totals, margin, infoCardY, contentWidth);

    const typeCardsY = infoCardY + infoCardHeight + 4;
    const typeCardsHeight = this.drawPDFTypeCards(pdf, lines, margin, typeCardsY, contentWidth);

    autoTable(pdf, {
      startY: typeCardsY + typeCardsHeight + 6,
      margin: { left: margin, right: margin, bottom: 30 },
      head: [[
        this.tr("t-employee-number"),
        this.tr("t-employee"),
        this.tr("t-type"),
        this.tr("t-payment-order-total-refund"),
        this.tr("t-payment-order-total-deduction"),
        this.tr("t-payment-order-previous-balance"),
        this.tr("t-payment-order-amount-to-pay"),
        this.tr("t-payment-order-amount-settled"),
        this.tr("t-payment-order-balance"),
        this.tr("t-notes"),
      ]],
      body: lines.map(line => [
        employeeNumber(line),
        employeeName(line),
        this.lineType(line),
        this.money(line.totalRefund),
        this.money(line.totalDeduction),
        this.money(line.previousBalance),
        this.money(line.amountToPay),
        this.money(settledAmount(line)),
        this.money(lineBalance(line)),
        line.notes || "-",
      ]),
      foot: [[
        this.tr("t-totals").toUpperCase(),
        "",
        String(totals.lines),
        this.money(totals.totalRefund),
        this.money(totals.totalDeduction),
        this.money(totals.previousBalance),
        this.money(totals.amountToPay),
        this.money(totals.amountSettled),
        this.money(totals.balance),
        "",
      ]],
      theme: "grid",
      styles: { fontSize: 7.2, cellPadding: 1.8, lineWidth: 0.1, lineColor: [200, 200, 200], overflow: "linebreak" },
      headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
      footStyles: { fillColor: [248, 249, 250], textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 252, 255] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 46 },
        2: { cellWidth: 20 },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
        9: { cellWidth: 38 },
      },
      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 8) {
          const line = lines[data.row.index];
          data.cell.styles.textColor = line && isLineSettled(line) ? [46, 125, 50] : [239, 108, 0];
        }
        if (data.section === "foot" && data.column.index === 7) {
          data.cell.styles.textColor = [46, 125, 50];
        }
      },
    });

    this.addPDFFooterAllPages(pdf, margin, pageWidth, pageHeight, generatedAt, userName);

    pdf.save(`${options?.fileName || this.defaultFileName(period)}.pdf`);
  }

  private static infoItems(period: PaymentOrderPeriodListing): { label: string; value: string }[] {
    return [
      { label: "t-contract", value: contractLabel(period) },
      { label: "t-period", value: formatMonthYear(period.month, period.year) },
      { label: "t-start-date", value: formatIsoDate(period.startDate) },
      { label: "t-end-date", value: formatIsoDate(period.endDate) },
      { label: "t-payment-order-generated-at", value: period.generatedAt ? formatDateTime(period.generatedAt) : "" },
      { label: "t-payment-order-closed-at", value: period.closedAt ? formatDateTime(period.closedAt) : "" },
      { label: "t-payment-order-posted-at", value: period.postedAt ? formatDateTime(period.postedAt) : "" },
    ]
      .filter(item => item.value)
      .map(item => ({ label: this.tr(item.label), value: item.value }));
  }

  private static typeSummaries(lines: PaymentOrderLine[]) {
    return (["REFUND", "DEDUCTION"] as PaymentOrderLineType[]).map(type => {
      const totals = computeTotals(lines.filter(line => line.type === type));
      return {
        type,
        title: this.tr(type === "REFUND" ? "t-payment-order-refunds" : "t-payment-order-deductions"),
        subtitle: this.tr("t-payment-order-settled-lines", { settled: totals.settledLines, total: totals.lines }),
        percent: settlementPercent(totals),
        totals,
        hasBalance: Math.round(totals.balance * 100) !== 0,
      };
    });
  }

  private static fitText(pdf: jsPDF, text: string, maxWidth: number): string {
    let output = text || "";
    while (pdf.getTextWidth(output) > maxWidth && output.length > 1) {
      output = `${output.slice(0, -4)}...`;
    }
    return output;
  }

  private static drawProgressBar(pdf: jsPDF, x: number, y: number, width: number, percent: number, color: Rgb): void {
    const height = 1.8;
    pdf.setFillColor(...this.PDF_COLORS.track);
    pdf.roundedRect(x, y, width, height, 0.9, 0.9, "F");
    const filled = (width * Math.min(100, Math.max(0, percent))) / 100;
    if (filled > 0) {
      pdf.setFillColor(...color);
      pdf.roundedRect(x, y, Math.max(filled, height), height, 0.9, 0.9, "F");
    }
  }

  private static drawPDFInfoCard(
    pdf: jsPDF,
    period: PaymentOrderPeriodListing,
    totals: PaymentOrderTotals,
    x: number,
    y: number,
    width: number
  ): number {
    const height = 29;
    const padding = 5;
    const colors = this.PDF_COLORS;

    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.2);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, y, width, height, 2.5, 2.5, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...colors.muted);
    const eyebrow = this.tr("t-payment-order-batch-info").toUpperCase();
    pdf.text(eyebrow, x + padding, y + 6);

    const statusText = this.tr(statusLabelKey(period.status));
    const statusColor = this.PDF_STATUS_COLORS[period.status] ?? colors.primary;
    pdf.setFontSize(6.5);
    const pillWidth = pdf.getTextWidth(statusText) + 5;
    const pillX = x + padding + pdf.getTextWidth(eyebrow) + 4;
    pdf.setFillColor(...this.tint(statusColor));
    pdf.roundedRect(pillX, y + 2.9, pillWidth, 4, 1, 1, "F");
    pdf.setTextColor(...statusColor);
    pdf.text(statusText, pillX + 2.5, y + 5.75);

    const items = this.infoItems(period);
    const itemWidth = (width - padding * 2) / items.length;
    items.forEach((item, index) => {
      const itemX = x + padding + itemWidth * index;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.setTextColor(...colors.muted);
      pdf.text(this.fitText(pdf, item.label, itemWidth - 3), itemX, y + 12.5);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...colors.text);
      pdf.text(this.fitText(pdf, item.value, itemWidth - 3), itemX, y + 17);
    });

    const percent = settlementPercent(totals);
    const progressColor = percent >= 100 ? colors.success : percent > 0 ? colors.primary : colors.muted;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.setTextColor(...colors.muted);
    pdf.text(this.tr("t-payment-order-settlement-progress"), x + padding, y + 22.5);
    pdf.setTextColor(...colors.text);
    const percentText = `${percent}%`;
    pdf.text(percentText, x + width - padding - pdf.getTextWidth(percentText), y + 22.5);
    this.drawProgressBar(pdf, x + padding, y + 24, width - padding * 2, percent, progressColor);

    return height;
  }

  private static drawPDFTypeCards(pdf: jsPDF, lines: PaymentOrderLine[], x: number, y: number, width: number): number {
    const height = 31;
    const gap = 4;
    const padding = 5;
    const cardWidth = (width - gap) / 2;
    const colors = this.PDF_COLORS;

    this.typeSummaries(lines).forEach((summary, index) => {
      const cardX = x + (cardWidth + gap) * index;
      const accent = summary.type === "REFUND" ? colors.success : colors.danger;

      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.2);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(cardX, y, cardWidth, height, 2.5, 2.5, "FD");

      const iconX = cardX + padding;
      const iconY = y + 3.5;
      const iconSize = 8;
      pdf.setFillColor(...this.tint(accent));
      pdf.roundedRect(iconX, iconY, iconSize, iconSize, 1.5, 1.5, "F");
      this.drawArrowIcon(pdf, iconX + iconSize / 2, iconY + iconSize / 2, summary.type === "REFUND" ? "down" : "up", accent);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.text);
      pdf.text(summary.title, iconX + iconSize + 3, y + 7);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(...colors.muted);
      pdf.text(summary.subtitle, iconX + iconSize + 3, y + 10.8);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(...colors.text);
      const percentText = `${summary.percent}%`;
      pdf.text(percentText, cardX + cardWidth - padding - pdf.getTextWidth(percentText), y + 9.5);

      this.drawProgressBar(pdf, cardX + padding, y + 14, cardWidth - padding * 2, summary.percent, accent);

      const values: { label: string; value: string; color: Rgb }[] = [
        { label: this.tr("t-payment-order-amount-to-pay"), value: this.money(summary.totals.amountToPay), color: colors.text },
        { label: this.tr("t-payment-order-amount-settled"), value: this.money(summary.totals.amountSettled), color: colors.success },
        { label: this.tr("t-payment-order-balance"), value: this.money(summary.totals.balance), color: summary.hasBalance ? colors.warning : colors.text },
      ];
      const valueWidth = (cardWidth - padding * 2) / values.length;
      values.forEach((item, valueIndex) => {
        const valueX = cardX + padding + valueWidth * valueIndex;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.5);
        pdf.setTextColor(...colors.muted);
        pdf.text(this.fitText(pdf, item.label.toUpperCase(), valueWidth - 2), valueX, y + 21);
        pdf.setFontSize(9.5);
        pdf.setTextColor(...item.color);
        pdf.text(this.fitText(pdf, item.value, valueWidth - 2), valueX, y + 26.5);
      });
    });

    return height;
  }

  private static drawArrowIcon(pdf: jsPDF, cx: number, cy: number, direction: "up" | "down", color: Rgb): void {
    const sign = direction === "down" ? 1 : -1;
    pdf.setDrawColor(...color);
    pdf.setFillColor(...color);
    pdf.setLineWidth(0.35);
    pdf.circle(cx, cy, 2.7, "S");
    pdf.line(cx, cy - 1.5 * sign, cx, cy + 0.3 * sign);
    pdf.triangle(cx - 1.1, cy + 0.1 * sign, cx + 1.1, cy + 0.1 * sign, cx, cy + 1.5 * sign, "F");
  }

  private static tint(color: Rgb, amount = 0.86): Rgb {
    return color.map(channel => Math.round(channel + (255 - channel) * amount)) as Rgb;
  }

  private static addPDFHeader(pdf: jsPDF, period: PaymentOrderPeriodListing, margin: number, pageWidth: number): void {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(this.title(period), margin, margin);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `${this.tr("t-payment-order-batches-subtitle")} - ${this.tr("t-status")}: ${this.tr(statusLabelKey(period.status))}`,
      margin,
      margin + 6
    );

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(contractLabel(period), margin, margin + 13);

    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(margin, margin + 18, pageWidth - margin, margin + 18);
  }

  private static addPDFFooterAllPages(
    pdf: jsPDF,
    margin: number,
    pageWidth: number,
    pageHeight: number,
    generatedAt: string,
    userName: string
  ): void {
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const footerY = pageHeight - 10;
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 6, pageWidth - margin, footerY - 6);

      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);

      const footerText = this.tr("t-spr-system-footer");
      const pageText = this.tr("t-spr-page-of", { current: i, total: totalPages });
      const dateFooter = `${this.tr("t-spr-date")}: ${this.getCurrentDate()}`;
      const generatedText = `${this.tr("t-spr-generated-at")}: ${generatedAt}`;
      const userFooter = `${this.tr("t-spr-user")}: ${userName || this.tr("t-spr-system-user")}`;

      pdf.text(footerText, margin, footerY - 2);
      pdf.text(generatedText, margin, footerY - 8);
      pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), footerY - 2);
      pdf.text(dateFooter, pageWidth - margin - pdf.getTextWidth(dateFooter), footerY - 8);
      pdf.text(userFooter, pageWidth - margin - pdf.getTextWidth(userFooter), footerY - 14);
    }
  }

  static async exportToExcel(
    period: PaymentOrderPeriodListing,
    lines: PaymentOrderLine[],
    userName: string,
    options?: PaymentOrderBatchExportOptions
  ): Promise<void> {
    const totals = computeTotals(lines);
    const columns = 10;
    const blankRow = () => Array<string | number>(columns).fill("");
    const merges: XLSX.Range[] = [];
    const merge = (row: number, startCol: number, endCol: number) => {
      if (endCol > startCol) merges.push({ s: { r: row, c: startCol }, e: { r: row, c: endCol } });
    };

    const data: (string | number)[][] = [];
    const addRow = (row: (string | number)[] = blankRow()) => data.push(row) - 1;

    const titleRowIndex = addRow();
    data[titleRowIndex][0] = this.title(period).toUpperCase();
    merge(titleRowIndex, 0, columns - 1);
    const subtitleRowIndex = addRow();
    data[subtitleRowIndex][0] = this.tr("t-payment-order-batches-subtitle");
    merge(subtitleRowIndex, 0, columns - 1);
    addRow();

    const infoItems = this.infoItems(period);
    const infoHeaderRow = addRow();
    data[infoHeaderRow][0] = this.tr("t-payment-order-batch-info").toUpperCase();
    data[infoHeaderRow][8] = this.tr(statusLabelKey(period.status));
    merge(infoHeaderRow, 0, 7);
    merge(infoHeaderRow, 8, 9);
    const infoLabelRow = addRow();
    const infoValueRow = addRow();
    infoItems.forEach((item, index) => {
      data[infoLabelRow][index] = item.label;
      data[infoValueRow][index] = item.value;
    });
    const percent = settlementPercent(totals);
    const infoProgressRow = addRow();
    data[infoProgressRow][0] = this.tr("t-payment-order-settlement-progress");
    data[infoProgressRow][8] = percent / 100;
    merge(infoProgressRow, 0, 7);
    merge(infoProgressRow, 8, 9);
    addRow();

    const typeBlocks = [
      { startCol: 0, endCol: 3, valueCols: [[0, 0], [1, 1], [2, 3]] },
      { startCol: 5, endCol: 9, valueCols: [[5, 5], [6, 7], [8, 9]] },
    ];
    const summaries = this.typeSummaries(lines);
    const typeTitleRow = addRow();
    const typeSubtitleRow = addRow();
    const typeLabelRow = addRow();
    const typeValueRow = addRow();
    summaries.forEach((summary, index) => {
      const block = typeBlocks[index];
      data[typeTitleRow][block.startCol] = summary.title;
      data[typeTitleRow][block.endCol] = summary.percent / 100;
      merge(typeTitleRow, block.startCol, block.endCol - 1);
      data[typeSubtitleRow][block.startCol] = summary.subtitle;
      merge(typeSubtitleRow, block.startCol, block.endCol);
      const values = [
        [this.tr("t-payment-order-amount-to-pay"), summary.totals.amountToPay],
        [this.tr("t-payment-order-amount-settled"), summary.totals.amountSettled],
        [this.tr("t-payment-order-balance"), summary.totals.balance],
      ] as const;
      values.forEach(([label, value], valueIndex) => {
        const [startCol, endCol] = block.valueCols[valueIndex];
        data[typeLabelRow][startCol] = label.toUpperCase();
        data[typeValueRow][startCol] = value;
        merge(typeLabelRow, startCol, endCol);
        merge(typeValueRow, startCol, endCol);
      });
    });
    addRow();

    const sectionRowIndex = addRow();
    data[sectionRowIndex][0] = this.tr("t-payment-order-batch-lines").toUpperCase();
    merge(sectionRowIndex, 0, columns - 1);

    const headerRowIndex = addRow(
      [
        this.tr("t-employee-number"),
        this.tr("t-employee"),
        this.tr("t-type"),
        `${this.tr("t-payment-order-total-refund")} (MT)`,
        `${this.tr("t-payment-order-total-deduction")} (MT)`,
        `${this.tr("t-payment-order-previous-balance")} (MT)`,
        `${this.tr("t-payment-order-amount-to-pay")} (MT)`,
        `${this.tr("t-payment-order-amount-settled")} (MT)`,
        `${this.tr("t-payment-order-balance")} (MT)`,
        this.tr("t-notes"),
      ]
    );
    const firstLineRow = data.length;
    lines.forEach(line => addRow([
      employeeNumber(line),
      employeeName(line),
      this.lineType(line),
      toAmount(line.totalRefund),
      toAmount(line.totalDeduction),
      toAmount(line.previousBalance),
      toAmount(line.amountToPay),
      settledAmount(line),
      lineBalance(line),
      line.notes || "",
    ]));
    const totalsRowIndex = addRow([
      this.tr("t-totals").toUpperCase(),
      "",
      totals.lines,
      totals.totalRefund,
      totals.totalDeduction,
      totals.previousBalance,
      totals.amountToPay,
      totals.amountSettled,
      totals.balance,
      "",
    ]);
    addRow();
    const generatedRowIndex = addRow();
    data[generatedRowIndex][0] = this.tr("t-generated-by");
    data[generatedRowIndex][1] = userName || this.tr("t-spr-system-user");
    data[generatedRowIndex][2] = this.tr("t-spr-generated-at");
    data[generatedRowIndex][3] = this.getCurrentDateTime();
    const footerRowIndex = addRow();
    data[footerRowIndex][0] = this.tr("t-spr-system-footer");
    merge(footerRowIndex, 0, columns - 1);

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 16 }, { wch: 34 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 36 }];
    ws["!merges"] = merges;

    const thin = { style: "thin", color: { rgb: this.BORDER } };
    const cardBorder = { style: "thin", color: { rgb: this.CARD_BORDER } };
    const border = { top: thin, bottom: thin, left: thin, right: thin };
    const cellAt = (row: number, col: number) => {
      const ref = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[ref]) ws[ref] = { t: "s", v: "" };
      return ws[ref];
    };
    const setStyle = (row: number, col: number, style: Record<string, unknown>, format?: string) => {
      const cell = cellAt(row, col);
      cell.s = { ...(cell.s || {}), ...style };
      if (format) cell.z = format;
    };
    const styleCard = (startRow: number, endRow: number, startCol: number, endCol: number, fill = "FFFFFF") => {
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          setStyle(row, col, {
            fill: { fgColor: { rgb: fill } },
            border: {
              ...(row === startRow ? { top: cardBorder } : {}),
              ...(row === endRow ? { bottom: cardBorder } : {}),
              ...(col === startCol ? { left: cardBorder } : {}),
              ...(col === endCol ? { right: cardBorder } : {}),
            },
            alignment: { vertical: "center", wrapText: true },
          });
        }
      }
    };
    const font = (style: Record<string, unknown>) => ({ font: { name: "Calibri", ...style } });
    const moneyFormat = '#,##0.00 "MT"';

    setStyle(titleRowIndex, 0, { ...font({ sz: 14, bold: true, color: { rgb: "FFFFFF" } }), fill: { fgColor: { rgb: "1F3A93" } } });
    setStyle(subtitleRowIndex, 0, font({ sz: 10, italic: true, color: { rgb: "555555" } }));

    const statusColor = this.EXCEL_STATUS_COLORS[period.status] ?? this.EXCEL_COLORS.primary;
    styleCard(infoHeaderRow, infoProgressRow, 0, columns - 1);
    setStyle(infoHeaderRow, 0, font({ sz: 9, bold: true, color: { rgb: this.EXCEL_COLORS.muted } }));
    setStyle(infoHeaderRow, 8, {
      ...font({ sz: 9, bold: true, color: { rgb: statusColor.text } }),
      fill: { fgColor: { rgb: statusColor.fill } },
      alignment: { horizontal: "center", vertical: "center" },
    });
    setStyle(infoHeaderRow, 9, { fill: { fgColor: { rgb: statusColor.fill } } });
    infoItems.forEach((_, index) => {
      setStyle(infoLabelRow, index, font({ sz: 9, color: { rgb: this.EXCEL_COLORS.muted } }));
      setStyle(infoValueRow, index, font({ sz: 10, bold: true, color: { rgb: this.EXCEL_COLORS.text } }));
    });
    const progressColor = percent >= 100 ? this.EXCEL_COLORS.success : percent > 0 ? this.EXCEL_COLORS.primary : this.EXCEL_COLORS.muted;
    setStyle(infoProgressRow, 0, font({ sz: 9, bold: true, color: { rgb: this.EXCEL_COLORS.muted } }));
    setStyle(infoProgressRow, 8, {
      ...font({ sz: 11, bold: true, color: { rgb: progressColor } }),
      alignment: { horizontal: "right", vertical: "center" },
    }, "0%");

    summaries.forEach((summary, index) => {
      const block = typeBlocks[index];
      const accent = summary.type === "REFUND" ? this.EXCEL_COLORS.success : this.EXCEL_COLORS.danger;
      const accentFill = summary.type === "REFUND" ? this.EXCEL_COLORS.successFill : this.EXCEL_COLORS.dangerFill;

      styleCard(typeTitleRow, typeValueRow, block.startCol, block.endCol);
      for (let col = block.startCol; col <= block.endCol; col++) {
        setStyle(typeTitleRow, col, { fill: { fgColor: { rgb: accentFill } } });
      }
      setStyle(typeTitleRow, block.startCol, font({ sz: 11, bold: true, color: { rgb: accent } }));
      setStyle(typeTitleRow, block.endCol, {
        ...font({ sz: 13, bold: true, color: { rgb: this.EXCEL_COLORS.text } }),
        alignment: { horizontal: "right", vertical: "center" },
      }, "0%");
      setStyle(typeSubtitleRow, block.startCol, font({ sz: 9, color: { rgb: this.EXCEL_COLORS.muted } }));

      const valueColors = [this.EXCEL_COLORS.text, this.EXCEL_COLORS.success, summary.hasBalance ? this.EXCEL_COLORS.warning : this.EXCEL_COLORS.text];
      block.valueCols.forEach(([startCol], valueIndex) => {
        setStyle(typeLabelRow, startCol, font({ sz: 8, bold: true, color: { rgb: this.EXCEL_COLORS.muted } }));
        setStyle(typeValueRow, startCol, {
          ...font({ sz: 11, bold: true, color: { rgb: valueColors[valueIndex] } }),
          alignment: { horizontal: "left", vertical: "center" },
        }, moneyFormat);
      });
    });

    setStyle(sectionRowIndex, 0, { ...font({ sz: 11, bold: true, color: { rgb: "333333" } }), fill: { fgColor: { rgb: "E8E8E8" } } });

    for (let col = 0; col < columns; col++) {
      setStyle(headerRowIndex, col, {
        ...font({ sz: 10, bold: true, color: { rgb: "1F3A93" } }),
        fill: { fgColor: { rgb: this.SOFT_BLUE } },
        alignment: { horizontal: "left", vertical: "center", wrapText: true },
        border,
      });
    }

    const amountCols = [3, 4, 5, 6, 7, 8];
    for (let row = firstLineRow; row <= totalsRowIndex; row++) {
      const isTotals = row === totalsRowIndex;
      const fill = isTotals ? this.LIGHT_GRAY : (row - firstLineRow) % 2 === 1 ? "FAFCFF" : "FFFFFF";

      for (let col = 0; col < columns; col++) {
        const isAmount = amountCols.includes(col);
        setStyle(row, col, {
          fill: { fgColor: { rgb: fill } },
          border,
          alignment: { horizontal: isAmount ? "right" : "left", vertical: "center", wrapText: true },
          font: { bold: isTotals },
        }, isAmount ? "#,##0.00" : undefined);
      }

      const line = lines[row - firstLineRow];
      if (!isTotals && line) {
        setStyle(row, 8, font({ bold: true, color: { rgb: isLineSettled(line) ? "2E7D32" : "EF6C00" } }));
      }
    }

    [0, 2].forEach(col => setStyle(generatedRowIndex, col, font({ bold: true, color: { rgb: "333333" } })));
    setStyle(footerRowIndex, 0, font({ sz: 9, italic: true, color: { rgb: "646464" } }));

    ws["!rows"] = data.map((_, row) => (row === typeTitleRow || row === typeValueRow ? { hpt: 20 } : {}));
    ws["!autofilter"] = {
      ref: `${XLSX.utils.encode_cell({ r: headerRowIndex, c: 0 })}:${XLSX.utils.encode_cell({ r: Math.max(headerRowIndex, totalsRowIndex - 1), c: columns - 1 })}`,
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, this.tr("t-payment-order-batches").slice(0, 31));

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    this.saveFile(
      buffer,
      `${options?.fileName || this.defaultFileName(period)}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  }

  private static saveFile(data: any, fileName: string, mimeType: string): void {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
