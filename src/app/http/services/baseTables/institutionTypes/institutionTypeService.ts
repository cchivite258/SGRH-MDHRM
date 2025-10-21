import HttpService from "@/app/http/httpService";
import type {
  InstitutionTypeInsert,
  InstitutionTypeListing,
  InstitutionTypeUpdate,
  InstitutionTypeResponse
} from "@/components/baseTables/institutionTypes/types";
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

export default class InstitutionTypeService extends HttpService {

  async getInstitutionTypes(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: InstitutionTypeListing[]; meta: any }> {
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
      const url = `/administration/setup/institution-types?${queryString}`;

      const response = await this.get<ApiResponse<InstitutionTypeListing[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar institution-types:", error);
      throw this.handleError(error);
    }
  }

  async createInstitutionType(data: InstitutionTypeInsert): Promise<ServiceResponse<InstitutionTypeResponse>> {
    try {
      const response = await this.post<ApiResponse<InstitutionTypeResponse>>(
        "/administration/setup/institution-types",
        data
      );
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error("❌ Erro ao criar institution-type:", error);
      throw this.handleError(error);
    }
  }

  async updateInstitutionType(id: string, data: InstitutionTypeUpdate): Promise<InstitutionTypeResponse> {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        enabled: data.enabled
      };

      const response = await this.put<InstitutionTypeResponse>(
        `/administration/setup/institution-types/${id}`,
        payload
      );
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar institution-type:", error);
      throw this.handleError(error);
    }
  }

  async deleteInstitutionType(id: string): Promise<void> {
    try {
      await this.delete(`/administration/setup/institution-types/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar institution-type:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Erro na requisição',
        error: error.response.data?.error || null,
        status: error.response.status
      };
    }
    return {
      message: 'Erro de conexão',
      error: null,
      status: 503
    };
  }

  private createNetworkErrorResponseInstitutionType(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/setup/institution-types'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}
