import { defineStore } from 'pinia';
import { clinicService } from "@/app/http/httpServiceProvider";
import type { ClinicListingType, ClinicInsertType, ClinicListingForListType } from '@/components/clinics/types';

export const useClinicStore = defineStore('clinics', {
  state: () => ({
    clinics: [] as ClinicListingType[],
    clinics_list: [] as ClinicListingForListType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftClinic: null as ClinicInsertType | null,
    currentClinicId: null as string | null
  }),

  actions: {
    async fetchClinics(
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_props?: string,
      query_value?: string
      
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      console.log('🔍 Parâmetros da requisição de clínicas:', {
        page: actualPage,
        size: actualSize,
        sortColumn,
        direction,
        query_value,
        query_props
      })

      try {
        const { content, meta } = await clinicService.getClinics(
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
        console.log('Clínicas:', this.clinics);
        console.log('Meta:', this.pagination);

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar clínicas';
        console.error("❌ Erro ao buscar clínicas:", err);
        this.clinics = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchClinicsForDropdown(
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_props?: string,
      query_value?: string
      
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      console.log('🔍 Parâmetros da requisição de clínicas:', {
        page: actualPage,
        size: actualSize,
        sortColumn,
        direction,
        query_value,
        query_props
      })

      try {
        const { content, meta } = await clinicService.getClinicsForDropdown(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.clinics_list = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Clínicas:', this.clinics_list);
        console.log('Meta:', this.pagination);

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar clínicas';
        console.error("❌ Erro ao buscar clínicas:", err);
        this.clinics_list = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },

    setDraftClinic(data: ClinicInsertType) {
      this.draftClinic = data;
      localStorage.setItem('clinicDraft', JSON.stringify(data));
    },

    setCurrentClinicId(id: string) {
      this.currentClinicId = id;
      localStorage.setItem('currentClinicId', id);
    },

    clearDraft() {
      this.draftClinic = null;
      this.currentClinicId = null;
      localStorage.removeItem('clinicDraft');
      localStorage.removeItem('currentClinicId');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('clinicDraft');
      const id = localStorage.getItem('currentClinicId');
      if (draft) this.draftClinic = JSON.parse(draft);
      if (id) this.currentClinicId = id;
    }
  },
   getters: {
    enabledClinics: (state) => {
      return state.clinics_list.filter(item => item.enabled === true) 
    }
  }
  
});
