<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { HealthPlanListingType, UsagesListingType } from "@/components/employee/types";
import TableActionView from "@/app/common/components/TableActionView.vue";
import CreateEditHospitalProcedureDialog from "@/components/institution/create/editHealthPlan/CreateEditHospitalProcedureDialog.vue";
import ViewHospitalProcedureDialog from "@/components/institution/create/editHealthPlan/ViewHospitalProcedureDialog.vue";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import { useHealthPlanEmployeeStore } from "@/store/employee/healthPlanStore";
import { healthPlanEmployeeService, hospitalProcedureService } from "@/app/http/httpServiceProvider";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import { useCoveragePeriodStore } from '@/store/institution/coveragePeriodStore';
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { formatCurrency } from '@/app/common/currencyFormat';

// Utils
import { usagesHeader } from "@/components/employee/create/utils";

// Store para periodos de cobertura
const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const healthPlanStore = useHealthPlanEmployeeStore();
const coveragePeriodStore = useCoveragePeriodStore();


let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const formulario = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

// Estado do componente
const healthPlanId = computed(() => {
    const id = route.params.id;
    return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
});


// Estado para posições
const viewDialog = ref(false);
const hospitalProcedureFormData = ref<UsagesListingType | null>(null);
const selectedHospitalProcedures = ref<UsagesListingType[]>([]);
const itemsPerPage = ref(10);
const searchQuery = ref("");
const searchProps = "fixedAmount,percentage,limitTypeDefinition";
const loading = ref(false);

// Computed properties
const loadingList = computed(() => healthPlanStore.loading);
const totalItems = computed(() => healthPlanStore.pagination.totalElements);

// Formulário do plano de saúde
const healthPlanFormData = ref<HealthPlanListingType>({
    id: healthPlanId.value || undefined,
    allocatedBalance: 0,
    usedBalance: 0,
    remainingBalance: 0,
    employeeId: undefined,
    companyHealthPlanId: "",
    companyHealthPlan: undefined,
    employee: undefined
});



// Buscar dados iniciais
onMounted(async () => {
    if (healthPlanId.value) {
        try {
            // Carrega dados do plano de saúde
            const healthplanResponse = await healthPlanEmployeeService.getHealthPlanbyId(healthPlanId.value);
            console.log("Health Plan Response:", healthplanResponse.content);
            const healthPlan = healthplanResponse.content;

            if (healthPlan) {


                healthPlanFormData.value = {
                    id: healthPlanId.value,
                    allocatedBalance: healthPlan.allocatedBalance,
                    usedBalance: healthPlan.usedBalance,
                    remainingBalance: healthPlan.remainingBalance,
                    employeeId: healthPlan.employeeId,
                    usages: healthPlan.usages || []
                };

            }

        } catch (e) {
            toast.error(t('t-message-load-error'));
            console.error("Erro ao carregar dados dos procedimentos hospitalares:", e);
        }
    }
});


interface FetchParams {
    page: number;
    itemsPerPage: number;
    sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
    search: string;
}
/*
const fetchHospitalProceduresOfPlan = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!healthPlanId.value) return;

  await healthPlanStore.fetchHospitalProceduresOfPlan(
    healthPlanId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );
};
*/

const toggleSelection = (item: UsagesListingType) => {
    const index = selectedHospitalProcedures.value.findIndex(selected => selected.id === item.id);
    if (index === -1) {
        selectedHospitalProcedures.value = [...selectedHospitalProcedures.value, item];
    } else {
        selectedHospitalProcedures.value = selectedHospitalProcedures.value.filter(selected => selected.id !== item.id);
    }
};


// Visualização de posição
const onViewClick = (data: UsagesListingType) => {
    hospitalProcedureFormData.value = { ...data };
    viewDialog.value = true;
};



// Voltar para lista de departamentos
// Adicione no início do seu script setup (junto com os outros imports)
const emit = defineEmits(['onStepChangeforDialog']);

