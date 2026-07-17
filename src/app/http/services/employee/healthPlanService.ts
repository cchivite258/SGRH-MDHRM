// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type {
  HealthPlanListingType,
  ExpensePerProcedureType,
  DependentHospitalProcedurePlanLimitType,
  DependentHospitalProcedurePlanUsedBalanceType
} from "@/components/employee/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? [];

const normalizeEmployeeHealthPlan = <T extends Record<string, any>>(item: T): T => ({
  ...item,
  companyHealthPlan: item.companyHealthPlan ?? item.contractHealthPlan,
  companyHealthPlanId: item.companyHealthPlanId ?? item.contractHealthPlanId
});

const EMPLOYEE_HEALTH_PLAN_INCLUDES = 'usages,employee,contractHealthPlan,companyHealthPlan';

export default class EmployeeHealthPlanService extends HttpService {
  async getHealthPlansByEmployee(
    id: string | null,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HealthPlanListingType[], meta: any }> {
    try {
      const queryParams = [
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      console.log('[getHealthPlansByEmployee] employeeId usado apenas para listar planos do colaborador:', id);

      if (query_value) {
        query_value = id + ',' + query_value;
      } else {
        query_value = String(id);
      }

      if (query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
      }

      if (query_value) {
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      if (query_props && query_value) {
        queryParams.push(`query_operator=AND`);
      }

      queryParams.push(`includes=${EMPLOYEE_HEALTH_PLAN_INCLUDES}`);

      const queryString = queryParams.join('&');
      const url = `/amm/employee-health-plans?${queryString}`;

      console.log('URL da requisicao dos planos:', url);
      const response = await this.get<ApiResponse<HealthPlanListingType[]>>(url);

      return {
        content: getContent(response).map((item: any) => normalizeEmployeeHealthPlan(item)) as HealthPlanListingType[],
        meta: getMeta(response)
      };
    } catch (error) {
      console.error("Erro ao buscar planos de saude do colaborador:", error);
      throw error;
    }
  }

  async getHealthPlanbyId(
    id: string | null,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HealthPlanListingType, meta: any }> {
    try {
      const queryParams = [
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      if (query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
      }

      if (query_value) {
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      queryParams.push(`includes=${EMPLOYEE_HEALTH_PLAN_INCLUDES}`);

      const queryString = queryParams.join('&');
      const url = `/amm/employee-health-plans/${id}?${queryString}`;

      console.log('URL da requisicao dos planos:', url);
      const response = await this.get<ApiResponse<HealthPlanListingType>>(url);

      return {
        content: normalizeEmployeeHealthPlan((response.data ?? response.content ?? response) as any) as HealthPlanListingType,
        meta: getMeta(response)
      };
    } catch (error) {
      console.error("Erro ao buscar plano de saude do colaborador:", error);
      throw error;
    }
  }

  handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Erro na requisicao',
        details: error.response.data?.errors || null,
        status: error.response.status
      };
    }
    return {
      message: 'Erro de conexao',
      details: null
    };
  }

  async getHospitalProcedureBalancebyEmployee(
    id: string | null,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: ExpensePerProcedureType[], meta: any }> {
    try {
      console.log('[by-employee-health-plan] employeeHealthPlanId enviado para consultar limites:', id);
      const queryParams = [
        `id=${id}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      if (query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
      }

      if (query_value) {
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      if (query_props && query_value) {
        queryParams.push(`query_operator=AND`);
      }

      const includesToUse = 'employeeHealthPlan,contractHealthPlanHospitalProcedures,companyHealthPlanHospitalProcedures,hospitalProcedureType,hospitalProcedureGroup,employeeHospitalProcedurePlanUsages,dependent';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/amm/employee-hospital-procedure-plan-limits/by-employee-health-plan?${queryString}`;

      console.log('Procedimentos URL da requisicao:', url);
      const response = await this.get<ApiResponse<ExpensePerProcedureType[]>>(url);

      return {
        content: getContent(response),
        meta: getMeta(response)
      };
    } catch (error) {
      console.error("Erro ao buscar procedimentos do plano:", error);
      throw error;
    }
  }

  async getHospitalProcedureBalanceByEmployeeHealthPlanAndDependent(
    employeeHealthPlanId: string,
    dependentId: string,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string,
    includes: string = 'employeeHealthPlan,contractHealthPlanHospitalProcedures,hospitalProcedureType,hospitalProcedureGroup,employeeHospitalProcedurePlanUsages,dependent'
  ): Promise<{ content: DependentHospitalProcedurePlanLimitType[], meta: any }> {
    try {
      const params = new URLSearchParams({
        employeeHealthPlanId,
        dependentId,
        page: page.toString(),
        size: size.toString(),
        sortColumn,
        direction
      });

      const trimmedQueryValue = query_value?.trim();
      if (trimmedQueryValue && query_props) {
        params.append('query_props', query_props);
        params.append('query_operator', 'OR');
        params.append('query_value', trimmedQueryValue);
      }

      params.append('includes', includes);

      const url = `/amm/employee-hospital-procedure-plan-limits/by-employee-health-plan-and-dependent?${params.toString()}`;
      const response = await this.get<ApiResponse<DependentHospitalProcedurePlanLimitType[]>>(url);

      return {
        content: getContent(response),
        meta: getMeta(response)
      };
    } catch (error) {
      console.error("Erro ao buscar plano do dependente:", error);
      throw error;
    }
  }

  async getHospitalProcedureUsedBalanceByEmployeeHealthPlanAndDependent(
    employeeHealthPlanId: string,
    dependentId: string
  ): Promise<DependentHospitalProcedurePlanUsedBalanceType> {
    try {
      const params = new URLSearchParams({
        employeeHealthPlanId,
        dependentId
      });

      const url = `/amm/employee-hospital-procedure-plan-limits/by-employee-health-plan-and-dependent/used-balance?${params.toString()}`;
      const response = await this.get<ApiResponse<DependentHospitalProcedurePlanUsedBalanceType>>(url);

      return (response.data ?? response.content ?? response) as DependentHospitalProcedurePlanUsedBalanceType;
    } catch (error) {
      console.error("Erro ao buscar saldo utilizado do plano do dependente:", error);
      throw error;
    }
  }
}
