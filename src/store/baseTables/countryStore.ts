// stores/userStore.ts
import { defineStore } from 'pinia';
import { countryService } from "@/app/http/httpServiceProvider";
import type { CountryListingType, CountryInsertType } from '@/components/baseTables/country/types';
import type { ProvinceListingType } from "@/components/baseTables/country/types";


export const useCountryStore = defineStore('countries', {
  state: () => ({
    countries: [] as CountryListingType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftCountry: null as CountryInsertType | null,
    currentCountryId: null as string | null
  }),

  actions: {
    async fetchCountries(
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
        const { content, meta } = await countryService.getCountries(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.countries = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🌍 Países:', this.countries);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar países';
        this.countries = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar países:", err);
      } finally {
        this.loading = false;
      }
    },

    setDraftCountry(data: CountryInsertType) {
      this.draftCountry = data;
      localStorage.setItem('countryDraft', JSON.stringify(data));
      console.log('🌍 Draft de país salvo:', this.draftCountry);
    },

    setCurrentCountryId(id: string) {
      this.currentCountryId = id;
      localStorage.setItem('currentCountryId', id);
      console.log('🌍 ID do país atual salvo:', this.currentCountryId);
    },

    clearDraft() {
      this.draftCountry = null;
      this.currentCountryId = null;
      localStorage.removeItem('countryDraft');
      localStorage.removeItem('currentCountryId');
      console.log('🌍 Draft de país e ID atual limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('countryDraft');
      const id = localStorage.getItem('currentCountryId');
      if (draft) this.draftCountry = JSON.parse(draft);
      if (id) this.currentCountryId = id;
      console.log('🌍 Carregando draft de país e ID atual do armazenamento:', this.draftCountry, this.currentCountryId);
    }
  }
});

export const useCountryStoreID = defineStore('country_id', {
  state: () => ({
    country_id: null as CountryListingType | null,
    error: null as string | null,
  }),
  actions: {
    async fetchCountryByID(id: string): Promise<CountryListingType | null> {
      this.error = null;

      try {
        const response = await countryService.getCountryByID(id);
        this.country_id = response.data;
        return response.data;
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar país por ID';
        console.error("❌ Erro ao buscar país por ID:", err);
        return null;
      }
    },
  },
});


export const useProvinceStore = defineStore('provinces', {
  state: () => ({
    provincesbyCountry: [] as ProvinceListingType[], 
    provinces: [] as ProvinceListingType[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchProvinces() {
      this.loading = true;
      this.error = null;

      try {
        const response = await countryService.getProvinces();
        this.provinces = response.content;
        console.log('response provinces', response);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar províncias';
        console.error("❌ Erro ao buscar províncias:", err);
      } finally {
        this.loading = false;
      }
    },
    clearProvinces() {
      this.provincesbyCountry = [];
    },
    
    async fetchProvincesbyCountry(countryId: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await countryService.getProvincesByCountryID(countryId);
        //console.log('response store provinces by country data--------------', data);
        // Garante que a resposta seja tratada como array
        this.provincesbyCountry = data?.content || [];
    //console.log('response store provinces by country------------------', this.provincesbyCountry);
      } catch (error) {
        this.error = 'Failed to load provinces';
        this.provincesbyCountry = []; // Garante que seja array mesmo em caso de erro
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
  },
});


export const useProvinceByCountryStoreID = defineStore('province_by_country', {
  state: () => ({
    province_by_country: [] as ProvinceListingType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchProvincesByCountryID(
      countryId: string,
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
        const { content, meta } = await countryService.getProvincesByCountryID(
          countryId,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.province_by_country = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🏞️ Províncias por país:', this.province_by_country);
        console.log('📄 Paginação:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar províncias';
        this.province_by_country = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar províncias:", err);
      } finally {
        this.loading = false;
      }
    }
  }
});
