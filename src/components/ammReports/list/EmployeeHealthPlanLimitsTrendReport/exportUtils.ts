import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import i18n from "@/plugins/i18n";
import { amountFormate } from "@/app/common/amountFormate";
import { formateDate } from "@/app/common/dateFormate";
import type {
  EmployeeHealthPlanLimitsTrendDetailType,
  EmployeeHealthPlanLimitsTrendReportType
} from "@/components/ammReports/types";

export interface ExportOptions {
  fileName?: string;
}

type NormalizedRow = {
  employeeName: string;
  employeeNumber: string;
  allocatedBalance: number;
  usedBalance: number;
  remainingBalance: number;
  percentSpended: number;
  percentRemaining: number;
};

export class EmployeeHealthPlanLimitsTrendReportExporter {
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

  private static formatPercent(value?: number): string {
    return `${new Intl.NumberFormat(this.localeCode(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(value || 0))}%`;
  }

  private static employeeName(item: EmployeeHealthPlanLimitsTrendDetailType): string {
    const employee = item.employee;
    return `${employee?.firstName || ""} ${employee?.middleName || ""} ${employee?.lastName || ""}`.replace(/\s+/g, " ").trim() || "-";
  }

  private static normalizeRows(report: EmployeeHealthPlanLimitsTrendReportType): NormalizedRow[] {
    return (report.details || []).map((item) => ({
      employeeName: this.employeeName(item),
      employeeNumber: item.employee?.employeeNumber || "-",
      allocatedBalance: Number(item.allocatedBalance || 0),
      usedBalance: Number(item.usedBalance || 0),
      remainingBalance: Number(item.remainingBalance || 0),
      percentSpended: Number(item.percentSpended || 0),
      percentRemaining: Number(item.percentRemaining || 0)
    }));
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

  private static periodRange(report: EmployeeHealthPlanLimitsTrendReportType): string {
    const start = report.coveragePeriod?.startDate ? formateDate(report.coveragePeriod.startDate) : "-";
    const end = report.coveragePeriod?.endDate ? formateDate(report.coveragePeriod.endDate) : "-";
    return `${start} - ${end}`;
  }

  private static totals(rows: NormalizedRow[]) {
    return {
      allocatedBalance: rows.reduce((sum, row) => sum + row.allocatedBalance, 0),
      usedBalance: rows.reduce((sum, row) => sum + row.usedBalance, 0),
      remainingBalance: rows.reduce((sum, row) => sum + row.remainingBalance, 0)
    };
  }

  static async exportToPDF(
    report: EmployeeHealthPlanLimitsTrendReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const rows = this.normalizeRows(report);
    const totals = this.totals(rows);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const generatedAt = this.generatedAt();
    const currentDate = new Date().toLocaleDateString(this.localeCode());

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(this.tr("t-ehplt-report-title"), margin, 12);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${this.tr("t-report")} #100012 - ${this.tr("t-report-100012-title")}`, margin, 18);
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
      opts?: { headlineColor?: [number, number, number] }
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
      pdf.setTextColor(120, 120, 120);
      pdf.text(fitSingleLine(title, 7), x + 14, y + 7);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      const headlineColor = opts?.headlineColor || [55, 71, 79];
      pdf.setTextColor(headlineColor[0], headlineColor[1], headlineColor[2]);
      const headlineLines = fitMultiLines(headline, 9, 2);
      const headlineStartY = y + 11.5;
      pdf.text(headlineLines, x + 14, headlineStartY);

      const dividerY = Math.min(headlineStartY + ((headlineLines.length - 1) * 4.2) + 3, y + h - 12);
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
        `${this.tr("t-coverage-period")}: ${report.coveragePeriod?.name || "-"}`,
        `${this.tr("t-period")}: ${this.periodRange(report)}`
      ],
      { headlineColor: [31, 58, 147] }
    );
    drawCard(
      margin + cardWidth + cardGap,
      cardsY,
      cardWidth,
      cardHeight,
      [232, 245, 233],
      this.tr("t-employees"),
      this.formatNumber(report.numberOfEmployees ?? rows.length),
      [
        `${this.tr("t-ehplt-percent-spent")}: ${this.formatPercent(report.percentSpended)}`,
        `${this.tr("t-ehplt-percent-remaining")}: ${this.formatPercent(report.percentRemaining)}`
      ],
      { headlineColor: [46, 125, 50] }
    );
    drawCard(
      margin + ((cardWidth + cardGap) * 2),
      cardsY,
      cardWidth,
      cardHeight,
      [255, 235, 238],
      this.tr("t-ehplt-used-balance"),
      `${amountFormate(totals.usedBalance)} MT`,
      [
        `${this.tr("t-ehplt-allocated-balance")}: ${amountFormate(totals.allocatedBalance)} MT`,
        `${this.tr("t-ehplt-remaining-balance")}: ${amountFormate(totals.remainingBalance)} MT`
      ],
      { headlineColor: [183, 28, 28] }
    );

