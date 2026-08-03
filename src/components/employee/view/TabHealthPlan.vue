<script lang="ts" setup>
import { computed, onBeforeUnmount, PropType, ref, watch } from "vue";
import { useRouter } from "vue-router";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import TableActionView from "@/app/common/components/TableActionView.vue";
import { formatCurrency } from "@/app/common/currencyFormat";
import { formateDate } from "@/app/common/dateFormate";
import { healthPlanHeader } from "@/components/employee/list/utils";
import type { HealthPlanListingType } from "@/components/employee/types";
import { useHealthPlanEmployeeStore } from "@/store/employee/healthPlanStore";

const router = useRouter();
const healthPlanStore = useHealthPlanEmployeeStore();

const props = defineProps({
  employeeId: {
    type: String as PropType<string | null>,
    default: null
  },
  previousStep: {
    type: Number as PropType<number | null>,
    default: null
  },
  nextStep: {
    type: Number as PropType<number | null>,
    default: null
  }
});

const dialog = ref(false);
const healthPlanData = ref<HealthPlanListingType | null>(null);
const searchQuery = ref("");
const searchProps = "employee.id,allocatedBalance,usedBalance,remainingBalance,status,startDate,endDate,closingDate";
const itemsPerPage = ref(10);
const selectedhealthPlanData = ref<HealthPlanListingType[]>([]);

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const loadingList = computed(() => healthPlanStore.loading);
const totalItems = computed(() => healthPlanStore.pagination.totalElements);

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
  search: string;
}

const fetchHealthPlanEmployee = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!props.employeeId) return;

  await healthPlanStore.fetchHealthPlanEmployee(
    props.employeeId,
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "createdAt",
    sortBy[0]?.order || "asc",
    search,
    searchProps,
    false
  );
};

const toggleSelection = (item: HealthPlanListingType) => {
  const index = selectedhealthPlanData.value.findIndex((selected) => selected.id === item.id);
  if (index === -1) {
    selectedhealthPlanData.value = [...selectedhealthPlanData.value, item];
    return;
  }

  selectedhealthPlanData.value = selectedhealthPlanData.value.filter((selected) => selected.id !== item.id);
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    healthPlanData.value = null;
  }
});

const onViewClick = (data: HealthPlanListingType) => {
  router.push({
    path: `/employee/healthPlan/view/${data.id}`,
    query: { employeeId: props.employeeId || undefined, tab: "5" }
  });
};

onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});
</script>

<template>
  <Card :title="$t('t-health-plan-list')" title-class="py-5">
    <template #title-action>
      <div />
    </template>
  </Card>

  <v-row class="mt-5">
    <v-col cols="12" lg="12">
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="12">
            <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-health-plan')" />
          </v-col>
        </v-row>
      </v-card-text>

      <DataTableServer
        v-model="selectedhealthPlanData"
        :headers="healthPlanHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="healthPlanStore.healthPlans"
        :items-per-page="itemsPerPage"
        :total-items="totalItems"
        :loading="loadingList"
        :search-query="searchQuery"
        :search-props="searchProps"
        @load-items="fetchHealthPlanEmployee"
        item-value="id"
        :show-select="false"
      >
        <template #body="{ items }">
          <tr v-for="item in items as HealthPlanListingType[]" :key="item.id" height="50">
            <td>{{ formatCurrency(item.allocatedBalance) }}</td>
            <td>{{ formatCurrency(item.usedBalance) }}</td>
            <td>{{ formatCurrency(item.remainingBalance) }}</td>
            <td>{{ formateDate(item.startDate) }}</td>
            <td>{{ formateDate(item.endDate) }}</td>
            <td>
              <TableActionView @onView="onViewClick(item)" />
            </td>
          </tr>
        </template>

        <template v-if="healthPlanStore.healthPlans.length === 0" #body>
          <tr>
            <td :colspan="healthPlanHeader.length" class="text-center py-10">
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
    </v-col>
  </v-row>

  <v-card-actions v-if="previousStep || nextStep" class="d-flex justify-space-between mt-5">
    <v-btn v-if="previousStep" color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', previousStep)">
      <i class="ph-arrow-left me-2" /> {{ $t('t-back') }}
    </v-btn>
    <v-btn v-if="nextStep" color="secondary" variant="elevated" class="me-2" @click="$emit('onStepChange', nextStep)">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>
  </v-card-actions>
</template>
