// stores/userStore.ts
import { defineStore } from 'pinia';
import { MAX_PAGE_SIZE } from "@/app/const";
import { hospitalProcedureTypeService } from "@/app/http/httpServiceProvider";
import type { HospitalProcedureTypeInsert, HospitalProcedureTypeListing, HospitalProcedureTypeUpdate } from "@/components/baseTables/hospitalProcedureType/types";

export const useHospitalProcedureTypeStore = defineStore('hospital_procedure_types', {
  state: () => ({
    hospital_procedure_types: [] as HospitalProcedureTypeListing[],
    hospital_procedure_types_dropdown: [] as HospitalProcedureTypeListing[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftProcedureType: null as HospitalProcedureTypeInsert | null,
    currentProcedureTypeId: null as string | null
  }),

  actions: {
    async fetchHospitalProcedureTypes(
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
        const { content, meta } = await hospitalProcedureTypeService.getHospitalProcedureTypes(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.hospital_procedure_types = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🏥 Tipos de Procedimentos Hospitalares:', this.hospital_procedure_types);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar os tipos de procedimentos hospitalares';
        this.hospital_procedure_types = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar hospital_procedure_types:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchHospitalProcedureTypesForDropdown(
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
      const actualSize = size ?? MAX_PAGE_SIZE;

      try {
        const { content, meta } = await hospitalProcedureTypeService.getHospitalProcedureTypesForList(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.hospital_procedure_types_dropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🏥 Tipos de Procedimentos Hospitalares:', this.hospital_procedure_types_dropdown);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar os tipos de procedimentos hospitalares';
        this.hospital_procedure_types_dropdown = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar hospital_procedure_types:", err);
      } finally {
        this.loading = false;
      }
    },

    setDraftProcedureType(data: HospitalProcedureTypeInsert) {
      this.draftProcedureType = data;
      localStorage.setItem('draftProcedureType', JSON.stringify(data));
      console.log('📋 Draft de tipo de procedimento salvo:', this.draftProcedureType);
    },

    setCurrentProcedureTypeId(id: string) {
      this.currentProcedureTypeId = id;
      localStorage.setItem('currentProcedureTypeId', id);
      console.log('🆔 ID do tipo de procedimento atual salvo:', this.currentProcedureTypeId);
    },

    clearDraft() {
      this.draftProcedureType = null;
      this.currentProcedureTypeId = null;
      localStorage.removeItem('draftProcedureType');
      localStorage.removeItem('currentProcedureTypeId');
      console.log('🧹 Draft e ID de tipo de procedimento limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('draftProcedureType');
      const id = localStorage.getItem('currentProcedureTypeId');
      if (draft) this.draftProcedureType = JSON.parse(draft);
      if (id) this.currentProcedureTypeId = id;
      console.log('📦 Carregado do armazenamento:', this.draftProcedureType, this.currentProcedureTypeId);
    }
  }
});