    autoTable(pdf, {
      startY: cardsY + cardHeight + 6,
      margin: { left: margin, right: margin },
      head: [[
        this.tr("t-employee"),
        this.tr("t-employee-number"),
        this.tr("t-ehplt-allocated-balance"),
        this.tr("t-ehplt-used-balance"),
        this.tr("t-ehplt-remaining-balance"),
        this.tr("t-ehplt-percent-spent"),
        this.tr("t-ehplt-percent-remaining")
      ]],
      body: rows.map((row) => [
        row.employeeName,
        row.employeeNumber,
        amountFormate(row.allocatedBalance),
        amountFormate(row.usedBalance),
        amountFormate(row.remainingBalance),
        this.formatPercent(row.percentSpended),
        this.formatPercent(row.percentRemaining)
      ]),
      foot: [[
        this.tr("t-totals"),
        "-",
        amountFormate(totals.allocatedBalance),
        amountFormate(totals.usedBalance),
        amountFormate(totals.remainingBalance),
        this.formatPercent(report.percentSpended),
        this.formatPercent(report.percentRemaining)
      ]],
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1.5, lineWidth: 0.1, lineColor: [220, 220, 220] },
      headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: "bold" },
      footStyles: { fillColor: [238, 244, 255], textColor: [31, 58, 147], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 58 },
        1: { cellWidth: 28 },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" }
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

