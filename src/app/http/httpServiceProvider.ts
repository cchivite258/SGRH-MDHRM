
import AuthService from "@/app/http/services/authService";
import UserService from "@/app/http/services/userService";
import EmployeeService from "@/app/http/services/employee/employeeService";
import InstitutionService from "@/app/http/services/institution/institutionService";
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
import InstitutionTypeService from "@/app/http/services/baseTables/institutionTypes/institutionTypeService";
import LeaveReasonService from "@/app/http/services/baseTables/leaveReason/leaveReasonService";
import LanguageService from "@/app/http/services/baseTables/languages/languageService";
import TaxRateTypeTypeService from "./services/baseTables/taxRate/taxRateService";
import ProviderTypeService from "@/app/http/services/baseTables/providerType/providerTypeService";
import BudgetService from "@/app/http/services/institution/budgetService";
import CompanyHospitalProceduresBalancesService from "@/app/http/services/ammReports/companyHospitalProceduresBalancesService";


// FakeBackendService is used for mocking API responses
import FakeBackendService from "@/app/http/services/fakeBackendService";

const authService = new AuthService();
const userService = new UserService();
const employeeService = new EmployeeService();
const institutionService = new InstitutionService();
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
const companyHospitalProceduresBalancesService = new CompanyHospitalProceduresBalancesService();

//BASETABLES
const countryService = new CountryService();
const currencyService = new CurrencyService();
const hospitalProcedureTypeService = new HospitalProcedureTypeService();
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
    institutionTypeService, 
    leaveReasonService, 
    languageService, 
    institutionService, 
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
    companyHospitalProceduresBalancesService
};
