import { defineStore } from 'pinia';
import { contractParticipantService } from "@/app/http/httpServiceProvider";
import type { ContractParticipantType } from '@/components/institution/types';

export const useContractParticipantStore = defineStore('contract_participants', {
  state: () => ({
    contract_participants: [] as ContractParticipantType[],
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
    async fetchContractParticipants(
      contractId: string | null,
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
        const response = await contractParticipantService.getParticipantsByContract(
          contractId || "",
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        if (response.status === 'error') {
          throw response.error;
        }

        const content = response.data?.content || [];
        const meta = response.data?.meta || {
          totalElements: content.length,
          page: actualPage,
          size: actualSize,
          totalPages: Math.ceil(content.length / actualSize)
        };

        this.contract_participants = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
      } catch (err: any) {
        this.error = err?.message || 'Erro ao buscar responsáveis';
        this.contract_participants = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    }
  }
});
