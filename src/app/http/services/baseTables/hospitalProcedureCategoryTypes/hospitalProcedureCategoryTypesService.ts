import axios from "@/app/http/axios";
import HttpService from "@/app/http/httpService";
import type {
  HospitalProcedureCategoryTypesBulkDelete,
  HospitalProcedureCategoryTypesInsert,
  HospitalProcedureCategoryTypesListing
} from "@/components/baseTables/hospitalProcedureCategoryTypes/types";

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

export default class HospitalProcedureCategoryTypesService extends HttpService {
  async getHospitalProcedureCategoryTypesByCategory(
    categoryId: string | number
  ): Promise<{ content: HospitalProcedureCategoryTypesListing[]; meta: any }> {
    try {
      const response = await this.get<ApiResponse<HospitalProcedureCategoryTypesListing[]>>(
        `/administration/setup/hospital-procedure-category-types/by-category/${categoryId}`
      );

      return {
        content: response.data || [],
        meta: response.meta || {}
      };
    } catch (error) {
      console.error("Erro ao buscar hospital-procedure-category-types por categoria:", error);
      throw this.handleError(error);
    }
  }

  async createHospitalProcedureCategoryTypes(data: HospitalProcedureCategoryTypesInsert): Promise<void> {
    try {
      await this.post("/administration/setup/hospital-procedure-category-types", data);
    } catch (error) {
      console.error("Erro ao criar hospital-procedure-category-types:", error);
      throw this.handleError(error);
    }
  }

  async bulkDeleteHospitalProcedureCategoryTypes(data: HospitalProcedureCategoryTypesBulkDelete): Promise<void> {
    try {
      await axios.delete("/administration/setup/hospital-procedure-category-types/bulk-delete", {
        data
      });
    } catch (error) {
      console.error("Erro ao eliminar hospital-procedure-category-types em lote:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || "Erro na requisicao",
        error: error.response.data?.error || null,
        status: error.response.status
      };
    }

    return {
      message: "Erro de conexao",
      error: null,
      status: 503
    };
  }
}
