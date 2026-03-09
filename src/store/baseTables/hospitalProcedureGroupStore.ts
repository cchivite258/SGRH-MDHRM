// stores/userStore.ts
import { defineStore } from 'pinia';
import { hospitalProcedureGroupService } from "@/app/http/httpServiceProvider";
import type { HospitalProcedureGroupInsert, HospitalProcedureGroupListing, HospitalProcedureGroupUpdate } from "@/components/baseTables/hospitalProcedureGroup/types";

export const useHospitalProcedureGroupStore = defineStore('hospital_procedure_groups', {
  state: () => ({
    hospital_procedure_groups: [] as HospitalProcedureGroupListing[],
    hospital_procedure_groups_dropdown: [] as HospitalProcedureGroupListing[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftProcedureGroup: null as HospitalProcedureGroupInsert | null,
    currentProcedureGroupId: null as string | null
  }),

  actions: {
    async fetchHospitalProcedureGroups(
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
        const { content, meta } = await hospitalProcedureGroupService.getHospitalProcedureGroups(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.hospital_procedure_groups = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🏥 Tipos de Procedimentos Hospitalares:', this.hospital_procedure_groups);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar os tipos de procedimentos hospitalares';
        this.hospital_procedure_groups = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar hospital_procedure_groups:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchHospitalProcedureGroupsForDropdown(
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
        const { content, meta } = await hospitalProcedureGroupService.getHospitalProcedureGroupsForList(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.hospital_procedure_groups_dropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🏥 Tipos de Procedimentos Hospitalares:', this.hospital_procedure_groups_dropdown);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar os tipos de procedimentos hospitalares';
        this.hospital_procedure_groups_dropdown = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar hospital_procedure_groups:", err);
      } finally {
        this.loading = false;
      }
    },

    setDraftProcedureGroup(data: HospitalProcedureGroupInsert) {
      this.draftProcedureGroup = data;
      localStorage.setItem('draftProcedureGroup', JSON.stringify(data));
      console.log('📋 Draft de tipo de procedimento salvo:', this.draftProcedureGroup);
    },

    setCurrentProcedureGroupId(id: string) {
      this.currentProcedureGroupId = id;
      localStorage.setItem('currentProcedureGroupId', id);
      console.log('🆔 ID do tipo de procedimento atual salvo:', this.currentProcedureGroupId);
    },

    clearDraft() {
      this.draftProcedureGroup = null;
      this.currentProcedureGroupId = null;
      localStorage.removeItem('draftProcedureGroup');
      localStorage.removeItem('currentProcedureGroupId');
      console.log('🧹 Draft e ID de tipo de procedimento limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('draftProcedureGroup');
      const id = localStorage.getItem('currentProcedureGroupId');
      if (draft) this.draftProcedureGroup = JSON.parse(draft);
      if (id) this.currentProcedureGroupId = id;
      console.log('📦 Carregado do armazenamento:', this.draftProcedureGroup, this.currentProcedureGroupId);
    }
  }
});
