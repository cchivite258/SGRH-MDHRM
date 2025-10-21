import HttpService from "@/app/http/httpService";
import type {
  CurrencyInsertType,
  CurrencyListingType,
  CurrencyUpdateType,
  CurrencyResponseType
} from "@/components/baseTables/currency/types";
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

export default class CurrencyService extends HttpService {

  async getCurrencies(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: CurrencyListingType[], meta: any }> {
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
      const url = `/administration/setup/currencies?${queryString}`;

      const response = await this.get<ApiResponse<CurrencyListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || {}
      };
    } catch (error) {
      console.error("❌ Erro ao buscar moedas:", error);
      throw this.handleError(error);
    }
  }

  async getCurrenciesForDropdown(
    page: number = 0,
    size: number = 1000000,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: CurrencyListingType[], meta: any }> {
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
      const url = `/administration/setup/currencies?${queryString}`;

      const response = await this.get<ApiResponse<CurrencyListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || {}
      };
    } catch (error) {
      console.error("❌ Erro ao buscar moedas:", error);
      throw this.handleError(error);
    }
  }

  async createCurrency(currencyData: CurrencyInsertType): Promise<ServiceResponse<CurrencyResponseType>> {
    try {
      const response = await this.post<ApiResponse<CurrencyResponseType>>("/administration/setup/currencies", currencyData);
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error("❌ Erro ao criar currencies:", error);
      throw error;
    }
  }

  async updateCurrency(id: string, currencyData: CurrencyUpdateType): Promise<CurrencyResponseType> {
    try {
      const payload = {
        name: currencyData.name,
        symbol: currencyData.symbol,
        enabled: currencyData.enabled
      };

      const response = await this.put<CurrencyResponseType>(`/administration/setup/currencies/${id}`, payload);
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar moeda:", error);
      throw this.handleError(error);
    }
  }

  async deleteCurrency(id: string): Promise<void> {
    try {
      await this.delete(`/administration/setup/currencies/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar moeda:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
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

  private createNetworkErrorResponseCurrency(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/setup/currencies'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}
