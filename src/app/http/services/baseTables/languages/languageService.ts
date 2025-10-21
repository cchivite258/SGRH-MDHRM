import HttpService from "@/app/http/httpService";
import type {
  LanguagesInsert,
  LanguagesUpdate,
  LanguagesListing,
  LanguagesResponse
} from "@/components/baseTables/languages/types";
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

export default class LanguagesService extends HttpService {

  async getLanguages(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: LanguagesListing[]; meta: any }> {
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
      const url = `/administration/languages?${queryString}`;

      const response = await this.get<ApiResponse<LanguagesListing[]>>(url);
      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar languages:", error);
      throw this.handleError(error);
    }
  }

  async createLanguages(data: LanguagesInsert): Promise<ServiceResponse<LanguagesResponse>> {
    try {
      const response = await this.post<ApiResponse<LanguagesResponse>>(
        "/administration/languages",
        data
      );
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error("❌ Erro ao criar language:", error);
      throw this.handleError(error);
      
    }
  }

  async updateLanguages(id: string, data: LanguagesUpdate): Promise<LanguagesResponse> {
    try {
      const payload = {
        code: data.code,
        name: data.name,
        localizedName: data.localizedName,
        region: data.region,
        rtl: data.rtl,
        enabled: data.enabled
      };
      console.log("enabled languages" ,payload)

      const response = await this.put<LanguagesResponse>(`/administration/languages/${id}`, payload);
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar language:", error);
      throw this.handleError(error);
    }
  }

  async deleteLanguages(id: string): Promise<void> {
    try {
      await this.delete(`/administration/languages/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar language:", error);
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

  private createNetworkErrorResponseLanguages(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/languages'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}
