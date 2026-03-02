import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TotalBilledByProviderReportType } from "@/components/ammReports/types";
import { amountFormate } from "@/app/common/amountFormate";
import { formateDate } from "@/app/common/dateFormate";
import i18n from "@/plugins/i18n";

export interface ExportOptions {
  fileName?: string;
}

export class TotalBilledByProviderReportExporter {
  private static readonly SOFT_BLUE = "DCEBFF";
  private static readonly LIGHT_GRAY = "F8F9FA";
  private static readonly BORDER = "D9D9D9";

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

  static async exportToPDF(
    report: TotalBilledByProviderReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const totalBilled = Number(report.totalBilled || 0);
    const totalEmployees = Number(report.totalEmployees || 0);
    const startPeriod = report.startDate ? formateDate(report.startDate) : "-";
    const endPeriod = report.endDate ? formateDate(report.endDate) : "-";

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const generatedAt = this.getCurrentDateTime();

    let currentY = margin;

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(this.tr("t-tbbp-report-title"), margin, currentY);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${this.tr("t-report")} #100008 - ${this.tr("t-report-100008-title")}`, margin, currentY + 6);

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
      report.serviceProviderName || "-",
      [
        `${this.tr("t-provider-type")}: ${report.serviceProviderTypeName || "-"}`,
        `${this.tr("t-institution")}: ${report.companyName || "-"}`
      ]
    );

    const card2X = margin + cardWidth + gap;
    drawCard(
      card2X,
      currentY,
      [232, 245, 233],
      this.tr("t-period"),
      this.tr("t-custom-period"),
      [
        `${this.tr("t-start-period")}: ${startPeriod}`,
        `${this.tr("t-end-period")}: ${endPeriod}`
      ],
      [46, 125, 50]
    );

    const card3X = card2X + cardWidth + gap;
    drawCard(
      card3X,
      currentY,
      [255, 235, 238],
      this.tr("t-total-billed"),
      `${amountFormate(totalBilled)} MT`,
      [`${this.tr("t-total-employees")}: ${totalEmployees}`],
      [183, 28, 28]
    );

