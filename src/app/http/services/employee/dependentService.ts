// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { DependentListingType, DependentInsertType } from "@/components/employee/types";
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

export default class DependentEmployeeService extends HttpService {
  async getDependentbyEmployee(
    id: string | null,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: DependentListingType[], meta: any }> {
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

      const includesToUse = 'company';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/human-resource/employees-dependents/of-employee?${queryString}`;


      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<DependentListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar dependentes:", error);
      throw error;
    }
  }

  async getDependentbyEmployeeForDropdown(
    id: string | null,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: DependentListingType[], meta: any }> {
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

      const includesToUse = 'company';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/human-resource/employees-dependents/of-employee?${queryString}`;


      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<DependentListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar dependentes:", error);
      throw error;
    }
  }

  async createDependent(dependentData: DependentInsertType): Promise<ServiceResponse<DependentListingType>> {
    try {
      const response = await this.post<ApiResponse<DependentListingType>>('/human-resource/employees-dependents', dependentData);
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: 'error',
          error: error.response.data as ApiErrorResponse
        };
      }
      return {
        status: 'error',
        error: this.NetworkErrorResponse()
      };
    }
  }

  private NetworkErrorResponse(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/human-resource/employees-dependents'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getDependentById(id: string): Promise<{ data: DependentListingType }> {
    try {
      const response = await this.get<{ data: DependentListingType; meta: any }>(
        `/human-resource/employees-dependents/${id}?includes=company`
      );
      console.log('Resposta da requisição getDependentById:------------------------', response);

      return {
        data: response.data
      };
    } catch (error) {
      throw this.handleError(error);
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

  async deleteDependent(id: string): Promise<void> {
    try {
      await this.delete(`/human-resource/employees-dependents/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar dependente:", error);
      throw error;
    }
  }


  async updateDependent(id: string, dependentData: DependentInsertType): Promise<ServiceResponse<DependentListingType>> {
    try {

      // Corpo da requisição conforme especificado
      const payload = {
        firstName: dependentData.firstName,
        middleName: dependentData.middleName,
        lastName: dependentData.lastName,
        gender: dependentData.gender,
        birthDate: dependentData.birthDate,
        relationship: dependentData.relationship,
        employee: dependentData.employee,
        idCardNumber: dependentData.idCardNumber,
        idCardIssuer: dependentData.idCardIssuer,
        idCardExpiryDate: dependentData.idCardExpiryDate,
        idCardIssuanceDate: dependentData.idCardIssuanceDate,
        enabled: dependentData.enabled
      };

      const response = await this.put<ApiResponse<DependentListingType>>(`/human-resource/employees-dependents/${id}`, payload);
      console.log('response update dependent', response)
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: 'error',
          error: error.response.data as ApiErrorResponse
        };
      }
      return {
        status: 'error',
        error: this.NetworkErrorResponse()
      };
    }
  }


}


