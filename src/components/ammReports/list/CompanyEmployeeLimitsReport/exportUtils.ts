import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import i18n from "@/plugins/i18n";
import { amountFormate } from "@/app/common/amountFormate";
import { formateDate } from "@/app/common/dateFormate";
import type {
  CompanyEmployeeLimitEmployeeType,
  CompanyEmployeeLimitsReportType
} from "@/components/ammReports/types";

export interface ExportOptions {
  fileName?: string;
}

type MonthKey = { year: number; month: number };
type EmployeeRow = {
  employeeName: string;
  department: string;
  position: string;
  hireDate: string;
  terminateDate: string;
  baseSalary: number;
  grossSalary: number;
  limitAmount: number;
  monthValues: Record<string, number>;
  totalBilled: number;
  totalAvailable: number;
};
type TotalsRow = {
  baseSalary: number;
  grossSalary: number;
  limitAmount: number;
  monthValues: Record<string, number>;
  totalBilled: number;
  totalAvailable: number;
};

export class CompanyEmployeeLimitsReportExporter {
  private static readonly BRAND_BLUE = "1F3A93";
  private static readonly SOFT_BLUE = "DCEBFF";
  private static readonly SOFT_BLUE_LIGHT = "EEF4FF";

  private static tr(key: string, params?: Record<string, unknown>): string {
    const translated = (i18n as any).global.t(key, params);
    return typeof translated === "string" ? translated : String(translated);
  }

  private static localeCode(): string {
    const rawLocale = (i18n as any).global.locale;
    const locale = typeof rawLocale === "string" ? rawLocale : rawLocale?.value;
    return locale === "en" ? "en-US" : "pt-PT";
  }

