import HttpService from "@/app/http/httpService";
import type {
  HospitalProcedureTypeInsert,
  HospitalProcedureTypeListing,
  HospitalProcedureTypeUpdate,
  HospitalProcedureTypeResponse
} from "@/components/baseTables/hospitalProcedureType/types";
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

export default class HospitalProcedureTypeService extends HttpService {

  async getHospitalProcedureTypes(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureTypeListing[], meta: any }> {
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
      const url = `/administration/setup/hospital-procedure-types?${queryString}`;

      const response = await this.get<ApiResponse<HospitalProcedureTypeListing[]>>(url);
      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar hospital-procedure-types:", error);
      throw this.handleError(error);
    }
  }

  async getHospitalProcedureTypesForList(
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureTypeListing[], meta: any }> {
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
      const url = `/administration/setup/hospital-procedure-types?${queryString}`;

      const response = await this.get<ApiResponse<HospitalProcedureTypeListing[]>>(url);
      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar hospital-procedure-types:", error);
      throw this.handleError(error);
    }
  }

  async createHospitalProcedureType(data: HospitalProcedureTypeInsert): Promise<ServiceResponse<HospitalProcedureTypeResponse>> {
    try {
      const response = await this.post<ApiResponse<HospitalProcedureTypeResponse>>(
        "/administration/setup/hospital-procedure-types",
        data
      );
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error("❌ Erro ao criar hospital-procedure-types:", error);
      throw error;
    }
  }

  async updateHospitalProcedureType(id: string, data: HospitalProcedureTypeUpdate): Promise<HospitalProcedureTypeResponse> {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        enabled: data.enabled
      };
      console.log("payload hospitalprocedure", payload)

      const response = await this.put<HospitalProcedureTypeResponse>(`/administration/setup/hospital-procedure-types/${id}`, payload);
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar hospital-procedure-type:", error);
      throw this.handleError(error);
    }
  }

  async deleteHospitalProcedureType(id: string): Promise<void> {
    try {
      await this.delete(`/administration/setup/hospital-procedure-types/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar hospital-procedure-type:", error);
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

  private createNetworkErrorResponseHospitalProcedureType(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/setup/hospital-procedure-types'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}
