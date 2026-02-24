import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CompanyCostPerEmployeeReportType, InvoiceEmployeeSummaryType } from "@/components/ammReports/types";
import { amountFormate } from '@/app/common/amountFormate';
import { formateDate } from "@/app/common/dateFormate";
import i18n from '@/plugins/i18n';

export interface ExportOptions {
  fileName?: string;
}

export class CostPerEmployeeReportExporter {
  private static tr(key: string, params?: Record<string, unknown>): string {
    const translated = (i18n as any).global.t(key, params);
    return typeof translated === 'string' ? translated : String(translated);
  }

  private static localeCode(): string {
    const rawLocale = (i18n as any).global.locale;
    const locale = typeof rawLocale === 'string' ? rawLocale : rawLocale?.value;
    return locale === 'en' ? 'en-US' : 'pt-PT';
  }

  private static buildDefaultFileName(
    report: CompanyCostPerEmployeeReportType,
    extension: 'pdf' | 'xlsx' | 'csv'
  ): string {
    const companyName = (report.company?.name || this.tr('t-cpe-company-fallback'))
      .replace(/\s+/g, '-')
      .toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const prefix = this.tr('t-cpe-file-prefix');
    return `${prefix}-${companyName}-${date}.${extension}`;
  }

  private static getCurrentDateTime(): string {
    return new Date().toLocaleDateString(this.localeCode(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private static getCurrentDate(): string {
    return new Date().toLocaleDateString(this.localeCode());
  }

  static async exportToPDF(
    report: CompanyCostPerEmployeeReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        let currentY = margin;

        this.addPDFHeader(pdf, report, userName, margin, currentY, pageWidth);
        currentY = 40;

        currentY = this.addPDFSummaryCards(pdf, report, userName, margin, contentWidth, currentY);
        currentY += 5;

        const totals = this.calculateTotals(report);
        const tableResult = this.addPDFTable(pdf, report, totals, margin, currentY);
        currentY = tableResult.finalY;

        if (currentY < pageHeight - 40) {
          currentY = this.addFinancialSummary(pdf, totals, margin, contentWidth, currentY);
        }

        this.addPDFFooterAllPages(pdf, userName, margin, pageWidth, pageHeight);

        const fileName = options?.fileName
          ? `${options.fileName}.pdf`
          : this.buildDefaultFileName(report, 'pdf');
        pdf.save(fileName);

        resolve();
      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  private static calculateTotals(report: CompanyCostPerEmployeeReportType) {
    const summaries = report.invoiceEmployeeSummaries || [];
    const totalAmount = summaries.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalInvoices = summaries.reduce((sum, item) => sum + item.totalInvoices, 0);

    return {
      totalAmount,
      totalEmployees: summaries.length,
      totalInvoices,
      averagePerEmployee: summaries.length > 0 ? totalAmount / summaries.length : 0,
      averagePerInvoice: totalInvoices > 0 ? totalAmount / totalInvoices : 0
    };
  }

  private static addPDFHeader(
    pdf: jsPDF,
    report: CompanyCostPerEmployeeReportType,
    userName: string,
    margin: number,
    currentY: number,
    pageWidth: number
  ): void {
    const currentDate = this.getCurrentDateTime();

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(this.tr('t-cpe-report-title'), margin, currentY);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(this.tr('t-cpe-report-subtitle'), margin, currentY + 6);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const companyName = report.company?.name || this.tr('t-cpe-company-fallback');
    pdf.text(companyName, margin, currentY + 14);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const dateText = `${this.tr('t-cpe-generated-at')}: ${currentDate}`;
    const userText = `${this.tr('t-cpe-by')}: ${userName || this.tr('t-cpe-system-user')}`;

    const dateWidth = pdf.getTextWidth(dateText);
    pdf.text(dateText, pageWidth - margin - dateWidth, currentY + 6);
    pdf.text(userText, pageWidth - margin - pdf.getTextWidth(userText), currentY + 14);

    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(margin, currentY + 20, pageWidth - margin, currentY + 20);
  }

  private static addPDFSummaryCards(
    pdf: jsPDF,
    report: CompanyCostPerEmployeeReportType,
    userName: string,
    margin: number,
    contentWidth: number,
    currentY: number
  ): number {
    const cardWidth = (contentWidth - 15) / 3;
    const cardHeight = 35;

    pdf.setFillColor(248, 249, 250);
    pdf.rect(margin, currentY, cardWidth, cardHeight, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(this.tr('t-institution'), margin + 8, currentY + 8);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const companyName = report.company?.name || this.tr('t-cpe-na');
    if (companyName.length > 25) {
      pdf.text(`${companyName.substring(0, 25)}...`, margin + 8, currentY + 14);
    } else {
      pdf.text(companyName, margin + 8, currentY + 14);
    }

    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    const email = report.company?.email || this.tr('t-cpe-na');
    if (email.length > 20) {
      pdf.text(`${email.substring(0, 20)}...`, margin + 8, currentY + 20);
    } else {
      pdf.text(email, margin + 8, currentY + 20);
    }
    pdf.text(`${this.tr('t-cpe-phone-short')}: ${report.company?.phone || this.tr('t-cpe-na')}`, margin + 8, currentY + 26);

    const hasCoveragePeriod = report.coveragePeriod !== null && report.coveragePeriod !== undefined;
    const card2X = margin + cardWidth + 7.5;

    pdf.setFillColor(232, 245, 233);
    pdf.rect(card2X, currentY, cardWidth, cardHeight, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    const periodTitle = hasCoveragePeriod ? this.tr('t-period') : this.tr('t-issue-period');
    pdf.text(periodTitle, card2X + 8, currentY + 8);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const periodName = hasCoveragePeriod ? report.coveragePeriod?.name || this.tr('t-cpe-na') : this.tr('t-custom-period');
    if (periodName.length > 20) {
      pdf.text(`${periodName.substring(0, 20)}...`, card2X + 8, currentY + 14);
    } else {
      pdf.text(periodName, card2X + 8, currentY + 14);
    }

    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    const startDate = hasCoveragePeriod && report.coveragePeriod?.startDate
      ? formateDate(report.coveragePeriod.startDate)
      : (report.fromDate ? formateDate(report.fromDate) : this.tr('t-cpe-na'));
    const endDate = hasCoveragePeriod && report.coveragePeriod?.endDate
      ? formateDate(report.coveragePeriod.endDate)
      : (report.toDate ? formateDate(report.toDate) : this.tr('t-cpe-na'));

    pdf.text(`${this.tr('t-start-period')}: ${startDate}`, card2X + 8, currentY + 22);
    pdf.text(`${this.tr('t-end-period')}: ${endDate}`, card2X + 8, currentY + 28);

    const card3X = card2X + cardWidth + 7.5;
    const summaries = report.invoiceEmployeeSummaries || [];
    const totalEmployees = summaries.length;
    const totalAmount = summaries.reduce((sum, item) => sum + item.totalAmount, 0);

    pdf.setFillColor(225, 245, 254);
    pdf.rect(card3X, currentY, cardWidth, cardHeight, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(this.tr('t-cpe-summary'), card3X + 8, currentY + 8);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${this.tr('t-employees')}: ${totalEmployees}`, card3X + 8, currentY + 16);

    pdf.setFontSize(8);
    pdf.setTextColor(33, 150, 243);
    pdf.text(`${this.tr('t-total-amount')}: ${amountFormate(totalAmount)} MT`, card3X + 8, currentY + 22);

    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${this.tr('t-cpe-by')}: ${userName || this.tr('t-cpe-system-user')}`, card3X + 8, currentY + 30);

    return currentY + cardHeight + 5;
  }

  private static addPDFTable(
    pdf: jsPDF,
    report: CompanyCostPerEmployeeReportType,
    totals: any,
    margin: number,
    currentY: number
  ): { finalY: number } {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.tr('t-expenses-by-employee'), margin, currentY);

    const tableData = report.invoiceEmployeeSummaries?.map((item: InvoiceEmployeeSummaryType) => [
      item.employeeName,
      item.totalInvoices.toString(),
      `${amountFormate(item.totalAmount)} MT`,
      item.totalInvoices > 0 ? `${amountFormate(item.totalAmount / item.totalInvoices)} MT` : '-'
    ]) || [];

    tableData.push([
      this.tr('t-totals').toUpperCase(),
      totals.totalInvoices.toString(),
      `${amountFormate(totals.totalAmount)} MT`,
      totals.totalInvoices > 0 ? `${amountFormate(totals.averagePerInvoice)} MT` : '-'
    ]);

    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: margin, right: margin },
      head: [[
        this.tr('t-employee'),
        this.tr('t-cpe-invoices-count'),
        this.tr('t-cpe-total-spent'),
        this.tr('t-average-per-invoice')
      ]],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontSize: 8 },
        1: { cellWidth: 25, halign: 'right', fontSize: 8 },
        2: { cellWidth: 30, halign: 'right', fontSize: 8 },
        3: { cellWidth: 30, halign: 'right', fontSize: 8 }
      },
      didParseCell: (data: any) => {
        if (data.row.index === (report.invoiceEmployeeSummaries?.length || 0)) {
          data.cell.styles.fillColor = [248, 249, 250];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.lineWidth = 0.3;
          data.cell.styles.lineColor = [100, 100, 100];
        }
      },
      willDrawCell: (data: any) => {
        if (data.row.index === (report.invoiceEmployeeSummaries?.length || 0)) {
          data.doc.setLineWidth(0.3);
          data.doc.setDrawColor(100, 100, 100);
        }
      }
    });

    const finalY = (pdf as any).lastAutoTable?.finalY || currentY + 100;
    return { finalY: finalY + 10 };
  }

