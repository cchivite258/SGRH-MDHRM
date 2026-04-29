// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { HospitalProcedureListingType, HospitalProcedureInsertType } from "@/components/institution/types";
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

const CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT = '/administration/contract/allowed-hospital-procedures';

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? [];

const normalizeHospitalProcedure = <T extends Record<string, any>>(item: T): T => ({
  ...item,
  companyHealthPlan: item.companyHealthPlan ?? item.contractHealthPlan,
  company: item.company ?? item.contractHealthPlan?.contract ?? item.contract
});

const appendContractFilter = (queryParams: string[], id: string | null, query_value?: string, query_props?: string) => {
  if (query_value && query_props) {
    queryParams.push(`query_props=${encodeURIComponent(`${query_props},contractHealthPlan.contract.id`)}`);
    queryParams.push(`query_value=${encodeURIComponent(`${query_value},${id}`)}`);
    queryParams.push(`query_operator=AND`);
    return;
  }

  queryParams.push(`query_props=contractHealthPlan.contract.id`);
  queryParams.push(`query_value=${id}`);
};

export default class HospitalProcedureService extends HttpService {
  private removeNullUndefinedAndEmptyFields<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== null && value !== undefined && value !== "")
    ) as Partial<T>;
  }

  async getHospitalProcedureByInstitution(
    id: string | null,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureListingType[], meta: any }> {
    try {
      const queryParams = [
        `id=${id}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      const includesToUse = 'contractHealthPlan,hospitalProcedureType,hospitalProcedureGroup';
      queryParams.push(`includes=${includesToUse}`);
      appendContractFilter(queryParams, id, query_value, query_props);

      const queryString = queryParams.join('&');
      const url = `${CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT}?${queryString}`;

      console.log('URL da requisiÃ§Ã£o:', url);
      const response = await this.get<ApiResponse<HospitalProcedureListingType[]>>(url);

      return {
        content: getContent(response).map((item: any) => normalizeHospitalProcedure(item)) as HospitalProcedureListingType[],
        meta: getMeta(response)
      };

    } catch (error) {
      console.error("âŒ Erro ao buscar procedimentos hospitalares:", error);
      throw error;
    }
  }


  async getHospitalProcedureByInstitutionForDropdown(
    id: string | null,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureListingType[], meta: any }> {
    try {
      const queryParams = [
        `id=${id}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      const includesToUse = 'contractHealthPlan,hospitalProcedureType,hospitalProcedureGroup';
      queryParams.push(`includes=${includesToUse}`);
      appendContractFilter(queryParams, id, query_value, query_props);

      const queryString = queryParams.join('&');
      const url = `${CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT}?${queryString}`;

      console.log('URL da requisiÃ§Ã£o:', url);
      const response = await this.get<ApiResponse<HospitalProcedureListingType[]>>(url);

      return {
        content: getContent(response).map((item: any) => normalizeHospitalProcedure(item)) as HospitalProcedureListingType[],
        meta: getMeta(response)
      };

    } catch (error) {
      console.error("âŒ Erro ao buscar procedimentos hospitalares:", error);
      throw error;
    }
  }

  async getHospitalProcedureByHealthPlan(
    id: string | null,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureListingType[], meta: any }> {
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
        queryParams.push(`query_operator=OR`);
      }

      const includesToUse = 'contractHealthPlan,hospitalProcedureType,hospitalProcedureGroup';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `${CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT}/in-health-plan?${queryString}`;

      console.log('URL da requisiÃ§Ã£o:', url);
      const response = await this.get<ApiResponse<HospitalProcedureListingType[]>>(url);
      return {
        content: getContent(response).map((item: any) => normalizeHospitalProcedure(item)) as HospitalProcedureListingType[],
        meta: getMeta(response)
      };

    } catch (error) {
      console.error("âŒ Erro ao buscar procedimentos hospitalares:", error);
      throw error;
    }
  }

  async getHospitalProcedures(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureListingType[], meta: any }> {
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

      const includesToUse = 'contractHealthPlan,hospitalProcedureType,hospitalProcedureGroup';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `${CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT}?${queryString}`;

      console.log('URL da requisiÃ§Ã£o:', url);
      const response = await this.get<ApiResponse<HospitalProcedureListingType[]>>(url);

      return {
        content: getContent(response).map((item: any) => normalizeHospitalProcedure(item)) as HospitalProcedureListingType[],
        meta: getMeta(response)
      };

    } catch (error) {
      console.error("âŒ Erro ao buscar procedimentos hospitalares:", error);
      throw error;
    }
  }


  async createHospitalProcedure(hospitalProcedureData: HospitalProcedureInsertType): Promise<ServiceResponse<HospitalProcedureListingType>> {
    try {
      const payload = this.removeNullUndefinedAndEmptyFields({
        ...hospitalProcedureData,
        contractHealthPlan: hospitalProcedureData.companyHealthPlan,
        companyHealthPlan: undefined,
        company: undefined
      });
      const response = await this.post<ApiResponse<HospitalProcedureListingType>>(CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT, payload);
      return {
        status: 'success',
        data: normalizeHospitalProcedure((response.data ?? response.content ?? response) as any) as HospitalProcedureListingType
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
        instance: CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getHospitalProcedureById(id: string): Promise<{ data: HospitalProcedureListingType }> {
    try {
      const response = await this.get<{ data: HospitalProcedureListingType; meta: any }>(
        `${CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT}/${id}?includes=contractHealthPlan`
      );
      console.log('Resposta da requisiÃ§Ã£o getHospitalProcedureById:------------------------', response);

      return {
        data: normalizeHospitalProcedure(((response as any).data ?? response) as any) as HospitalProcedureListingType
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }


  handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Erro na requisiÃ§Ã£o',
        details: error.response.data?.errors || null,
        status: error.response.status
      };
    }
    return {
      message: 'Erro de conexÃ£o',
      details: null
    };
  }

  async deleteHospitalProcedure(id: string): Promise<void> {
    try {
      await this.delete(`${CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error("âŒ Erro ao deletar procedimento hospitalar:", error);
      throw error;
    }
  }


  async updateHospitalProcedure(id: string, hospitalProcedureData: HospitalProcedureInsertType): Promise<ServiceResponse<HospitalProcedureListingType>> {
    try {

      // Corpo da requisiÃ§Ã£o conforme especificado
      const rawPayload = {
        fixedAmount: hospitalProcedureData.fixedAmount,
        percentage: hospitalProcedureData.percentage,
        limitTypeDefinition: hospitalProcedureData.limitTypeDefinition,
        hospitalProcedureGroup: hospitalProcedureData.hospitalProcedureGroup,
        groupFixedAmount: hospitalProcedureData.groupFixedAmount,
        groupPercentage: hospitalProcedureData.groupPercentage,
        hospitalProcedureGroupLimit: hospitalProcedureData.hospitalProcedureGroupLimit,
        belongsToGroup: !!hospitalProcedureData.belongsToGroup,
        enabled: hospitalProcedureData.enabled
      };
      const payload = this.removeNullUndefinedAndEmptyFields(rawPayload);

      const response = await this.put<ApiResponse<HospitalProcedureListingType>>(`${CONTRACT_HOSPITAL_PROCEDURES_ENDPOINT}/${id}`, payload);
      return {
        status: 'success',
        data: normalizeHospitalProcedure((response.data ?? response.content ?? response) as any) as HospitalProcedureListingType
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: 'error',
          error: {
            ...error.response.data,
            statusCode: error.response.status
          } as ApiErrorResponse
        };
      }
      return {
        status: 'error',
        error: this.NetworkErrorResponse()
      };
    }
  }
}
