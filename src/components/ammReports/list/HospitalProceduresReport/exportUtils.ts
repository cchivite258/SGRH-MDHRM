import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CompanyHospitalProceduresBalanceType } from "@/components/ammReports/types";
import { amountFormate } from '@/app/common/amountFormate';
import { formateDate } from "@/app/common/dateFormate";

export interface ExportOptions {
  fileName?: string;
}

export class ReportExporter {

  // ========== EXPORT PARA PDF ==========
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

        // ========== CABEÇALHO ==========
        this.addPDFHeader(pdf, report, userName, margin, contentWidth, currentY, pageWidth);
        currentY = 45; // Reduzido de 40 para 30

        // ========== RESUMO EM CARDS (MENORES E SEM BORDAS EXTERNAS) ==========
        currentY = this.addPDFSummaryCards(pdf, report, userName, margin, contentWidth, currentY, pageWidth);
        currentY += 5; // Reduzido espaço

        // ========== TABELA DE PROCEDIMENTOS (MENOR) ==========
        const tableResult = this.addPDFTable(pdf, report, margin, contentWidth, currentY);
        currentY = tableResult.finalY;

        // Adicionar rodapé em todas as páginas
        this.addPDFFooterAllPages(pdf, report, userName, margin, pageWidth, pageHeight);

