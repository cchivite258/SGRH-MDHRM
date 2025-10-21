// stores/clinicStore.ts
import { defineStore } from 'pinia';
import { clinicInstitutionService } from "@/app/http/httpServiceProvider";
import type { ClinicListingType } from '@/components/institution/types';

export const useClinicInstitutionStore = defineStore('clinics_institution', { 
  state: () => ({
    clinics: [] as ClinicListingType[],
    clinicsForDropdown: [] as ClinicListingType[],
    pagination: { 
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10000000, 
      totalPages: 0
    },
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchInstitutionClinics(
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
      
      console.log('🔍 Parâmetros da requisição de clínicas por instituição:', {
        id,
        page: actualPage,
        size: actualSize,
        sortColumn,
        direction,
        query_value,
        query_props
      });
    
      try {
        const { content, meta } = await clinicInstitutionService.getClinicByInstitution( 
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.clinics = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Clinicas:', this.clinics);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar clinicas';
        console.error("❌ Erro ao buscar clinicas:", err);
        this.clinics = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchInstitutionClinicsForDropdown(
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
      
      console.log('🔍 Parâmetros da requisição de clínicas por instituição:', {
        id,
        page: actualPage,
        size: actualSize,
        sortColumn,
        direction,
        query_value,
        query_props
      });
    
      try {
        const { content, meta } = await clinicInstitutionService.getClinicByInstitutionForDropdown( 
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.clinicsForDropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Clinicas:', this.clinicsForDropdown);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar clinicas';
        console.error("❌ Erro ao buscar clinicas:", err);
        this.clinicsForDropdown = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
     clearClinics() {
      this.clinicsForDropdown = [];
    }
    
  }
});