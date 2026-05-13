import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import type { EmployeeExpenseStatementReportType } from "@/components/ammReports/types";
import { amountFormate } from "@/app/common/amountFormate";
import { formateDate } from "@/app/common/dateFormate";
import i18n from "@/plugins/i18n";

export interface ExportOptions {
  fileName?: string;
}

export class EmployeeExpenseStatementReportExporter {
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

  private static fitText(pdf: jsPDF, text: string, maxWidth: number): string {
    let value = text || "";
    if (pdf.getTextWidth(value) <= maxWidth) return value;
    const ellipsis = "...";
    while (value.length > 0 && pdf.getTextWidth(value + ellipsis) > maxWidth) {
      value = value.slice(0, -1);
    }
    return `${value}${ellipsis}`;
  }

  private static drawTextInCell(
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    width: number,
    align: "left" | "right" = "left"
  ) {
    const fitted = this.fitText(pdf, text, Math.max(2, width - 2));
    if (align === "right") {
      pdf.text(fitted, x + width, y, { align: "right" });
      return;
    }
    pdf.text(fitted, x, y);
  }

  static async exportToPDF(
    report: EmployeeExpenseStatementReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const details = report.details || [];
    const totalAmount = Number(report.totalAmount || 0);
    const employeeUsedBalance = Number(report.employeeUsedBalance || 0);
    const employeeRemaingBalance = Number(report.employeeRemaingBalance || 0);
    const employeeAllocatedBalance = Number(report.employeeAllocatedBalance || 0);
    const employeeName = `${report.employeeFirstName || ""} ${report.employeeLastName || ""}`.trim() || "-";
    const generatedAt = this.getCurrentDateTime();
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: false,
      putOnlyUsedFonts: true,
      precision: 2
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - (margin * 2);
    const tableMargin = 8;
    const tableWidth = pageWidth - (tableMargin * 2);

    let currentY = margin;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.tr("t-ees-report-title"), margin, currentY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${this.tr("t-report")} #100009 - ${this.tr("t-report-100009-title")}`, margin, currentY + 6);

    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(margin, currentY + 10, pageWidth - margin, currentY + 10);

    currentY = 28;

    const gap = 4;
    const cardWidth = (contentWidth - (gap * 2)) / 3;
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
      const maxTextWidth = cardWidth - 18;
      pdf.setDrawColor(225, 229, 235);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");
      pdf.setFillColor(iconBg[0], iconBg[1], iconBg[2]);
      pdf.roundedRect(x + 4, y + 4, 8, 8, 1.5, 1.5, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text(this.fitText(pdf, title, maxTextWidth), x + 14, y + 7);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(headlineColor[0], headlineColor[1], headlineColor[2]);
      pdf.text(this.fitText(pdf, headline, maxTextWidth), x + 14, y + 12);

      const dividerY = y + 16;
      pdf.setDrawColor(236, 239, 244);
      pdf.line(x + 3, dividerY, x + cardWidth - 3, dividerY);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(90, 90, 90);
      let lineY = dividerY + 5;
      lines.forEach((line) => {
        pdf.text(this.fitText(pdf, line, cardWidth - 8), x + 4, lineY);
        lineY += 4;
      });
    };

    drawCard(
      margin,
      currentY,
      this.tr("t-employee"),
      employeeName,
      [
        `${this.tr("t-department")}: ${report.employeeDepartmentName || "-"}`,
        `${this.tr("t-position")}: ${report.employeePositionName || "-"}`
      ],
      [55, 71, 79],
      [227, 242, 253]
    );

    drawCard(
      margin + cardWidth + gap,
      currentY,
      this.tr("t-institution"),
      report.contractName || "-",
      [
        `${this.tr("t-coverage-period")}: ${report.coveragePeriodName || "-"}`,
        `${this.tr("t-total-invoices")}: ${details.length}`
      ],
      [46, 125, 50],
      [232, 245, 233]
    );

    drawCard(
      margin + ((cardWidth + gap) * 2),
      currentY,
      this.tr("t-total-billed"),
      `${amountFormate(totalAmount)} MT`,
      [
        `${this.tr("t-total-paid-by-company")}: ${amountFormate(employeeUsedBalance)} MT`,
        `${this.tr("t-remaining-balance")}: ${amountFormate(employeeRemaingBalance)} MT`,
        `${this.tr("t-total-allocated")}: ${amountFormate(employeeAllocatedBalance)} MT`
      ],
      [183, 28, 28],
      [255, 235, 238]
    );

    currentY += cardHeight + 8;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.tr("t-report-details"), margin, currentY);
    currentY += 5;