        // ========== SALVAR ARQUIVO ==========
        const fileName = options?.fileName || `relatorio-gastos-${report.company?.name || 'empresa'}-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

        resolve();
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        reject(error);
      }
    });
  }

  private static addPDFHeader(
    pdf: jsPDF,
    report: CompanyHospitalProceduresBalanceType,
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
    pdf.setFontSize(16); // Reduzido de 18
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório de Gastos Hospitalares', margin, currentY);

    // Subtítulo
    pdf.setFontSize(9); // Reduzido de 10
    pdf.setFont('helvetica', 'normal');
    pdf.text('Relatório #100001 • Total de Gastos em Assistência Médica', margin, currentY + 6);

    // Informações da empresa (menor)
    pdf.setFontSize(11); // Reduzido de 12
    pdf.setFont('helvetica', 'bold');
    const companyName = report.company?.name || 'Empresa';
    pdf.text(companyName, margin, currentY + 14);

    // Data e usuário (menor)
    pdf.setFontSize(9); // Reduzido de 10
    pdf.setFont('helvetica', 'normal');
    const dateText = `Gerado em: ${currentDate}`;
    const userText = `Por: ${userName}`;

    const dateWidth = pdf.getTextWidth(dateText);
    pdf.text(dateText, pageWidth - margin - dateWidth, currentY + 6);
    pdf.text(userText, pageWidth - margin - pdf.getTextWidth(userText), currentY + 14);

    // Linha divisória mais fina
    pdf.setDrawColor(180, 180, 180); // Cor mais clara
    pdf.setLineWidth(0.3); // Mais fina
    pdf.line(margin, currentY + 20, pageWidth - margin, currentY + 20);
  }

  private static addPDFSummaryCards(
    pdf: jsPDF,
    report: CompanyHospitalProceduresBalanceType,
    userName: string,
    margin: number,
    contentWidth: number,
    currentY: number,
    pageWidth: number
  ): number {
    const cardWidth = (contentWidth - 15) / 3; // Ajustado para 15px de gap
    const cardHeight = 35; // Reduzido de 45 para 35

    // Card 1: Instituição - REMOVIDA BORDA EXTERNA
    pdf.setFillColor(248, 249, 250);
    pdf.rect(margin, currentY, cardWidth, cardHeight, 'F'); // Apenas fill, sem borda

    pdf.setFontSize(10); // Reduzido de 11
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66); // Cinza escuro
    pdf.text('Instituição', margin + 8, currentY + 8);

    pdf.setFontSize(8); // Reduzido de 9
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const companyName = report.company?.name || 'N/A';
    if (companyName.length > 35) {
      pdf.text(companyName.substring(0, 35) + '...', margin + 8, currentY + 14);
    } else {
      pdf.text(companyName, margin + 8, currentY + 14);
    }

    pdf.setFontSize(7); // Reduzido de 7 para 6
    pdf.setTextColor(100, 100, 100);
    const email = report.company?.email || 'N/A';
    if (email.length > 35) {
      pdf.text(email.substring(0, 35) + '...', margin + 8, currentY + 20);
    } else {
      pdf.text(email, margin + 8, currentY + 24);
    }
    pdf.text(`Tel: ${report.company?.phone || 'N/A'}`, margin + 8, currentY + 30);

    // Card 2: Período - REMOVIDA BORDA EXTERNA
    const hasCoveragePeriod = report.coveragePeriod !== null && report.coveragePeriod !== undefined;
    const card2X = margin + cardWidth + 7.5; // Ajustado gap

    pdf.setFillColor(232, 245, 233);
    pdf.rect(card2X, currentY, cardWidth, cardHeight, 'F'); // Apenas fill, sem borda

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
      : (report.issueDateFrom ? formateDate(report.issueDateFrom) : 'N/A');
    const endDate = hasCoveragePeriod && report.coveragePeriod?.endDate
      ? formateDate(report.coveragePeriod.endDate)
      : (report.issueDateTo ? formateDate(report.issueDateTo) : 'N/A');

    pdf.text(`Início: ${startDate}`, card2X + 8, currentY + 24);
    pdf.text(`Fim: ${endDate}`, card2X + 8, currentY + 30);

    // Card 3: Total Gastos 
    const card3X = card2X + cardWidth + 7.5; 

    pdf.setFillColor(255, 235, 238);
    pdf.rect(card3X, currentY, cardWidth, cardHeight, 'F'); 

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(66, 66, 66);
    pdf.text('Total Gastos', card3X + 8, currentY + 8);

    pdf.setFontSize(12); 
    pdf.setTextColor(183, 28, 28);
    const totalAmount = amountFormate(report.totalAmount);
    if (totalAmount.length > 15) {
      pdf.text(totalAmount.substring(0, 15) + '... MT', card3X + 8, currentY + 15);
    } else {
      pdf.text(`${totalAmount} MT`, card3X + 8, currentY + 15);
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Procedimentos: ${report.procedureExpenses?.length || 0}`, card3X + 8, currentY + 30);
    //pdf.text(`Por: ${userName}`, card3X + 8, currentY + 32);

    return currentY + cardHeight + 5;
  }

  private static addPDFTable(
    pdf: jsPDF,
    report: CompanyHospitalProceduresBalanceType,
    margin: number,
    contentWidth: number,
    currentY: number
  ): { finalY: number } {
    // Título da tabela (menor)
    pdf.setFontSize(12); // Reduzido de 14
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Gastos por Procedimento', margin, currentY);

    // Preparar dados da tabela
    const tableData = report.procedureExpenses?.map((p: any) => [
      p.procedure.name,
      `${amountFormate(p.amountSpent)} MT`,
      p.amountCovered ? `${amountFormate(p.amountCovered)} MT` : '—'
    ]) || [];

    // Adicionar linha de total 
    const totalRow = ['TOTAIS', `${amountFormate(report.totalAmount)} MT`, '—'];

    // Criar tabela com autoTable )
    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: margin, right: margin },
      head: [['Procedimento', 'Valor Gasto', 'Valor Coberto']],
      body: [...tableData, totalRow],
      theme: 'grid',
      styles: {
        fontSize: 8, // Reduzido de 9
        cellPadding: 2, // Reduzido de 3
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9 // Reduzido
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontSize: 8 },
        1: { cellWidth: 35, halign: 'right', fontSize: 8 }, 
        2: { cellWidth: 35, halign: 'right', fontSize: 8 } 
      },
      // Estilizar linha de totais com bordas
      didParseCell: (data: any) => {
        if (data.row.index === tableData.length) { // Última linha (totais)
          data.cell.styles.fillColor = [248, 249, 250]; // Fundo cinza claro
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.lineWidth = 0.1; // Borda mais forte
          data.cell.styles.lineColor = [100, 100, 100]; // Cor da borda
        }
      },
      willDrawCell: (data: any) => {
        if (data.row.index === tableData.length) { // Última linha (totais)
          // Garantir que todas as bordas sejam desenhadas
          data.doc.setLineWidth(0.3);
          data.doc.setDrawColor(100, 100, 100);
        }
      }
    });

    // Retornar nova posição Y após a tabela
    const finalY = (pdf as any).lastAutoTable?.finalY || currentY + 100;
    return { finalY: finalY + 5 };
  }

  private static addPDFFooterAllPages(
    pdf: jsPDF,
    report: CompanyHospitalProceduresBalanceType,
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

      // Posição fixa no rodapé da página
      const footerY = pageHeight - 15;

      // Linha divisória do rodapé
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

      // Texto do rodapé
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);

      const footerText = 'SGRH - Sistema de Gestão de Recursos Humanos';
      const dateText = `Data: ${currentDate}`;
      const userText = `Usuário: ${userName}`;
      const pageText = `Página ${i} de ${totalPages}`;

      // Texto à esquerda
      pdf.text(footerText, margin, footerY - 5);

      // Informações à direita
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
    report: CompanyHospitalProceduresBalanceType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();
      const currentDate = new Date().toLocaleDateString('pt-PT');

      // ========== ABA DE RESUMO ==========
      const summaryData = [
        ['RELATÓRIO DE GASTOS HOSPITALARES'],
        [''],
        ['Empresa:', report.company?.name || 'N/A'],
        ['Email:', report.company?.email || 'N/A'],
        ['Telefone:', report.company?.phone || 'N/A'],
        [''],
        ['PERÍODO'],
        ['Tipo:', report.coveragePeriod ? 'Período de Cobertura' : 'Período Personalizado'],
        ['Nome:', report.coveragePeriod?.name || 'N/A'],
        ['Data Início:', report.coveragePeriod && report.coveragePeriod.startDate ? formateDate(report.coveragePeriod.startDate) : (report.issueDateFrom ? formateDate(report.issueDateFrom) : 'N/A')],
        ['Data Fim:', report.coveragePeriod && report.coveragePeriod.endDate ? formateDate(report.coveragePeriod.endDate) : (report.issueDateTo ? formateDate(report.issueDateTo) : 'N/A')],
        [''],
        ['RESUMO FINANCEIRO'],
        ['Total Gastos:', `${amountFormate(report.totalAmount)} MT`],
        ['Número de Procedimentos:', report.procedureExpenses?.length || 0],
        [''],
        ['INFORMAÇÕES DO RELATÓRIO'],
        ['Gerado por:', userName],
        ['Data de geração:', currentDate],
        ['ID do Relatório:', '100001']
      ];

      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      this.applyExcelStyles(summaryWS, summaryData.length);
      XLSX.utils.book_append_sheet(workbook, summaryWS, 'Resumo');

      // ========== ABA DE PROCEDIMENTOS ==========
      const proceduresData = [
        ['PROCEDIMENTOS DETALHADOS'],
        [''],
        ['Procedimento', 'Valor Gasto (MT)', 'Valor Coberto (MT)']
      ];

      report.procedureExpenses?.forEach((p: any) => {
        proceduresData.push([
          p.procedure.name,
          p.amountSpent,
          p.amountCovered || 0
        ]);
      });

      proceduresData.push(['']);
      proceduresData.push(['TOTAIS', String(report.totalAmount), '—']);

      const proceduresWS = XLSX.utils.aoa_to_sheet(proceduresData);
      this.applyProceduresExcelStyles(proceduresWS, proceduresData.length);
      XLSX.utils.book_append_sheet(workbook, proceduresWS, 'Procedimentos');

      // ========== SALVAR ARQUIVO ==========
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      const fileName = options?.fileName || `relatorio-gastos-${report.company?.name || 'empresa'}-${new Date().toISOString().split('T')[0]}.xlsx`;
      this.saveFile(excelBuffer, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      throw error;
    }
  }

  private static applyExcelStyles(ws: XLSX.WorkSheet, dataLength: number): void {
    const colWidths = [{ wch: 25 }, { wch: 30 }];
    ws['!cols'] = colWidths;

    if (ws['A1']) {
      ws['A1'].s = {
        font: { sz: 14, bold: true, color: { rgb: "1F3A93" } },
        alignment: { horizontal: "center" }
      };
    }

    [7, 13, 17].forEach(row => {
      const cell = `A${row}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 11, bold: true, color: { rgb: "333333" } },
          fill: { fgColor: { rgb: "E8E8E8" } }
        };
      }
    });

    if (ws['B14']) {
      ws['B14'].s = {
        font: { sz: 11, bold: true, color: { rgb: "B71C1C" } }
      };
    }
  }

  private static applyProceduresExcelStyles(ws: XLSX.WorkSheet, dataLength: number): void {
    const colWidths = [{ wch: 40 }, { wch: 20 }, { wch: 20 }];
    ws['!cols'] = colWidths;

    if (ws['A1']) {
      ws['A1'].s = {
        font: { sz: 12, bold: true, color: { rgb: "1F3A93" } }
      };
    }

    const headerRow = 3;
    ['A', 'B', 'C'].forEach(col => {
      const cell = `${col}${headerRow}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { sz: 10, bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "424242" } },
          alignment: { horizontal: col === 'A' ? "left" : "right" }
        };
      }
    });

    const totalRow = dataLength;
    if (ws[`A${totalRow}`]) {
      ws[`A${totalRow}`].s = {
        font: { sz: 10, bold: true },
        fill: { fgColor: { rgb: "F8F9FA" } },
        border: {
          top: { style: "thin", color: { rgb: "646464" } },
          bottom: { style: "thin", color: { rgb: "646464" } },
          left: { style: "thin", color: { rgb: "646464" } },
          right: { style: "thin", color: { rgb: "646464" } }
        }
      };
    }

    if (ws[`B${totalRow}`]) {
      ws[`B${totalRow}`].s = {
        font: { sz: 10, bold: true, color: { rgb: "B71C1C" } },
        fill: { fgColor: { rgb: "F8F9FA" } },
        alignment: { horizontal: "right" },
        border: {
          top: { style: "thin", color: { rgb: "646464" } },
          bottom: { style: "thin", color: { rgb: "646464" } },
          left: { style: "thin", color: { rgb: "646464" } },
          right: { style: "thin", color: { rgb: "646464" } }
        }
      };
    }

    if (ws[`C${totalRow}`]) {
      ws[`C${totalRow}`].s = {
        font: { sz: 10, bold: true },
        fill: { fgColor: { rgb: "F8F9FA" } },
        alignment: { horizontal: "right" },
        border: {
          top: { style: "thin", color: { rgb: "646464" } },
          bottom: { style: "thin", color: { rgb: "646464" } },
          left: { style: "thin", color: { rgb: "646464" } },
          right: { style: "thin", color: { rgb: "646464" } }
        }
      };
    }

    const dataStart = 4;
    const dataEnd = totalRow - 2;

    for (let R = dataStart; R <= dataEnd; ++R) {
      if (ws[`B${R}`]) ws[`B${R}`].z = '#,##0.00" MT"';
      if (ws[`C${R}`]) ws[`C${R}`].z = '#,##0.00" MT"';
    }

    if (ws[`B${totalRow}`]) ws[`B${totalRow}`].z = '#,##0.00" MT"';
  }

  // ========== EXPORT PARA CSV ==========
  static async exportToCSV(
    report: CompanyHospitalProceduresBalanceType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    try {
      const currentDate = new Date().toLocaleDateString('pt-PT');

      let csvContent = 'RELATÓRIO DE GASTOS HOSPITALARES\n\n';
      csvContent += 'INFORMAÇÕES DA EMPRESA\n';
      csvContent += `Empresa,${report.company?.name || 'N/A'}\n`;
      csvContent += `Email,${report.company?.email || 'N/A'}\n`;
      csvContent += `Telefone,${report.company?.phone || 'N/A'}\n\n`;
      csvContent += 'PERÍODO\n';
      csvContent += `Tipo,${report.coveragePeriod ? 'Período de Cobertura' : 'Período Personalizado'}\n`;
      csvContent += `Nome,${report.coveragePeriod?.name || 'N/A'}\n`;
      csvContent += `Data Início,${report.coveragePeriod && report.coveragePeriod.startDate ? formateDate(report.coveragePeriod.startDate) : (report.issueDateFrom ? formateDate(report.issueDateFrom) : 'N/A')}\n`;
      csvContent += `Data Fim,${report.coveragePeriod && report.coveragePeriod.endDate ? formateDate(report.coveragePeriod.endDate) : (report.issueDateTo ? formateDate(report.issueDateTo) : 'N/A')}\n\n`;
      csvContent += 'RESUMO FINANCEIRO\n';
      csvContent += `Total Gastos,${amountFormate(report.totalAmount)} MT\n`;
      csvContent += `Número de Procedimentos,${report.procedureExpenses?.length || 0}\n\n`;
      csvContent += 'PROCEDIMENTOS\n';
      csvContent += 'Procedimento,Valor Gasto (MT),Valor Coberto (MT)\n';

      report.procedureExpenses?.forEach((p: any) => {
        csvContent += `${p.procedure.name},${p.amountSpent},${p.amountCovered || 0}\n`;
      });

      csvContent += `TOTAIS,${report.totalAmount},-\n\n`;
      csvContent += 'INFORMAÇÕES DO RELATÓRIO\n';
      csvContent += `Gerado por,${userName}\n`;
      csvContent += `Data de geração,${currentDate}\n`;
      csvContent += `ID do Relatório,100001\n`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = options?.fileName || `relatorio-gastos-${report.company?.name || 'empresa'}-${new Date().toISOString().split('T')[0]}.csv`;
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