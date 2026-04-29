import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  EntityInsertType,
  EntityListingType,
  EntityResponseType
} from "@/components/entities/types";

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

const ORGANIZATION_ENDPOINT = "/administration/organization";

export default class CompanyDetailsService extends HttpService {
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

  async getCompanyDetails(
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
  ): Promise<{ content: EntityListingType[]; meta: any }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortColumn,
        direction
      });

      if (globalSearch) {
        params.append(
          "query_props",
          "name,address,description,phone,email,website,incomeTaxNumber,createdAt"
        );
        params.append("query_operator", "OR");
        params.append("query_value", globalSearch);
      }

      if (advancedFilters.length > 0) {
        params.append("query_props", advancedFilters.map((f) => f.prop).join(","));
        params.append(
          "query_comparision",
          advancedFilters.map((f) => f.operator).join(",")
        );
        params.append("query_value", advancedFilters.map((f) => f.value).join(","));
        params.append("query_operator", logicalOperator);
      }

      params.append("includes", "institutionType");

      const response = await this.get<ApiResponse<EntityListingType[]>>(
        `${ORGANIZATION_ENDPOINT}?${params.toString()}`
      );

      return this.normalizeListResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async createCompanyDetails(
    entityData: EntityInsertType
  ): Promise<ServiceResponse<EntityResponseType>> {
    try {
      const payload = {
        name: entityData.name,
        description: entityData.description,
        address: entityData.address,
        phone: entityData.phone,
        email: entityData.email,
        website: entityData.website,
        incomeTaxNumber: entityData.incomeTaxNumber,
        institutionType: entityData.institutionType,
        enabled: entityData.enabled
      };
      const response = await this.post<ApiResponse<EntityResponseType>>(
        ORGANIZATION_ENDPOINT,
        payload
      );
      return {
        status: "success",
        data: response.data ?? response.content ?? (response as EntityResponseType)
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

  async getCompanyDetailsById(id: string): Promise<{ data: EntityResponseType }> {
    const response = await this.get<ApiResponse<EntityResponseType> | EntityResponseType>(
      `${ORGANIZATION_ENDPOINT}/${id}?includes=institutionType`
    );

    const normalized = (response as ApiResponse<EntityResponseType>)?.data
      ?? (response as ApiResponse<EntityResponseType>)?.content
      ?? (response as EntityResponseType);

    return {
      data: normalized
    };
  }

  async updateCompanyDetails(
    id: string,
    entityData: EntityInsertType
  ): Promise<ServiceResponse<EntityResponseType>> {
    try {
      const payload = {
        name: entityData.name,
        description: entityData.description,
        address: entityData.address,
        phone: entityData.phone,
        email: entityData.email,
        website: entityData.website,
        incomeTaxNumber: entityData.incomeTaxNumber,
        institutionType: entityData.institutionType,
        enabled: entityData.enabled
      };
      const response = await this.put<ApiResponse<EntityResponseType>>(
        `${ORGANIZATION_ENDPOINT}/${id}`,
        payload
      );
      return {
        status: "success",
        data: response.data ?? response.content ?? (response as EntityResponseType)
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

  async deleteCompanyDetails(id: string): Promise<void> {
    await this.delete(`${ORGANIZATION_ENDPOINT}/${id}`);
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
        instance: ORGANIZATION_ENDPOINT
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}

