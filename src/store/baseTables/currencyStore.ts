// stores/userStore.ts
import { defineStore } from 'pinia';
import { currencyService } from "@/app/http/httpServiceProvider";
import type { CurrencyInsertType, CurrencyListingType, CurrencyUpdateType } from "@/components/baseTables/currency/types";
import { cu } from '@/assets/images/flags/utils';


export const useCurrencyStore = defineStore('currencies', {
  state: () => ({
    currencies: [] as CurrencyListingType[],
    currenciesForDropdown: [] as CurrencyListingType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftCurrency: null as CurrencyInsertType | null,
    currentCurrencyId: null as string | null
  }),

  actions: {
    async fetchCurrencies(
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
        const { content, meta } = await currencyService.getCurrencies(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.currencies = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🌍 Países:', this.currencies);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar currencies';
        this.currencies = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar currencies:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrenciesForDropdown(
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
        const { content, meta } = await currencyService.getCurrenciesForDropdown(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.currenciesForDropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🌍 Países:', this.currenciesForDropdown);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar currencies';
        this.currenciesForDropdown = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar currencies:", err);
      } finally {
        this.loading = false;
      }
    },

    setDraftCurrency(data: CurrencyInsertType) {
      this.draftCurrency = data;
      localStorage.setItem('countryDraft', JSON.stringify(data));
      console.log('🌍 Draft de país salvo:', this.draftCurrency);
    },

    setCurrentCountryId(id: string) {
      this.currentCurrencyId = id;
      localStorage.setItem('currentCurrencyId', id);
      console.log('🌍 ID do Currency atual salvo:', this.currentCurrencyId);
    },

    clearDraft() {
      this.draftCurrency = null;
      this.currentCurrencyId = null;
      localStorage.removeItem('draftCurrency');
      localStorage.removeItem('currentCurrencyId');
      console.log('🌍 Draft de Currency e ID atual limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('draftCurrency');
      const id = localStorage.getItem('currentCurrencyId');
      if (draft) this.draftCurrency = JSON.parse(draft);
      if (id) this.currentCurrencyId = id;
      console.log('🌍 Carregando draft de Currency e ID atual do armazenamento:', this.draftCurrency, this.currentCurrencyId);
    }
  },
    getters: {
    enabledCurrencies: (state) => {
      return state.currenciesForDropdown.filter(item => item.enabled === true) 
    }
  }

});