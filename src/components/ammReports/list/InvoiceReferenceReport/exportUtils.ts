import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoiceReferenceReportType } from "@/components/ammReports/types";
import { amountFormate } from "@/app/common/amountFormate";
import { formateDate } from "@/app/common/dateFormate";
import i18n from "@/plugins/i18n";

export interface ExportOptions {
  fileName?: string;
}

export class InvoiceReferenceReportExporter {
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
      minute: "2-digit",
    });
  }

  private static getCurrentDate(): string {
    return new Date().toLocaleDateString(this.localeCode());
  }

  private static getTitle(): string {
    return this.tr("t-report-100010-title");
  }

  static async exportToPDF(
    report: InvoiceReferenceReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const details = report.details || [];
    const totalAmount = Number(report.totalAmount || 0);

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    const generatedAt = this.getCurrentDateTime();

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(this.getTitle(), margin, margin);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${this.tr("t-report")} #100010 - ${this.getTitle()}`, margin, margin + 6);

    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(margin, margin + 10, pageWidth - margin, margin + 10);

    const cardsY = 28;
    const gap = 4;
    const cardWidth = (contentWidth - gap * 2) / 3;
    const cardHeight = 34;

    const drawCard = (
      x: number,
      y: number,
      title: string,
      headline: string,
      lines: string[],
      headlineColor: [number, number, number] = [55, 71, 79],
      iconBg: [number, number, number] = [227, 242, 253]
    ) => {
      const maxTextWidth = cardWidth - 16;
      const fitSingleLine = (text: string, fontSize: number): string => {
        pdf.setFontSize(fontSize);
        let output = text || "";
        while (pdf.getTextWidth(output) > maxTextWidth && output.length > 1) {
          output = `${output.slice(0, -2)}...`;
        }
        return output;
      };

      pdf.setDrawColor(225, 229, 235);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");

      pdf.setFillColor(iconBg[0], iconBg[1], iconBg[2]);
      pdf.roundedRect(x + 3, y + 3, 7, 7, 1.2, 1.2, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text(fitSingleLine(title, 7), x + 12, y + 6);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(headlineColor[0], headlineColor[1], headlineColor[2]);
      pdf.text(fitSingleLine(headline, 9.5), x + 12, y + 11);

      const dividerY = y + 13;
      pdf.setDrawColor(236, 239, 244);
      pdf.line(x + 3, dividerY, x + cardWidth - 3, dividerY);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(90, 90, 90);

      let lineY = dividerY + 4;
      lines.forEach((line) => {
        if (lineY <= y + cardHeight - 2) {
          pdf.text(fitSingleLine(line, 7), x + 3, lineY);
          lineY += 4;
        }
      });
    };

    drawCard(
      margin,
      cardsY,
      this.tr("t-invoice-reference"),
      report.invoiceReferenceNumber || "-",
      [
        `${this.tr("t-total-invoices")}: ${details.length}`,
        `${this.tr("t-contract")}: ${report.contract?.name || "-"}`,
      ]
    );

    drawCard(
      margin + cardWidth + gap,
      cardsY,
      this.tr("t-service-provider"),
      report.serviceProvider?.name || "-",
      [
        `${this.tr("t-service-provider-phone")}: ${report.serviceProvider?.phone || "-"}`,
        `${this.tr("t-service-provider-email")}: ${report.serviceProvider?.email || "-"}`,
      ],
      [46, 125, 50],
      [232, 245, 233]
    );

    drawCard(
      margin + (cardWidth + gap) * 2,
      cardsY,
      this.tr("t-total-billed"),
      `${amountFormate(totalAmount)} MT`,
      [],
      [183, 28, 28],
      [255, 235, 238]
    );

    autoTable(pdf, {
      startY: cardsY + cardHeight + 8,
      margin: { left: margin, right: margin },
      head: [[
        this.tr("t-invoice-number"),
        this.tr("t-invoice-reference"),
        this.tr("t-issue-date"),
        this.tr("t-due-date"),
        this.tr("t-invoice-status"),
        this.tr("t-authorized-by"),
        this.tr("t-total-amount"),
      ]],
      body: details.map((item) => [
        item.invoiceNumber || "-",
        item.invoiceReferenceNumber || "-",
        item.issueDate ? formateDate(item.issueDate) : "-",
        item.dueDate ? formateDate(item.dueDate) : "-",
        item.invoiceStatus || "-",
        item.authorizedBy || "-",
        `${amountFormate(Number(item.totalAmount || 0))} MT`,
      ]),
      foot: [[
        this.tr("t-totals").toUpperCase(),
        "-",
        "-",
        "-",
        "-",
        "-",
        `${amountFormate(totalAmount)} MT`,
      ]],
      theme: "grid",
      tableWidth: "auto",
      styles: { fontSize: 7.5, cellPadding: 2, lineWidth: 0.1, lineColor: [200, 200, 200], overflow: "linebreak" },
      headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
      footStyles: { fillColor: [248, 249, 250], textColor: [0, 0, 0], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        3: { cellWidth: "auto" },
        4: { cellWidth: "auto" },
        5: { cellWidth: "auto" },
        6: { cellWidth: "auto", halign: "right" },
      },
      didParseCell: (data: any) => {
        if (data.section === "foot" && data.column.index === 6) {
          data.cell.styles.textColor = [183, 28, 28];
        }
      },
    });

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

    const fileName = options?.fileName || `relatorio-facturas-por-referencia-${new Date().toISOString().split("T")[0]}`;
    pdf.save(`${fileName}.pdf`);
  }

  static async exportToExcel(
    report: InvoiceReferenceReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const details = report.details || [];
    const totalAmount = Number(report.totalAmount || 0);

    const workbook = XLSX.utils.book_new();
    const data: string[][] = [
      [this.getTitle().toUpperCase(), "", "", "", "", "", ""],
      [`${this.tr("t-invoice-reference")}: ${report.invoiceReferenceNumber || "-"}`, "", "", "", "", "", ""],
      [`${this.tr("t-contract")}: ${report.contract?.name || "-"}`, "", "", "", "", "", ""],
      [`${this.tr("t-service-provider")}: ${report.serviceProvider?.name || "-"}`, "", "", "", "", "", ""],
      [`${this.tr("t-total-amount")}: ${amountFormate(totalAmount)} MT`, "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      [this.tr("t-report-details").toUpperCase(), "", "", "", "", "", ""],
      [this.tr("t-invoice-number"), this.tr("t-invoice-reference"), this.tr("t-issue-date"), this.tr("t-due-date"), this.tr("t-invoice-status"), this.tr("t-authorized-by"), `${this.tr("t-total-amount")} (MT)`],
      ...details.map((item) => [
        item.invoiceNumber || "-",
        item.invoiceReferenceNumber || "-",
        item.issueDate ? formateDate(item.issueDate) : "-",
        item.dueDate ? formateDate(item.dueDate) : "-",
        item.invoiceStatus || "-",
        item.authorizedBy || "-",
        String(item.totalAmount || 0),
      ]),
      [this.tr("t-totals").toUpperCase(), "-", "-", "-", "-", "-", String(totalAmount)],
      ["", "", "", "", "", "", ""],
      [this.tr("t-generated-by"), userName || this.tr("t-spr-system-user"), this.tr("t-spr-generated-at"), this.getCurrentDate(), "", "", ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 18 }, { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 26 }, { wch: 18 }];
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 6 } },
    ];

    if (ws["A1"]) ws["A1"].s = { font: { sz: 14, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1F3A93" } } };
    if (ws["A7"]) ws["A7"].s = { font: { sz: 11, bold: true, color: { rgb: "333333" } }, fill: { fgColor: { rgb: "E8E8E8" } } };

    ["A8", "B8", "C8", "D8", "E8", "F8", "G8"].forEach((cell) => {
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true, color: { rgb: "1F3A93" } },
          fill: { fgColor: { rgb: this.SOFT_BLUE } },
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: this.BORDER } },
            bottom: { style: "thin", color: { rgb: this.BORDER } },
            left: { style: "thin", color: { rgb: this.BORDER } },
            right: { style: "thin", color: { rgb: this.BORDER } },
          },
        };
      }
    });

    const borderStyle = {
      top: { style: "thin", color: { rgb: this.BORDER } },
      bottom: { style: "thin", color: { rgb: this.BORDER } },
      left: { style: "thin", color: { rgb: this.BORDER } },
      right: { style: "thin", color: { rgb: this.BORDER } },
    };

    const startRow = 9;
    const totalsRow = startRow + details.length;

    for (let row = startRow; row <= totalsRow; row++) {
      const isTotals = row === totalsRow;
      const fill = isTotals ? this.LIGHT_GRAY : row % 2 === 0 ? "FAFCFF" : "FFFFFF";

      ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
        const cell = `${col}${row}`;
        if (!ws[cell]) return;

        ws[cell].s = {
          fill: { fgColor: { rgb: fill } },
          border: borderStyle,
          alignment: { horizontal: col === "G" ? "right" : "left", vertical: "center", wrapText: true },
          font: { bold: isTotals },
        };
      });

      if (ws[`G${row}`]) ws[`G${row}`].z = '#,##0.00" MT"';
      if (isTotals && ws[`G${row}`]) {
        ws[`G${row}`].s = {
          ...(ws[`G${row}`].s || {}),
          font: { bold: true, color: { rgb: "B71C1C" } },
        };
      }
    }

    ws["!autofilter"] = { ref: `A8:G${totalsRow}` };

    XLSX.utils.book_append_sheet(workbook, ws, this.getTitle());

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const fileName = options?.fileName || `relatorio-facturas-por-referencia-${new Date().toISOString().split("T")[0]}`;
    this.saveFile(excelBuffer, `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  static async exportToCSV(
    report: InvoiceReferenceReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const details = report.details || [];
    const totalAmount = Number(report.totalAmount || 0);

    let csvContent = `${this.getTitle().toUpperCase()}\n`;
    csvContent += `${this.tr("t-invoice-reference")},${report.invoiceReferenceNumber || "-"}\n`;
    csvContent += `${this.tr("t-contract")},${report.contract?.name || "-"}\n`;
    csvContent += `${this.tr("t-service-provider")},${report.serviceProvider?.name || "-"}\n`;
    csvContent += `${this.tr("t-total-amount")},${totalAmount}\n\n`;

    csvContent += `${this.tr("t-invoice-number")},${this.tr("t-invoice-reference")},${this.tr("t-issue-date")},${this.tr("t-due-date")},${this.tr("t-invoice-status")},${this.tr("t-authorized-by")},${this.tr("t-total-amount")}\n`;

    details.forEach((item) => {
      csvContent += `${item.invoiceNumber || "-"},${item.invoiceReferenceNumber || "-"},${item.issueDate ? formateDate(item.issueDate) : "-"},${item.dueDate ? formateDate(item.dueDate) : "-"},${item.invoiceStatus || "-"},${item.authorizedBy || "-"},${item.totalAmount || 0}\n`;
    });

    csvContent += `${this.tr("t-totals").toUpperCase()},-,-,-,-,-,${totalAmount}\n\n`;
    csvContent += `${this.tr("t-generated-by")},${userName || this.tr("t-spr-system-user")}\n`;
    csvContent += `${this.tr("t-spr-generated-at")},${this.getCurrentDate()}\n`;

    const bom = "\uFEFF";
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = options?.fileName || `relatorio-facturas-por-referencia-${new Date().toISOString().split("T")[0]}`;
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
