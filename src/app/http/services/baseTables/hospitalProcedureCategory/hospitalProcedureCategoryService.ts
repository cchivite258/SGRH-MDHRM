import HttpService from "@/app/http/httpService";
import type {
  HospitalProcedureCategoryInsert,
  HospitalProcedureCategoryListing,
  HospitalProcedureCategoryUpdate,
  HospitalProcedureCategoryResponse
} from "@/components/baseTables/hospitalProcedureCategory/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

export default class HospitalProcedureCategoryService extends HttpService {
  async getHospitalProcedureCategoryById(id: string | number): Promise<HospitalProcedureCategoryResponse> {
    try {
      const response = await this.get<ApiResponse<HospitalProcedureCategoryResponse>>(
        `/administration/setup/hospital-procedure-categories/${id}`
      );

      return response.data;
    } catch (error) {
      console.error("âŒ Erro ao buscar hospital-procedure-category por ID:", error);
      throw this.handleError(error);
    }
  }

  async getHospitalProcedureCategories(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureCategoryListing[], meta: any }> {
    try {
      const queryParams = [
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const queryString = queryParams.join('&');
      const url = `/administration/setup/hospital-procedure-categories?${queryString}`;

      const response = await this.get<ApiResponse<HospitalProcedureCategoryListing[]>>(url);
      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("âŒ Erro ao buscar hospital-procedure-categories:", error);
      throw this.handleError(error);
    }
  }

  async getHospitalProcedureCategoriesForList(
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureCategoryListing[], meta: any }> {
    try {
      const queryParams = [
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const queryString = queryParams.join('&');
      const url = `/administration/setup/hospital-procedure-categories?${queryString}`;

      const response = await this.get<ApiResponse<HospitalProcedureCategoryListing[]>>(url);
      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("âŒ Erro ao buscar hospital-procedure-categories:", error);
      throw this.handleError(error);
    }
  }

  async createHospitalProcedureCategory(data: HospitalProcedureCategoryInsert): Promise<ServiceResponse<HospitalProcedureCategoryResponse>> {
    try {
      const response = await this.post<ApiResponse<HospitalProcedureCategoryResponse>>(
        "/administration/setup/hospital-procedure-categories",
        data
      );
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error("âŒ Erro ao criar hospital-procedure-categories:", error);
      throw this.handleError(error);
    }
  }

  async updateHospitalProcedureCategory(id: string, data: HospitalProcedureCategoryUpdate): Promise<HospitalProcedureCategoryResponse> {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        enabled: data.enabled
      };
      const response = await this.put<HospitalProcedureCategoryResponse>(`/administration/setup/hospital-procedure-categories/${id}`, payload);
      return response;
    } catch (error) {
      console.error("âŒ Erro ao actualizar hospital-procedure-category:", error);
      throw this.handleError(error);
    }
  }

  async deleteHospitalProcedureCategory(id: string): Promise<void> {
    try {
      await this.delete(`/administration/setup/hospital-procedure-categories/${id}`);
    } catch (error) {
      console.error("âŒ Erro ao deletar hospital-procedure-category:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Erro na requisiÃ§Ã£o',
        error: error.response.data?.error || null,
        status: error.response.status
      };
    }
    return {
      message: 'Erro de conexÃ£o',
      error: null,
      status: 503
    };
  }

  private createNetworkErrorResponseHospitalProcedureCategory(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/setup/hospital-procedure-categories'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}


