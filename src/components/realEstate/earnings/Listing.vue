<script lang="ts" setup>
import {
  earningData,
  realEstateEarningHeader,
} from "@/components/realEstate/earnings/utils";
import { ref, watch, computed, onMounted } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import Status from "@/app/common/components/Status.vue";

const query = ref("");
const type = ref("All Select");
const isSelectAll = ref(false);
const mappedItems = earningData.map((item) => {
  return {
    ...item,
    isChecked: false,
  };
});
const filteredItem = ref(mappedItems);
const finalData = ref(filteredItem.value);

const page = ref(1);
const noOfItems = computed(() => {
  return finalData.value.length;
});
const tableData = ref<any[]>([]);
const loading = ref(false);

const config = ref({
  page: page.value,
  start: 0,
  end: 0,
  noOfItems: noOfItems.value,
  itemsPerPage: 6,
});

const getPaginatedData = () => {
  const { itemsPerPage, page } = config.value;
  const start = (page - 1) * itemsPerPage;
  let end = start + itemsPerPage;
  end = end <= noOfItems.value ? end : noOfItems.value;

  config.value = {
    ...config.value,
    start,
    end,
  };

  const data = filteredItem.value.slice(config.value.start, config.value.end);

  loading.value = true;
  tableData.value = [];

  setTimeout(() => {
    tableData.value = data;
    loading.value = false;
  }, 200);
};

onMounted(() => {
  getPaginatedData();
});

watch(page, (newPage: number) => {
  config.value.page = newPage;
  getPaginatedData();
});

watch(query, (newQuery: string) => {
  filteredItem.value = finalData.value.filter((item) => {
    const val = newQuery.toLowerCase();
    if (
      item.details.toLowerCase().includes(val) ||
      item.type.toLowerCase().includes(val) ||
      item.transactionID.toLowerCase().includes(val)
    ) {
      return item;
    }
  });
  updateTableData(filteredItem.value);
});

const updateTableData = (newVal: any[]) => {
  loading.value = true;
  const { itemsPerPage } = config.value;

  const start = 1;
  let end = start + itemsPerPage;
  end = end <= newVal.length ? end : newVal.length;
  tableData.value = [];

  setTimeout(() => {
    tableData.value = newVal;
    config.value = {
      ...config.value,
      start,
      end,
      noOfItems: newVal.length,
    };
    loading.value = false;
  }, 200);
};

const onSelectAll = () => {
  isSelectAll.value = !isSelectAll.value;
  tableData.value = tableData.value.map((item) => {
    return {
      ...item,
      isChecked: isSelectAll.value,
    };
  });
};
</script>
<template>
  <v-card class="mt-5">
    <v-card-title class="pt-4">
      <v-row justify="space-between">
        <v-col cols="12" lg="4">
          <QuerySearch
            v-model="query"
            placeholder="Search for transaction, date or something..."
          />
        </v-col>
        <v-col cols="auto">
          <v-select
            v-model="type"
            variant="plain"
            rounded
            density="compact"
            hide-details
            class="filter-select-item"
            :items="[
              'All Select',
              'Email',
              'Agencies Name',
              'Address',
              'Total Property',
              'Employee',
            ]"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-4">
      <Table
        :headerItems="realEstateEarningHeader"
        v-model="page"
        is-pagination
        :config="config"
        :loading="loading"
        @on-select-all="onSelectAll"
      >
        <template #body>
          <tr
            v-for="(item, index) in tableData"
            :key="'real-estate-overview-item-' + index"
            height="50"
          >
            <td>
              <v-checkbox
                v-model="item.isChecked"
                hide-details
                color="primary"
              />
            </td>
            <td>
              <i v-if="item.isSuccess" class="ph-trend-up text-success" />
              <i v-else class="ph-trend-down text-danger" />
            </td>
            <td class="font-weight-bold text-primary">
              #{{ item.transactionID }}
            </td>
            <td class="timestamp">
              {{ item.date }}
              <small class="text-muted">{{ item.timestamp }}</small>
            </td>
            <td>{{ item.details }}</td>
            <td>{{ item.type }}</td>
            <td>${{ item.amount }}</td>
            <td><Status :status="item.status" /></td>
          </tr>
        </template>
      </Table>

      <div v-if="!filteredItem.length" class="text-center pt-14">
        <div class="mb-3">
          <v-avatar size="80" color="primary" variant="tonal">
            <i class="ph-magnifying-glass ph-lg"></i>
          </v-avatar>
        </div>
        <span class="text-subtitle-1 font-weight-bold"
          >No matching records found</span
        >
      </div>
    </v-card-text>
  </v-card>
</template>
