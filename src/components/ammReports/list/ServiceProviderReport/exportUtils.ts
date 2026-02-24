import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ServiceProviderReportType } from "@/components/ammReports/types";
import { amountFormate } from '@/app/common/amountFormate';
import { formateDate } from "@/app/common/dateFormate";
import i18n from '@/plugins/i18n';

export interface ExportOptions {
  fileName?: string;
}

export class ServiceProviderReportExporter {
  private static safeSheetName(name: string, fallback: string): string {
    const base = (name || fallback)
      .replace(/[\\\/\?\*\[\]:]/g, ' ')
      .trim();
    const safe = base.length > 31 ? base.slice(0, 31).trim() : base;
    return safe || fallback;
  }
  private static tr(key: string, params?: Record<string, unknown>): string {
    const translated = (i18n as any).global.t(key, params);
    return typeof translated === 'string' ? translated : String(translated);
  }

  private static localeCode(): string {
    const rawLocale = (i18n as any).global.locale;
    const locale = typeof rawLocale === 'string' ? rawLocale : rawLocale?.value;
    return locale === 'en' ? 'en-US' : 'pt-PT';
  }

  private static getCurrentDateTime(): string {
    return new Date().toLocaleDateString(this.localeCode(), {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  private static getCurrentDate(): string {
    return new Date().toLocaleDateString(this.localeCode());
  }

  private static fitText(pdf: jsPDF, text: string, maxWidth: number): string {
    let value = text || '';
    if (pdf.getTextWidth(value) <= maxWidth) return value;
    const ellipsis = '...';
    while (value.length > 0 && (pdf.getTextWidth(value + ellipsis) > maxWidth)) {
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
    const lines = (pdf.splitTextToSize(text || '', maxWidth) as string[]) || [];
    if (lines.length === 0) return;
    const finalLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      finalLines[maxLines - 1] = this.fitText(pdf, finalLines[maxLines - 1], maxWidth);
    }
    finalLines.forEach((line, index) => {
      pdf.text(line, x, y + (index * lineHeight));
    });
  }

  private static getDetails(report: ServiceProviderReportType): NonNullable<ServiceProviderReportType['details']> {
    return report.details || [];
  }

  private static getStartDate(report: ServiceProviderReportType): string {
    return report.startDate ? formateDate(report.startDate) : this.tr('t-spr-na');
  }

  private static getEndDate(report: ServiceProviderReportType): string {
    return report.endDate ? formateDate(report.endDate) : this.tr('t-spr-na');
  }

  private static getTotalAmount(report: ServiceProviderReportType): number {
    if (typeof report.totalAmount === 'number') return report.totalAmount;
    return this.getDetails(report).reduce((sum, item) => sum + (item.totalBilled || 0), 0);
  }

  private static buildDefaultFileName(
    report: ServiceProviderReportType,
    extension: 'pdf' | 'xlsx' | 'csv'
  ): string {
    const providerName = (report.serviceProviderName || this.tr('t-spr-provider-fallback'))
      .replace(/\s+/g, '-')
      .toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const prefix = this.tr('t-spr-file-prefix');
    return `${prefix}-${providerName}-${date}.${extension}`;
  }

  static async exportToPDF(
    report: ServiceProviderReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const details = this.getDetails(report);
    const totalAmount = this.getTotalAmount(report);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    let currentY = margin;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(this.tr('t-spr-report-title'), margin, currentY);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(this.tr('t-spr-report-subtitle'), margin, currentY + 6);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(report.serviceProviderName || this.tr('t-spr-provider-fallback'), margin, currentY + 14);

    const dateText = `${this.tr('t-spr-generated-at')}: ${this.getCurrentDateTime()}`;
    const userText = `${this.tr('t-spr-by')}: ${userName || this.tr('t-spr-system-user')}`;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), currentY + 6);
    pdf.text(userText, pageWidth - margin - pdf.getTextWidth(userText), currentY + 14);

    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(margin, currentY + 20, pageWidth - margin, currentY + 20);

    currentY = 45;

    const cardWidth = (contentWidth - 15) / 3;
    const cardHeight = 35;
    const cardPaddingX = 8;
    const cardContentWidth = cardWidth - (cardPaddingX * 2);

    pdf.setFillColor(248, 249, 250);
    pdf.rect(margin, currentY, cardWidth, cardHeight, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(this.tr('t-service-provider'), margin + 8, currentY + 8);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    this.drawTextInCard(
      pdf,
      report.serviceProviderName || this.tr('t-spr-na'),
      margin + cardPaddingX,
      currentY + 14,
      cardContentWidth,
      2
    );
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    this.drawTextInCard(
      pdf,
      `${this.tr('t-provider-type')}: ${report.serviceProviderTypeName || this.tr('t-spr-na')}`,
      margin + cardPaddingX,
      currentY + 24,
      cardContentWidth,
      1
    );

    const card2X = margin + cardWidth + 7.5;
    pdf.setFillColor(232, 245, 233);
    pdf.rect(card2X, currentY, cardWidth, cardHeight, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(this.tr('t-period'), card2X + 8, currentY + 8);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    this.drawTextInCard(pdf, this.tr('t-custom-period'), card2X + cardPaddingX, currentY + 14, cardContentWidth, 1);
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    this.drawTextInCard(
      pdf,
      `${this.tr('t-start-period')}: ${this.getStartDate(report)}`,
      card2X + cardPaddingX,
      currentY + 22,
      cardContentWidth,
      1
    );
    this.drawTextInCard(
      pdf,
      `${this.tr('t-end-period')}: ${this.getEndDate(report)}`,
      card2X + cardPaddingX,
      currentY + 28,
      cardContentWidth,
      1
    );

    const card3X = card2X + cardWidth + 7.5;
    pdf.setFillColor(255, 235, 238);
    pdf.rect(card3X, currentY, cardWidth, cardHeight, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(this.tr('t-total-spent'), card3X + 8, currentY + 8);
    pdf.setFontSize(11);
    pdf.setTextColor(183, 28, 28);
    this.drawTextInCard(
      pdf,
      `${amountFormate(totalAmount)} MT`,
      card3X + cardPaddingX,
      currentY + 16,
      cardContentWidth,
      1
    );
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    currentY += cardHeight + 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.tr('t-expenses-by-procedure'), margin, currentY);

    const tableData = details.map((row) => [
      row.hospitalProcedureTypeName || this.tr('t-spr-na'),
      String(row.totalInvoiceItems || 0),
      `${amountFormate(row.totalBilled || 0)} MT`
    ]);

    tableData.push([
      this.tr('t-totals').toUpperCase(),
      '-',
      `${amountFormate(totalAmount)} MT`
    ]);

    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: margin, right: margin },
      head: [[
        this.tr('t-procedure'),
        this.tr('t-total-invoices'),
        this.tr('t-billed-amount')
      ]],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, lineWidth: 0.1, lineColor: [200, 200, 200] },
      headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' }
      },
      didParseCell: (data: any) => {
        if (data.row.index === details.length) {
          data.cell.styles.fillColor = [248, 249, 250];
          data.cell.styles.fontStyle = 'bold';
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
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const footerText = this.tr('t-spr-system-footer');
      const pageText = this.tr('t-spr-page-of', { current: i, total: totalPages });
      const dateText = `${this.tr('t-spr-date')}: ${this.getCurrentDate()}`;
      const userFooter = `${this.tr('t-spr-user')}: ${userName || this.tr('t-spr-system-user')}`;
      pdf.text(footerText, margin, footerY - 5);
      pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), footerY - 5);
      pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), footerY - 12);
      pdf.text(userFooter, pageWidth - margin - pdf.getTextWidth(userFooter), footerY - 19);
    }

    const fileName = options?.fileName
      ? `${options.fileName}.pdf`
      : this.buildDefaultFileName(report, 'pdf');
    pdf.save(fileName);
  }

  static async exportToExcel(
    report: ServiceProviderReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const details = this.getDetails(report);
    const totalAmount = this.getTotalAmount(report);
    const totalProcedures = details.length;
    const detailRows = details.length > 0
      ? details.map((row) => [
          row.hospitalProcedureTypeName || this.tr('t-spr-na'),
          String(row.totalInvoiceItems || 0),
          String(row.totalBilled || 0),
          ''
        ])
      : [[this.tr('t-no-report-data'), '-', '-', '-']];

    const workbook = XLSX.utils.book_new();
    const currentDate = this.getCurrentDate();

    const summaryData = [
      [this.tr('t-spr-report-title').toUpperCase(), '', '', ''],
      [`${this.tr('t-report')} #100003 - ${this.tr('t-report-by-service-provider')}`, '', '', ''],
      ['', '', '', ''],
      [this.tr('t-spr-provider-section'), '', '', ''],
      [
        this.tr('t-service-provider'),
        report.serviceProviderName || this.tr('t-spr-na'),
        this.tr('t-provider-type'),
        String(report.serviceProviderTypeName || this.tr('t-spr-na'))
      ],
      [this.tr('t-spr-period-section'), '', '', ''],
      [
        this.tr('t-spr-start-date'),
        this.getStartDate(report),
        this.tr('t-spr-end-date'),
        this.getEndDate(report)
      ],
      ['', '', '', ''],
      [this.tr('t-spr-financial-summary'), '', '', ''],
      [
        this.tr('t-total-spent'),
        `${amountFormate(totalAmount)} MT`,
        this.tr('t-spr-procedures-performed'),
        String(totalProcedures)
      ],
      ['', '', '', ''],
      ['', '', '', ''],
      [this.tr('t-spr-report-information'), '', '', ''],
      [
        this.tr('t-generated-by'),
        userName || this.tr('t-spr-system-user'),
        this.tr('t-spr-generated-at'),
        currentDate
      ],
      [this.tr('t-spr-report-id'), '100003', '', ''],
      ['', '', '', ''],
      [this.tr('t-spr-detailed-procedures').toUpperCase(), '', '', ''],
      [
        this.tr('t-procedure'),
        this.tr('t-total-invoices'),
        `${this.tr('t-billed-amount')} (MT)`,
        ''
      ],
      ...detailRows,
      [this.tr('t-totals').toUpperCase(), '-', String(totalAmount), '']
    ];

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    this.applySummaryExcelStyles(summaryWS);
    const summarySheetName = this.safeSheetName(this.tr('t-spr-sheet-summary'), 'Resumo');
    workbook.SheetNames.push(summarySheetName);
    workbook.Sheets[summarySheetName] = summaryWS;

    // Keep a single-sheet layout (as approved): details are embedded in summary.

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });
    const fileName = options?.fileName
      ? `${options.fileName}.xlsx`
      : this.buildDefaultFileName(report, 'xlsx');
    this.saveFile(excelBuffer, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  private static applySummaryExcelStyles(ws: XLSX.WorkSheet): void {
    ws['!cols'] = [{ wch: 28 }, { wch: 36 }, { wch: 28 }, { wch: 30 }];
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 3 } },
      { s: { r: 8, c: 0 }, e: { r: 8, c: 3 } },
      { s: { r: 12, c: 0 }, e: { r: 12, c: 3 } }
    ];

    ws['!rows'] = [
      { hpt: 30 }, { hpt: 20 }, { hpt: 8 },
      { hpt: 22 }, { hpt: 20 }, { hpt: 22 }, { hpt: 20 },
      { hpt: 8 }, { hpt: 22 }, { hpt: 20 }, { hpt: 20 },
      { hpt: 8 }, { hpt: 22 }, { hpt: 20 }, { hpt: 20 }
    ];

    const titleStyle = {
      font: { sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1F3A93' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    const subtitleStyle = {
      font: { sz: 10, bold: true, color: { rgb: '1F3A93' } },
      fill: { fgColor: { rgb: 'E8F1FF' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    const sectionStyle = {
      font: { sz: 11, bold: true, color: { rgb: '333333' } },
      fill: { fgColor: { rgb: 'E8E8E8' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
    const labelStyle = {
      font: { sz: 10, bold: true, color: { rgb: '37474F' } },
      fill: { fgColor: { rgb: 'F8F9FA' } }
    };
    const valueStyle = {
      font: { sz: 10, color: { rgb: '111111' } },
      fill: { fgColor: { rgb: 'FFFFFF' } }
    };

    ws['A1'] && (ws['A1'].s = titleStyle);
    ws['A2'] && (ws['A2'].s = subtitleStyle);

    ['A4', 'A6', 'A9', 'A13'].forEach((cell) => {
      if (ws[cell]) ws[cell].s = sectionStyle;
    });

    ['A5', 'C5', 'A7', 'C7', 'A10', 'C10', 'A11', 'A14', 'C14', 'A15'].forEach((cell) => {
      if (ws[cell]) ws[cell].s = labelStyle;
    });
    ['B5', 'D5', 'B7', 'D7', 'B10', 'D10', 'B11', 'B14', 'D14', 'B15'].forEach((cell) => {
      if (ws[cell]) ws[cell].s = valueStyle;
    });

    if (ws['B10']) {
      ws['B10'].s = {
        ...valueStyle,
        font: { sz: 11, bold: true, color: { rgb: 'B71C1C' } }
      };
    }
    if (ws['D10'] || ws['B11']) {
      if (ws['D10']) {
        ws['D10'].s = {
          ...valueStyle,
          font: { sz: 11, bold: true, color: { rgb: '0D47A1' } }
        };
      }
      if (ws['B11']) {
        ws['B11'].s = {
          ...valueStyle,
          font: { sz: 11, bold: true, color: { rgb: '0B8043' } }
        };
      }
    }
  }

  private static applyProceduresExcelStyles(ws: XLSX.WorkSheet, dataLength: number): void {
    ws['!cols'] = [{ wch: 48 }, { wch: 18 }, { wch: 28 }, { wch: 22 }];
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }
    ];

    ws['A1'] && (ws['A1'].s = {
      font: { sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1F3A93' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    });
    ws['A2'] && (ws['A2'].s = {
      font: { sz: 9, italic: true, color: { rgb: '1F3A93' } },
      fill: { fgColor: { rgb: 'E8F1FF' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    });

    const headerRow = 4;
    ['A', 'B', 'C', 'D'].forEach((col) => {
      const cell = `${col}${headerRow}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true, color: { rgb: '1F3A93' } },
          fill: { fgColor: { rgb: 'DCEBFF' } },
          alignment: { horizontal: col === 'A' ? 'left' : 'right' }
        };
      }
    });

    const totalRow = dataLength;
    ['A', 'B', 'C', 'D'].forEach((col) => {
      const cell = `${col}${totalRow}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true, color: col === 'D' ? { rgb: 'B71C1C' } : undefined },
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

    const dataStart = 5;
    const dataEnd = totalRow - 2;
    for (let row = dataStart; row <= dataEnd; row++) {
      if (row % 2 === 0) {
        ['A', 'B', 'C', 'D'].forEach((col) => {
          const cell = `${col}${row}`;
          if (ws[cell]) {
            ws[cell].s = {
              ...(ws[cell].s || {}),
              fill: { fgColor: { rgb: 'FAFAFA' } }
            };
          }
        });
      }
      if (ws[`B${row}`]) ws[`B${row}`].z = '0';
      if (ws[`C${row}`]) ws[`C${row}`].z = '0';
      if (ws[`D${row}`]) ws[`D${row}`].z = '#,##0.00" MT"';
    }
    if (ws[`D${totalRow}`]) ws[`D${totalRow}`].z = '#,##0.00" MT"';

    ws['!autofilter'] = { ref: `A${headerRow}:D${totalRow}` };
  }

  static async exportToCSV(
    report: ServiceProviderReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const details = this.getDetails(report);
    const totalAmount = this.getTotalAmount(report);

    const sectionLine = '-'.repeat(80);
    let csvContent = `${this.tr('t-spr-report-title').toUpperCase()}\n${sectionLine}\n\n`;
    csvContent += `${this.tr('t-spr-provider-section').toUpperCase()}\n${sectionLine}\n`;
    csvContent += `${this.tr('t-service-provider')},${report.serviceProviderName || this.tr('t-spr-na')}\n`;
    csvContent += `${this.tr('t-provider-type')},${report.serviceProviderTypeName || this.tr('t-spr-na')}\n\n`;
    csvContent += `${this.tr('t-spr-period-section')}\n${sectionLine}\n`;
    csvContent += `${this.tr('t-spr-start-date')},${this.getStartDate(report)}\n`;
    csvContent += `${this.tr('t-spr-end-date')},${this.getEndDate(report)}\n\n`;
    csvContent += `${this.tr('t-spr-financial-summary')}\n${sectionLine}\n`;
    csvContent += `${this.tr('t-total-spent')},${amountFormate(totalAmount)} MT\n`;
    csvContent += `\n`;
    csvContent += `${this.tr('t-spr-detailed-procedures').toUpperCase()}\n${sectionLine}\n`;
    csvContent += `${this.tr('t-procedure')},${this.tr('t-total-invoices')},${this.tr('t-billed-amount')} (MT)\n`;

    details.forEach((row) => {
      csvContent += `${row.hospitalProcedureTypeName || this.tr('t-spr-na')},${row.totalInvoiceItems || 0},${row.totalBilled || 0}\n`;
    });

    csvContent += `${this.tr('t-totals').toUpperCase()},-,${totalAmount}\n\n`;
    csvContent += `${this.tr('t-spr-report-information')}\n${sectionLine}\n`;
    csvContent += `${this.tr('t-generated-by')},${userName || this.tr('t-spr-system-user')}\n`;
    csvContent += `${this.tr('t-spr-generated-at')},${this.getCurrentDate()}\n`;
    csvContent += `${this.tr('t-spr-report-id')},100003\n`;

    const bom = '\uFEFF';
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = options?.fileName
      ? `${options.fileName}.csv`
      : this.buildDefaultFileName(report, 'csv');
    this.saveFile(blob, fileName, 'text/csv');
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
