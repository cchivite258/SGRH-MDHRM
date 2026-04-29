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

const CONTRACTS_ENDPOINT = "/administration/contracts";
const CONTRACTS_INCLUDES = "organization,departments,personsOfContacts,contractHealthPlans,coveragePeriods";
const CONTRACTS_INCLUDE_QUERY = `includes=${CONTRACTS_INCLUDES}`;

export default class InstitutionService extends HttpService {
  private normalizeDepartment<T extends Record<string, any>>(department: T, contract: Record<string, any>): T {
    return {
      ...department,
      company: department.company ?? contract
    };
  }

  private normalizeContactPerson<T extends Record<string, any>>(person: T, contract: Record<string, any>): T {
    return {
      ...person,
      company: person.company ?? contract
    };
  }

  private normalizeHealthPlan<T extends Record<string, any>>(healthPlan: T, contract: Record<string, any>): T {
    return {
      ...healthPlan,
      company: healthPlan.company ?? contract,
      companyId: healthPlan.companyId ?? healthPlan.contractId ?? contract.id,
      companyContributionPercentage: healthPlan.companyContributionPercentage ?? healthPlan.contractContributionPercentage,
      companyHealthPlan: healthPlan.companyHealthPlan ?? healthPlan.contractHealthPlan
    };
  }

  private normalizeCoveragePeriod<T extends Record<string, any>>(period: T, contract: Record<string, any>): T {
    return {
      ...period,
      company: period.company ?? contract,
      companyId: period.companyId ?? period.contractId ?? contract.id,
      companyHealthPlanId: period.companyHealthPlanId ?? period.contractHealthPlanId
    };
  }

  private normalizeInstitution<T extends Record<string, any>>(item: T): T {
    const organization = item.organization ?? item.companyDetails;

    if (!organization) {
      return item;
    }

    return {
      ...item,
      companyDetails: item.companyDetails ?? organization,
      companyDetailsId: item.companyDetailsId ?? item.organizationId ?? organization.id,
      address: item.address ?? organization.address,
      phone: item.phone ?? organization.phone,
      email: item.email ?? organization.email,
      website: item.website ?? organization.website,
      incomeTaxNumber: item.incomeTaxNumber ?? organization.incomeTaxNumber,
      institutionType: item.institutionType ?? organization.institutionType,
      departments: (item.departments ?? []).map((department: any) => this.normalizeDepartment(department, item)),
      personsOfContacts: (item.personsOfContacts ?? []).map((person: any) => this.normalizeContactPerson(person, item)),
      contactPersons: (item.contactPersons ?? item.personsOfContacts ?? []).map((person: any) => this.normalizeContactPerson(person, item)),
      contractHealthPlans: (item.contractHealthPlans ?? []).map((healthPlan: any) => this.normalizeHealthPlan(healthPlan, item)),
      healthPlans: (item.healthPlans ?? item.contractHealthPlans ?? []).map((healthPlan: any) => this.normalizeHealthPlan(healthPlan, item)),
      coveragePeriods: (item.coveragePeriods ?? []).map((period: any) => this.normalizeCoveragePeriod(period, item))
    };
  }

  private normalizeListResponse<T>(response: ApiResponse<T[]>): { content: T[]; meta: any } {
    return {
      content: (response.content ?? response.data ?? []).map((item: any) => this.normalizeInstitution(item)) as T[],
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
        params.append("query_props", "name,description,organization.name,organization.address,organization.phone,organization.email,organization.website,organization.incomeTaxNumber,createdAt");
        params.append("query_operator", "OR");
        params.append("query_value", globalSearch);
      }

      if (advancedFilters.length > 0) {
        params.append("query_props", advancedFilters.map((f) => f.prop).join(","));
        params.append("query_comparision", advancedFilters.map((f) => f.operator).join(","));
        params.append("query_value", advancedFilters.map((f) => f.value).join(","));
        params.append("query_operator", logicalOperator);
      }

      params.append("includes", CONTRACTS_INCLUDES);

      const response = await this.get<ApiResponse<InstitutionListingType[]>>(
        `${CONTRACTS_ENDPOINT}?${params.toString()}`
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

      queryParams.push(`includes=${CONTRACTS_INCLUDES}`);

      const response = await this.get<ApiResponse<InstitutionListingType[]>>(
        `${CONTRACTS_ENDPOINT}?${queryParams.join("&")}`
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
        organizationId: institutionData.companyDetailsId,
        enabled: institutionData.enabled
      };
      console.log(" payload", payload);

      const response = await this.post<ApiResponse<InstitutionResponseType>>(
        `${CONTRACTS_ENDPOINT}?${CONTRACTS_INCLUDE_QUERY}`,
        payload
      );
      console.log("Respeonse create", response)
      return {
        status: "success",
        data: this.normalizeInstitution((response.data ?? response.content ?? response) as any) as InstitutionResponseType
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
        instance: CONTRACTS_ENDPOINT
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getInstitutionById(id: string): Promise<{ data: InstitutionResponseType }> {
    const response = await this.get<ApiResponse<InstitutionResponseType> | InstitutionResponseType>(
      `${CONTRACTS_ENDPOINT}/${id}?includes=${CONTRACTS_INCLUDES}`
    );

    const normalized = (response as ApiResponse<InstitutionResponseType>)?.data
      ?? (response as ApiResponse<InstitutionResponseType>)?.content
      ?? (response as InstitutionResponseType);

    return {
      data: this.normalizeInstitution(normalized as any) as InstitutionResponseType
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
    await this.delete(`${CONTRACTS_ENDPOINT}/${id}`);
  }

  async updateInstitution(id: string, institutionData: InstitutionInsertType): Promise<InstitutionResponseType> {
    const payload = {
      name: institutionData.name,
      description: institutionData.description,
      organizationId: institutionData.companyDetailsId,
      enabled: institutionData.enabled
    };
     console.log("payload", payload);


    const response = await this.put<InstitutionResponseType>(
      `${CONTRACTS_ENDPOINT}/${id}?${CONTRACTS_INCLUDE_QUERY}`,
      payload
    );
    return this.normalizeInstitution(response as any) as InstitutionResponseType;
  }
}
