// stores/userStore.ts
import { defineStore } from 'pinia';
import { leaveReasonService } from "@/app/http/httpServiceProvider";
import type { LeaveReasonUpdate, LeaveReasonListing, LeaveReasonInsert } from "@/components/baseTables/leaveReason/types";

export const useLeaveReasonStore = defineStore('leave_reason', {
  state: () => ({
    leave_reason: [] as LeaveReasonListing[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftLeaveReason: null as LeaveReasonInsert | null,
    currentLeaveReasonId: null as string | null
  }),

  actions: {
    async fetchLeaveReasons(
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
        const { content, meta } = await leaveReasonService.getLeaveReasons(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.leave_reason = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('📝 Motivos de Ausência:', this.leave_reason);
        console.log('📊 Paginação:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar motivos de ausência';
        this.leave_reason = [];
        this.pagination.totalElements = 0;
        console.error('❌ Erro ao buscar motivos de ausência:', err);
      } finally {
        this.loading = false;
      }
    },

    setDraftLeaveReason(data: LeaveReasonInsert) {
      this.draftLeaveReason = data;
      localStorage.setItem('draftLeaveReason', JSON.stringify(data));
      console.log('📋 Draft de motivo de ausência salvo:', this.draftLeaveReason);
    },

    setCurrentLeaveReasonId(id: string) {
      this.currentLeaveReasonId = id;
      localStorage.setItem('currentLeaveReasonId', id);
      console.log('🆔 ID do motivo de ausência atual salvo:', this.currentLeaveReasonId);
    },

    clearDraft() {
      this.draftLeaveReason = null;
      this.currentLeaveReasonId = null;
      localStorage.removeItem('draftLeaveReason');
      localStorage.removeItem('currentLeaveReasonId');
      console.log('🧹 Draft e ID de motivo de ausência limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('draftLeaveReason');
      const id = localStorage.getItem('currentLeaveReasonId');
      if (draft) this.draftLeaveReason = JSON.parse(draft);
      if (id) this.currentLeaveReasonId = id;
      console.log('📦 Dados recuperados do armazenamento:', this.draftLeaveReason, this.currentLeaveReasonId);
    }
  }
});

