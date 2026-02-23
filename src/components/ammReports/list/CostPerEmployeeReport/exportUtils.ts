import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CompanyCostPerEmployeeReportType, InvoiceEmployeeSummaryType } from "@/components/ammReports/types";
import { amountFormate } from '@/app/common/amountFormate';
import { formateDate } from "@/app/common/dateFormate";

export interface ExportOptions {
  fileName?: string;
}

export class CostPerEmployeeReportExporter {
  
  // ========== EXPORT PARA PDF ==========
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
        
        // ========== CABEÇALHO ==========
        this.addPDFHeader(pdf, report, userName, margin, contentWidth, currentY, pageWidth);
        currentY = 40;
        
        // ========== RESUMO EM CARDS ==========
        currentY = this.addPDFSummaryCards(pdf, report, userName, margin, contentWidth, currentY, pageWidth);
        currentY += 5;
        
        // Calcular totais
        const totals = this.calculateTotals(report);
        
        // ========== TABELA DE COLABORADORES ==========
        const tableResult = this.addPDFTable(pdf, report, totals, margin, contentWidth, currentY);
        currentY = tableResult.finalY;
        
        // ========== RESUMO FINANCEIRO ==========
        if (currentY < pageHeight - 40) {
          currentY = this.addFinancialSummary(pdf, totals, margin, contentWidth, currentY);
        }
        
        // Adicionar rodapé em todas as páginas
        this.addPDFFooterAllPages(pdf, report, userName, margin, pageWidth, pageHeight);
        