    const baseColumns = [
      { key: "issueDate", title: this.tr("t-issue-date"), width: 24, align: "left" as const },
      { key: "invoiceNumber", title: this.tr("t-invoice-number"), width: 24, align: "left" as const },
      { key: "serviceProvider", title: this.tr("t-service-provider"), width: 36, align: "left" as const },
      { key: "patient", title: this.tr("t-patient"), width: 34, align: "left" as const },
      { key: "procedures", title: this.tr("t-procedures"), width: 78, align: "left" as const },
      { key: "total", title: this.tr("t-total-billed"), width: 24, align: "right" as const }
    ];
    const baseWidth = baseColumns.reduce((sum, column) => sum + column.width, 0);
    const scale = tableWidth / baseWidth;
    const columns = baseColumns.map((column, index) => {
      const scaledWidth = index === baseColumns.length - 1
        ? tableWidth - baseColumns.slice(0, -1).reduce((sum, current) => sum + Math.round(current.width * scale * 10) / 10, 0)
        : Math.round(column.width * scale * 10) / 10;
      return { ...column, width: scaledWidth };
    });

    const rowHeight = 8;
    const headerHeight = 10;
    const footerHeight = 8;
    const tableX = tableMargin;
    const drawTableHeader = (y: number) => {
      let x = tableX;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      columns.forEach((column) => {
        pdf.setFillColor(66, 66, 66);
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(x, y, column.width, headerHeight, "FD");
        pdf.setTextColor(255, 255, 255);
        this.drawTextInCell(pdf, column.title, x + 1.5, y + 6, column.width - 3, column.align);
        x += column.width;
      });
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
    };

    const maxBodyY = pageHeight - 22;
    drawTableHeader(currentY);
    currentY += headerHeight;

    for (const item of details) {
      if (currentY + rowHeight > maxBodyY) {
        pdf.addPage("a4", "landscape");
        currentY = margin;
        drawTableHeader(currentY);
        currentY += headerHeight;
      }

      const row = [
        item.invoiceIssueDate ? formateDate(item.invoiceIssueDate) : "-",
        item.invoiceNumber || "-",
        item.serviceProviderName || "-",
        item.pacientName || "-",
        (item.hospitalProcedureTypeName || []).join(", ") || "-",
        `${amountFormate(Number(item.invoiceTotalAmount || 0))} MT`
      ];

      let x = tableX;
      columns.forEach((column, index) => {
        pdf.setDrawColor(220, 220, 220);
        pdf.rect(x, currentY, column.width, rowHeight);
        this.drawTextInCell(pdf, row[index], x + 1.5, currentY + 5.3, column.width - 3, column.align);
        x += column.width;
      });

      currentY += rowHeight;
    }

    if (currentY + footerHeight > maxBodyY) {
      pdf.addPage("a4", "landscape");
      currentY = margin;
      drawTableHeader(currentY);
      currentY += headerHeight;
    }