  private static addFinancialSummary(
    pdf: jsPDF,
    totals: any,
    margin: number,
    contentWidth: number,
    currentY: number
  ): number {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.tr('t-financial-summary'), margin, currentY);

    const summaryY = currentY + 8;
    const lineHeight = 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    pdf.setTextColor(0, 0, 0);
    pdf.text(`${this.tr('t-cpe-total-overall-spent')}:`, margin, summaryY);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(183, 28, 28);
    pdf.text(`${amountFormate(totals.totalAmount)} MT`, margin + 50, summaryY);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${this.tr('t-average-per-employee')}:`, margin, summaryY + lineHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(33, 150, 243);
    pdf.text(`${amountFormate(totals.averagePerEmployee)} MT`, margin + 50, summaryY + lineHeight);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${this.tr('t-average-per-invoice')}:`, margin, summaryY + (lineHeight * 2));
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(76, 175, 80);
    pdf.text(`${amountFormate(totals.averagePerInvoice)} MT`, margin + 50, summaryY + (lineHeight * 2));

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${this.tr('t-total-invoices')}:`, margin + contentWidth / 2, summaryY);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(totals.totalInvoices.toString(), margin + contentWidth / 2 + 40, summaryY);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${this.tr('t-total-employees')}:`, margin + contentWidth / 2, summaryY + lineHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(totals.totalEmployees.toString(), margin + contentWidth / 2 + 40, summaryY + lineHeight);

    return summaryY + (lineHeight * 3) + 10;
  }

  private static addPDFFooterAllPages(
    pdf: jsPDF,
    userName: string,
    margin: number,
    pageWidth: number,
    pageHeight: number
  ): void {
    const currentDate = this.getCurrentDate();
    const totalPages = pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      const footerY = pageHeight - 15;

      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);

      const footerText = this.tr('t-cpe-system-footer');
      const dateText = `${this.tr('t-cpe-date')}: ${currentDate}`;
      const userText = `${this.tr('t-cpe-user')}: ${userName || this.tr('t-cpe-system-user')}`;
      const pageText = this.tr('t-cpe-page-of', { current: i, total: totalPages });

      pdf.text(footerText, margin, footerY - 5);

      const pageTextWidth = pdf.getTextWidth(pageText);
      pdf.text(pageText, pageWidth - margin - pageTextWidth, footerY - 5);

      const dateTextWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, pageWidth - margin - dateTextWidth, footerY - 12);

      const userTextWidth = pdf.getTextWidth(userText);
      pdf.text(userText, pageWidth - margin - userTextWidth, footerY - 19);
    }
  }

  static async exportToExcel(
    report: CompanyCostPerEmployeeReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();
      const currentDate = this.getCurrentDate();
      const totals = this.calculateTotals(report);

      const summaryData = [
        [this.tr('t-cpe-report-title').toUpperCase()],
        [''],
        [`${this.tr('t-cpe-company')}:`, report.company?.name || this.tr('t-cpe-na')],
        [`${this.tr('t-cpe-email')}:`, report.company?.email || this.tr('t-cpe-na')],
        [`${this.tr('t-cpe-phone')}:`, report.company?.phone || this.tr('t-cpe-na')],
        [`${this.tr('t-cpe-address')}:`, report.company?.address || this.tr('t-cpe-na')],
        [''],
        [this.tr('t-cpe-period-section')],
        [`${this.tr('t-cpe-type')}:`, report.coveragePeriod ? this.tr('t-coverage-period') : this.tr('t-custom-period')],
        [`${this.tr('t-cpe-name')}:`, report.coveragePeriod?.name || this.tr('t-cpe-na')],
        [`${this.tr('t-cpe-start-date')}:`, report.coveragePeriod && report.coveragePeriod.startDate ? formateDate(report.coveragePeriod.startDate) : (report.fromDate ? formateDate(report.fromDate) : this.tr('t-cpe-na'))],
        [`${this.tr('t-cpe-end-date')}:`, report.coveragePeriod && report.coveragePeriod.endDate ? formateDate(report.coveragePeriod.endDate) : (report.toDate ? formateDate(report.toDate) : this.tr('t-cpe-na'))],
        [''],
        [this.tr('t-cpe-statistical-summary')],
        [`${this.tr('t-total-employees')}:`, totals.totalEmployees.toString()],
        [`${this.tr('t-total-invoices')}:`, totals.totalInvoices.toString()],
        [`${this.tr('t-total-amount')}:`, `${amountFormate(totals.totalAmount)} MT`],
        [`${this.tr('t-average-per-employee')}:`, `${amountFormate(totals.averagePerEmployee)} MT`],
        [`${this.tr('t-average-per-invoice')}:`, `${amountFormate(totals.averagePerInvoice)} MT`],
        [''],
        [this.tr('t-cpe-report-information')],
        [`${this.tr('t-generated-by')}:`, userName || this.tr('t-cpe-system-user')],
        [`${this.tr('t-cpe-generated-at')}:`, currentDate],
        [`${this.tr('t-cpe-report-id')}:`, '100002']
      ];

      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      this.applyExcelStyles(summaryWS);
      XLSX.utils.book_append_sheet(workbook, summaryWS, this.tr('t-cpe-sheet-summary'));

      const employeesData: string[][] = [
        [this.tr('t-expenses-by-employee').toUpperCase()],
        [''],
        [
          this.tr('t-employee'),
          this.tr('t-cpe-invoices-count'),
          `${this.tr('t-cpe-total-spent')} (MT)`,
          `${this.tr('t-average-per-invoice')} (MT)`
        ]
      ];

      report.invoiceEmployeeSummaries?.forEach((item: InvoiceEmployeeSummaryType) => {
        employeesData.push([
          item.employeeName,
          item.totalInvoices.toString(),
          item.totalAmount.toString(),
          item.totalInvoices > 0 ? (item.totalAmount / item.totalInvoices).toString() : '0'
        ]);
      });

      employeesData.push(['']);
      employeesData.push([
        this.tr('t-totals').toUpperCase(),
        totals.totalInvoices.toString(),
        totals.totalAmount.toString(),
        totals.totalInvoices > 0 ? totals.averagePerInvoice.toString() : '0'
      ]);

      const employeesWS = XLSX.utils.aoa_to_sheet(employeesData);
      this.applyEmployeesExcelStyles(employeesWS, employeesData.length);
      XLSX.utils.book_append_sheet(workbook, employeesWS, this.tr('t-cpe-sheet-employees'));

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true
      });

      const fileName = options?.fileName
        ? `${options.fileName}.xlsx`
        : this.buildDefaultFileName(report, 'xlsx');
      this.saveFile(excelBuffer, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    }
  }

  private static applyExcelStyles(ws: XLSX.WorkSheet): void {
    const colWidths = [{ wch: 25 }, { wch: 35 }];
    ws['!cols'] = colWidths;

    if (ws['A1']) {
      ws['A1'].s = {
        font: { sz: 14, bold: true, color: { rgb: '1F3A93' } },
        alignment: { horizontal: 'center' }
      };
    }

    [7, 13, 19].forEach(row => {
      const cell = `A${row}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 11, bold: true, color: { rgb: '333333' } },
          fill: { fgColor: { rgb: 'E8E8E8' } }
        };
      }
    });

    if (ws['B16']) {
      ws['B16'].s = {
        font: { sz: 11, bold: true, color: { rgb: 'B71C1C' } }
      };
    }
  }

  private static applyEmployeesExcelStyles(ws: XLSX.WorkSheet, dataLength: number): void {
    const colWidths = [
      { wch: 40 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 }
    ];
    ws['!cols'] = colWidths;

    if (ws['A1']) {
      ws['A1'].s = {
        font: { sz: 12, bold: true, color: { rgb: '1F3A93' } }
      };
    }

    const headerRow = 3;
    ['A', 'B', 'C', 'D'].forEach(col => {
      const cell = `${col}${headerRow}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true, color: { rgb: '1F3A93' } },
          fill: { fgColor: { rgb: 'DCEBFF' } },
          alignment: { horizontal: col === 'A' ? 'left' : 'right' }
        };
      }
    });

    const totalRow = dataLength - 1;
    ['A', 'B', 'C', 'D'].forEach(col => {
      const cell = `${col}${totalRow}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true },
          fill: { fgColor: { rgb: 'F8F9FA' } },
          alignment: { horizontal: col === 'A' ? 'left' : 'right' },
          border: {
            top: { style: 'thin', color: { rgb: '646464' } },
            bottom: { style: 'thin', color: { rgb: '646464' } },
            left: { style: 'thin', color: { rgb: '646464' } },
            right: { style: 'thin', color: { rgb: '646464' } }
          }
        };
      }
    });

    if (ws[`C${totalRow}`]) {
      ws[`C${totalRow}`].s.font.color = { rgb: 'B71C1C' };
    }

    const dataStart = 4;
    const dataEnd = totalRow - 2;

    for (let row = dataStart; row <= dataEnd; row++) {
      if (ws[`B${row}`]) {
        ws[`B${row}`].z = '0';
      }
      if (ws[`C${row}`]) {
        ws[`C${row}`].z = '#,##0.00" MT"';
      }
      if (ws[`D${row}`]) {
        ws[`D${row}`].z = '#,##0.00" MT"';
      }
    }

    if (ws[`B${totalRow}`]) {
      ws[`B${totalRow}`].z = '0';
    }
    if (ws[`C${totalRow}`]) {
      ws[`C${totalRow}`].z = '#,##0.00" MT"';
    }
    if (ws[`D${totalRow}`]) {
      ws[`D${totalRow}`].z = '#,##0.00" MT"';
    }
  }

  static async exportToCSV(
    report: CompanyCostPerEmployeeReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    try {
      const currentDate = this.getCurrentDate();
      const totals = this.calculateTotals(report);

      const sectionLine = '-'.repeat(80);
      let csvContent = `${this.tr('t-cpe-report-title').toUpperCase()}\n${sectionLine}\n\n`;
      csvContent += `${this.tr('t-cpe-company-information').toUpperCase()}\n${sectionLine}\n`;
      csvContent += `${this.tr('t-cpe-company')},${report.company?.name || this.tr('t-cpe-na')}\n`;
      csvContent += `${this.tr('t-cpe-email')},${report.company?.email || this.tr('t-cpe-na')}\n`;
      csvContent += `${this.tr('t-cpe-phone')},${report.company?.phone || this.tr('t-cpe-na')}\n`;
      csvContent += `${this.tr('t-cpe-address')},${report.company?.address || this.tr('t-cpe-na')}\n\n`;

      csvContent += `${this.tr('t-cpe-period-section')}\n${sectionLine}\n`;
      csvContent += `${this.tr('t-cpe-type')},${report.coveragePeriod ? this.tr('t-coverage-period') : this.tr('t-custom-period')}\n`;
      csvContent += `${this.tr('t-cpe-name')},${report.coveragePeriod?.name || this.tr('t-cpe-na')}\n`;
      csvContent += `${this.tr('t-cpe-start-date')},${report.coveragePeriod && report.coveragePeriod.startDate ? formateDate(report.coveragePeriod.startDate) : (report.fromDate ? formateDate(report.fromDate) : this.tr('t-cpe-na'))}\n`;
      csvContent += `${this.tr('t-cpe-end-date')},${report.coveragePeriod && report.coveragePeriod.endDate ? formateDate(report.coveragePeriod.endDate) : (report.toDate ? formateDate(report.toDate) : this.tr('t-cpe-na'))}\n\n`;

      csvContent += `${this.tr('t-cpe-statistical-summary')}\n${sectionLine}\n`;
      csvContent += `${this.tr('t-total-employees')},${totals.totalEmployees}\n`;
      csvContent += `${this.tr('t-total-invoices')},${totals.totalInvoices}\n`;
      csvContent += `${this.tr('t-total-amount')},${amountFormate(totals.totalAmount)} MT\n`;
      csvContent += `${this.tr('t-average-per-employee')},${amountFormate(totals.averagePerEmployee)} MT\n`;
      csvContent += `${this.tr('t-average-per-invoice')},${amountFormate(totals.averagePerInvoice)} MT\n\n`;

      csvContent += `${this.tr('t-expenses-by-employee').toUpperCase()}\n${sectionLine}\n`;
      csvContent += `${this.tr('t-employee')},${this.tr('t-cpe-invoices-count')},${this.tr('t-cpe-total-spent')} (MT),${this.tr('t-average-per-invoice')} (MT)\n`;

      report.invoiceEmployeeSummaries?.forEach((item: InvoiceEmployeeSummaryType) => {
        const avgPerInvoice = item.totalInvoices > 0 ? item.totalAmount / item.totalInvoices : 0;
        csvContent += `${item.employeeName},${item.totalInvoices},${item.totalAmount},${avgPerInvoice}\n`;
      });

      csvContent += `${this.tr('t-totals').toUpperCase()},${totals.totalInvoices},${totals.totalAmount},${totals.totalInvoices > 0 ? totals.averagePerInvoice : 0}\n\n`;

      csvContent += `${this.tr('t-cpe-report-information')}\n${sectionLine}\n`;
      csvContent += `${this.tr('t-generated-by')},${userName || this.tr('t-cpe-system-user')}\n`;
      csvContent += `${this.tr('t-cpe-generated-at')},${currentDate}\n`;
      csvContent += `${this.tr('t-cpe-report-id')},100002\n`;

      const bom = '\uFEFF';
      const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = options?.fileName
        ? `${options.fileName}.csv`
        : this.buildDefaultFileName(report, 'csv');
      this.saveFile(blob, fileName, 'text/csv');

    } catch (error) {
      console.error('Error generating CSV:', error);
      throw error;
    }
  }

  private static saveFile(data: any, fileName: string, mimeType: string): void {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
