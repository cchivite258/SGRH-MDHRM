// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { DepartmentListingType, DepartmentListingForListType, DepartmentInsertType } from "@/components/institution/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface DepartmentListResponse {
  data: DepartmentListingType[];
  meta: any;
}

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

interface ServiceResponse<T> {  
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}


export default class DepartmentService extends HttpService {
  async getDepartmentsByInstitution(
    id: string | number|  null,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: DepartmentListingType[], meta: any }> {
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

      const queryString = queryParams.join('&');
      const url = `/administration/departments/in-company?${queryString}`;

      console.log('URL da requisição:', url);
      const response = await this.get<DepartmentListResponse>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar departamentos:", error);
      throw error;
    }
  }

  async getDepartmentsByInstitutionList(
    id: string | null,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: DepartmentListingForListType[], meta: any }> {
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

      const queryString = queryParams.join('&');
      const url = `/administration/departments/in-company?${queryString}`;

      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<DepartmentListingForListType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar departamentos:", error);
      throw error;
    }
  }

  async createDepartment(departmentData: DepartmentInsertType): Promise<ServiceResponse<DepartmentListingForListType>> {
    try {
      const response = await this.post<ApiResponse<DepartmentListingForListType>>('/administration/departments', departmentData);
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
        instance: '/administration/companies'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getDepartmentsById(id: string): Promise<{ data: DepartmentListingForListType }> {
    try {
      const response = await this.get<{ data: DepartmentListingForListType; meta: any }>(
        `/administration/departments/${id}?includes=company`
      );
      console.log('Resposta da requisição getDepartmentsById:------------------------', response);

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

  async deleteDepartment(id: string): Promise<void> {
    try {
      await this.delete(`/administration/departments/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar departamentos:", error);
      throw error;
    }
  }


  async updateDepartment(id: string, departmentData: DepartmentInsertType): Promise<DepartmentListingForListType> {
    try {

      // Corpo da requisição conforme especificado
      const payload = {
        name: departmentData.name,
        description: departmentData.description,
        company: departmentData.company,
        enabled: departmentData.enabled
      };

      const response = await this.put<DepartmentListingForListType>(`/administration/departments/${id}`, payload);
      console.log('response update deparment', response)
      return response;

    } catch (error) {
      console.error("❌ Erro ao actualizar deparment:", error);
      throw error;
    }
  }
}