    let footerX = tableX;
    const footerRow = [
      this.tr("t-totals").toUpperCase(),
      "-",
      "-",
      "-",
      "-",
      `${amountFormate(totalAmount)} MT`
    ];
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    columns.forEach((column, index) => {
      pdf.setFillColor(248, 249, 250);
      pdf.setDrawColor(180, 180, 180);
      pdf.rect(footerX, currentY, column.width, footerHeight, "FD");
      pdf.setTextColor(index === columns.length - 1 ? 183 : 0, index === columns.length - 1 ? 28 : 0, index === columns.length - 1 ? 28 : 0);
      this.drawTextInCell(pdf, footerRow[index], footerX + 1.5, currentY + 5.3, column.width - 3, column.align);
      footerX += column.width;
    });
    pdf.setTextColor(0, 0, 0);

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
      const dateText = `${this.tr("t-spr-date")}: ${this.getCurrentDate()}`;
      const generatedText = `${this.tr("t-spr-generated-at")}: ${generatedAt}`;
      const userFooter = `${this.tr("t-spr-user")}: ${userName || this.tr("t-spr-system-user")}`;
      pdf.text(footerText, margin, footerY - 5);
      pdf.text(generatedText, margin, footerY - 12);
      pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), footerY - 5);
      pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), footerY - 12);
      pdf.text(userFooter, pageWidth - margin - pdf.getTextWidth(userFooter), footerY - 19);
    }

    const fileName = options?.fileName || `extrato-por-colaborador-${new Date().toISOString().split("T")[0]}`;
    pdf.save(`${fileName}.pdf`);
  }

  static async exportToExcel(
    report: EmployeeExpenseStatementReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const details = report.details || [];
    const totalAmount = Number(report.totalAmount || 0);
    const employeeUsedBalance = Number(report.employeeUsedBalance || 0);
    const employeeRemaingBalance = Number(report.employeeRemaingBalance || 0);
    const employeeAllocatedBalance = Number(report.employeeAllocatedBalance || 0);
    const employeeName = `${report.employeeFirstName || ""} ${report.employeeLastName || ""}`.trim() || "-";

    const workbook = XLSX.utils.book_new();
    const data: string[][] = [
      [this.tr("t-ees-report-title").toUpperCase(), "", "", "", "", ""],
      [`${this.tr("t-employee")}: ${employeeName}`, "", "", "", "", ""],
      [`${this.tr("t-institution")}: ${report.contractName || "-"}`, "", "", "", "", ""],
      [`${this.tr("t-coverage-period")}: ${report.coveragePeriodName || "-"}`, "", "", "", "", ""],
      [this.tr("t-total-billed"), `${amountFormate(totalAmount)} MT`, this.tr("t-total-paid-by-company"), `${amountFormate(employeeUsedBalance)} MT`, "", ""],
      [this.tr("t-remaining-balance"), `${amountFormate(employeeRemaingBalance)} MT`, this.tr("t-total-allocated"), `${amountFormate(employeeAllocatedBalance)} MT`, "", ""],
      ["", "", "", "", "", ""],
      [this.tr("t-report-details").toUpperCase(), "", "", "", "", ""],
      [this.tr("t-issue-date"), this.tr("t-invoice-number"), this.tr("t-service-provider"), this.tr("t-patient"), this.tr("t-procedures"), `${this.tr("t-total-billed")} (MT)`],
      ...details.map((item) => [
        item.invoiceIssueDate ? formateDate(item.invoiceIssueDate) : "-",
        item.invoiceNumber || "-",
        item.serviceProviderName || "-",
        item.pacientName || "-",
        (item.hospitalProcedureTypeName || []).join(", ") || "-",
        String(item.invoiceTotalAmount || 0),
      ]),
      [this.tr("t-totals").toUpperCase(), "-", "-", "-", "-", String(totalAmount)],
      ["", "", "", "", "", ""],
      [this.tr("t-generated-by"), userName || this.tr("t-spr-system-user"), this.tr("t-spr-generated-at"), this.getCurrentDate(), "", ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 28 }, { wch: 28 }, { wch: 52 }, { wch: 20 }];
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 5 } },
    ];

    if (ws["A1"]) ws["A1"].s = { font: { sz: 14, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1F3A93" } } };
    if (ws["A8"]) ws["A8"].s = { font: { sz: 11, bold: true, color: { rgb: "333333" } }, fill: { fgColor: { rgb: "E8E8E8" } } };

    ["A9", "B9", "C9", "D9", "E9", "F9"].forEach((cell) => {
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

    const startRow = 10;
    const totalsRow = startRow + details.length;

    for (let row = startRow; row <= totalsRow; row++) {
      const isTotals = row === totalsRow;
      const fill = isTotals ? this.LIGHT_GRAY : row % 2 === 0 ? "FAFCFF" : "FFFFFF";

      ["A", "B", "C", "D", "E", "F"].forEach((col) => {
        const cell = `${col}${row}`;
        if (!ws[cell]) return;

        ws[cell].s = {
          fill: { fgColor: { rgb: fill } },
          border: borderStyle,
          alignment: { horizontal: col === "F" ? "right" : "left", vertical: "center", wrapText: true },
          font: { bold: isTotals },
        };
      });

      if (ws[`F${row}`]) ws[`F${row}`].z = '#,##0.00" MT"';
      if (isTotals && ws[`F${row}`]) {
        ws[`F${row}`].s = {
          ...(ws[`F${row}`].s || {}),
          font: { bold: true, color: { rgb: "B71C1C" } },
        };
      }
    }

    ws["!autofilter"] = { ref: `A9:F${totalsRow}` };

    XLSX.utils.book_append_sheet(workbook, ws, this.tr("t-ees-sheet"));

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const fileName = options?.fileName || `extrato-por-colaborador-${new Date().toISOString().split("T")[0]}`;
    this.saveFile(excelBuffer, `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  static async exportToCSV(
    report: EmployeeExpenseStatementReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const details = report.details || [];
    const totalAmount = Number(report.totalAmount || 0);
    const employeeUsedBalance = Number(report.employeeUsedBalance || 0);
    const employeeRemaingBalance = Number(report.employeeRemaingBalance || 0);
    const employeeAllocatedBalance = Number(report.employeeAllocatedBalance || 0);
    const employeeName = `${report.employeeFirstName || ""} ${report.employeeLastName || ""}`.trim() || "-";

    let csvContent = `${this.tr("t-ees-report-title").toUpperCase()}\n`;
    csvContent += `${this.tr("t-employee")},${employeeName}\n`;
    csvContent += `${this.tr("t-position")},${report.employeePositionName || "-"}\n`;
    csvContent += `${this.tr("t-department")},${report.employeeDepartmentName || "-"}\n`;
    csvContent += `${this.tr("t-institution")},${report.contractName || "-"}\n`;
    csvContent += `${this.tr("t-coverage-period")},${report.coveragePeriodName || "-"}\n`;
    csvContent += `${this.tr("t-total-billed")},${totalAmount}\n`;
    csvContent += `${this.tr("t-total-paid-by-company")},${employeeUsedBalance}\n`;
    csvContent += `${this.tr("t-remaining-balance")},${employeeRemaingBalance}\n`;
    csvContent += `${this.tr("t-total-allocated")},${employeeAllocatedBalance}\n\n`;

    csvContent += `${this.tr("t-issue-date")},${this.tr("t-invoice-number")},${this.tr("t-service-provider")},${this.tr("t-patient")},${this.tr("t-procedures")},${this.tr("t-total-billed")}\n`;

    details.forEach((item) => {
      csvContent += `${item.invoiceIssueDate ? formateDate(item.invoiceIssueDate) : "-"},${item.invoiceNumber || "-"},${item.serviceProviderName || "-"},${item.pacientName || "-"},"${(item.hospitalProcedureTypeName || []).join(", ")}",${item.invoiceTotalAmount || 0}\n`;
    });

    csvContent += `${this.tr("t-totals").toUpperCase()},-,-,-,-,${totalAmount}\n\n`;
    csvContent += `${this.tr("t-generated-by")},${userName || this.tr("t-spr-system-user")}\n`;
    csvContent += `${this.tr("t-spr-generated-at")},${this.getCurrentDate()}\n`;

    const bom = "\uFEFF";
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = options?.fileName || `extrato-por-colaborador-${new Date().toISOString().split("T")[0]}`;
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
