import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import i18n from "@/plugins/i18n";
import { formateDate } from "@/app/common/dateFormate";
import type {
  HospitalProcedureTrendDetailType,
  HospitalProcedureTrendReportType
} from "@/components/ammReports/types";

export interface ExportOptions {
  fileName?: string;
}

type NormalizedRow = {
  procedureName: string;
  totalUsages: number;
};

export class HospitalProcedureTrendReportExporter {
  private static readonly BRAND_BLUE = "1F3A93";
  private static readonly SOFT_BLUE = "DCEBFF";
  private static readonly SOFT_BLUE_LIGHT = "EEF4FF";

  private static tr(key: string, params?: Record<string, unknown>): string {
    const translated = (i18n as any).global.t(key, params);
    return typeof translated === "string" ? translated : String(translated);
  }

  private static localeCode(): string {
    const rawLocale = (i18n as any).global.locale;
    const locale = typeof rawLocale === "string" ? rawLocale : rawLocale?.value;
    return locale === "en" ? "en-US" : "pt-PT";
  }

  private static formatNumber(value?: number): string {
    return new Intl.NumberFormat(this.localeCode()).format(Number(value || 0));
  }

  private static normalizeRows(report: HospitalProcedureTrendReportType): NormalizedRow[] {
    return (report.details || []).map((item: HospitalProcedureTrendDetailType) => ({
      procedureName: item.hospitalProcedureTypeName || this.tr("t-hpt-unknown-procedure"),
      totalUsages: Number(item.totalUsages || 0)
    }));
  }

  private static totalUsages(rows: NormalizedRow[]): number {
    return rows.reduce((sum, row) => sum + row.totalUsages, 0);
  }

