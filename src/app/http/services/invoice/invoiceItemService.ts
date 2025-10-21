// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { InvoiceItemInsertType, InvoiceItemListingType } from "@/components/invoice/types";
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

export default class InvoiceItemService extends HttpService {
  async getInvoiceItemByInvoice(
    id: string | null,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: InvoiceItemListingType[], meta: any }> {
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

      const includesToUse = 'taxRate,companyAllowedHospitalProcedure';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/amm/invoice-items/of-invoice?${queryString}`;

      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<InvoiceItemListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar pessoas de contacto:", error);
      throw error;
    }
  }

  async createInvoiceItem(invoiceData: InvoiceItemInsertType): Promise<ServiceResponse<InvoiceItemListingType>> {
    try {
      const response = await this.post<ApiResponse<InvoiceItemListingType>>('/amm/invoice-items', invoiceData);
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

  async getInvoiceItemById(id: string): Promise<{ data: InvoiceItemListingType }> {
    try {
      const response = await this.get<{ data: InvoiceItemListingType; meta: any }>(
        `/amm/invoice-items/${id}?includes=invoice`
      );
      console.log('Resposta da requisição getInvoiceItemById:------------------------', response);

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

  async deleteInvoiceItem(id: string): Promise<void> {
    try {
      await this.delete(`/amm/invoice-items/${id}`);
    } catch (error) {
      console.error("❌ Erro ao item da factura:", error);
      throw error;
    }
  }


  async updateInvoiceItem(id: string | undefined, invoiceData: InvoiceItemInsertType): Promise<ServiceResponse<InvoiceItemListingType>> {
    try {

      // Corpo da requisição conforme especificado
      const payload = {
        unitPrice: invoiceData.unitPrice,
        quantity: invoiceData.quantity,
        taxRate: invoiceData.taxRate,
        description: invoiceData.description,
        companyAllowedHospitalProcedure: invoiceData.companyAllowedHospitalProcedure,
        invoice: invoiceData.invoice,
      };

      const response = await this.put<ApiResponse<InvoiceItemListingType>>(`/amm/invoice-items/${id}`, payload);
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


