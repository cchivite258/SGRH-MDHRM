import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ServiceProviderComparisonReportType, ServiceProviderReportType } from "@/components/ammReports/types";
import { amountFormate } from "@/app/common/amountFormate";
import { formateDate } from "@/app/common/dateFormate";
import i18n from "@/plugins/i18n";

export interface ExportOptions {
  fileName?: string;
}

type ComparisonRow = {
  procedureName: string;
  providerAAmount?: number;
  providerBAmount?: number;
};

export class ServiceProviderComparisonReportExporter {
  private static readonly SOFT_BLUE = "DCEBFF";
  private static readonly LIGHT_GRAY = "F8F9FA";
  private static readonly BORDER = "D9D9D9";

  private static safeSheetName(name: string, fallback: string): string {
    const base = (name || fallback).replace(/[\\\/\?\*\[\]:]/g, " ").trim();
    const safe = base.length > 31 ? base.slice(0, 31).trim() : base;
    return safe || fallback;
  }

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
      minute: "2-digit"
    });
  }

  private static getCurrentDate(): string {
    return new Date().toLocaleDateString(this.localeCode());
  }

  private static providerA(report: ServiceProviderComparisonReportType): ServiceProviderReportType | undefined {
    return report?.[0];
  }

  private static providerB(report: ServiceProviderComparisonReportType): ServiceProviderReportType | undefined {
    return report?.[1];
  }

  private static buildDetailKey(detail: any): string {
    if (detail?.hospitalProcedureTypeId !== undefined && detail?.hospitalProcedureTypeId !== null) {
      return `id:${String(detail.hospitalProcedureTypeId)}`;
    }
    return `name:${String(detail?.hospitalProcedureTypeName || "").trim().toLowerCase()}`;
  }

  private static buildComparisonRows(report: ServiceProviderComparisonReportType): ComparisonRow[] {
    const map = new Map<string, ComparisonRow>();

    (this.providerA(report)?.details || []).forEach((detail) => {
      const key = this.buildDetailKey(detail);
      const existing = map.get(key) || {
        procedureName: detail.hospitalProcedureTypeName || "-",
        providerAAmount: undefined,
        providerBAmount: undefined,
      };
      existing.providerAAmount = detail.totalBilled || 0;
      if (!existing.procedureName || existing.procedureName === "-") {
        existing.procedureName = detail.hospitalProcedureTypeName || "-";
      }
      map.set(key, existing);
    });

    (this.providerB(report)?.details || []).forEach((detail) => {
      const key = this.buildDetailKey(detail);
      const existing = map.get(key) || {
        procedureName: detail.hospitalProcedureTypeName || "-",
        providerAAmount: undefined,
        providerBAmount: undefined,
      };
      existing.providerBAmount = detail.totalBilled || 0;
      if (!existing.procedureName || existing.procedureName === "-") {
        existing.procedureName = detail.hospitalProcedureTypeName || "-";
      }
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => {
      const maxA = Math.max(a.providerAAmount || 0, a.providerBAmount || 0);
      const maxB = Math.max(b.providerAAmount || 0, b.providerBAmount || 0);
      return maxB - maxA;
    });
  }

  private static getProviderTotal(provider?: ServiceProviderReportType): number {
    return (provider?.details || []).reduce((sum, item) => sum + (item.totalBilled || 0), 0);
  }

  private static getPeriod(report: ServiceProviderComparisonReportType): { start: string; end: string } {
    const first = report?.[0];
    return {
      start: first?.startDate ? formateDate(first.startDate) : "-",
      end: first?.endDate ? formateDate(first.endDate) : "-"
    };
  }

  private static providerHeader(provider: ServiceProviderReportType | undefined, labelKey: string): string {
    const name = provider?.serviceProviderName || "-";
    const type = provider?.serviceProviderTypeName || "";
    return `${this.tr(labelKey)}: ${type ? `${name} - ${type}` : name}`;
  }

  private static providerLabel(provider: ServiceProviderReportType | undefined): string {
    const name = provider?.serviceProviderName || "";
    const type = provider?.serviceProviderTypeName || "";
    return type ? `${name} - ${type}` : name;
  }

  private static getComparisonColor(
    row: ComparisonRow,
    provider: "A" | "B"
  ): [number, number, number] {
    const red: [number, number, number] = [183, 28, 28];
    const black: [number, number, number] = [33, 33, 33];
    const a = row.providerAAmount;
    const b = row.providerBAmount;
    const current = provider === "A" ? a : b;
    const other = provider === "A" ? b : a;

    if (current === undefined) return black;
    if (other === undefined) return red;
    if (current > other) return red;
    return black;
  }

  private static getTotalsComparisonColor(
    providerATotal: number,
    providerBTotal: number,
    provider: "A" | "B"
  ): [number, number, number] {
    const red: [number, number, number] = [183, 28, 28];
    const black: [number, number, number] = [33, 33, 33];
    const current = provider === "A" ? providerATotal : providerBTotal;
    const other = provider === "A" ? providerBTotal : providerATotal;
    if (current > other) return red;
    return black;
  }

  static async exportToPDF(
    report: ServiceProviderComparisonReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const providerA = this.providerA(report);
    const providerB = this.providerB(report);
    const rows = this.buildComparisonRows(report);
    const period = this.getPeriod(report);
    const providerATotal = this.getProviderTotal(providerA);
    const providerBTotal = this.getProviderTotal(providerB);
    const totalAmount = providerATotal + providerBTotal;

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const generatedAt = this.getCurrentDateTime();

    let currentY = margin;

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(this.tr("t-spc-report-title"), margin, currentY);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${this.tr("t-report")} #100005 - ${this.tr("t-report-100005-title")}`, margin, currentY + 6);

    const userText = `${this.tr("t-spr-by")}: ${userName || this.tr("t-spr-system-user")}`;
    pdf.text(userText, pageWidth - margin - pdf.getTextWidth(userText), currentY + 12);

    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(margin, currentY + 18, pageWidth - margin, currentY + 18);

    currentY = 40;

    const gap = 5;
    const cardWidth = (pageWidth - margin * 2 - (gap * 2)) / 3;
    const cardHeight = 40;

    const drawCard = (
      x: number,
      y: number,
      iconBg: [number, number, number],
      title: string,
      headline: string,
      lines: string[],
      headlineColor: [number, number, number] = [55, 71, 79]
    ) => {
      const maxTextWidth = cardWidth - 18;
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

      pdf.setDrawColor(225, 229, 235);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");
      pdf.setFillColor(iconBg[0], iconBg[1], iconBg[2]);
      pdf.roundedRect(x + 4, y + 4, 8, 8, 1.5, 1.5, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text(fitSingleLine(title, 7), x + 14, y + 7);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(headlineColor[0], headlineColor[1], headlineColor[2]);
      const headlineLines = fitMultiLines(headline, 10, 2);
      const headlineStartY = y + 12;
      const headlineLineHeight = 4.2;
      pdf.text(headlineLines, x + 14, headlineStartY);

      const dividerY = Math.min(headlineStartY + ((headlineLines.length - 1) * headlineLineHeight) + 3, y + cardHeight - 12);
      pdf.setDrawColor(236, 239, 244);
      pdf.line(x + 3, dividerY, x + cardWidth - 3, dividerY);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(90, 90, 90);
      let lineY = dividerY + 5;
      lines.forEach((line) => {
        const contentLines = fitMultiLines(line, 7, 2);
        contentLines.forEach((contentLine) => {
          if (lineY <= (y + cardHeight - 3)) {
            pdf.text(contentLine, x + 4, lineY);
            lineY += 4.2;
          }
        });
        lineY += 0.8;
      });
    };

    drawCard(
      margin,
      currentY,
      [227, 242, 253],
      this.tr("t-spc-provider-1"),
      providerA?.serviceProviderName || "-",
      [
        providerA?.serviceProviderTypeName || "",
        `${amountFormate(providerATotal)} MT`
      ]
    );

    const card2X = margin + cardWidth + gap;
    drawCard(
      card2X,
      currentY,
      [255, 235, 238],
      this.tr("t-spc-provider-2"),
      providerB?.serviceProviderName || "-",
      [
        providerB?.serviceProviderTypeName || "",
        `${amountFormate(providerBTotal)} MT`
      ]
    );

    const card3X = card2X + cardWidth + gap;
    drawCard(
      card3X,
      currentY,
      [241, 248, 233],
      this.tr("t-spc-difference"),
      `${amountFormate(Math.abs(providerATotal - providerBTotal))} MT`,
      [
        `${this.tr("t-start-period")}: ${period.start}`,
        `${this.tr("t-end-period")}: ${period.end}`
      ],
      [27, 94, 32]
    );

    currentY += cardHeight + 10;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.tr("t-spc-detailed-section"), margin, currentY);

    const tableBody = rows.map((row) => [
      row.procedureName,
      row.providerAAmount !== undefined ? `${amountFormate(row.providerAAmount)} MT` : "-",
      row.providerBAmount !== undefined ? `${amountFormate(row.providerBAmount)} MT` : "-"
    ]);

    tableBody.push([
      this.tr("t-totals").toUpperCase(),
      `${amountFormate(providerATotal)} MT`,
      `${amountFormate(providerBTotal)} MT`
    ]);

    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: margin, right: margin },
      head: [[
        this.tr("t-procedure"),
        this.providerLabel(providerA),
        this.providerLabel(providerB)
      ]],
      body: tableBody,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
        overflow: "linebreak"
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 45, halign: "right" },
        2: { cellWidth: 45, halign: "right" }
      },
      didParseCell: (data: any) => {
        if (data.row.index === tableBody.length - 1) {
          data.cell.styles.fillColor = [248, 249, 250];
          data.cell.styles.fontStyle = "bold";
          if (data.column.index === 1) {
            data.cell.styles.textColor = this.getTotalsComparisonColor(providerATotal, providerBTotal, "A");
          }
          if (data.column.index === 2) {
            data.cell.styles.textColor = this.getTotalsComparisonColor(providerATotal, providerBTotal, "B");
          }
          return;
        }

        if (data.row.index >= 0 && data.row.index < rows.length) {
          const row = rows[data.row.index];
          if (data.column.index === 1) {
            data.cell.styles.textColor = this.getComparisonColor(row, "A");
          }
          if (data.column.index === 2) {
            data.cell.styles.textColor = this.getComparisonColor(row, "B");
          }
        }
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
      pdf.setTextColor(100, 100, 100);

      const footerText = this.tr("t-spr-system-footer");
      const pageText = this.tr("t-spr-page-of", { current: i, total: totalPages });
      const dateFooter = `${this.tr("t-spr-date")}: ${this.getCurrentDate()}`;
      const generatedText = `${this.tr("t-spr-generated-at")}: ${generatedAt}`;
      const userFooter = `${this.tr("t-spr-user")}: ${userName || this.tr("t-spr-system-user")}`;

      pdf.text(footerText, margin, footerY - 5);
      pdf.text(generatedText, margin, footerY - 12);
      pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), footerY - 5);
      pdf.text(dateFooter, pageWidth - margin - pdf.getTextWidth(dateFooter), footerY - 12);
      pdf.text(userFooter, pageWidth - margin - pdf.getTextWidth(userFooter), footerY - 19);
    }

    const fileName = options?.fileName || `service-provider-comparison-${new Date().toISOString().split("T")[0]}`;
    pdf.save(`${fileName}.pdf`);
  }

  static async exportToExcel(
    report: ServiceProviderComparisonReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const providerA = this.providerA(report);
    const providerB = this.providerB(report);
    const rows = this.buildComparisonRows(report);
    const period = this.getPeriod(report);
    const providerATotal = this.getProviderTotal(providerA);
    const providerBTotal = this.getProviderTotal(providerB);

    const workbook = XLSX.utils.book_new();

    const headerA = this.providerHeader(providerA, "t-spc-provider-1");
    const headerB = this.providerHeader(providerB, "t-spc-provider-2");

    const data: string[][] = [
      [this.tr("t-spc-report-title").toUpperCase(), "", "", ""],
      [`${this.tr("t-start-period")}: ${period.start} | ${this.tr("t-end-period")}: ${period.end}`, "", "", ""],
      [this.tr("t-spc-detailed-section"), "", "", ""],
      [this.tr("t-procedure"), headerA, headerB, ""],
      ...rows.map((row) => [
        row.procedureName,
        row.providerAAmount !== undefined ? String(row.providerAAmount) : "-",
        row.providerBAmount !== undefined ? String(row.providerBAmount) : "-",
        ""
      ]),
      [this.tr("t-totals").toUpperCase(), String(providerATotal), String(providerBTotal), ""],
      ["", "", "", ""],
      [this.tr("t-generated-by"), userName || this.tr("t-spr-system-user"), this.tr("t-spr-generated-at"), this.getCurrentDate()]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 44 }, { wch: 34 }, { wch: 34 }, { wch: 10 }];
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }
    ];

    if (ws["A1"]) ws["A1"].s = { font: { sz: 14, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1F3A93" } } };
    if (ws["A2"]) ws["A2"].s = { font: { sz: 10, color: { rgb: "1F3A93" } }, fill: { fgColor: { rgb: "E8F1FF" } } };
    if (ws["A3"]) ws["A3"].s = { font: { sz: 11, bold: true, color: { rgb: "333333" } }, fill: { fgColor: { rgb: "E8E8E8" } } };

    ["A4", "B4", "C4"].forEach((cell) => {
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true, color: { rgb: "1F3A93" } },
          fill: { fgColor: { rgb: this.SOFT_BLUE } },
          alignment: { horizontal: "left", vertical: "center" },
        };
      }
    });

    const borderStyle = {
      top: { style: "thin", color: { rgb: this.BORDER } },
      bottom: { style: "thin", color: { rgb: this.BORDER } },
      left: { style: "thin", color: { rgb: this.BORDER } },
      right: { style: "thin", color: { rgb: this.BORDER } }
    };

    const tableStartRow = 5;
    const totalsRow = tableStartRow + rows.length;

    for (let row = tableStartRow; row <= totalsRow; row++) {
      const isTotals = row === totalsRow;
      const fill = isTotals ? this.LIGHT_GRAY : (row % 2 === 0 ? "FAFCFF" : "FFFFFF");

      ["A", "B", "C"].forEach((col) => {
        const cell = `${col}${row}`;
        if (!ws[cell]) return;

        ws[cell].s = {
          fill: { fgColor: { rgb: fill } },
          border: borderStyle,
          alignment: { horizontal: col === "A" ? "left" : "right", vertical: "center" },
          font: { bold: isTotals }
        };
      });

      if (ws[`B${row}`] && ws[`B${row}`].v !== "-") ws[`B${row}`].z = '#,##0.00" MT"';
      if (ws[`C${row}`] && ws[`C${row}`].v !== "-") ws[`C${row}`].z = '#,##0.00" MT"';

      if (!isTotals) {
        const rowData = rows[row - tableStartRow];
        const colorA = this.getComparisonColor(rowData, "A");
        const colorB = this.getComparisonColor(rowData, "B");
        const toRgbHex = (color: [number, number, number]) =>
          color.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

        if (ws[`B${row}`]) {
          ws[`B${row}`].s = {
            ...(ws[`B${row}`].s || {}),
            font: { bold: false, color: { rgb: toRgbHex(colorA) } }
          };
        }
        if (ws[`C${row}`]) {
          ws[`C${row}`].s = {
            ...(ws[`C${row}`].s || {}),
            font: { bold: false, color: { rgb: toRgbHex(colorB) } }
          };
        }
      } else {
        const toRgbHex = (color: [number, number, number]) =>
          color.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
        const totalsColorA = this.getTotalsComparisonColor(providerATotal, providerBTotal, "A");
        const totalsColorB = this.getTotalsComparisonColor(providerATotal, providerBTotal, "B");

        if (ws[`B${row}`]) {
          ws[`B${row}`].s = {
            ...(ws[`B${row}`].s || {}),
            font: { bold: true, color: { rgb: toRgbHex(totalsColorA) } }
          };
        }
        if (ws[`C${row}`]) {
          ws[`C${row}`].s = {
            ...(ws[`C${row}`].s || {}),
            font: { bold: true, color: { rgb: toRgbHex(totalsColorB) } }
          };
        }
      }
    }

    ws["!autofilter"] = { ref: `A4:C${totalsRow}` };

    const sheetName = this.safeSheetName(this.tr("t-spc-sheet"), "Resumo");
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const fileName = options?.fileName || `service-provider-comparison-${new Date().toISOString().split("T")[0]}`;
    this.saveFile(excelBuffer, `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  static async exportToCSV(
    report: ServiceProviderComparisonReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const providerA = this.providerA(report);
    const providerB = this.providerB(report);
    const rows = this.buildComparisonRows(report);
    const period = this.getPeriod(report);
    const providerATotal = this.getProviderTotal(providerA);
    const providerBTotal = this.getProviderTotal(providerB);
    const line = "-".repeat(120);

    let csvContent = `${this.tr("t-spc-report-title").toUpperCase()}\n${line}\n`;
    csvContent += `${this.tr("t-start-period")},${period.start}\n`;
    csvContent += `${this.tr("t-end-period")},${period.end}\n\n`;
    csvContent += `${this.tr("t-spc-provider-1")},${providerA?.serviceProviderName || "-"},${providerA?.serviceProviderTypeName || ""}\n`;
    csvContent += `${this.tr("t-spc-provider-2")},${providerB?.serviceProviderName || "-"},${providerB?.serviceProviderTypeName || ""}\n\n`;

    csvContent += `${this.tr("t-procedure")},${this.providerHeader(providerA, "t-spc-provider-1")},${this.providerHeader(providerB, "t-spc-provider-2")}\n`;

    rows.forEach((row) => {
      const a = row.providerAAmount !== undefined ? row.providerAAmount : "-";
      const b = row.providerBAmount !== undefined ? row.providerBAmount : "-";
      csvContent += `${row.procedureName},${a},${b}\n`;
    });

    csvContent += `${this.tr("t-totals").toUpperCase()},${providerATotal},${providerBTotal}\n\n`;
    csvContent += `${this.tr("t-generated-by")},${userName || this.tr("t-spr-system-user")}\n`;
    csvContent += `${this.tr("t-spr-generated-at")},${this.getCurrentDate()}\n`;

    const bom = "\uFEFF";
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = options?.fileName || `service-provider-comparison-${new Date().toISOString().split("T")[0]}`;
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

