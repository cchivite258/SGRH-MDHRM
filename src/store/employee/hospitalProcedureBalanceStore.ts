import { defineStore } from 'pinia';
import { healthPlanEmployeeService } from "@/app/http/httpServiceProvider";
import type { HealthPlanListingType, ExpensePerProcedureType } from '@/components/employee/types';

export const useHospitalProcedureBalanceStore = defineStore('hospital_procedure_balance', {
  state: () => ({
    allHealthPlans: [] as HealthPlanListingType[],
    activeHealthPlan: null as HealthPlanListingType | null,
    expensePerProcedure: [] as ExpensePerProcedureType[],
    
    // Estados separados para melhor controle
    loading: false,
    loadingPlans: false,
    loadingProcedures: false,
    
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    
    error: null as string | null,
    currentEmployeeId: null as string | null, // Para rastrear o employee atual
    isInitialized: false
  }),

  getters: {
    hasActivePlan: (state) => !!state.activeHealthPlan,
    activePlanId: (state) => state.activeHealthPlan?.id
  },

  actions: {
    /**
     * Carrega o plano ativo para um employee específico
     */
    async loadActiveHealthPlan(employeeId: string) {
      console.log('Carregando plano ativo para o funcionário ID:', employeeId);
      
      // Se já estamos carregando para este employee, não faz nada
      if (this.currentEmployeeId === employeeId && this.isInitialized) {
        console.log('Já inicializado para este employee');
        return;
      }

      this.loadingPlans = true;
      this.error = null;
      this.currentEmployeeId = employeeId;
      
      try {
        const { content } = await healthPlanEmployeeService.getHealthPlansByEmployee(
          employeeId,
          0,
          1000, // Valor razoável em vez de 100000
          'createdAt',
          'asc',
          '',
          "employee.id"
        );

        this.allHealthPlans = content;
        console.log('Todos os planos carregados:', this.allHealthPlans.length);
        
        // Encontra plano ativo
        this.activeHealthPlan = content.find(plan => plan.status === 'ACTIVE') || null;
        console.log('Plano ativo encontrado:', this.activeHealthPlan?.id);
        
        // Limpa procedimentos anteriores se mudou de employee
        this.expensePerProcedure = [];
        this.pagination.totalElements = 0;
        this.isInitialized = true;

      } catch (err: any) {
        this.error = err.message || 'Erro ao carregar plano ativo';
        this.activeHealthPlan = null;
        this.isInitialized = false;
      } finally {
        this.loadingPlans = false;
      }
    },

    /**
     * Busca procedimentos do plano ativo atual
     */
    async fetchProceduresForActivePlan(
      page = 0,
      size = 10,
      sortColumn = 'createdAt',
      direction = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      console.log('fetchProceduresForActivePlan - Plano ativo ID:', this.activeHealthPlan?.id);
      
      if (!this.activeHealthPlan?.id) {
        console.warn('Nenhum plano ativo para buscar procedimentos');
        this.expensePerProcedure = [];
        return;
      }

      this.loadingProcedures = true;
      this.error = null;

      try {
        const { content, meta } = await healthPlanEmployeeService.getHospitalProcedureBalancebyEmployee(
          this.activeHealthPlan.id,
          page,
          size,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.expensePerProcedure = content;
        console.log('Procedimentos carregados:', content.length);

        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar procedimentos';
        this.expensePerProcedure = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loadingProcedures = false;
      }
    },

    /**
     * Método combinado: carrega plano ativo E depois seus procedimentos
     */
    async loadActivePlanWithProcedures(
      employeeId: string,
      procedureParams?: {
        page?: number;
        size?: number;
        sortColumn?: string;
        direction?: string;
        query_value?: string;
        query_props?: string;
      }
    ) {
      // Primeiro carrega o plano ativo
      await this.loadActiveHealthPlan(employeeId);
      
      // Se existe plano ativo, carrega os procedimentos
      if (this.activeHealthPlan?.id) {
        const params = procedureParams || {};
        await this.fetchProceduresForActivePlan(
          params.page || 0,
          params.size || 10,
          params.sortColumn || 'createdAt',
          params.direction || 'asc',
          params.query_value,
          params.query_props || "hospitalProcedureType.name,allocatedBalance,usedBalance,remainingBalance"
        );
      }
    },

    /**
     * Busca procedimentos com paginação (para uso com DataTableServer)
     */
    async fetchProcedures(
      employeeId: string,
      { page = 0, size = 10, sortColumn = 'createdAt', direction = 'asc', query_value, query_props }: {
        page: number;
        size: number;
        sortColumn?: string;
        direction?: string;
        query_value?: string;
        query_props?: string;
      }
    ) {
      // Se o employee mudou, recarrega o plano ativo primeiro
      if (this.currentEmployeeId !== employeeId || !this.isInitialized) {
        await this.loadActiveHealthPlan(employeeId);
      }
      
      // Agora busca os procedimentos
      if (this.activeHealthPlan?.id) {
        await this.fetchProceduresForActivePlan(
          page,
          size,
          sortColumn,
          direction,
          query_value,
          query_props
        );
      } else {
        // Se não há plano ativo, limpa os procedimentos
        this.expensePerProcedure = [];
        this.pagination.totalElements = 0;
      }
    },

    /**
     * Limpa todos os dados
     */
    clearData() {
      this.allHealthPlans = [];
      this.activeHealthPlan = null;
      this.expensePerProcedure = [];
      this.pagination = {
        totalElements: 0,
        currentPage: 0,
        itemsPerPage: 10,
        totalPages: 0
      };
      this.error = null;
      this.currentEmployeeId = null;
      this.isInitialized = false;
    },

    /**
     * Limpa apenas os procedimentos (mantém o plano ativo)
     */
    clearProcedures() {
      this.expensePerProcedure = [];
      this.pagination.totalElements = 0;
    }
  },
});