        // ========== SALVAR ARQUIVO ==========
        const fileName = options?.fileName || `relatorio-custo-colaborador-${report.company?.name || 'empresa'}-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        resolve();
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
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
    contentWidth: number,
    currentY: number,
    pageWidth: number
  ): void {
    const currentDate = new Date().toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Título principal
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório de Custo por Colaborador', margin, currentY);
    
    // Subtítulo
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Relatório #100002 • Análise de Gastos por Funcionário', margin, currentY + 6);
    
    // Informações da empresa
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const companyName = report.company?.name || 'Empresa';
    pdf.text(companyName, margin, currentY + 14);
    
    // Data e usuário
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const dateText = `Gerado em: ${currentDate}`;
    const userText = `Por: ${userName}`;
    
    const dateWidth = pdf.getTextWidth(dateText);
    pdf.text(dateText, pageWidth - margin - dateWidth, currentY + 6);
    pdf.text(userText, pageWidth - margin - pdf.getTextWidth(userText), currentY + 14);
    
    // Linha divisória
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
    currentY: number,
    pageWidth: number
  ): number {
    const cardWidth = (contentWidth - 15) / 3;
    const cardHeight = 35;
    
    // Card 1: Instituição
    pdf.setFillColor(248, 249, 250);
    pdf.rect(margin, currentY, cardWidth, cardHeight, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text('Instituição', margin + 8, currentY + 8);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const companyName = report.company?.name || 'N/A';
    if (companyName.length > 25) {
      pdf.text(companyName.substring(0, 25) + '...', margin + 8, currentY + 14);
    } else {
      pdf.text(companyName, margin + 8, currentY + 14);
    }
    
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    const email = report.company?.email || 'N/A';
    if (email.length > 20) {
      pdf.text(email.substring(0, 20) + '...', margin + 8, currentY + 20);
    } else {
      pdf.text(email, margin + 8, currentY + 20);
    }
    pdf.text(`Tel: ${report.company?.phone || 'N/A'}`, margin + 8, currentY + 26);
    
    // Card 2: Período
    const hasCoveragePeriod = report.coveragePeriod !== null && report.coveragePeriod !== undefined;
    const card2X = margin + cardWidth + 7.5;
    
    pdf.setFillColor(232, 245, 233);
    pdf.rect(card2X, currentY, cardWidth, cardHeight, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    const periodTitle = hasCoveragePeriod ? 'Período' : 'Emissão';
    pdf.text(periodTitle, card2X + 8, currentY + 8);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const periodName = hasCoveragePeriod ? report.coveragePeriod?.name || 'N/A' : 'Personalizado';
    if (periodName.length > 20) {
      pdf.text(periodName.substring(0, 20) + '...', card2X + 8, currentY + 14);
    } else {
      pdf.text(periodName, card2X + 8, currentY + 14);
    }
    
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    const startDate = hasCoveragePeriod && report.coveragePeriod?.startDate 
      ? formateDate(report.coveragePeriod.startDate) 
      : (report.fromDate ? formateDate(report.fromDate) : 'N/A');
    const endDate = hasCoveragePeriod && report.coveragePeriod?.endDate 
      ? formateDate(report.coveragePeriod.endDate) 
      : (report.toDate ? formateDate(report.toDate) : 'N/A');
    
    pdf.text(`Início: ${startDate}`, card2X + 8, currentY + 22);
    pdf.text(`Fim: ${endDate}`, card2X + 8, currentY + 28);
    
    // Card 3: Estatísticas
    const card3X = card2X + cardWidth + 7.5;
    const summaries = report.invoiceEmployeeSummaries || [];
    const totalEmployees = summaries.length;
    const totalAmount = summaries.reduce((sum, item) => sum + item.totalAmount, 0);
    
    pdf.setFillColor(225, 245, 254);
    pdf.rect(card3X, currentY, cardWidth, cardHeight, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text('Resumo', card3X + 8, currentY + 8);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Colaboradores: ${totalEmployees}`, card3X + 8, currentY + 16);
    
    pdf.setFontSize(8);
    pdf.setTextColor(33, 150, 243);
    pdf.text(`Total: ${amountFormate(totalAmount)} MT`, card3X + 8, currentY + 22);
    
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Por: ${userName}`, card3X + 8, currentY + 30);
    
    return currentY + cardHeight + 5;
  }
  
  private static addPDFTable(
    pdf: jsPDF,
    report: CompanyCostPerEmployeeReportType,
    totals: any,
    margin: number,
    contentWidth: number,
    currentY: number
  ): { finalY: number } {
    // Título da tabela
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Gastos por Colaborador', margin, currentY);
    
    // Preparar dados da tabela
    const tableData = report.invoiceEmployeeSummaries?.map((item: InvoiceEmployeeSummaryType) => [
      item.employeeName,
      item.totalInvoices.toString(),
      `${amountFormate(item.totalAmount)} MT`,
      item.totalInvoices > 0 ? `${amountFormate(item.totalAmount / item.totalInvoices)} MT` : '—'
    ]) || [];
    
    // Adicionar linha de totais
    tableData.push([
      'TOTAIS',
      totals.totalInvoices.toString(),
      `${amountFormate(totals.totalAmount)} MT`,
      totals.totalInvoices > 0 ? `${amountFormate(totals.averagePerInvoice)} MT` : '—'
    ]);
    
    // Criar tabela com autoTable
    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: margin, right: margin },
      head: [['Colaborador', 'Nº Faturas', 'Total Gasto', 'Média/Fatura']],
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
    // Título do resumo
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Resumo Financeiro', margin, currentY);
    
    const summaryY = currentY + 8;
    const lineHeight = 6;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    // Total Geral
    pdf.setTextColor(0, 0, 0);
    pdf.text('Total Geral Gastos:', margin, summaryY);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(183, 28, 28);
    pdf.text(`${amountFormate(totals.totalAmount)} MT`, margin + 50, summaryY);
    
    // Média por Colaborador
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Média por Colaborador:', margin, summaryY + lineHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(33, 150, 243);
    pdf.text(`${amountFormate(totals.averagePerEmployee)} MT`, margin + 50, summaryY + lineHeight);
    
    // Média por Fatura
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Média por Fatura:', margin, summaryY + (lineHeight * 2));
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(76, 175, 80);
    pdf.text(`${amountFormate(totals.averagePerInvoice)} MT`, margin + 50, summaryY + (lineHeight * 2));
    
    // Número de Faturas
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Total de Faturas:', margin + contentWidth/2, summaryY);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(totals.totalInvoices.toString(), margin + contentWidth/2 + 40, summaryY);
    
    // Número de Colaboradores
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Total de Colaboradores:', margin + contentWidth/2, summaryY + lineHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text(totals.totalEmployees.toString(), margin + contentWidth/2 + 40, summaryY + lineHeight);
    
    return summaryY + (lineHeight * 3) + 10;
  }
  
  private static addPDFFooterAllPages(
    pdf: jsPDF,
    report: CompanyCostPerEmployeeReportType,
    userName: string,
    margin: number,
    pageWidth: number,
    pageHeight: number
  ): void {
    const currentDate = new Date().toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
      
      const footerText = 'SGRH - Sistema de Gestão de Recursos Humanos';
      const dateText = `Data: ${currentDate}`;
      const userText = `Usuário: ${userName}`;
      const pageText = `Página ${i} de ${totalPages}`;
      
      pdf.text(footerText, margin, footerY - 5);
      
      const pageTextWidth = pdf.getTextWidth(pageText);
      pdf.text(pageText, pageWidth - margin - pageTextWidth, footerY - 5);
      
      const dateTextWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, pageWidth - margin - dateTextWidth, footerY - 12);
      
      const userTextWidth = pdf.getTextWidth(userText);
      pdf.text(userText, pageWidth - margin - userTextWidth, footerY - 19);
    }
  }
  
  // ========== EXPORT PARA EXCEL ==========
  static async exportToExcel(
    report: CompanyCostPerEmployeeReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();
      const currentDate = new Date().toLocaleDateString('pt-PT');
      const totals = this.calculateTotals(report);
      
      // ========== ABA DE RESUMO ==========
      const summaryData = [
        ['RELATÓRIO DE CUSTO POR COLABORADOR'],
        [''],
        ['Empresa:', report.company?.name || 'N/A'],
        ['Email:', report.company?.email || 'N/A'],
        ['Telefone:', report.company?.phone || 'N/A'],
        ['Endereço:', report.company?.address || 'N/A'],
        [''],
        ['PERÍODO'],
        ['Tipo:', report.coveragePeriod ? 'Período de Cobertura' : 'Período Personalizado'],
        ['Nome:', report.coveragePeriod?.name || 'N/A'],
        ['Data Início:', report.coveragePeriod && report.coveragePeriod.startDate ? formateDate(report.coveragePeriod.startDate) : (report.fromDate ? formateDate(report.fromDate) : 'N/A')],
        ['Data Fim:', report.coveragePeriod && report.coveragePeriod.endDate ? formateDate(report.coveragePeriod.endDate) : (report.toDate ? formateDate(report.toDate) : 'N/A')],
        [''],
        ['RESUMO ESTATÍSTICO'],
        ['Total de Colaboradores:', totals.totalEmployees.toString()],
        ['Total de Faturas:', totals.totalInvoices.toString()],
        ['Total Gastos:', `${amountFormate(totals.totalAmount)} MT`],
        ['Média por Colaborador:', `${amountFormate(totals.averagePerEmployee)} MT`],
        ['Média por Fatura:', `${amountFormate(totals.averagePerInvoice)} MT`],
        [''],
        ['INFORMAÇÕES DO RELATÓRIO'],
        ['Gerado por:', userName],
        ['Data de geração:', currentDate],
        ['ID do Relatório:', '100002']
      ];
      
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      this.applyExcelStyles(summaryWS, summaryData.length);
      XLSX.utils.book_append_sheet(workbook, summaryWS, 'Resumo');
      
      // ========== ABA DE COLABORADORES ==========
      const employeesData = [
        ['GASTOS POR COLABORADOR'],
        [''],
        ['Colaborador', 'Nº Faturas', 'Total Gasto (MT)', 'Média por Fatura (MT)']
      ];
      
      report.invoiceEmployeeSummaries?.forEach((item: InvoiceEmployeeSummaryType) => {
        employeesData.push([
          item.employeeName,
          item.totalInvoices.toString(), // Converter para string
          item.totalAmount.toString(),   // Converter para string
          item.totalInvoices > 0 ? (item.totalAmount / item.totalInvoices).toString() : '0' // Converter para string
        ]);
      });
      
      employeesData.push(['']);
      employeesData.push([
        'TOTAIS', 
        totals.totalInvoices.toString(), // Converter para string
        totals.totalAmount.toString(),   // Converter para string
        totals.totalInvoices > 0 ? totals.averagePerInvoice.toString() : '0' // Converter para string
      ]);
      
      const employeesWS = XLSX.utils.aoa_to_sheet(employeesData);
      this.applyEmployeesExcelStyles(employeesWS, employeesData.length);
      XLSX.utils.book_append_sheet(workbook, employeesWS, 'Colaboradores');
      
      // ========== SALVAR ARQUIVO ==========
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      
      const fileName = options?.fileName || `relatorio-custo-colaborador-${report.company?.name || 'empresa'}-${new Date().toISOString().split('T')[0]}.xlsx`;
      this.saveFile(excelBuffer, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      throw error;
    }
  }
  
  private static applyExcelStyles(ws: XLSX.WorkSheet, dataLength: number): void {
    const colWidths = [{ wch: 25 }, { wch: 35 }];
    ws['!cols'] = colWidths;
    
    if (ws['A1']) {
      ws['A1'].s = {
        font: { sz: 14, bold: true, color: { rgb: "1F3A93" } },
        alignment: { horizontal: "center" }
      };
    }
    
    [7, 13, 19].forEach(row => {
      const cell = `A${row}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 11, bold: true, color: { rgb: "333333" } },
          fill: { fgColor: { rgb: "E8E8E8" } }
        };
      }
    });
    
    // Estilo para totais financeiros
    if (ws['B16']) {
      ws['B16'].s = {
        font: { sz: 11, bold: true, color: { rgb: "B71C1C" } }
      };
    }
  }
  
  private static applyEmployeesExcelStyles(ws: XLSX.WorkSheet, dataLength: number): void {
    const colWidths = [
      { wch: 40 }, // Colaborador
      { wch: 15 }, // Nº Faturas
      { wch: 20 }, // Total Gasto
      { wch: 20 }  // Média/Fatura
    ];
    ws['!cols'] = colWidths;
    
    if (ws['A1']) {
      ws['A1'].s = {
        font: { sz: 12, bold: true, color: { rgb: "1F3A93" } }
      };
    }
    
    const headerRow = 3;
    ['A', 'B', 'C', 'D'].forEach(col => {
      const cell = `${col}${headerRow}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "424242" } },
          alignment: { horizontal: col === 'A' ? "left" : "right" }
        };
      }
    });
    
    const totalRow = dataLength - 1;
    ['A', 'B', 'C', 'D'].forEach(col => {
      const cell = `${col}${totalRow}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true },
          fill: { fgColor: { rgb: "F8F9FA" } },
          alignment: { horizontal: col === 'A' ? "left" : "right" },
          border: {
            top: { style: "thin", color: { rgb: "646464" } },
            bottom: { style: "thin", color: { rgb: "646464" } },
            left: { style: "thin", color: { rgb: "646464" } },
            right: { style: "thin", color: { rgb: "646464" } }
          }
        };
      }
    });
    
    if (ws[`C${totalRow}`]) {
      ws[`C${totalRow}`].s.font.color = { rgb: "B71C1C" };
    }
    
    // Formatar células numéricas
    const dataStart = 4;
    const dataEnd = totalRow - 2;
    
    for (let R = dataStart; R <= dataEnd; ++R) {
      if (ws[`B${R}`]) {
        ws[`B${R}`].z = '0';
      }
      if (ws[`C${R}`]) {
        ws[`C${R}`].z = '#,##0.00" MT"';
      }
      if (ws[`D${R}`]) {
        ws[`D${R}`].z = '#,##0.00" MT"';
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
  
  // ========== EXPORT PARA CSV ==========
  static async exportToCSV(
    report: CompanyCostPerEmployeeReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    try {
      const currentDate = new Date().toLocaleDateString('pt-PT');
      const totals = this.calculateTotals(report);
      
      let csvContent = 'RELATÓRIO DE CUSTO POR COLABORADOR\n\n';
      csvContent += 'INFORMAÇÕES DA EMPRESA\n';
      csvContent += `Empresa,${report.company?.name || 'N/A'}\n`;
      csvContent += `Email,${report.company?.email || 'N/A'}\n`;
      csvContent += `Telefone,${report.company?.phone || 'N/A'}\n`;
      csvContent += `Endereço,${report.company?.address || 'N/A'}\n\n`;
      
      csvContent += 'PERÍODO\n';
      csvContent += `Tipo,${report.coveragePeriod ? 'Período de Cobertura' : 'Período Personalizado'}\n`;
      csvContent += `Nome,${report.coveragePeriod?.name || 'N/A'}\n`;
      csvContent += `Data Início,${report.coveragePeriod && report.coveragePeriod.startDate ? formateDate(report.coveragePeriod.startDate) : (report.fromDate ? formateDate(report.fromDate) : 'N/A')}\n`;
      csvContent += `Data Fim,${report.coveragePeriod && report.coveragePeriod.endDate ? formateDate(report.coveragePeriod.endDate) : (report.toDate ? formateDate(report.toDate) : 'N/A')}\n\n`;
      
      csvContent += 'RESUMO ESTATÍSTICO\n';
      csvContent += `Total de Colaboradores,${totals.totalEmployees}\n`;
      csvContent += `Total de Faturas,${totals.totalInvoices}\n`;
      csvContent += `Total Gastos,${amountFormate(totals.totalAmount)} MT\n`;
      csvContent += `Média por Colaborador,${amountFormate(totals.averagePerEmployee)} MT\n`;
      csvContent += `Média por Fatura,${amountFormate(totals.averagePerInvoice)} MT\n\n`;
      
      csvContent += 'GASTOS POR COLABORADOR\n';
      csvContent += 'Colaborador,Nº Faturas,Total Gasto (MT),Média por Fatura (MT)\n';
      
      report.invoiceEmployeeSummaries?.forEach((item: InvoiceEmployeeSummaryType) => {
        const avgPerInvoice = item.totalInvoices > 0 ? item.totalAmount / item.totalInvoices : 0;
        csvContent += `${item.employeeName},${item.totalInvoices},${item.totalAmount},${avgPerInvoice}\n`;
      });
      
      csvContent += `TOTAIS,${totals.totalInvoices},${totals.totalAmount},${totals.totalInvoices > 0 ? totals.averagePerInvoice : 0}\n\n`;
      
      csvContent += 'INFORMAÇÕES DO RELATÓRIO\n';
      csvContent += `Gerado por,${userName}\n`;
      csvContent += `Data de geração,${currentDate}\n`;
      csvContent += `ID do Relatório,100002\n`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = options?.fileName || `relatorio-custo-colaborador-${report.company?.name || 'empresa'}-${new Date().toISOString().split('T')[0]}.csv`;
      this.saveFile(blob, fileName, 'text/csv');
      
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
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