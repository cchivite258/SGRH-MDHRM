<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { BudgetInsertType, TransactionType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import Status from "@/app/common/components/Status.vue";
import Table from "@/app/common/components/Table.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { formateDate } from "@/app/common/dateFormate";
import { amountFormate } from "@/app/common/amountFormate";
import { transactionHeaders } from "@/components/institution/create/utils";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<BudgetInsertType | null>,
    required: false,
    default: () => ({
      id: undefined,
      name: "",
      budgetAmount: 0,
      coveragePeriod: undefined,
      enabled: true,
    })
  },
});

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

//estados para tabela de transações
const selectedTransactions = ref<TransactionType[]>([]);
const itemsPerPage = ref(10);
const searchProps = "name,description";
const loading = ref(false);
const searchQuery = ref("");


// Computed para filtrar transações com base na busca
const filteredTransactions = computed(() => {
  if (!searchQuery.value) return props.data?.coveragePeriodBudgetTransaction || []

  const query = searchQuery.value.toLowerCase()
  return (props.data?.coveragePeriodBudgetTransaction || []).filter(transaction => {
    return (
      transaction.id.toLowerCase().includes(query) ||
      (transaction.invoiceId && transaction.invoiceId.toLowerCase().includes(query)) ||
      transaction.postingOperation.toLowerCase().includes(query) ||
      transaction.totalAmount.toString().includes(query)
    )
  })
})

const toggleSelection = (item: TransactionType) => {
  const index = selectedTransactions.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedTransactions.value = [...selectedTransactions.value, item];
  } else {
    selectedTransactions.value = selectedTransactions.value.filter(selected => selected.id !== item.id);
  }
};

const onViewClick = (transaction: TransactionType) => {
  // Implemente a lógica para visualizar a transação
  console.log('View transaction:', transaction)
}

</script>

<template>
  <v-dialog v-model="dialogValue" width="800" scrollable>
    <Card :title="$t('t-view-budget')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 50vh">
        <v-row class="">
          <v-col cols="12" lg="12" class="text-right">
            <Status :status="props.data?.enabled ? 'enabled' : 'disabled'" />
          </v-col>
        </v-row>
        <v-row class="mt-n3">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-name') }}</div>
            <div>{{ props.data?.name || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-budget-amount') }}</div>
            <div>{{ amountFormate(props.data?.budgetAmount) || '-' }}</div>
          </v-col>
        </v-row>
        <v-row class="mt-3">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-budget-spended') }}</div>
            <div>{{ amountFormate(props.data?.budgetSpended) || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-total-amount-by-company-employees') }}</div>
            <div>{{ amountFormate(props.data?.totalAmountByCompanyEmployees) || '-' }}</div>
          </v-col>
        </v-row>
        <v-row class="mt-5">


          <v-col cols="12" lg="12">
            <Card :title="$t('t-transactions-list')" title-class="py-0">
              <v-card-text>
                <v-row>
                  <v-col cols="12" lg="12">
                    <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-transaction')" />
                  </v-col>
                </v-row>
              </v-card-text>
              <Table :header-items="transactionHeaders">
                <template #body>
                  <!-- Quando há transações -->
                  <tr v-for="item in filteredTransactions" :key="'transaction-' + item.id">
                    <td>
                      <v-checkbox :model-value="selectedTransactions.some(selected => selected.id === item.id)"
                        @update:model-value="toggleSelection(item)" hide-details density="compact" color="primary" />
                    </td>
                    <td class="text-primary font-weight-bold">{{ item.id }}</td>
                    <td>{{ formateDate(item.createdAt) }}</td>
                    <td>{{ item.invoiceId || '-' }}</td>
                    <td>{{ amountFormate(item.totalAmount) }}</td>
                    <td>
                      <Status :status="item.postingOperation === 'POST' ? 'posted' : 'pending'" />
                    </td>
                    <td>
                      <Status :status="item.enabled ? 'enabled' : 'disabled'" />
                    </td>
                    <td style="padding-right: 0px;">
                      <TableActionView @onView="onViewClick(item)" />
                    </td>
                  </tr>

                  <!-- Quando não há transações -->
                  <tr v-if="filteredTransactions.length === 0">
                    <td :colspan="transactionHeaders.length" class="text-center py-10">
                      <v-avatar size="80" color="primary" variant="tonal">
                        <i class="ph-magnifying-glass" style="font-size: 30px" />
                      </v-avatar>
                      <div class="text-subtitle-1 font-weight-bold mt-3">
                        {{ $t('t-no-transactions-found') }}
                      </div>
                    </td>
                  </tr>
                </template>
              </Table>
            </Card>
          </v-col>

        </v-row>
      </v-card-text>
      <v-divider />

      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
