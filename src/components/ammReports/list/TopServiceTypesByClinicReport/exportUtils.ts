import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ServiceProviderReportType, TopServiceTypesByClinicReportType } from "@/components/ammReports/types";
import { amountFormate } from "@/app/common/amountFormate";
import { formateDate } from "@/app/common/dateFormate";
import i18n from "@/plugins/i18n";

export interface ExportOptions {
  fileName?: string;
}

type FlatRow = {
  providerName: string;
  procedureName: string;
  totalInvoiceItems: number;
  totalBilled: number;
};

export class TopServiceTypesByClinicReportExporter {
  private static readonly SOFT_BLUE = "DCEBFF";
  private static readonly LIGHT_GRAY = "F8F9FA";
  private static readonly BORDER = "D9D9D9";

  private static safeSheetName(name: string, fallback: string): string {
    const base = (name || fallback)
      .replace(/[\\\/\?\*\[\]:]/g, " ")
      .trim();
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

  private static getProviderTotalBilled(provider: ServiceProviderReportType): number {
    return (provider.details || []).reduce((sum, item) => sum + (item.totalBilled || 0), 0);
  }

  private static sortReport(report: TopServiceTypesByClinicReportType): ServiceProviderReportType[] {
    return [...(report || [])]
      .map((provider) => ({
        ...provider,
        details: [...(provider.details || [])].sort((a, b) => (b.totalBilled || 0) - (a.totalBilled || 0))
      }))
      .sort((a, b) => this.getProviderTotalBilled(b) - this.getProviderTotalBilled(a));
  }

  private static flattenRows(report: TopServiceTypesByClinicReportType): FlatRow[] {
    const rows: FlatRow[] = [];
    const sortedReport = this.sortReport(report);

    sortedReport.forEach((provider) => {
      (provider.details || []).forEach((detail) => {
        rows.push({
          providerName: provider.serviceProviderName || this.tr("t-spr-na"),
          procedureName: detail.hospitalProcedureTypeName || this.tr("t-spr-na"),
          totalInvoiceItems: detail.totalInvoiceItems || 0,
          totalBilled: detail.totalBilled || 0
        });
      });
    });

    return rows;
  }

  private static getPeriod(report: TopServiceTypesByClinicReportType): { start: string; end: string } {
    const first = report[0];
    return {
      start: first?.startDate ? formateDate(first.startDate) : "-",
      end: first?.endDate ? formateDate(first.endDate) : "-"
    };
  }

  private static fitText(pdf: jsPDF, text: string, maxWidth: number): string {
    let value = text || "";
    if (pdf.getTextWidth(value) <= maxWidth) return value;

    const ellipsis = "...";
    while (value.length > 0 && pdf.getTextWidth(value + ellipsis) > maxWidth) {
      value = value.slice(0, -1);
    }

    return `${value}${ellipsis}`;
  }

  private static drawTextInCard(
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    maxLines = 1,
    lineHeight = 4
  ): void {
    const lines = (pdf.splitTextToSize(text || "", maxWidth) as string[]) || [];
    if (lines.length === 0) return;

    const finalLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      finalLines[maxLines - 1] = this.fitText(pdf, finalLines[maxLines - 1], maxWidth);
    }

    finalLines.forEach((line, index) => {
      pdf.text(line, x, y + (index * lineHeight));
    });
  }

  static async exportToPDF(
    report: TopServiceTypesByClinicReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const sortedReport = this.sortReport(report);
    const rows = this.flattenRows(sortedReport);
    const period = this.getPeriod(sortedReport);
    const totalAmount = rows.reduce((sum, item) => sum + item.totalBilled, 0);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const generatedAt = this.getCurrentDateTime();

    let currentY = margin;

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(this.tr("t-tsbc-report-title"), margin, currentY);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${this.tr("t-report")} #100004 - ${this.tr("t-top-service-types-by-service-provider")}`, margin, currentY + 6);


    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(margin, currentY + 18, pageWidth - margin, currentY + 18);

    currentY = 40;

    const gap = 5;
    const cardWidth = (contentWidth - (gap * 2)) / 3;
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
      this.tr("t-service-provider"),
      String(sortedReport.length),
      [`${this.tr("t-spr-procedures-performed")}: ${rows.length}`]
    );

    const card2X = margin + cardWidth + gap;
    drawCard(
      card2X,
      currentY,
      [232, 245, 233],
      this.tr("t-period"),
      this.tr("t-custom-period"),
      [
        `${this.tr("t-start-period")}: ${period.start}`,
        `${this.tr("t-end-period")}: ${period.end}`
      ],
      [46, 125, 50]
    );

