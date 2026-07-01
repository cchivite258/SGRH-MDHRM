// stores/userStore.ts
import { defineStore } from 'pinia';
import { hospitalProcedureCategoryService } from "@/app/http/httpServiceProvider";
import type { HospitalProcedureCategoryInsert, HospitalProcedureCategoryListing } from "@/components/baseTables/hospitalProcedureCategory/types";

export const useHospitalProcedureCategoryStore = defineStore('hospital_procedure_categories', {
  state: () => ({
    hospital_procedure_categories: [] as HospitalProcedureCategoryListing[],
    hospital_procedure_categories_dropdown: [] as HospitalProcedureCategoryListing[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftProcedureCategory: null as HospitalProcedureCategoryInsert | null,
    currentProcedureCategoryId: null as string | null
  }),

  actions: {
    async fetchHospitalProcedureCategories(
      page?: number,
      size?: number,
      sortColumn: string = 'name',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await hospitalProcedureCategoryService.getHospitalProcedureCategories(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.hospital_procedure_categories = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('ðŸ¥ Categorias de Procedimentos Hospitalares:', this.hospital_procedure_categories);
        console.log('ðŸ“„ Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar as categorias de procedimentos hospitalares';
        this.hospital_procedure_categories = [];
        this.pagination.totalElements = 0;
        console.error("âŒ Erro ao buscar hospital_procedure_categories:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchHospitalProcedureCategoriesForDropdown(
      page?: number,
      size?: number,
      sortColumn: string = 'name',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await hospitalProcedureCategoryService.getHospitalProcedureCategoriesForList(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.hospital_procedure_categories_dropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('ðŸ¥ Categorias de Procedimentos Hospitalares:', this.hospital_procedure_categories_dropdown);
        console.log('ðŸ“„ Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar as categorias de procedimentos hospitalares';
        this.hospital_procedure_categories_dropdown = [];
        this.pagination.totalElements = 0;
        console.error("âŒ Erro ao buscar hospital_procedure_categories:", err);
      } finally {
        this.loading = false;
      }
    },

    setDraftProcedureCategory(data: HospitalProcedureCategoryInsert) {
      this.draftProcedureCategory = data;
      localStorage.setItem('draftProcedureCategory', JSON.stringify(data));
      console.log('ðŸ“‹ Draft de categoria de procedimento salvo:', this.draftProcedureCategory);
    },

    setCurrentProcedureCategoryId(id: string) {
      this.currentProcedureCategoryId = id;
      localStorage.setItem('currentProcedureCategoryId', id);
      console.log('ðŸ†” ID do categoria de procedimento atual salvo:', this.currentProcedureCategoryId);
    },

    clearDraft() {
      this.draftProcedureCategory = null;
      this.currentProcedureCategoryId = null;
      localStorage.removeItem('draftProcedureCategory');
      localStorage.removeItem('currentProcedureCategoryId');
      console.log('ðŸ§¹ Draft e ID de categoria de procedimento limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('draftProcedureCategory');
      const id = localStorage.getItem('currentProcedureCategoryId');
      if (draft) this.draftProcedureCategory = JSON.parse(draft);
      if (id) this.currentProcedureCategoryId = id;
      console.log('ðŸ“¦ Carregado do armazenamento:', this.draftProcedureCategory, this.currentProcedureCategoryId);
    }
  }
});

