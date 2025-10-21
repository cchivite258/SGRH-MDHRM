// services/positionService.ts
import HttpService from "@/app/http/httpService";
import type { PositionListingType, PositionInsertType, PositionListingForListType, DepartmentListingForListType } from "@/components/institution/types";
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


export default class PositionService extends HttpService {
  async getPositionsByDepartment(
    id: string,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: PositionListingType[], meta: any }> {
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
      const url = `/administration/positions/in-department?${queryString}`;

      console.log('URL da requisição:', url);
      const response = await this.get<{ data: PositionListingType[]; meta: any }>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };
      
    } catch (error) {
      console.error("❌ Erro ao buscar posições:", error);
      throw error;
    }
  }

  
    async getPositionByDepartmentList(
      id: string | null,
      page: number = 0,
      size: number = 10000000,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ): Promise<{ content: PositionListingForListType[], meta: any }> {
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
        const url = `/administration/positions/in-department?${queryString}`;
  
        console.log('URL da requisição:', url);
        const response = await this.get<ApiResponse<PositionListingForListType[]>>(url);
  
        return {
          content: response.data || [],
          meta: response.meta || []
        };
  
      } catch (error) {
        console.error("❌ Erro ao buscar departamentos:", error);
        throw error;
      }
    }
  
    async createPosition(positionData: PositionInsertType): Promise<ServiceResponse<PositionListingForListType>> {
      try {
        const response = await this.post<ApiResponse<PositionListingForListType>>('/administration/positions', positionData);
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
  
    async getPositionById(id: string): Promise<{ data: PositionListingForListType }> {
      try {
        const response = await this.get<{ data: PositionListingForListType; meta: any }>(
          `/administration/positions/${id}?includes=department`
        );
        console.log('Resposta da requisição getPositionById:------------------------', response);
  
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
  
    async deletePosition(id: string): Promise<void> {
      try {
        await this.delete(`/administration/positions/${id}`);
      } catch (error) {
        console.error("❌ Erro ao deletar positions:", error);
        throw error;
      }
    }
  
  
    async updatePosition(id: string, positionData: PositionInsertType): Promise<PositionListingForListType> {
      try {
  
        // Corpo da requisição conforme especificado
        const payload = {
          name: positionData.name,
          description: positionData.description,
          department: positionData.department,
          enabled: positionData.enabled
        };
  
        const response = await this.put<PositionListingForListType>(`/administration/positions/${id}`, payload);
        console.log('response update position', response)
        return response;
  
      } catch (error) {
        console.error("❌ Erro ao actualizar position:", error);
        throw error;
      }
    }
}