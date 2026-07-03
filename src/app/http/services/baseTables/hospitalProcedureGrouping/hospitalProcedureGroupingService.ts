import HttpService from "@/app/http/httpService";
import type {
  HospitalProcedureGroupingByCategoryInsert,
  HospitalProcedureGroupingInsert,
  HospitalProcedureGroupingListing
} from "@/components/baseTables/hospitalProcedureGrouping/types";

interface ApiResponse<T> {
  data?: T | { content?: T; meta?: any; metadata?: any };
  content?: T;
  meta?: any;
  metadata?: any;
}

const getContent = <T>(response: ApiResponse<T[]>): T[] => {
  const rawContent = response.content ?? response.data;

  if (Array.isArray(rawContent)) return rawContent;
  if (rawContent && typeof rawContent === "object" && "content" in rawContent) {
    return rawContent.content ?? [];
  }

  return [];
};

const getMeta = (response: ApiResponse<any>): any => {
  if (response.metadata || response.meta) return response.metadata ?? response.meta;
  if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
    return (response.data as { metadata?: any; meta?: any }).metadata ?? (response.data as { meta?: any }).meta ?? {};
  }

  return {};
};

export default class HospitalProcedureGroupingService extends HttpService {
  async getHospitalProcedureGroupings(
    query_value?: string | number,
    query_props?: string,
    includes?: string,
    page: number = 0,
    size: number = 10000000
  ): Promise<{ content: HospitalProcedureGroupingListing[]; meta: any }> {
    try {
      const queryParams: string[] = [
        `page=${page}`,
        `size=${size}`
      ];

      if (query_value !== undefined && query_value !== null && query_value !== "" && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(String(query_value))}`);
      }

      if (includes) {
        queryParams.push(`includes=${encodeURIComponent(includes)}`);
      }

      const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
      const response = await this.get<ApiResponse<HospitalProcedureGroupingListing[]>>(
        `/administration/setup/hospital-procedure-grouping${queryString}`
      );
      return {
        content: getContent(response),
        meta: getMeta(response)
      };
    } catch (error) {
      console.error("Erro ao buscar hospital-procedure-grouping:", error);
      throw error;
    }
  }

  async getHospitalProcedureGroupingById(id: string | number): Promise<HospitalProcedureGroupingListing> {
    try {
      return await this.get<HospitalProcedureGroupingListing>(`/administration/setup/hospital-procedure-grouping/${id}`);
    } catch (error) {
      console.error("Erro ao buscar hospital-procedure-grouping por id:", error);
      throw error;
    }
  }

  async createHospitalProcedureGrouping(data: HospitalProcedureGroupingInsert): Promise<void> {
    try {
      await this.post("/administration/setup/hospital-procedure-grouping", data);
    } catch (error) {
      console.error("Erro ao criar hospital-procedure-grouping:", error);
      throw error;
    }
  }

  async createHospitalProcedureGroupingByCategory(data: HospitalProcedureGroupingByCategoryInsert): Promise<void> {
    try {
      await this.post("/administration/setup/hospital-procedure-grouping/by-category", data);
    } catch (error) {
      console.error("Erro ao criar hospital-procedure-grouping por categoria:", error);
      throw error;
    }
  }

  async deleteHospitalProcedureGrouping(id: string | number): Promise<void> {
    try {
      await this.delete(`/administration/setup/hospital-procedure-grouping/${id}`);
    } catch (error) {
      console.error("Erro ao deletar hospital-procedure-grouping:", error);
      throw error;
    }
  }
}