// Depois modifique a função onBack para:
const onBack = () => {
    // Obtém o ID do funcionário do departamento atual
    const employeeId = healthPlanFormData.value.employeeId;
    console.log("employeeId:", employeeId);

    if (employeeId) {
        // Navega para a rota de edição da instituição e força a tab 3
        router.push({
            path: `/employee/view/${employeeId}`,
            query: { tab: 4 } // Adiciona o query param para a tab
        });
    } else {
        // Fallback caso não tenha employeeId
        router.push(`/employee/list/`);
    }
};


/**
 * Submete dados do formulário
 */
interface ServiceResponse<T> {
    status: 'success' | 'error';
    data?: T;
    error?: ApiErrorResponse;
}


</script>

<template>
    <Card title="">
        <v-form ref="formulario">
            <v-card-text>
                <v-card>
                    <v-card-text>
                        <v-row class="mt-n6">
                            <v-col cols="12" lg="4">
                                <div class="font-weight-bold mb-1">
                                    {{ $t('t-allocated-balance') }} 
                                </div>
                                <div>{{ formatCurrency(healthPlanFormData.allocatedBalance) }}</div>
                            </v-col>
                            <v-col cols="12" lg="4">
                                <div class="font-weight-bold mb-2">
                                    {{ $t('t-used-balance') }}
                                </div>
                                <div>{{ formatCurrency(healthPlanFormData.usedBalance) }}</div>
                            </v-col>
                            <v-col cols="12" lg="4">
                                <div class="font-weight-bold mb-2">
                                    {{ $t('t-remaining-balance') }} 
                                </div>
                                <div>{{ formatCurrency(healthPlanFormData.remainingBalance) }}</div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-card-text>
        </v-form>

        <v-card-text>
            <Card :title="$t('t-usages-list')" title-class="pt-0">
            </Card>
            <v-row class="mt-n3">
                <v-col cols="12" lg="12">
                    <v-card class="mt-5">
                        <v-card-text>
                            <!--<v-card-text>
                                <v-row>
                                    <v-col cols="12" lg="12">
                                        <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-usages')" />
                                    </v-col>
                                </v-row>
                            </v-card-text>-->
                            <DataTableServer v-model="selectedHospitalProcedures"
                                :headers="usagesHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
                                :items="healthPlanFormData.usages || []" :items-per-page="itemsPerPage"
                                :total-items="healthPlanFormData.usages?.length || 0" :loading="loadingList"
                                :search-query="searchQuery" :search-props="searchProps" item-value="id" show-select>
                                <template #body="{ items }">
                                    <tr v-for="item in items as UsagesListingType[]" :key="item.id" height="50">
                                        <td>
                                            <v-checkbox
                                                :model-value="selectedHospitalProcedures.some(selected => selected.id === item.id)"
                                                @update:model-value="toggleSelection(item)" hide-details
                                                density="compact" />
                                        </td>
                                        <td>{{ formatCurrency(item.billedAmount) }}</td>
                                        <td>{{ formatCurrency(item.memberPaidAmount) }}</td>
                                        <td>{{ formatCurrency(item.amountCovered) }}</td>
                                    </tr>
                                </template>

                                <template v-if="!healthPlanFormData.usages || healthPlanFormData.usages.length === 0"
                                    #body>
                                    <tr>
                                        <td :colspan="usagesHeader.length" class="text-center py-10">
                                            <v-avatar size="80" color="primary" variant="tonal">
                                                <i class="ph-magnifying-glass" style="font-size: 30px" />
                                            </v-avatar>
                                            <div class="text-subtitle-1 font-weight-bold mt-3">
                                                {{ $t('t-search-not-found-message') }}
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </DataTableServer>

                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-card-actions class="d-flex justify-space-between mt-10">
                <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack">
                    {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
                </v-btn>
            </v-card-actions>
        </v-card-text>
    </Card>



</template>