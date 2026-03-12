// stores/departmentStore.ts
import { defineStore } from 'pinia';
import { hospitalProcedureService } from "@/app/http/httpServiceProvider";
import type { HospitalProcedureListingType } from '@/components/institution/types';

export const useHospitalProcedureStore = defineStore('hospital_procedure', { 
  state: () => ({
    hospital_procedure: [] as HospitalProcedureListingType[],
    all_hospital_procedures: [] as HospitalProcedureListingType[],
    hospital_procedure_for_dropdown: [] as HospitalProcedureListingType[],
    hospital_procedure_of_plan: [] as HospitalProcedureListingType[],
    activeHealthPlan: null as any,
    pagination: { 
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 9999999, 
      totalPages: 0
    },
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchHospitalProcedures(
      id: string | null,
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;
    
      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;
    
      try {
        const { content, meta } = await hospitalProcedureService.getHospitalProcedureByInstitution(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.hospital_procedure = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Procedimentos hospitalares:', this.hospital_procedure);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar procedimentos hospitalares';
        console.error("❌ Erro ao buscar procedimentos hospitalares:", err);
        this.hospital_procedure = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },

    async fetchAllHospitalProcedures(
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;
    
      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;
    
      try {
        const { content, meta } = await hospitalProcedureService.getHospitalProcedures(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.all_hospital_procedures = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Procedimentos hospitalares:', this.all_hospital_procedures);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar procedimentos hospitalares';
        console.error("❌ Erro ao buscar procedimentos hospitalares:", err);
        this.all_hospital_procedures = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },


    async fetchHospitalProceduresForDropdown(
      id: string | null,
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;
    
      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;
    
      try {
        const { content, meta } = await hospitalProcedureService.getHospitalProcedureByInstitution(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.hospital_procedure_for_dropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Procedimentos hospitalares:', this.hospital_procedure_for_dropdown);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar procedimentos hospitalares';
        console.error("❌ Erro ao buscar procedimentos hospitalares:", err);
        this.hospital_procedure_for_dropdown = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },

    async fetchHospitalProceduresOfPlan(
      id: string | null,
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;
    
      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;
    
      try {
        const { content, meta } = await hospitalProcedureService.getHospitalProcedureByHealthPlan(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.hospital_procedure_of_plan = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Procedimentos hospitalares:', this.hospital_procedure_of_plan);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar procedimentos hospitalares';
        console.error("❌ Erro ao buscar procedimentos hospitalares:", err);
        this.hospital_procedure_of_plan = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    }

    
  }, 
});