    const fileName = options?.fileName || `employee-health-plan-limits-trend-${new Date().toISOString().split("T")[0]}`;
    pdf.save(`${fileName}.pdf`);
  }

  static async exportToExcel(
    report: EmployeeHealthPlanLimitsTrendReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const rows = this.normalizeRows(report);
    const totals = this.totals(rows);
    const workbook = XLSX.utils.book_new();
    const data = [
      [this.tr("t-ehplt-report-title").toUpperCase()],
      [`${this.tr("t-report")} #100012 - ${this.tr("t-report-100012-title")}`],
      [`${this.tr("t-institution")}: ${report.contract?.name || "-"} | ${this.tr("t-coverage-period")}: ${report.coveragePeriod?.name || "-"} (${this.periodRange(report)})`],
      [`${this.tr("t-generated-by")}: ${userName || this.tr("t-spr-system-user")} | ${this.tr("t-spr-generated-at")}: ${this.generatedAt()}`],
      [],
      [
        this.tr("t-employee"),
        this.tr("t-employee-number"),
        this.tr("t-ehplt-allocated-balance"),
        this.tr("t-ehplt-used-balance"),
        this.tr("t-ehplt-remaining-balance"),
        this.tr("t-ehplt-percent-spent"),
        this.tr("t-ehplt-percent-remaining")
      ],
      ...rows.map((row) => [
        row.employeeName,
        row.employeeNumber,
        row.allocatedBalance,
        row.usedBalance,
        row.remainingBalance,
        row.percentSpended,
        row.percentRemaining
      ]),
      [
        this.tr("t-totals"),
        "-",
        totals.allocatedBalance,
        totals.usedBalance,
        totals.remainingBalance,
        Number(report.percentSpended || 0),
        Number(report.percentRemaining || 0)
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } }
    ];
    ws["!cols"] = [{ wch: 34 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 16 }];

    if (ws["A1"]) ws["A1"].s = { font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: this.BRAND_BLUE } } };
    if (ws["A2"]) ws["A2"].s = { font: { bold: true, color: { rgb: this.BRAND_BLUE } } };
    for (let col = 0; col <= 6; col++) {
      const addr = XLSX.utils.encode_cell({ r: 5, c: col });
      if (ws[addr]) ws[addr].s = { font: { bold: true, color: { rgb: this.BRAND_BLUE } }, fill: { fgColor: { rgb: this.SOFT_BLUE } } };
    }

    const totalsRow = data.length;
    for (let col = 0; col <= 6; col++) {
      const addr = XLSX.utils.encode_cell({ r: totalsRow - 1, c: col });
      if (ws[addr]) ws[addr].s = { font: { bold: true, color: { rgb: this.BRAND_BLUE } }, fill: { fgColor: { rgb: this.SOFT_BLUE_LIGHT } } };
    }
    for (let row = 7; row <= totalsRow; row++) {
      for (let col = 2; col <= 4; col++) {
        const addr = XLSX.utils.encode_cell({ r: row - 1, c: col });
        if (ws[addr]) ws[addr].z = "#,##0.00";
      }
      for (let col = 5; col <= 6; col++) {
        const addr = XLSX.utils.encode_cell({ r: row - 1, c: col });
        if (ws[addr]) ws[addr].z = "0.00";
      }
    }

    XLSX.utils.book_append_sheet(workbook, ws, this.tr("t-ehplt-sheet"));
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const fileName = options?.fileName || `employee-health-plan-limits-trend-${new Date().toISOString().split("T")[0]}`;
    this.saveFile(excelBuffer, `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  static async exportToCSV(
    report: EmployeeHealthPlanLimitsTrendReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const rows = this.normalizeRows(report);
    const totals = this.totals(rows);
    const escapeCsv = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    let csv = `${escapeCsv(this.tr("t-ehplt-report-title").toUpperCase())}\n`;
    csv += `${escapeCsv(this.tr("t-institution"))},${escapeCsv(report.contract?.name || "-")}\n`;
    csv += `${escapeCsv(this.tr("t-coverage-period"))},${escapeCsv(`${report.coveragePeriod?.name || "-"} (${this.periodRange(report)})`)}\n`;
    csv += `${escapeCsv(this.tr("t-generated-by"))},${escapeCsv(userName || this.tr("t-spr-system-user"))}\n\n`;
    csv += [
      this.tr("t-employee"),
      this.tr("t-employee-number"),
      this.tr("t-ehplt-allocated-balance"),
      this.tr("t-ehplt-used-balance"),
      this.tr("t-ehplt-remaining-balance"),
      this.tr("t-ehplt-percent-spent"),
      this.tr("t-ehplt-percent-remaining")
    ].map(escapeCsv).join(",") + "\n";

    rows.forEach((row) => {
      csv += [
        row.employeeName,
        row.employeeNumber,
        row.allocatedBalance,
        row.usedBalance,
        row.remainingBalance,
        row.percentSpended,
        row.percentRemaining
      ].map(escapeCsv).join(",") + "\n";
    });
    csv += [
      this.tr("t-totals"),
      "-",
      totals.allocatedBalance,
      totals.usedBalance,
      totals.remainingBalance,
      Number(report.percentSpended || 0),
      Number(report.percentRemaining || 0)
    ].map(escapeCsv).join(",") + "\n";

    const bom = "\uFEFF";
    const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });
    const fileName = options?.fileName || `employee-health-plan-limits-trend-${new Date().toISOString().split("T")[0]}`;
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
