import { defineStore } from "pinia";
import { companyDetailsService } from "@/app/http/httpServiceProvider";
import type {
  EntityInsertType,
  EntityListingType
} from "@/components/entities/types";

export const useCompanyDetailsStore = defineStore("companyDetails", {
  state: () => ({
    entities: [] as EntityListingType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    globalSearch: "",
    advancedFilters: [] as {
      prop: string;
      operator: string;
      value: string | boolean | Date;
    }[],
    logicalOperator: "AND" as "AND" | "OR",
    draftEntity: null as EntityInsertType | null,
    currentEntityId: null as string | null
  }),

  actions: {
    async fetchCompanyDetails(
      page?: number,
      size?: number,
      sortColumn: string = "createdAt",
      direction: string = "asc"
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await companyDetailsService.getCompanyDetails(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          this.globalSearch,
          this.advancedFilters,
          this.logicalOperator
        );

        this.entities = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
      } catch (err: any) {
        this.error = err.message || "Erro ao buscar entidades";
        this.entities = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    setGlobalSearch(search: string) {
      this.globalSearch = search;
    },
    setAdvancedFilters(
      filters: {
        prop: string;
        operator: string;
        value: string | boolean | Date;
      }[]
    ) {
      this.advancedFilters = filters;
    },
    setLogicalOperator(operator: "AND" | "OR") {
      this.logicalOperator = operator;
    },
    clearFilters() {
      this.globalSearch = "";
      this.advancedFilters = [];
      this.logicalOperator = "AND";
    },
    setDraftEntity(data: EntityInsertType) {
      this.draftEntity = data;
      localStorage.setItem("entityDraft", JSON.stringify(data));
    },
    setCurrentEntityId(id: string) {
      this.currentEntityId = id;
      localStorage.setItem("currentEntityId", id);
    },
    clearDraft() {
      this.draftEntity = null;
      this.currentEntityId = null;
      localStorage.removeItem("entityDraft");
      localStorage.removeItem("currentEntityId");
    },
    loadFromStorage() {
      const draft = localStorage.getItem("entityDraft");
      const id = localStorage.getItem("currentEntityId");
      if (draft) this.draftEntity = JSON.parse(draft);
      if (id) this.currentEntityId = id;
    }
  }
});