    currentY += cardHeight + 10;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.tr("t-report-details"), margin, currentY);

    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: margin, right: margin },
      head: [[
        this.tr("t-service-provider"),
        this.tr("t-provider-type"),
        this.tr("t-total-employees"),
        this.tr("t-total-billed")
      ]],
      body: [[
        report.serviceProviderName || "-",
        report.serviceProviderTypeName || "-",
        String(totalEmployees),
        `${amountFormate(totalBilled)} MT`
      ]],
      foot: [[this.tr("t-totals").toUpperCase(), "-", String(totalEmployees), `${amountFormate(totalBilled)} MT`]],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2, lineWidth: 0.1, lineColor: [200, 200, 200], overflow: "linebreak" },
      headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      footStyles: { fillColor: [248, 249, 250], textColor: [0, 0, 0], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 66 },
        1: { cellWidth: 42 },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 38, halign: "right" }
      },
      didParseCell: (data: any) => {
        if (data.section === "foot" && data.column.index === 3) {
          data.cell.styles.textColor = [183, 28, 28];
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

    const fileName = options?.fileName || `total-facturado-por-provedor-${new Date().toISOString().split("T")[0]}`;
    pdf.save(`${fileName}.pdf`);
  }

  static async exportToExcel(
    report: TotalBilledByProviderReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const totalBilled = Number(report.totalBilled || 0);
    const totalEmployees = Number(report.totalEmployees || 0);
    const startPeriod = report.startDate ? formateDate(report.startDate) : "-";
    const endPeriod = report.endDate ? formateDate(report.endDate) : "-";

    const workbook = XLSX.utils.book_new();
    const data: string[][] = [
      [this.tr("t-tbbp-report-title").toUpperCase(), "", "", ""],
      [`${this.tr("t-start-period")}: ${startPeriod} | ${this.tr("t-end-period")}: ${endPeriod}`, "", "", ""],
      [this.tr("t-tbbp-summary"), "", "", ""],
      [this.tr("t-service-provider"), report.serviceProviderName || "-", this.tr("t-provider-type"), report.serviceProviderTypeName || "-"],
      [this.tr("t-institution"), report.companyName || "-", this.tr("t-total-employees"), String(totalEmployees)],
      [this.tr("t-total-billed"), `${amountFormate(totalBilled)} MT`, "", ""],
      ["", "", "", ""],
      [this.tr("t-report-details").toUpperCase(), "", "", ""],
      [this.tr("t-service-provider"), this.tr("t-provider-type"), this.tr("t-total-employees"), `${this.tr("t-total-billed")} (MT)`],
      [report.serviceProviderName || "-", report.serviceProviderTypeName || "-", String(totalEmployees), String(totalBilled)],
      [this.tr("t-totals").toUpperCase(), "-", String(totalEmployees), String(totalBilled)],
      ["", "", "", ""],
      [this.tr("t-generated-by"), userName || this.tr("t-spr-system-user"), this.tr("t-spr-generated-at"), this.getCurrentDate()]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 36 }, { wch: 30 }, { wch: 22 }, { wch: 24 }];
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 3 } }
    ];

    if (ws["A1"]) ws["A1"].s = { font: { sz: 14, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1F3A93" } } };
    if (ws["A2"]) ws["A2"].s = { font: { sz: 10, color: { rgb: "1F3A93" } }, fill: { fgColor: { rgb: "E8F1FF" } } };
    if (ws["A3"]) ws["A3"].s = { font: { sz: 11, bold: true, color: { rgb: "333333" } }, fill: { fgColor: { rgb: "E8E8E8" } } };
    if (ws["A8"]) ws["A8"].s = { font: { sz: 11, bold: true, color: { rgb: "333333" } }, fill: { fgColor: { rgb: "E8E8E8" } } };

    ["A9", "B9", "C9", "D9"].forEach((cell) => {
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

    for (let row = 10; row <= 11; row++) {
      const isTotals = row === 11;
      const fill = isTotals ? this.LIGHT_GRAY : "FFFFFF";
      ["A", "B", "C", "D"].forEach((col) => {
        const cell = `${col}${row}`;
        if (!ws[cell]) return;
        ws[cell].s = {
          fill: { fgColor: { rgb: fill } },
          border: borderStyle,
          alignment: { horizontal: col === "C" || col === "D" ? "right" : "left", vertical: "center" },
          font: { bold: isTotals }
        };
      });
      if (ws[`C${row}`]) ws[`C${row}`].z = "0";
      if (ws[`D${row}`]) ws[`D${row}`].z = '#,##0.00" MT"';
      if (isTotals && ws[`D${row}`]) ws[`D${row}`].s = { ...(ws[`D${row}`].s || {}), font: { bold: true, color: { rgb: "B71C1C" } } };
    }

    ws["!autofilter"] = { ref: "A9:D11" };
    XLSX.utils.book_append_sheet(workbook, ws, this.tr("t-tbbp-sheet"));

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const fileName = options?.fileName || `total-facturado-por-provedor-${new Date().toISOString().split("T")[0]}`;
    this.saveFile(excelBuffer, `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  static async exportToCSV(
    report: TotalBilledByProviderReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const totalBilled = Number(report.totalBilled || 0);
    const totalEmployees = Number(report.totalEmployees || 0);
    const startPeriod = report.startDate ? formateDate(report.startDate) : "-";
    const endPeriod = report.endDate ? formateDate(report.endDate) : "-";
    const line = "-".repeat(100);

    let csvContent = `${this.tr("t-tbbp-report-title").toUpperCase()}\n${line}\n`;
    csvContent += `${this.tr("t-start-period")},${startPeriod}\n`;
    csvContent += `${this.tr("t-end-period")},${endPeriod}\n`;
    csvContent += `${this.tr("t-institution")},${report.companyName || "-"}\n`;
    csvContent += `${this.tr("t-service-provider")},${report.serviceProviderName || "-"}\n`;
    csvContent += `${this.tr("t-provider-type")},${report.serviceProviderTypeName || "-"}\n\n`;

    csvContent += `${this.tr("t-service-provider")},${this.tr("t-provider-type")},${this.tr("t-total-employees")},${this.tr("t-total-billed")}\n`;
    csvContent += `${report.serviceProviderName || "-"},${report.serviceProviderTypeName || "-"},${totalEmployees},${totalBilled}\n`;
    csvContent += `${this.tr("t-totals").toUpperCase()},-,${totalEmployees},${totalBilled}\n\n`;
    csvContent += `${this.tr("t-generated-by")},${userName || this.tr("t-spr-system-user")}\n`;
    csvContent += `${this.tr("t-spr-generated-at")},${this.getCurrentDate()}\n`;

    const bom = "\uFEFF";
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = options?.fileName || `total-facturado-por-provedor-${new Date().toISOString().split("T")[0]}`;
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