  private static generatedAt(): string {
    return new Date().toLocaleDateString(this.localeCode(), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  private static periodLabel(report: HospitalProcedureTrendReportType): string {
    const period = report.coveragePeriod;
    const start = period?.startDate ? formateDate(period.startDate) : "-";
    const end = period?.endDate ? formateDate(period.endDate) : "-";
    return `${period?.name || "-"} (${start} - ${end})`;
  }

  static async exportToPDF(
    report: HospitalProcedureTrendReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const rows = this.normalizeRows(report);
    const total = this.totalUsages(rows);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const margin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const generatedAt = this.generatedAt();
    const currentDate = new Date().toLocaleDateString(this.localeCode());
    const proceduresCount = rows.length;
    const topProcedure = rows[0]?.procedureName || "-";

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(this.tr("t-hpt-report-title"), margin, 12);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${this.tr("t-report")} #100011 - ${this.tr("t-report-100011-title")}`, margin, 18);
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(margin, 23, pageWidth - margin, 23);

    const drawCard = (
      x: number,
      y: number,
      w: number,
      h: number,
      iconBg: [number, number, number],
      title: string,
      headline: string,
      lines: string[],
      opts?: { titleColor?: [number, number, number]; headlineColor?: [number, number, number] }
    ) => {
      const maxTextWidth = w - 18;
      const fitSingleLine = (text: string, fontSize: number): string => {
        pdf.setFontSize(fontSize);
        let output = text || "";
        while (pdf.getTextWidth(output) > maxTextWidth && output.length > 1) {
          output = `${output.slice(0, -2)}...`;
        }
        return output;
      };
      const fitMultiLines = (text: string, fontSize: number, maxLines: number): string[] => {
        pdf.setFontSize(fontSize);
        const split = pdf.splitTextToSize(text || "", maxTextWidth) as string[];
        if (split.length <= maxLines) return split;
        const clipped = split.slice(0, maxLines);
        clipped[maxLines - 1] = fitSingleLine(clipped[maxLines - 1], fontSize);
        return clipped;
      };

      pdf.setDrawColor(224, 224, 224);
      pdf.setLineWidth(0.3);
      pdf.setFillColor(250, 252, 255);
      pdf.roundedRect(x, y, w, h, 2, 2, "FD");
      pdf.setFillColor(iconBg[0], iconBg[1], iconBg[2]);
      pdf.roundedRect(x + 4, y + 4, 8, 8, 1.5, 1.5, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      const titleColor = opts?.titleColor || [120, 120, 120];
      pdf.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
      pdf.text(fitSingleLine(title, 7), x + 14, y + 7);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      const headlineColor = opts?.headlineColor || [55, 71, 79];
      pdf.setTextColor(headlineColor[0], headlineColor[1], headlineColor[2]);
      const headlineLines = fitMultiLines(headline, 9, 2);
      const headlineStartY = y + 11.5;
      const headlineLineHeight = 4.2;
      pdf.text(headlineLines, x + 14, headlineStartY);

      const dividerY = Math.min(headlineStartY + ((headlineLines.length - 1) * headlineLineHeight) + 3, y + h - 12);
      pdf.setDrawColor(236, 239, 244);
      pdf.line(x + 3, dividerY, x + w - 3, dividerY);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(90, 90, 90);
      let lineY = dividerY + 5;
      lines.forEach((line) => {
        const contentLines = fitMultiLines(line, 7, 2);
        contentLines.forEach((contentLine) => {
          if (lineY <= (y + h - 3)) {
            pdf.text(contentLine, x + 4, lineY);
            lineY += 4.2;
          }
        });
        lineY += 0.8;
      });
    };

    const cardsY = 28;
    const cardGap = 4;
    const cardWidth = (pageWidth - (margin * 2) - (cardGap * 2)) / 3;
    const cardHeight = 40;
    drawCard(
      margin,
      cardsY,
      cardWidth,
      cardHeight,
      [227, 242, 253],
      this.tr("t-institution"),
      report.contract?.name || "-",
      [
        `${this.tr("t-report")}: #100011`,
        `${this.tr("t-hpt-procedures-ranked")}: ${this.formatNumber(proceduresCount)}`
      ],
      { headlineColor: [31, 58, 147] }
    );
    drawCard(
      margin + cardWidth + cardGap,
      cardsY,
      cardWidth,
      cardHeight,
      [232, 245, 233],
      this.tr("t-coverage-period"),
      report.coveragePeriod?.name || "-",
      [
        `${this.tr("t-start-period")}: ${report.coveragePeriod?.startDate ? formateDate(report.coveragePeriod.startDate) : "-"}`,
        `${this.tr("t-end-period")}: ${report.coveragePeriod?.endDate ? formateDate(report.coveragePeriod.endDate) : "-"}`
      ],
      { headlineColor: [46, 125, 50] }
    );
    drawCard(
      margin + ((cardWidth + cardGap) * 2),
      cardsY,
      cardWidth,
      cardHeight,
      [255, 235, 238],
      this.tr("t-hpt-total-usages"),
      this.formatNumber(total),
      [
        `${this.tr("t-hpt-top-procedure")}: ${topProcedure}`,
        `${this.tr("t-hpt-average-usages")}: ${this.formatNumber(proceduresCount ? Math.round(total / proceduresCount) : 0)}`
      ],
      { headlineColor: [183, 28, 28] }
    );

    autoTable(pdf, {
      startY: cardsY + cardHeight + 6,
      margin: { left: margin, right: margin, bottom: 40 },
      head: [[this.tr("t-procedure"), this.tr("t-hpt-total-usages")]],
      body: rows.map((row) => [row.procedureName, this.formatNumber(row.totalUsages)]),
      foot: [[this.tr("t-totals"), this.formatNumber(total)]],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2, lineWidth: 0.1, lineColor: [220, 220, 220] },
      headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: "bold" },
      footStyles: { fillColor: [238, 244, 255], textColor: [31, 58, 147], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 38, halign: "right" }
      }
    });

    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const footerY = pageHeight - 15;
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(120, 120, 120);

      const footerText = this.tr("t-spr-system-footer");
      const pageText = this.tr("t-spr-page-of", { current: i, total: totalPages });
      const dateFooter = `${this.tr("t-spr-date")}: ${currentDate}`;
      const generatedText = `${this.tr("t-spr-generated-at")}: ${generatedAt}`;
      const userFooter = `${this.tr("t-spr-user")}: ${userName || this.tr("t-spr-system-user")}`;

      pdf.text(footerText, margin, footerY - 5);
      pdf.text(generatedText, margin, footerY - 12);
      pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), footerY - 5);
      pdf.text(dateFooter, pageWidth - margin - pdf.getTextWidth(dateFooter), footerY - 12);
      pdf.text(userFooter, pageWidth - margin - pdf.getTextWidth(userFooter), footerY - 19);
    }

    const fileName = options?.fileName || `hospital-procedure-trend-${new Date().toISOString().split("T")[0]}`;
    pdf.save(`${fileName}.pdf`);
  }

  static async exportToExcel(
    report: HospitalProcedureTrendReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const rows = this.normalizeRows(report);
    const total = this.totalUsages(rows);
    const workbook = XLSX.utils.book_new();
    const data = [
      [this.tr("t-hpt-report-title").toUpperCase()],
      [`${this.tr("t-report")} #100011 - ${this.tr("t-report-100011-title")}`],
      [`${this.tr("t-institution")}: ${report.contract?.name || "-"} | ${this.tr("t-coverage-period")}: ${this.periodLabel(report)}`],
      [`${this.tr("t-generated-by")}: ${userName || this.tr("t-spr-system-user")} | ${this.tr("t-spr-generated-at")}: ${this.generatedAt()}`],
      [],
      [this.tr("t-procedure"), this.tr("t-hpt-total-usages")],
      ...rows.map((row) => [row.procedureName, row.totalUsages]),
      [this.tr("t-totals"), total]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }
    ];
    ws["!cols"] = [{ wch: 48 }, { wch: 18 }];

    if (ws["A1"]) ws["A1"].s = { font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: this.BRAND_BLUE } } };
    if (ws["A2"]) ws["A2"].s = { font: { bold: true, color: { rgb: this.BRAND_BLUE } } };
    ["A6", "B6"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = { font: { bold: true, color: { rgb: this.BRAND_BLUE } }, fill: { fgColor: { rgb: this.SOFT_BLUE } } };
    });

    const totalsRow = data.length;
    [`A${totalsRow}`, `B${totalsRow}`].forEach((cell) => {
      if (ws[cell]) ws[cell].s = { font: { bold: true, color: { rgb: this.BRAND_BLUE } }, fill: { fgColor: { rgb: this.SOFT_BLUE_LIGHT } } };
    });

    for (let row = 7; row <= totalsRow; row++) {
      const cell = `B${row}`;
      if (ws[cell]) ws[cell].z = "#,##0";
    }

    XLSX.utils.book_append_sheet(workbook, ws, this.tr("t-hpt-sheet"));
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const fileName = options?.fileName || `hospital-procedure-trend-${new Date().toISOString().split("T")[0]}`;
    this.saveFile(excelBuffer, `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  static async exportToCSV(
    report: HospitalProcedureTrendReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const rows = this.normalizeRows(report);
    const total = this.totalUsages(rows);
    const escapeCsv = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    let csv = `${escapeCsv(this.tr("t-hpt-report-title").toUpperCase())}\n`;
    csv += `${escapeCsv(this.tr("t-institution"))},${escapeCsv(report.contract?.name || "-")}\n`;
    csv += `${escapeCsv(this.tr("t-coverage-period"))},${escapeCsv(this.periodLabel(report))}\n`;
    csv += `${escapeCsv(this.tr("t-generated-by"))},${escapeCsv(userName || this.tr("t-spr-system-user"))}\n`;
    csv += `${escapeCsv(this.tr("t-spr-generated-at"))},${escapeCsv(this.generatedAt())}\n\n`;
    csv += `${escapeCsv(this.tr("t-procedure"))},${escapeCsv(this.tr("t-hpt-total-usages"))}\n`;
    rows.forEach((row) => {
      csv += `${escapeCsv(row.procedureName)},${escapeCsv(row.totalUsages)}\n`;
    });
    csv += `${escapeCsv(this.tr("t-totals"))},${escapeCsv(total)}\n`;

    const bom = "\uFEFF";
    const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });
    const fileName = options?.fileName || `hospital-procedure-trend-${new Date().toISOString().split("T")[0]}`;
    this.saveFile(blob, `${fileName}.csv`, "text/csv");
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
