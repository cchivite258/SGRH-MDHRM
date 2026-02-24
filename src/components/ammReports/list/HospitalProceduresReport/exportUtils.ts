import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CompanyHospitalProceduresBalanceType } from "@/components/ammReports/types";
import { amountFormate } from '@/app/common/amountFormate';
import { formateDate } from "@/app/common/dateFormate";
import i18n from '@/plugins/i18n';

export interface ExportOptions {
  fileName?: string;
}

export class ReportExporter {
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

  private static buildDefaultFileName(
    report: CompanyHospitalProceduresBalanceType,
    extension: 'pdf' | 'xlsx' | 'csv'
  ): string {
    const companyName = (report.company?.name || this.tr('t-hpr-company-fallback'))
      .replace(/\s+/g, '-')
      .toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const prefix = this.tr('t-hpr-file-prefix');
    return `${prefix}-${companyName}-${date}.${extension}`;
  }

  static async exportToPDF(
    report: CompanyHospitalProceduresBalanceType,
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
        currentY = 45;

        currentY = this.addPDFSummaryCards(pdf, report, userName, margin, contentWidth, currentY);
        currentY += 5;

        const tableResult = this.addPDFTable(pdf, report, margin, currentY);
        currentY = tableResult.finalY;

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

  private static addPDFHeader(
    pdf: jsPDF,
    report: CompanyHospitalProceduresBalanceType,
    userName: string,
    margin: number,
    currentY: number,
    pageWidth: number
  ): void {
    const currentDate = this.getCurrentDateTime();

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(this.tr('t-hpr-report-title'), margin, currentY);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(this.tr('t-hpr-report-subtitle'), margin, currentY + 6);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const companyName = report.company?.name || this.tr('t-hpr-company-fallback');
    pdf.text(companyName, margin, currentY + 14);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const dateText = `${this.tr('t-hpr-generated-at')}: ${currentDate}`;
    const userText = `${this.tr('t-hpr-by')}: ${userName || this.tr('t-hpr-system-user')}`;

    const dateWidth = pdf.getTextWidth(dateText);
    pdf.text(dateText, pageWidth - margin - dateWidth, currentY + 6);
    pdf.text(userText, pageWidth - margin - pdf.getTextWidth(userText), currentY + 14);

    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(margin, currentY + 20, pageWidth - margin, currentY + 20);
  }

  private static addPDFSummaryCards(
    pdf: jsPDF,
    report: CompanyHospitalProceduresBalanceType,
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
    const companyName = report.company?.name || this.tr('t-hpr-na');
    if (companyName.length > 35) {
      pdf.text(`${companyName.substring(0, 35)}...`, margin + 8, currentY + 14);
    } else {
      pdf.text(companyName, margin + 8, currentY + 14);
    }

    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    const email = report.company?.email || this.tr('t-hpr-na');
    if (email.length > 35) {
      pdf.text(`${email.substring(0, 35)}...`, margin + 8, currentY + 20);
    } else {
      pdf.text(email, margin + 8, currentY + 24);
    }
    pdf.text(`${this.tr('t-hpr-phone-short')}: ${report.company?.phone || this.tr('t-hpr-na')}`, margin + 8, currentY + 30);

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
    const periodName = hasCoveragePeriod ? report.coveragePeriod?.name || this.tr('t-hpr-na') : this.tr('t-custom-period');
    if (periodName.length > 20) {
      pdf.text(`${periodName.substring(0, 20)}...`, card2X + 8, currentY + 14);
    } else {
      pdf.text(periodName, card2X + 8, currentY + 14);
    }

    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    const startDate = hasCoveragePeriod && report.coveragePeriod?.startDate
      ? formateDate(report.coveragePeriod.startDate)
      : (report.issueDateFrom ? formateDate(report.issueDateFrom) : this.tr('t-hpr-na'));
    const endDate = hasCoveragePeriod && report.coveragePeriod?.endDate
      ? formateDate(report.coveragePeriod.endDate)
      : (report.issueDateTo ? formateDate(report.issueDateTo) : this.tr('t-hpr-na'));

    pdf.text(`${this.tr('t-start-period')}: ${startDate}`, card2X + 8, currentY + 24);
    pdf.text(`${this.tr('t-end-period')}: ${endDate}`, card2X + 8, currentY + 30);

    const card3X = card2X + cardWidth + 7.5;

    pdf.setFillColor(255, 235, 238);
    pdf.rect(card3X, currentY, cardWidth, cardHeight, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(this.tr('t-total-spent'), card3X + 8, currentY + 8);

    pdf.setFontSize(12);
    pdf.setTextColor(183, 28, 28);
    const totalAmount = amountFormate(report.totalAmount);
    if (totalAmount.length > 15) {
      pdf.text(`${totalAmount.substring(0, 15)}... MT`, card3X + 8, currentY + 15);
    } else {
      pdf.text(`${totalAmount} MT`, card3X + 8, currentY + 15);
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${this.tr('t-procedures')}: ${report.procedureExpenses?.length || 0}`, card3X + 8, currentY + 30);

    return currentY + cardHeight + 5;
  }

  private static addPDFTable(
    pdf: jsPDF,
    report: CompanyHospitalProceduresBalanceType,
    margin: number,
    currentY: number
  ): { finalY: number } {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.tr('t-expenses-by-procedure'), margin, currentY);

    const tableData = report.procedureExpenses?.map((p: any) => [
      p.procedure.name,
      `${amountFormate(p.amountSpent)} MT`,
      p.amountCovered ? `${amountFormate(p.amountCovered)} MT` : '-'
    ]) || [];

    const totalRow = [this.tr('t-totals').toUpperCase(), `${amountFormate(report.totalAmount)} MT`, '-'];

    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: margin, right: margin },
      head: [[
        this.tr('t-procedure'),
        this.tr('t-amount-spent'),
        this.tr('t-amount-covered')
      ]],
      body: [...tableData, totalRow],
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
        1: { cellWidth: 35, halign: 'right', fontSize: 8 },
        2: { cellWidth: 35, halign: 'right', fontSize: 8 }
      },
      didParseCell: (data: any) => {
        if (data.row.index === tableData.length) {
          data.cell.styles.fillColor = [248, 249, 250];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.lineWidth = 0.1;
          data.cell.styles.lineColor = [100, 100, 100];
        }
      },
      willDrawCell: (data: any) => {
        if (data.row.index === tableData.length) {
          data.doc.setLineWidth(0.3);
          data.doc.setDrawColor(100, 100, 100);
        }
      }
    });

    const finalY = (pdf as any).lastAutoTable?.finalY || currentY + 100;
    return { finalY: finalY + 5 };
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

      const footerText = this.tr('t-hpr-system-footer');
      const dateText = `${this.tr('t-hpr-date')}: ${currentDate}`;
      const userText = `${this.tr('t-hpr-user')}: ${userName || this.tr('t-hpr-system-user')}`;
      const pageText = this.tr('t-hpr-page-of', { current: i, total: totalPages });

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
    report: CompanyHospitalProceduresBalanceType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();
      const currentDate = this.getCurrentDate();

      const summaryData = [
        [this.tr('t-hpr-report-title').toUpperCase()],
        [''],
        [`${this.tr('t-hpr-company')}:`, report.company?.name || this.tr('t-hpr-na')],
        [`${this.tr('t-hpr-email')}:`, report.company?.email || this.tr('t-hpr-na')],
        [`${this.tr('t-hpr-phone')}:`, report.company?.phone || this.tr('t-hpr-na')],
        [''],
        [this.tr('t-hpr-period-section')],
        [`${this.tr('t-hpr-type')}:`, report.coveragePeriod ? this.tr('t-coverage-period') : this.tr('t-custom-period')],
        [`${this.tr('t-hpr-name')}:`, report.coveragePeriod?.name || this.tr('t-hpr-na')],
        [`${this.tr('t-hpr-start-date')}:`, report.coveragePeriod && report.coveragePeriod.startDate ? formateDate(report.coveragePeriod.startDate) : (report.issueDateFrom ? formateDate(report.issueDateFrom) : this.tr('t-hpr-na'))],
        [`${this.tr('t-hpr-end-date')}:`, report.coveragePeriod && report.coveragePeriod.endDate ? formateDate(report.coveragePeriod.endDate) : (report.issueDateTo ? formateDate(report.issueDateTo) : this.tr('t-hpr-na'))],
        [''],
        [this.tr('t-hpr-financial-summary')],
        [`${this.tr('t-total-spent')}:`, `${amountFormate(report.totalAmount)} MT`],
        [`${this.tr('t-hpr-procedures-count')}:`, String(report.procedureExpenses?.length || 0)],
        [''],
        [this.tr('t-hpr-report-information')],
        [`${this.tr('t-generated-by')}:`, userName || this.tr('t-hpr-system-user')],
        [`${this.tr('t-hpr-generated-at')}:`, currentDate],
        [`${this.tr('t-hpr-report-id')}:`, '100001']
      ];

      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      this.applyExcelStyles(summaryWS);
      XLSX.utils.book_append_sheet(workbook, summaryWS, this.tr('t-hpr-sheet-summary'));

      const proceduresData: string[][] = [
        [this.tr('t-hpr-detailed-procedures').toUpperCase()],
        [''],
        [
          this.tr('t-procedure'),
          `${this.tr('t-amount-spent')} (MT)`,
          `${this.tr('t-amount-covered')} (MT)`
        ]
      ];

      report.procedureExpenses?.forEach((p: any) => {
        proceduresData.push([
          p.procedure.name,
          String(p.amountSpent),
          String(p.amountCovered || 0)
        ]);
      });

      proceduresData.push(['']);
      proceduresData.push([this.tr('t-totals').toUpperCase(), String(report.totalAmount), '-']);

      const proceduresWS = XLSX.utils.aoa_to_sheet(proceduresData);
      this.applyProceduresExcelStyles(proceduresWS, proceduresData.length);
      XLSX.utils.book_append_sheet(workbook, proceduresWS, this.tr('t-hpr-sheet-procedures'));

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
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
    const colWidths = [{ wch: 25 }, { wch: 30 }];
    ws['!cols'] = colWidths;

    if (ws['A1']) {
      ws['A1'].s = {
        font: { sz: 14, bold: true, color: { rgb: '1F3A93' } },
        alignment: { horizontal: 'center' }
      };
    }

    [7, 13, 17].forEach(row => {
      const cell = `A${row}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 11, bold: true, color: { rgb: '333333' } },
          fill: { fgColor: { rgb: 'E8E8E8' } }
        };
      }
    });

    if (ws['B14']) {
      ws['B14'].s = {
        font: { sz: 11, bold: true, color: { rgb: 'B71C1C' } }
      };
    }
  }

  private static applyProceduresExcelStyles(ws: XLSX.WorkSheet, dataLength: number): void {
    const colWidths = [{ wch: 40 }, { wch: 20 }, { wch: 20 }];
    ws['!cols'] = colWidths;

    if (ws['A1']) {
      ws['A1'].s = {
        font: { sz: 12, bold: true, color: { rgb: '1F3A93' } }
      };
    }

    const headerRow = 3;
    ['A', 'B', 'C'].forEach(col => {
      const cell = `${col}${headerRow}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '424242' } },
          alignment: { horizontal: col === 'A' ? 'left' : 'right' }
        };
      }
    });

    const totalRow = dataLength;
    if (ws[`A${totalRow}`]) {
      ws[`A${totalRow}`].s = {
        font: { sz: 10, bold: true },
        fill: { fgColor: { rgb: 'F8F9FA' } },
        border: {
          top: { style: 'thin', color: { rgb: '646464' } },
          bottom: { style: 'thin', color: { rgb: '646464' } },
          left: { style: 'thin', color: { rgb: '646464' } },
          right: { style: 'thin', color: { rgb: '646464' } }
        }
      };
    }

    if (ws[`B${totalRow}`]) {
      ws[`B${totalRow}`].s = {
        font: { sz: 10, bold: true, color: { rgb: 'B71C1C' } },
        fill: { fgColor: { rgb: 'F8F9FA' } },
        alignment: { horizontal: 'right' },
        border: {
          top: { style: 'thin', color: { rgb: '646464' } },
          bottom: { style: 'thin', color: { rgb: '646464' } },
          left: { style: 'thin', color: { rgb: '646464' } },
          right: { style: 'thin', color: { rgb: '646464' } }
        }
      };
    }

    if (ws[`C${totalRow}`]) {
      ws[`C${totalRow}`].s = {
        font: { sz: 10, bold: true },
        fill: { fgColor: { rgb: 'F8F9FA' } },
        alignment: { horizontal: 'right' },
        border: {
          top: { style: 'thin', color: { rgb: '646464' } },
          bottom: { style: 'thin', color: { rgb: '646464' } },
          left: { style: 'thin', color: { rgb: '646464' } },
          right: { style: 'thin', color: { rgb: '646464' } }
        }
      };
    }

    const dataStart = 4;
    const dataEnd = totalRow - 2;

    for (let row = dataStart; row <= dataEnd; ++row) {
      if (ws[`B${row}`]) ws[`B${row}`].z = '#,##0.00" MT"';
      if (ws[`C${row}`]) ws[`C${row}`].z = '#,##0.00" MT"';
    }

    if (ws[`B${totalRow}`]) ws[`B${totalRow}`].z = '#,##0.00" MT"';
  }

  static async exportToCSV(
    report: CompanyHospitalProceduresBalanceType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    try {
      const currentDate = this.getCurrentDate();

      let csvContent = `${this.tr('t-hpr-report-title').toUpperCase()}\n\n`;
      csvContent += `${this.tr('t-hpr-company-information').toUpperCase()}\n`;
      csvContent += `${this.tr('t-hpr-company')},${report.company?.name || this.tr('t-hpr-na')}\n`;
      csvContent += `${this.tr('t-hpr-email')},${report.company?.email || this.tr('t-hpr-na')}\n`;
      csvContent += `${this.tr('t-hpr-phone')},${report.company?.phone || this.tr('t-hpr-na')}\n\n`;
      csvContent += `${this.tr('t-hpr-period-section')}\n`;
      csvContent += `${this.tr('t-hpr-type')},${report.coveragePeriod ? this.tr('t-coverage-period') : this.tr('t-custom-period')}\n`;
      csvContent += `${this.tr('t-hpr-name')},${report.coveragePeriod?.name || this.tr('t-hpr-na')}\n`;
      csvContent += `${this.tr('t-hpr-start-date')},${report.coveragePeriod && report.coveragePeriod.startDate ? formateDate(report.coveragePeriod.startDate) : (report.issueDateFrom ? formateDate(report.issueDateFrom) : this.tr('t-hpr-na'))}\n`;
      csvContent += `${this.tr('t-hpr-end-date')},${report.coveragePeriod && report.coveragePeriod.endDate ? formateDate(report.coveragePeriod.endDate) : (report.issueDateTo ? formateDate(report.issueDateTo) : this.tr('t-hpr-na'))}\n\n`;
      csvContent += `${this.tr('t-hpr-financial-summary')}\n`;
      csvContent += `${this.tr('t-total-spent')},${amountFormate(report.totalAmount)} MT\n`;
      csvContent += `${this.tr('t-hpr-procedures-count')},${report.procedureExpenses?.length || 0}\n\n`;
      csvContent += `${this.tr('t-hpr-detailed-procedures').toUpperCase()}\n`;
      csvContent += `${this.tr('t-procedure')},${this.tr('t-amount-spent')} (MT),${this.tr('t-amount-covered')} (MT)\n`;

      report.procedureExpenses?.forEach((p: any) => {
        csvContent += `${p.procedure.name},${p.amountSpent},${p.amountCovered || 0}\n`;
      });

      csvContent += `${this.tr('t-totals').toUpperCase()},${report.totalAmount},-\n\n`;
      csvContent += `${this.tr('t-hpr-report-information')}\n`;
      csvContent += `${this.tr('t-generated-by')},${userName || this.tr('t-hpr-system-user')}\n`;
      csvContent += `${this.tr('t-hpr-generated-at')},${currentDate}\n`;
      csvContent += `${this.tr('t-hpr-report-id')},100001\n`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
