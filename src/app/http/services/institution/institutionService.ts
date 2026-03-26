import HttpService from "@/app/http/httpService";
import type { InstitutionListingType, InstitutionInsertType, InstitutionResponseType } from "@/components/institution/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorResponse;
}

export default class InstitutionService extends HttpService {
  private normalizeListResponse<T>(response: ApiResponse<T[]>): { content: T[]; meta: any } {
    return {
      content: response.content ?? response.data ?? [],
      meta: response.metadata ?? response.meta ?? {
        totalElements: 0,
        page: 0,
        size: 10,
        totalPages: 0
      }
    };
  }

  async getInstitutions(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "asc",
    globalSearch?: string,
    advancedFilters: {
      prop: string;
      operator: string;
      value: string | boolean | Date;
    }[] = [],
    logicalOperator: string = "AND"
  ): Promise<{ content: InstitutionListingType[]; meta: any }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortColumn,
        direction
      });

      if (globalSearch) {
        params.append("query_props", "name,address,description,phone,email,website,incomeTaxNumber,createdAt");
        params.append("query_operator", "OR");
        params.append("query_value", globalSearch);
      }

      if (advancedFilters.length > 0) {
        params.append("query_props", advancedFilters.map((f) => f.prop).join(","));
        params.append("query_comparision", advancedFilters.map((f) => f.operator).join(","));
        params.append("query_value", advancedFilters.map((f) => f.value).join(","));
        params.append("query_operator", logicalOperator);
      }

      params.append("includes", "institutionType,companyDetails");

      const response = await this.get<ApiResponse<InstitutionListingType[]>>(
        `/administration/companies?${params.toString()}`
      );

      return this.normalizeListResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getInstitutionsForListing(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "asc",
    query_value?: string,
    query_props?: string
  ): Promise<{ content: InstitutionListingType[]; meta: any }> {
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

      queryParams.push("includes=institutionType,companyDetails");

      const response = await this.get<ApiResponse<InstitutionListingType[]>>(
        `/administration/companies?${queryParams.join("&")}`
      );

      return this.normalizeListResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async createInstitution(institutionData: InstitutionInsertType): Promise<ServiceResponse<InstitutionResponseType>> {
    try {
      const payload = {
        name: institutionData.name,
        description: institutionData.description,
        companyDetailsId: institutionData.companyDetailsId,
        enabled: institutionData.enabled
      };
      console.log(" payload", payload);

      const response = await this.post<ApiResponse<InstitutionResponseType>>("/administration/companies", payload);
      console.log("Respeonse create", response)
      return {
        status: "success",
        data: response.data ?? response.content
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse
        };
      }
      return {
        status: "error",
        error: this.createNetworkErrorResponse()
      };
    }
  }

  private createNetworkErrorResponse(): ApiErrorResponse {
    return {
      status: "error",
      message: "Network error",
      error: {
        type: "ConnectionError",
        title: "Network Error",
        status: 503,
        detail: "Could not connect to server",
        instance: "/administration/companies"
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getInstitutionById(id: string): Promise<{ data: InstitutionResponseType }> {
    const response = await this.get<ApiResponse<InstitutionResponseType> | InstitutionResponseType>(
      `/administration/companies/${id}?includes=companyDetails,institutionType`
    );

    const normalized = (response as ApiResponse<InstitutionResponseType>)?.data
      ?? (response as ApiResponse<InstitutionResponseType>)?.content
      ?? (response as InstitutionResponseType);

    return {
      data: normalized
    };
  }

  handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || "Erro na requisição",
        details: error.response.data?.errors || null,
        status: error.response.status
      };
    }
    return {
      message: "Erro de conexão",
      details: null
    };
  }

  async deleteInstitution(id: string): Promise<void> {
    await this.delete(`/administration/companies/${id}`);
  }

  async updateInstitution(id: string, institutionData: InstitutionInsertType): Promise<InstitutionResponseType> {
    const payload = {
      name: institutionData.name,
      description: institutionData.description,
      companyDetailsId: institutionData.companyDetailsId,
      enabled: institutionData.enabled
    };
     console.log("payload", payload);


    return await this.put<InstitutionResponseType>(`/administration/companies/${id}`, payload);
  }
}

