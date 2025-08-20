import HttpService from "@/app/http/httpService";
import type {
  TaxRateTypeInsert,
  TaxRateTypeListing,
  TaxRateTypeUpdate,
  TaxRateTypeResponse
} from "@/components/baseTables/TaxRate/types";
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

export default class TaxRateTypeTypeService extends HttpService {

  async getTaxRates(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: TaxRateTypeListing[]; meta: any }> {
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
      const url = `/administration/setup/tax-rates?${queryString}`;

      const response = await this.get<ApiResponse<TaxRateTypeListing[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar tax-rates:", error);
      throw this.handleError(error);
    }
  }

  async getTaxRatesForDropdown(
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: TaxRateTypeListing[]; meta: any }> {
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
      const url = `/administration/setup/tax-rates?${queryString}`;

      const response = await this.get<ApiResponse<TaxRateTypeListing[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar tax-rates:", error);
      throw this.handleError(error);
    }
  }

  async createTaxRate(data: TaxRateTypeInsert): Promise<ServiceResponse<TaxRateTypeResponse>> {
    try {
      const response = await this.post<ApiResponse<TaxRateTypeResponse>>(
        "/administration/setup/tax-rates",
        data
      );
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error("❌ Erro ao criar tax-rates:", error);
      throw this.handleError(error);
    }
  }

  async updateTaxRate(id: string, data: TaxRateTypeUpdate): Promise<TaxRateTypeResponse> {
    try {
      const payload = {
        name: data.name,
        rate: data.rate,
        description: data.description,
        enabled: data.enabled
      };

      const response = await this.put<TaxRateTypeResponse>(
        `/administration/setup/tax-rates/${id}`,
        payload
      );
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar tax-rates:", error);
      throw this.handleError(error);
    }
  }

  async deleteTaxRate(id: string): Promise<void> {
    try {
      await this.delete(`/administration/setup/tax-rates/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar tax-rates:", error);
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

  private createNetworkErrorResponseTaxRates(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/setup/tax-rates'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}
