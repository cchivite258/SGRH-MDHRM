// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { InvoiceItemInsertType, InvoiceItemListingType } from "@/components/invoice/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

const INVOICE_ITEMS_ENDPOINT = '/amm/invoice-items';

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? [];

const normalizeInvoiceItem = <T extends Record<string, any>>(item: T): T => ({
  ...item,
  companyAllowedHospitalProcedure: item.companyAllowedHospitalProcedure ?? item.contractAllowedHospitalProcedure,
  companyAllowedHospitalProcedureId: item.companyAllowedHospitalProcedureId ?? item.contractAllowedHospitalProcedureId
});

const toInvoiceItemPayload = (invoiceData: InvoiceItemInsertType) => ({
  unitPrice: invoiceData.unitPrice,
  quantity: invoiceData.quantity,
  taxRate: invoiceData.taxRate,
  description: invoiceData.description,
  contractAllowedHospitalProcedure: invoiceData.companyAllowedHospitalProcedure,
  invoice: invoiceData.invoice
});

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
      console.log("Estou a processar  o itens da factura com ID:", id);

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

      const includesToUse = 'taxRate,contractAllowedHospitalProcedure';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `${INVOICE_ITEMS_ENDPOINT}/of-invoice?${queryString}`;

      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<InvoiceItemListingType[]>>(url);

      return {
        content: getContent(response).map((item: any) => normalizeInvoiceItem(item)) as InvoiceItemListingType[],
        meta: getMeta(response)
      };

    } catch (error) {
      console.error("❌ Erro ao buscar pessoas de contacto:", error);
      throw error;
    }
  }

  async createInvoiceItem(invoiceData: InvoiceItemInsertType): Promise<ServiceResponse<InvoiceItemListingType>> {
    try {
      const response = await this.post<ApiResponse<InvoiceItemListingType>>(INVOICE_ITEMS_ENDPOINT, toInvoiceItemPayload(invoiceData));
      return {
        status: 'success',
        data: normalizeInvoiceItem((response.data ?? response.content ?? response) as any) as InvoiceItemListingType
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
        instance: INVOICE_ITEMS_ENDPOINT
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getInvoiceItemById(id: string): Promise<{ data: InvoiceItemListingType }> {
    try {
      const response = await this.get<{ data: InvoiceItemListingType; meta: any }>(
        `${INVOICE_ITEMS_ENDPOINT}/${id}?includes=invoice,contractAllowedHospitalProcedure`
      );
      console.log('Resposta da requisição getInvoiceItemById:------------------------', response);

      return {
        data: normalizeInvoiceItem(((response as any).data ?? response) as any) as InvoiceItemListingType
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
      await this.delete(`${INVOICE_ITEMS_ENDPOINT}/${id}`);
    } catch (error) {
      console.error("❌ Erro ao item da factura:", error);
      throw error;
    }
  }


  async updateInvoiceItem(id: string | undefined, invoiceData: InvoiceItemInsertType): Promise<ServiceResponse<InvoiceItemListingType>> {
    try {

      // Corpo da requisição conforme especificado
      const payload = toInvoiceItemPayload(invoiceData);

      const response = await this.put<ApiResponse<InvoiceItemListingType>>(`${INVOICE_ITEMS_ENDPOINT}/${id}`, payload);
      return {
        status: 'success',
        data: normalizeInvoiceItem((response.data ?? response.content ?? response) as any) as InvoiceItemListingType
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