    const card3X = card2X + cardWidth + gap;
    drawCard(
      card3X,
      currentY,
      [255, 235, 238],
      this.tr("t-total-spent"),
      `${amountFormate(totalAmount)} MT`,
      [`${this.tr("t-spr-procedures-performed")}: ${rows.length}`],
      [183, 28, 28]
    );
    currentY += cardHeight + 10;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.tr("t-tsbc-detailed-section"), margin, currentY);

    const tableBody: any[] = [];
    sortedReport.forEach((provider) => {
      tableBody.push([
        {
          content: `${this.tr("t-service-provider")}: ${provider.serviceProviderName || this.tr("t-spr-na")}`,
          colSpan: 3,
          styles: {
            fillColor: [238, 245, 255],
            textColor: [31, 58, 147],
            fontStyle: "bold"
          }
        }
      ]);

      (provider.details || []).forEach((detail) => {
        tableBody.push([
          detail.hospitalProcedureTypeName || this.tr("t-spr-na"),
          String(detail.totalInvoiceItems || 0),
          `${amountFormate(detail.totalBilled || 0)} MT`
        ]);
      });

      const providerInvoiceTotal = (provider.details || []).reduce((sum, x) => sum + (x.totalInvoiceItems || 0), 0);
      const providerBilledTotal = (provider.details || []).reduce((sum, x) => sum + (x.totalBilled || 0), 0);
      tableBody.push([
        `${this.tr("t-totals").toUpperCase()} - ${provider.serviceProviderName || this.tr("t-spr-na")}`,
        String(providerInvoiceTotal),
        `${amountFormate(providerBilledTotal)} MT`
      ]);
    });

    tableBody.push([
      this.tr("t-totals").toUpperCase(),
      "-",
      `${amountFormate(totalAmount)} MT`
    ]);

    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: margin, right: margin },
      head: [[
        this.tr("t-procedure"),
        this.tr("t-total-invoices"),
        this.tr("t-billed-amount")
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
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 25, halign: "right" },
        2: { cellWidth: 35, halign: "right" }
      },
      didParseCell: (data: any) => {
        const rowLabel = data.row?.raw?.[0]?.content || data.row?.raw?.[0] || "";
        const isProviderSubtotal = typeof rowLabel === "string" && rowLabel.startsWith(`${this.tr("t-totals").toUpperCase()} - `);
        if (data.row.index === tableBody.length - 1) {
          data.cell.styles.fillColor = [248, 249, 250];
          data.cell.styles.fontStyle = "bold";
          if (data.column.index === 2) {
            data.cell.styles.textColor = [183, 28, 28];
          }
        } else if (isProviderSubtotal) {
          data.cell.styles.fillColor = [245, 248, 255];
          data.cell.styles.fontStyle = "bold";
          if (data.column.index === 2) {
            data.cell.styles.textColor = [183, 28, 28];
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

    const fileName = options?.fileName || `top-service-types-by-service-provider-${new Date().toISOString().split("T")[0]}`;
    pdf.save(`${fileName}.pdf`);
  }

  static async exportToExcel(
    report: TopServiceTypesByClinicReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const sortedReport = this.sortReport(report);
    const rows = this.flattenRows(sortedReport);
    const period = this.getPeriod(sortedReport);
    const totalAmount = rows.reduce((sum, r) => sum + r.totalBilled, 0);
    const workbook = XLSX.utils.book_new();

    const data: string[][] = [
      [this.tr("t-tsbc-report-title").toUpperCase(), "", "", "", ""],
      [`${this.tr("t-start-period")}: ${period.start} | ${this.tr("t-end-period")}: ${period.end}`, "", "", "", ""],
      [this.tr("t-tsbc-summary"), "", "", "", ""],
      [this.tr("t-service-provider"), String(sortedReport.length), this.tr("t-spr-procedures-performed"), String(rows.length), `${amountFormate(totalAmount)} MT`],
      ["", "", "", "", ""],
      [this.tr("t-tsbc-detailed-section").toUpperCase(), "", "", "", ""],
      [this.tr("t-procedure"), this.tr("t-total-invoices"), `${this.tr("t-billed-amount")} (MT)`, "", ""],
      ...sortedReport.flatMap((provider) => {
        const out: string[][] = [];
        const providerName = provider.serviceProviderName || this.tr("t-spr-na");
        out.push([`${this.tr("t-service-provider")}: ${providerName}`, "", "", "", ""]);
        (provider.details || []).forEach((detail) => {
          out.push([
            detail.hospitalProcedureTypeName || this.tr("t-spr-na"),
            String(detail.totalInvoiceItems || 0),
            String(detail.totalBilled || 0),
            "",
            ""
          ]);
        });
        const providerInvoiceTotal = (provider.details || []).reduce((sum, x) => sum + (x.totalInvoiceItems || 0), 0);
        const providerBilledTotal = (provider.details || []).reduce((sum, x) => sum + (x.totalBilled || 0), 0);
        out.push([
          `${this.tr("t-totals").toUpperCase()} - ${providerName}`,
          String(providerInvoiceTotal),
          String(providerBilledTotal),
          "",
          ""
        ]);
        return out;
      }),
      [this.tr("t-totals").toUpperCase(), "-", String(totalAmount), "", ""],
      ["", "", "", "", ""],
      [this.tr("t-generated-by"), userName || this.tr("t-spr-system-user"), this.tr("t-spr-generated-at"), this.getCurrentDate(), ""]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 36 }, { wch: 36 }, { wch: 18 }, { wch: 28 }, { wch: 20 }];
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 4 } }
    ];

    if (ws["A1"]) ws["A1"].s = { font: { sz: 14, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1F3A93" } } };
    if (ws["A2"]) ws["A2"].s = { font: { sz: 10, color: { rgb: "1F3A93" } }, fill: { fgColor: { rgb: "E8F1FF" } } };
    if (ws["A3"]) ws["A3"].s = { font: { sz: 11, bold: true, color: { rgb: "333333" } }, fill: { fgColor: { rgb: "E8E8E8" } } };
    if (ws["A6"]) ws["A6"].s = { font: { sz: 11, bold: true, color: { rgb: "333333" } }, fill: { fgColor: { rgb: "E8E8E8" } } };

    ["A7", "B7", "C7", "D7"].forEach((cell) => {
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true, color: { rgb: "1F3A93" } },
          fill: { fgColor: { rgb: this.SOFT_BLUE } },
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: this.BORDER } },
            bottom: { style: "thin", color: { rgb: this.BORDER } },
            left: { style: "thin", color: { rgb: this.BORDER } },
            right: { style: "thin", color: { rgb: this.BORDER } }
          }
        };
      }
    });

    const borderStyle = {
      top: { style: "thin", color: { rgb: this.BORDER } },
      bottom: { style: "thin", color: { rgb: this.BORDER } },
      left: { style: "thin", color: { rgb: this.BORDER } },
      right: { style: "thin", color: { rgb: this.BORDER } }
    };

    const tableStartRow = 8;
    const totalsRow = data.findIndex((row) => row[0] === this.tr("t-totals").toUpperCase()) + 1;

    for (let row = tableStartRow; row <= totalsRow; row++) {
      const a = `A${row}`;
      const b = `B${row}`;
      const c = `C${row}`;
      const d = `D${row}`;
      const e = `E${row}`;
      const rowLabel = ws[a]?.v ? String(ws[a].v) : "";
      const isProviderSeparator = rowLabel.startsWith(`${this.tr("t-service-provider")}:`);
      const isProviderTotal = rowLabel.startsWith(`${this.tr("t-totals").toUpperCase()} - `);
      const isTotals = rowLabel === this.tr("t-totals").toUpperCase();
      const isAlt = !isProviderSeparator && !isProviderTotal && !isTotals && row % 2 === 0;

      if (isProviderSeparator) {
        if (ws[a]) {
          ws[a].s = {
            font: { bold: true, color: { rgb: "1F3A93" } },
            fill: { fgColor: { rgb: "EAF3FF" } },
            alignment: { horizontal: "left", vertical: "center" },
            border: borderStyle
          };
        }
        if (ws[b]) ws[b].s = { fill: { fgColor: { rgb: "EAF3FF" } }, border: borderStyle };
        if (ws[c]) ws[c].s = { fill: { fgColor: { rgb: "EAF3FF" } }, border: borderStyle };
        if (ws[d]) ws[d].s = { fill: { fgColor: { rgb: "EAF3FF" } }, border: borderStyle };
        if (ws[e]) ws[e].s = { fill: { fgColor: { rgb: "EAF3FF" } }, border: borderStyle };
        continue;
      }

      if (isProviderTotal) {
        const providerTotalStyle = {
          fill: { fgColor: { rgb: "F5F8FF" } },
          border: borderStyle,
          alignment: { horizontal: "left", vertical: "center" },
          font: { bold: true, color: { rgb: "1F3A93" } }
        };
        if (ws[a]) ws[a].s = providerTotalStyle;
        if (ws[b]) ws[b].s = { ...providerTotalStyle, alignment: { horizontal: "right", vertical: "center" } };
        if (ws[c]) ws[c].s = { ...providerTotalStyle, alignment: { horizontal: "right", vertical: "center" }, font: { bold: true, color: { rgb: "B71C1C" } } };
        if (ws[d]) ws[d].s = { ...providerTotalStyle };
        if (ws[e]) ws[e].s = { ...providerTotalStyle };
        if (ws[b]) ws[b].z = "0";
        if (ws[c]) ws[c].z = '#,##0.00" MT"';
        continue;
      }

      const baseFill = isTotals ? this.LIGHT_GRAY : (isAlt ? "FAFCFF" : "FFFFFF");
      const baseStyle = {
        fill: { fgColor: { rgb: baseFill } },
        border: borderStyle,
        alignment: { horizontal: "left", vertical: "center" }
      };

      if (ws[a]) ws[a].s = { ...baseStyle, font: { bold: isTotals } };
      if (ws[b]) ws[b].s = { ...baseStyle, alignment: { horizontal: "right", vertical: "center" }, font: { bold: isTotals } };
      if (ws[c]) ws[c].s = { ...baseStyle, alignment: { horizontal: "right", vertical: "center" }, font: { bold: isTotals } };
      if (ws[d]) ws[d].s = { ...baseStyle, alignment: { horizontal: "right", vertical: "center" }, font: { bold: isTotals } };
      if (ws[e]) ws[e].s = { ...baseStyle };

      if (ws[b]) ws[b].z = "0";
      if (ws[c]) ws[c].z = '#,##0.00" MT"';
      if (isTotals && ws[c]) {
        ws[c].s = {
          ...(ws[c].s || {}),
          font: { bold: true, color: { rgb: "B71C1C" } }
        };
      }
    }

    ws["!autofilter"] = { ref: `A7:C${totalsRow}` };

    const sheetName = this.safeSheetName(this.tr("t-tsbc-sheet"), "Resumo");
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const fileName = options?.fileName || `top-service-types-by-service-provider-${new Date().toISOString().split("T")[0]}`;
    this.saveFile(excelBuffer, `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  static async exportToCSV(
    report: TopServiceTypesByClinicReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const sortedReport = this.sortReport(report);
    const rows = this.flattenRows(sortedReport);
    const period = this.getPeriod(sortedReport);
    const totalAmount = rows.reduce((sum, r) => sum + r.totalBilled, 0);
    const line = "-".repeat(80);

    let csvContent = `${this.tr("t-tsbc-report-title").toUpperCase()}\n${line}\n`;
    csvContent += `${this.tr("t-start-period")},${period.start}\n`;
    csvContent += `${this.tr("t-end-period")},${period.end}\n\n`;
    csvContent += `${this.tr("t-tsbc-detailed-section").toUpperCase()}\n${line}\n`;
    csvContent += `${this.tr("t-procedure")},${this.tr("t-total-invoices")},${this.tr("t-billed-amount")} (MT)\n`;

    sortedReport.forEach((provider) => {
      const providerName = provider.serviceProviderName || this.tr("t-spr-na");
      csvContent += `\n${this.tr("t-service-provider")}: ${providerName}\n`;
      (provider.details || []).forEach((detail) => {
        csvContent += `${detail.hospitalProcedureTypeName || this.tr("t-spr-na")},${detail.totalInvoiceItems || 0},${detail.totalBilled || 0}\n`;
      });
      const providerInvoiceTotal = (provider.details || []).reduce((sum, x) => sum + (x.totalInvoiceItems || 0), 0);
      const providerBilledTotal = (provider.details || []).reduce((sum, x) => sum + (x.totalBilled || 0), 0);
      csvContent += `${this.tr("t-totals").toUpperCase()} - ${providerName},${providerInvoiceTotal},${providerBilledTotal}\n`;
    });

    csvContent += `${this.tr("t-totals").toUpperCase()},-,${totalAmount}\n\n`;
    csvContent += `${this.tr("t-generated-by")},${userName || this.tr("t-spr-system-user")}\n`;
    csvContent += `${this.tr("t-spr-generated-at")},${this.getCurrentDate()}\n`;

    const bom = "\uFEFF";
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = options?.fileName || `top-service-types-by-service-provider-${new Date().toISOString().split("T")[0]}`;
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

