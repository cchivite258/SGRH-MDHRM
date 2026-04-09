
import AuthService from "@/app/http/services/authService";
import UserService from "@/app/http/services/userService";
import EmployeeService from "@/app/http/services/employee/employeeService";
import InstitutionService from "@/app/http/services/institution/institutionService";
import CompanyDetailsService from "@/app/http/services/institution/companyDetailsService";
import DepartmentService from "@/app/http/services/institution/departmentService";
import PositionService from "@/app/http/services/institution/positionService";
import ServiceProviderInstitutionService from "@/app/http/services/institution/serviceProviderService";
import ServiceProviderService from "@/app/http/services/serviceProvider/serviceProviderService";
import ContactPersonService from "@/app/http/services/institution/contactPersonService";
import HospitalProcedureService from "@/app/http/services/institution/hospitalProcedureService";
import CoveragePeriodsService from "@/app/http/services/institution/coveragePeriodsService";
import HealthPlanService from "@/app/http/services/institution/healthPlanService";
import InvoiceService from "@/app/http/services/invoice/invoiceService";
import DependentEmployeeService from "@/app/http/services/employee/dependentService";
import HealthPlanEmployeeService from "@/app/http/services/employee/healthPlanService";
import InvoiceItemService from "@/app/http/services/invoice/invoiceItemService";

//BASETABLES
import CountryService from "@/app/http/services/baseTables/country/countryService";
import CurrencyService from "@/app/http/services/baseTables/currency/currencyService";
import HospitalProcedureTypeService from "@/app/http/services/baseTables/hospitalProcedureType/hospitalProcedureTypeService";
import HospitalProcedureGroupService from "@/app/http/services/baseTables/hospitalProcedureGroup/hospitalProcedureGroupService";
import HospitalProcedureGroupingService from "@/app/http/services/baseTables/hospitalProcedureGrouping/hospitalProcedureGroupingService";
import InstitutionTypeService from "@/app/http/services/baseTables/institutionTypes/institutionTypeService";
import LeaveReasonService from "@/app/http/services/baseTables/leaveReason/leaveReasonService";
import LanguageService from "@/app/http/services/baseTables/languages/languageService";
import TaxRateTypeTypeService from "./services/baseTables/taxRate/taxRateService";
import ProviderTypeService from "@/app/http/services/baseTables/providerType/providerTypeService";
import BudgetService from "@/app/http/services/institution/budgetService";

//Reports
import CompanyHospitalProceduresBalancesService from "@/app/http/services/ammReports/companyHospitalProceduresBalancesService";
import CostPerEmployeeService from "@/app/http/services/ammReports/CostPerEmployeeService";
import ServiceProviderReportService from "@/app/http/services/ammReports/serviceProviderReportService";
import TopServiceTypesByClinicReportService from "@/app/http/services/ammReports/topServiceTypesByClinicReportService";
import ServiceProviderComparisonReportService from "@/app/http/services/ammReports/serviceProviderComparisonReportService";
import CompanyEmployeeLimitsReportService from "@/app/http/services/ammReports/companyEmployeeLimitsReportService";
import TotalBilledMedicalAssistanceReportService from "@/app/http/services/ammReports/totalBilledMedicalAssistanceReportService";
import TotalBilledByProviderReportService from "@/app/http/services/ammReports/totalBilledByProviderReportService";
import EmployeeExpenseStatementReportService from "@/app/http/services/ammReports/employeeExpenseStatementReportService";

// FakeBackendService is used for mocking API responses
import FakeBackendService from "@/app/http/services/fakeBackendService";

const authService = new AuthService();
const userService = new UserService();
const employeeService = new EmployeeService();
const institutionService = new InstitutionService();
const companyDetailsService = new CompanyDetailsService();
const departmentService = new DepartmentService();
const positionService = new PositionService();
const coveragePeriodsService = new CoveragePeriodsService();
const healthPlanService = new HealthPlanService();
const serviceProviderService = new ServiceProviderService();
const contactPersonService = new ContactPersonService();
const hospitalProcedureService = new HospitalProcedureService();
const serviceProviderInstitutionService = new ServiceProviderInstitutionService();
const invoiceService = new InvoiceService();
const dependentEmployeeService = new DependentEmployeeService();
const invoiceItemService = new InvoiceItemService();
const healthPlanEmployeeService = new HealthPlanEmployeeService();
const budgetService = new BudgetService();

//Reports
const companyHospitalProceduresBalancesService = new CompanyHospitalProceduresBalancesService();
const costPerEmployeeService = new CostPerEmployeeService();
const serviceProviderReportService = new ServiceProviderReportService();
const topServiceTypesByClinicReportService = new TopServiceTypesByClinicReportService();
const serviceProviderComparisonReportService = new ServiceProviderComparisonReportService();
const companyEmployeeLimitsReportService = new CompanyEmployeeLimitsReportService();
const totalBilledMedicalAssistanceReportService = new TotalBilledMedicalAssistanceReportService();
const totalBilledByProviderReportService = new TotalBilledByProviderReportService();
const employeeExpenseStatementReportService = new EmployeeExpenseStatementReportService();

//BASETABLES
const countryService = new CountryService();
const currencyService = new CurrencyService();
const hospitalProcedureTypeService = new HospitalProcedureTypeService();
const hospitalProcedureGroupService = new HospitalProcedureGroupService();
const hospitalProcedureGroupingService = new HospitalProcedureGroupingService();
const institutionTypeService = new InstitutionTypeService();
const leaveReasonService = new LeaveReasonService();
const languageService = new LanguageService();
const taxRateTypeService = new TaxRateTypeTypeService();
const providerTypeService = new ProviderTypeService();

// FakeBackendService is used for mocking API responses
const fakeBackendService = new FakeBackendService();

export {
    authService,
    userService, 
    employeeService, 
    fakeBackendService, 
    countryService, 
    currencyService, 
    hospitalProcedureTypeService, 
    hospitalProcedureGroupService,
    hospitalProcedureGroupingService,
    institutionTypeService, 
    leaveReasonService, 
    languageService, 
    institutionService, 
    companyDetailsService,
    departmentService, 
    positionService, 
    serviceProviderService,
    contactPersonService,
    serviceProviderInstitutionService,
    hospitalProcedureService,
    invoiceService,
    dependentEmployeeService,
    taxRateTypeService,
    invoiceItemService,
    coveragePeriodsService,
    healthPlanService,
    healthPlanEmployeeService,
    providerTypeService,
    budgetService,
    companyHospitalProceduresBalancesService,
    costPerEmployeeService,
    serviceProviderReportService,
    topServiceTypesByClinicReportService,
    serviceProviderComparisonReportService,
    companyEmployeeLimitsReportService,
    totalBilledMedicalAssistanceReportService,
    totalBilledByProviderReportService,
    employeeExpenseStatementReportService
};
