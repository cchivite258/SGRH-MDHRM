// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { HealthPlanListingType, ExpensePerProcedureType } from "@/components/employee/types";
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
        //`id=${id}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      console.log('ID recebido em getHealthPlansByEmployee:', id);

      // Adiciona o ID apenas se query_value não estiver vazio
      if (query_value) {
        query_value = id + ',' + query_value;
      } else {
        query_value = String(id); // Se query_value estiver vazio, usa apenas o ID
      }


      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const includesToUse = 'usages,contractHealthPlan';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/amm/employee-health-plans?${queryString}`;


      console.log('URL da requisição dos planos:', url);
      const response = await this.get<ApiResponse<HealthPlanListingType[]>>(url);

      return {
        content: getContent(response).map((item: any) => normalizeEmployeeHealthPlan(item)) as HealthPlanListingType[],
        meta: getMeta(response)
      };

    } catch (error) {
      console.error("❌ Erro ao buscar dependentes:", error);
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
          `id=${id}`,
          `page=${page}`,
          `size=${size}`,
          `sortColumn=${sortColumn}`,
          `direction=${direction}`
        ];
  
          if (query_value && query_props) {
            queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
            queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
          }
    
        const includesToUse = 'usages,contractHealthPlan';
        queryParams.push(`includes=${includesToUse}`);
  
        const queryString = queryParams.join('&');
        const url = `/amm/employee-health-plans/${id}?${queryString}`;


        console.log('URL da requisição dos planos:', url);
        const response = await this.get<ApiResponse<HealthPlanListingType>>(url);
  
        return {
          content: normalizeEmployeeHealthPlan((response.data ?? response.content ?? response) as any) as HealthPlanListingType,
          meta: getMeta(response)
        };
        
      } catch (error) {
        console.error("❌ Erro ao buscar dependentes:", error);
        throw error;
      }
    }

  handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Erro na requisição',
        details: error.response.data?.errors || null,
        status: error.response.status
      };
    }
    return {
      message: 'Erro de conexão',
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
    ): Promise<{ content: ExpensePerProcedureType [], meta: any }> { 
      try {
        const queryParams = [
          `id=${id}`,
          `page=${page}`,
          `size=${size}`,
          `sortColumn=${sortColumn}`,
          `direction=${direction}`
        ];
  
          if (query_value && query_props) {
            queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
            queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
          }
    
        const includesToUse = 'hospitalProcedureType';
        queryParams.push(`includes=${includesToUse}`);
  
        const queryString = queryParams.join('&');
        const url = `/amm/employee-hospital-procedure-plan-limits/by-employee-health-plan?${queryString}`;


        console.log('Procedimentos  URL da requisição:', url);
        const response = await this.get<ApiResponse<ExpensePerProcedureType[]>>(url);
  
        return {
          content: getContent(response),
          meta: getMeta(response)
        };
        
      } catch (error) {
        console.error("❌ Erro ao buscar dependentes:", error);
        throw error;
      }
    }



}