  private static parseDate(value?: string): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private static getMonthRange(report: CompanyEmployeeLimitsReportType): MonthKey[] {
    const start = this.parseDate(report.coveragePeriodStartDate);
    const end = this.parseDate(report.coveragePeriodEndDate);
    if (!start || !end || start > end) return [];

    const months: MonthKey[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= last) {
      months.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  private static monthLabel(year: number, month: number): string {
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString(this.localeCode(), { month: "long", year: "2-digit" });
  }

  private static toMonthKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, "0")}`;
  }

  private static countMonthsInclusive(start: Date, end: Date): number {
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    if (endMonth < startMonth) return 0;
    return ((endMonth.getFullYear() - startMonth.getFullYear()) * 12) + (endMonth.getMonth() - startMonth.getMonth()) + 1;
  }

  private static getAnnualSalaryMonthsCount(
    report: CompanyEmployeeLimitsReportType,
    employee: CompanyEmployeeLimitEmployeeType,
    periodMonthsCount: number
  ): number {
    const periodStart = this.parseDate(report.coveragePeriodStartDate);
    const periodEnd = this.parseDate(report.coveragePeriodEndDate);
    if (!periodStart || !periodEnd) return periodMonthsCount;

    const contractType = String(employee.employeeContractDurationType || "").toUpperCase();
    const hireDate = this.parseDate(employee.employeeHireDate);
    const terminateDate = this.parseDate(employee.employeeTerminateDate);

    // Janela do contrato: OPEN_ENDED usa fim do periodo; FIXED_TERM usa data de termino quando existir.
    const contractStart = hireDate || periodStart;
    const contractEnd = contractType === "FIXED_TERM" ? (terminateDate || periodEnd) : periodEnd;

    // Janela elegivel e a intersecao entre periodo do relatorio e periodo do contrato.
    const effectiveStart = contractStart > periodStart ? contractStart : periodStart;
    const effectiveEnd = contractEnd < periodEnd ? contractEnd : periodEnd;

    if (effectiveEnd < effectiveStart) return 0;
    return this.countMonthsInclusive(effectiveStart, effectiveEnd);
  }

  private static calculateLimit(
    report: CompanyEmployeeLimitsReportType,
    employee: CompanyEmployeeLimitEmployeeType,
    periodMonthsCount: number
  ): number {
    const limitType = String(employee.healthPlanLimit || "");
    const fixed = Number(employee.fixedAmount || 0);
    const component = String(employee.salaryComponent || "");
    const perc = Number(employee.contractContributionPercentage || 0);
    const base = component === "GROSS_SALARY"
      ? Number(employee.employeeGrossSalary || 0)
      : Number(employee.employeeBaseSalary || 0);

    if (limitType === "FIXED_AMOUNT") return fixed;

    if (limitType === "ANUAL_SALARY" || limitType === "ANNUAL_SALARY") {
      // Limite anual e proporcional aos meses elegiveis do contrato dentro do periodo do relatorio.
      const annualMonthsCount = this.getAnnualSalaryMonthsCount(report, employee, periodMonthsCount);
      return (base * annualMonthsCount * perc) / 100;
    }

    if (limitType === "SALARY_PERCENTAGE") {
      return (base * perc) / 100;
    }

    return fixed;
  }

  private static normalizeRows(report: CompanyEmployeeLimitsReportType): { months: MonthKey[]; rows: EmployeeRow[] } {
    const months = this.getMonthRange(report);
    const periodMonthsCount = months.length;

    const rows = (report.employees || []).map((employee) => {
      const employeeName = `${employee.employeeFirstName || ""} ${employee.employeeLastName || ""}`.trim() || "-";
      const contractType = String(employee.employeeContractDurationType || "").toUpperCase();
      const monthValues: Record<string, number> = {};
      (employee.monthlyDetails || []).forEach((m) => {
        const key = this.toMonthKey(Number(m.year || 0), Number(m.month || 0));
        monthValues[key] = Number(m.totalAmount || 0);
      });

      const totalBilled = Object.values(monthValues).reduce((sum, v) => sum + v, 0);
      const limitAmount = this.calculateLimit(report, employee, periodMonthsCount);
      const totalAvailable = limitAmount - totalBilled;

      return {
        employeeName,
        department: employee.departmentName || "-",
        position: employee.positionName || "-",
        hireDate: employee.employeeHireDate ? formateDate(employee.employeeHireDate) : "-",
        terminateDate: contractType === "OPEN_ENDED"
          ? "-"
          : (employee.employeeTerminateDate ? formateDate(employee.employeeTerminateDate) : "-"),
        baseSalary: Number(employee.employeeBaseSalary || 0),
        grossSalary: Number(employee.employeeGrossSalary || 0),
        limitAmount,
        monthValues,
        totalBilled,
        totalAvailable
      };
    });

    // Mantem todos os formatos consistentes: preview/PDF/Excel/CSV ordenados alfabeticamente.
    rows.sort((a, b) => a.employeeName.localeCompare(b.employeeName, this.localeCode(), { sensitivity: "base" }));

    return { months, rows };
  }

  private static getLimitColumnTitle(report: CompanyEmployeeLimitsReportType): string {
    const employee = (report.employees || [])[0];
    if (!employee) return this.tr("t-cel-limit-amount");

    const limitType = String(employee.healthPlanLimit || "");
    const component = String(employee.salaryComponent || "");
    const percentage = Number(employee.contractContributionPercentage || 0);

    if (limitType === "FIXED_AMOUNT") return this.tr("t-cel-limit-fixed-amount");

    if (limitType === "SALARY_PERCENTAGE" || limitType === "ANUAL_SALARY" || limitType === "ANNUAL_SALARY") {
      const formattedPercentage = new Intl.NumberFormat(this.localeCode(), {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(percentage);
      const componentLabel = component === "GROSS_SALARY"
        ? this.tr("t-cel-gross-salary-lower")
        : this.tr("t-cel-base-salary-lower");
      return `${formattedPercentage}% ${componentLabel}`;
    }

    return this.tr("t-cel-limit-amount");
  }

  private static calculateTotals(rows: EmployeeRow[], months: MonthKey[]): TotalsRow {
    const monthValues: Record<string, number> = {};
    months.forEach((m) => {
      const key = this.toMonthKey(m.year, m.month);
      monthValues[key] = rows.reduce((sum, row) => sum + (row.monthValues[key] || 0), 0);
    });

    return {
      baseSalary: rows.reduce((sum, row) => sum + row.baseSalary, 0),
      grossSalary: rows.reduce((sum, row) => sum + row.grossSalary, 0),
      limitAmount: rows.reduce((sum, row) => sum + row.limitAmount, 0),
      monthValues,
      totalBilled: rows.reduce((sum, row) => sum + row.totalBilled, 0),
      totalAvailable: rows.reduce((sum, row) => sum + row.totalAvailable, 0)
    };
  }

  static async exportToPDF(
    report: CompanyEmployeeLimitsReportType,
    userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const { months, rows } = this.normalizeRows(report);
    const totals = this.calculateTotals(rows, months);
    const limitColumnTitle = this.getLimitColumnTitle(report);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const generatedAt = new Date().toLocaleDateString(this.localeCode(), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const currentDate = new Date().toLocaleDateString(this.localeCode());

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(this.tr("t-cel-report-title"), margin, 12);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${this.tr("t-report")} #100006 - ${this.tr("t-report-100006-title")}`, margin, 18);
    pdf.text(`${this.tr("t-institution")}: ${report.contractName || "-"}`, margin, 23);
    pdf.text(`${this.tr("t-coverage-period")}: ${report.coveragePeriodName || "-"}`, margin, 28);

    const drawCard = (
      x: number,
      y: number,
      w: number,
      h: number,
      iconBg: [number, number, number],
      title: string,
      headline: string,
      lines: string[],
      opts?: { titleColor?: [number, number, number]; headlineColor?: [number, number, number] }
    ) => {
      const maxTextWidth = w - 18;
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

      pdf.setDrawColor(224, 224, 224);
      pdf.setLineWidth(0.3);
      pdf.setFillColor(250, 252, 255);
      pdf.roundedRect(x, y, w, h, 2, 2, "FD");
      pdf.setFillColor(iconBg[0], iconBg[1], iconBg[2]);
      pdf.roundedRect(x + 4, y + 4, 8, 8, 1.5, 1.5, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      const titleColor = opts?.titleColor || [120, 120, 120];
      pdf.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
      pdf.text(fitSingleLine(title, 7), x + 14, y + 7);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      const headlineColor = opts?.headlineColor || [55, 71, 79];
      pdf.setTextColor(headlineColor[0], headlineColor[1], headlineColor[2]);
      const headlineLines = fitMultiLines(headline, 9, 2);
      const headlineStartY = y + 11.5;
      const headlineLineHeight = 4.2;
      pdf.text(headlineLines, x + 14, headlineStartY);

      const dividerY = Math.min(headlineStartY + ((headlineLines.length - 1) * headlineLineHeight) + 3, y + h - 12);
      pdf.setDrawColor(236, 239, 244);
      pdf.line(x + 3, dividerY, x + w - 3, dividerY);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(90, 90, 90);
      let lineY = dividerY + 5;
      lines.forEach((line) => {
        const contentLines = fitMultiLines(line, 7, 2);
        contentLines.forEach((contentLine) => {
          if (lineY <= (y + h - 3)) {
            pdf.text(contentLine, x + 4, lineY);
            lineY += 4.2;
          }
        });
        lineY += 0.8;
      });
    };

    const cardsY = 33;
    const cardGap = 4;
    const cardWidth = (pageWidth - (margin * 2) - (cardGap * 2)) / 3;
    const cardHeight = 40;
    drawCard(
      margin,
      cardsY,
      cardWidth,
      cardHeight,
      [227, 242, 253],
      this.tr("t-institution"),
      report.contractName || "-",
      [
        `${this.tr("t-coverage-period")}: ${report.coveragePeriodName || "-"}`,
        `${report.coveragePeriodStartDate ? formateDate(report.coveragePeriodStartDate) : "-"} - ${report.coveragePeriodEndDate ? formateDate(report.coveragePeriodEndDate) : "-"}`
      ],
      { titleColor: [120, 120, 120], headlineColor: [55, 71, 79] }
    );
    drawCard(
      margin + cardWidth + cardGap,
      cardsY,
      cardWidth,
      cardHeight,
      [232, 245, 233],
      this.tr("t-employees"),
      `${rows.length}`,
      [
        `${this.tr("t-cel-total-limit")}: ${amountFormate(totals.limitAmount)} MT`
      ],
      { titleColor: [120, 120, 120], headlineColor: [31, 58, 147] }
    );
    drawCard(
      margin + ((cardWidth + cardGap) * 2),
      cardsY,
      cardWidth,
      cardHeight,
      [255, 235, 238],
      this.tr("t-cel-total-billed"),
      `${amountFormate(totals.totalBilled)} MT`,
      [
        `${this.tr("t-cel-total-available")}: ${amountFormate(totals.totalAvailable)} MT`
      ],
      { titleColor: [120, 120, 120], headlineColor: [183, 28, 28] }
    );

    const monthHeaders = months.map((m) => this.monthLabel(m.year, m.month));
    const headers = [
      this.tr("t-name"),
      this.tr("t-department"),
      this.tr("t-position"),
      this.tr("t-hire-date"),
      this.tr("t-termination-date"),
      this.tr("t-base-salary"),
      this.tr("t-gross-salary"),
      limitColumnTitle,
      ...monthHeaders,
      this.tr("t-cel-total-billed"),
      this.tr("t-cel-total-available")
    ];

    const body = rows.map((row) => {
      const monthsData = months.map((m) => {
        const key = this.toMonthKey(m.year, m.month);
        const value = row.monthValues[key] || 0;
        return value ? amountFormate(value) : "-";
      });
      return [
        row.employeeName,
        row.department,
        row.position,
        row.hireDate,
        row.terminateDate,
        amountFormate(row.baseSalary),
        amountFormate(row.grossSalary),
        amountFormate(row.limitAmount),
        ...monthsData,
        amountFormate(row.totalBilled),
        amountFormate(row.totalAvailable)
      ];
    });
    body.push([
      this.tr("t-totals"),
      "-",
      "-",
      "-",
      "-",
      amountFormate(totals.baseSalary),
      amountFormate(totals.grossSalary),
      amountFormate(totals.limitAmount),
      ...months.map((m) => amountFormate(totals.monthValues[this.toMonthKey(m.year, m.month)] || 0)),
      amountFormate(totals.totalBilled),
      amountFormate(totals.totalAvailable)
    ]);

    autoTable(pdf, {
      startY: cardsY + cardHeight + 6,
      margin: { left: margin, right: margin },
      head: [headers],
      body,
      styles: { fontSize: 7, cellPadding: 1.5, lineWidth: 0.1, lineColor: [220, 220, 220] },
      headStyles: { fillColor: [220, 235, 255], textColor: [31, 58, 147], fontStyle: "bold" },
      didParseCell: (data: any) => {
        if (data.section === "body") {
          const isTotalsRow = data.row.index === rows.length;
          const row = rows[data.row.index];
          const colTotalBilled = 8 + months.length;
          const colTotalAvailable = 9 + months.length;

          if (isTotalsRow) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [238, 244, 255];
            data.cell.styles.textColor = [31, 58, 147];
          }

          if (data.column.index === colTotalAvailable && ((isTotalsRow && totals.totalAvailable < 0) || (row && row.totalAvailable < 0))) {
            data.cell.styles.textColor = [183, 28, 28];
            data.cell.styles.fontStyle = "bold";
          }
          if (data.column.index === colTotalBilled) {
            data.cell.styles.fontStyle = "bold";
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
      pdf.setTextColor(120, 120, 120);

      const footerText = this.tr("t-spr-system-footer");
      const pageText = this.tr("t-spr-page-of", { current: i, total: totalPages });
      const dateFooter = `${this.tr("t-spr-date")}: ${currentDate}`;
      const generatedText = `${this.tr("t-spr-generated-at")}: ${generatedAt}`;
      const userFooter = `${this.tr("t-spr-user")}: ${userName || this.tr("t-spr-system-user")}`;

      pdf.text(footerText, margin, footerY - 5);
      pdf.text(generatedText, margin, footerY - 12);
      pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), footerY - 5);
      pdf.text(dateFooter, pageWidth - margin - pdf.getTextWidth(dateFooter), footerY - 12);
      pdf.text(userFooter, pageWidth - margin - pdf.getTextWidth(userFooter), footerY - 19);
    }

    const fileName = options?.fileName || `limites-assistencia-medica-${new Date().toISOString().split("T")[0]}`;
    pdf.save(`${fileName}.pdf`);
  }

  static async exportToExcel(
    report: CompanyEmployeeLimitsReportType,
    _userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const { months, rows } = this.normalizeRows(report);
    const totals = this.calculateTotals(rows, months);
    const limitColumnTitle = this.getLimitColumnTitle(report);
    const workbook = XLSX.utils.book_new();
    const monthHeaders = months.map((m) => this.monthLabel(m.year, m.month));
    const headers = [
      this.tr("t-name"),
      this.tr("t-department"),
      this.tr("t-position"),
      this.tr("t-hire-date"),
      this.tr("t-termination-date"),
      this.tr("t-base-salary"),
      this.tr("t-gross-salary"),
      limitColumnTitle,
      ...monthHeaders,
      this.tr("t-cel-total-billed"),
      this.tr("t-cel-total-available")
    ];

    const tableHeaderRow = 10;
    const data: any[][] = [
      [this.tr("t-cel-report-title").toUpperCase()],
      [`${this.tr("t-report")} #100006 - ${this.tr("t-report-100006-title")}`],
      [`${this.tr("t-institution")}: ${report.contractName || "-"} | ${this.tr("t-coverage-period")}: ${report.coveragePeriodName || "-"} (${report.coveragePeriodStartDate ? formateDate(report.coveragePeriodStartDate) : "-"} - ${report.coveragePeriodEndDate ? formateDate(report.coveragePeriodEndDate) : "-"})`],
      [],
      [],
      [],
      [],
      [],
      [],
      headers,
      ...rows.map((row) => {
        const monthsData = months.map((m) => row.monthValues[this.toMonthKey(m.year, m.month)] || 0);
        return [
          row.employeeName,
          row.department,
          row.position,
          row.hireDate,
          row.terminateDate,
          row.baseSalary,
          row.grossSalary,
          row.limitAmount,
          ...monthsData,
          row.totalBilled,
          row.totalAvailable
        ];
      }),
      [
        this.tr("t-totals"),
        "-",
        "-",
        "-",
        "-",
        totals.baseSalary,
        totals.grossSalary,
        totals.limitAmount,
        ...months.map((m) => totals.monthValues[this.toMonthKey(m.year, m.month)] || 0),
        totals.totalBilled,
        totals.totalAvailable
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const mergeEndCol = headers.length - 1;
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: mergeEndCol } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: mergeEndCol } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: mergeEndCol } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } },
      { s: { r: 4, c: 5 }, e: { r: 4, c: 9 } },
      { s: { r: 4, c: 10 }, e: { r: 4, c: mergeEndCol } }
    ];

    ws["!cols"] = headers.map((_, i) => {
      if (i === 0) return { wch: 26 };
      if (i < 5) return { wch: 18 };
      return { wch: 14 };
    });

    const setCell = (row: number, col: number, value: string) => {
      const addr = XLSX.utils.encode_cell({ r: row, c: col });
      ws[addr] = { ...(ws[addr] || {}), t: "s", v: value };
    };

    setCell(4, 0, this.tr("t-institution"));
    setCell(5, 0, report.contractName || "-");
    setCell(6, 0, `${this.tr("t-coverage-period")}: ${report.coveragePeriodName || "-"}`);
    setCell(7, 0, `${report.coveragePeriodStartDate ? formateDate(report.coveragePeriodStartDate) : "-"} - ${report.coveragePeriodEndDate ? formateDate(report.coveragePeriodEndDate) : "-"}`);

    setCell(4, 5, this.tr("t-employees"));
    setCell(5, 5, String(rows.length));
    setCell(6, 5, `${this.tr("t-cel-total-limit")}: ${amountFormate(totals.limitAmount)} MT`);

    setCell(4, 10, this.tr("t-cel-total-billed"));
    setCell(5, 10, `${amountFormate(totals.totalBilled)} MT`);
    setCell(6, 10, `${this.tr("t-cel-total-available")}: ${amountFormate(totals.totalAvailable)} MT`);

    if (ws["A1"]) ws["A1"].s = { font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: this.BRAND_BLUE } } };
    if (ws["A2"]) ws["A2"].s = { font: { sz: 11, color: { rgb: this.BRAND_BLUE } } };
    if (ws["A3"]) ws["A3"].s = { font: { sz: 10, color: { rgb: "4A4A4A" } } };

    const cardBorder = {
      top: { style: "thin", color: { rgb: "D9DDE7" } },
      bottom: { style: "thin", color: { rgb: "D9DDE7" } },
      left: { style: "thin", color: { rgb: "D9DDE7" } },
      right: { style: "thin", color: { rgb: "D9DDE7" } }
    };

    for (let row = 4; row <= 7; row++) {
      for (let col = 0; col <= mergeEndCol; col++) {
        const addr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[addr]) ws[addr] = { t: "s", v: "" };
        ws[addr].s = {
          ...(ws[addr].s || {}),
          border: cardBorder,
          fill: { fgColor: { rgb: "F8FBFF" } },
          font: { color: { rgb: "4A4A4A" }, bold: row === 4 },
          alignment: { vertical: "center" }
        };
      }
    }

    const c2 = XLSX.utils.encode_cell({ r: 4, c: 5 });
    const c3 = XLSX.utils.encode_cell({ r: 4, c: 10 });
    if (ws[c2]) ws[c2].s = { ...(ws[c2].s || {}), font: { bold: true, color: { rgb: this.BRAND_BLUE } } };
    if (ws[c3]) ws[c3].s = { ...(ws[c3].s || {}), font: { bold: true, color: { rgb: "B71C1C" } } };

    for (let col = 0; col < headers.length; col++) {
      const addr = XLSX.utils.encode_cell({ r: tableHeaderRow - 1, c: col });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true, color: { rgb: this.BRAND_BLUE } },
          fill: { fgColor: { rgb: this.SOFT_BLUE } },
          alignment: { horizontal: "center", vertical: "center" },
          border: cardBorder
        };
      }
    }

    const dataStart = tableHeaderRow + 1;
    const dataEnd = data.length;
    const totalAvailableCol = 9 + months.length;
    const totalsRowNumber = dataStart + rows.length;
    for (let row = dataStart; row <= dataEnd; row++) {
      for (let col = 5; col <= totalAvailableCol; col++) {
        const addr = XLSX.utils.encode_cell({ r: row - 1, c: col });
        if (ws[addr]) ws[addr].z = "#,##0.00";
      }

      const availableAddr = XLSX.utils.encode_cell({ r: row - 1, c: totalAvailableCol });
      const rowData = rows[row - dataStart];
      if (row === totalsRowNumber) {
        for (let col = 0; col <= mergeEndCol; col++) {
          const totalsCellAddr = XLSX.utils.encode_cell({ r: row - 1, c: col });
          if (ws[totalsCellAddr]) {
            ws[totalsCellAddr].s = {
              ...(ws[totalsCellAddr].s || {}),
              font: { ...(ws[totalsCellAddr].s?.font || {}), bold: true, color: { rgb: this.BRAND_BLUE } },
              fill: { fgColor: { rgb: this.SOFT_BLUE_LIGHT } }
            };
          }
        }
      }
      if (rowData && rowData.totalAvailable < 0 && ws[availableAddr]) {
        ws[availableAddr].s = { ...(ws[availableAddr].s || {}), font: { bold: true, color: { rgb: "B71C1C" } } };
      }
      if (row === totalsRowNumber && totals.totalAvailable < 0 && ws[availableAddr]) {
        ws[availableAddr].s = { ...(ws[availableAddr].s || {}), font: { bold: true, color: { rgb: "B71C1C" } } };
      }
    }

    ws["!autofilter"] = { ref: `A${tableHeaderRow}:${XLSX.utils.encode_col(mergeEndCol)}${data.length}` };
    XLSX.utils.book_append_sheet(workbook, ws, this.tr("t-cel-sheet"));
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const fileName = options?.fileName || `limites-assistencia-medica-${new Date().toISOString().split("T")[0]}`;
    this.saveFile(excelBuffer, `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  static async exportToCSV(
    report: CompanyEmployeeLimitsReportType,
    _userName: string,
    options?: ExportOptions
  ): Promise<void> {
    const { months, rows } = this.normalizeRows(report);
    const totals = this.calculateTotals(rows, months);
    const limitColumnTitle = this.getLimitColumnTitle(report);
    const monthHeaders = months.map((m) => this.monthLabel(m.year, m.month));

    let csv = `${this.tr("t-cel-report-title").toUpperCase()}\n`;
    csv += `${this.tr("t-institution")},${report.contractName || "-"}\n`;
    csv += `${this.tr("t-coverage-period")},${report.coveragePeriodName || "-"}\n\n`;

    const header = [
      this.tr("t-name"),
      this.tr("t-department"),
      this.tr("t-position"),
      this.tr("t-hire-date"),
      this.tr("t-termination-date"),
      this.tr("t-base-salary"),
      this.tr("t-gross-salary"),
      limitColumnTitle,
      ...monthHeaders,
      this.tr("t-cel-total-billed"),
      this.tr("t-cel-total-available")
    ];
    csv += `${header.join(",")}\n`;

    rows.forEach((row) => {
      const monthsData = months.map((m) => row.monthValues[this.toMonthKey(m.year, m.month)] || 0);
      const line = [
        row.employeeName,
        row.department,
        row.position,
        row.hireDate,
        row.terminateDate,
        row.baseSalary,
        row.grossSalary,
        row.limitAmount,
        ...monthsData,
        row.totalBilled,
        row.totalAvailable
      ];
      csv += `${line.join(",")}\n`;
    });

    const totalsLine = [
      this.tr("t-totals"),
      "-",
      "-",
      "-",
      "-",
      totals.baseSalary,
      totals.grossSalary,
      totals.limitAmount,
      ...months.map((m) => totals.monthValues[this.toMonthKey(m.year, m.month)] || 0),
      totals.totalBilled,
      totals.totalAvailable
    ];
    csv += `${totalsLine.join(",")}\n`;

    const bom = "\uFEFF";
    const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });
    const fileName = options?.fileName || `limites-assistencia-medica-${new Date().toISOString().split("T")[0]}`;
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
