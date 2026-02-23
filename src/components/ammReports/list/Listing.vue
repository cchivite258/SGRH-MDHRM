<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import {
  reports,
  reportHeader,
  reportAction,
} from "@/components/ammReports/list/utils";

import Table from "@/app/common/components/Table.vue";
import { ReportType } from "@/components/ammReports/types";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Card from "@/app/common/components/Card.vue";

import PreviewDialog100001 from "@/components/ammReports/list/HospitalProceduresReport/PreviewDialog.vue";
import GenerateDialog100001 from "@/components/ammReports/list/HospitalProceduresReport/GenerateDialog.vue";

import PreviewDialog100002 from "@/components/ammReports/list/CostPerEmployeeReport/PreviewDialog.vue";
import GenerateDialog100002 from "@/components/ammReports/list/CostPerEmployeeReport/GenerateDialog.vue";

const previewDialog100001 = ref(false);
const generateDialog100001 = ref(false);

const previewDialog100002 = ref(false);
const generateDialog100002 = ref(false);

const prop = defineProps({
  filters: {
    type: Object,
    default: () => { },
  },
});

const isAllChecked = ref(false);
const mappedReports = reports.map((data) => {
  return {
    ...data,
    isChecked: false,
  };
});

const filteredReports = ref<ReportType[]>(mappedReports);
const finalData = ref<ReportType[]>(filteredReports.value);

const page = ref(1);
const noOfItems = computed(() => {
  return finalData.value.length;
});
const tableData = ref<ReportType[]>([]);
const loading = ref(false);

const config = ref({
  page: page.value,
  start: 0,
  end: 0,
  noOfItems: noOfItems.value,
  itemsPerPage: 10,
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

  const data = filteredReports.value.slice(
    config.value.start,
    config.value.end
  );

  loading.value = true;
  tableData.value = [];

  setTimeout(() => {
  tableData.value = data.map(item => ({
    ...item,
  }));

  // aplica o selectAll se estiver ativo
  if (isAllChecked.value) {
    tableData.value.forEach(item => (item.isChecked = true));
  }

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


const onSelectAll = () => {
  isAllChecked.value = !isAllChecked.value;

  // Atualiza todos os itens filtrados
  filteredReports.value.forEach(item => {
    item.isChecked = isAllChecked.value;
  });

  // Atualiza os itens da página actual
  tableData.value.forEach(item => {
    item.isChecked = isAllChecked.value;
  });
};


const reportHandlers: Record<string, {
  preview?: () => void;
  generate?: () => void;
}> = {
  "100001": {
    preview: () => previewDialog100001.value = true,
    generate: () => generateDialog100001.value = true,
  },
  "100002": {
     preview: () => previewDialog100002.value = true,
     generate: () => generateDialog100002.value = true
  },
};



const onSelect = (action: string, data: ReportType) => {
  const handler = reportHandlers[data.id];

  if (!handler) {
    console.warn("Nenhum handler definido para relatório ID:", data.id);
    return;
  }

  if (action === "preview" && handler.preview) {
  handler.preview();
}

if (action === "generate" && handler.generate) {
  handler.generate();
}

};


const updateTableData = (newVal: ReportType[]) => {
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

const searchQuery = ref("");

watch(searchQuery, (value) => {
  const val = value.toLowerCase();

  filteredReports.value = finalData.value.filter((report) =>
    report.title.toLowerCase().includes(val)
  );

  updateTableData(filteredReports.value);
});

</script>
<template>
  <Card :title="$t('t-reports')" class="mt-7">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="12">
          <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-report')" />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text>
      <Table v-model="page" :config="config"
        :headerItems="reportHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" is-pagination
        :loading="loading" @onSelectAll="onSelectAll">
        <template #body>
          <tr v-for="item in tableData" :key="item.id">
            <td>
              <v-checkbox v-model="item.isChecked" color="primary" hide-details />
            </td>
            <td class="text-primary cursor-pointer">
              #{{ item.id || 'N/A' }}
            </td>
            <td>
              <div class="d-flex align-center">
                <v-avatar color="light" class="pa-2 mx-1" rounded>
                  <i :class="item.img"></i>
                </v-avatar>
                <span class="font-weight-bold">{{ item.title }}</span>
              </div>
            </td>
            <td>
              <ListMenuWithIcon :menuItems="reportAction.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" @onSelect="onSelect($event, item)" />
            </td>
          </tr>
        </template>
      </Table>
      <div v-if="!filteredReports.length" class="text-center pa-7">
        <div class="mb-3">
          <v-avatar color="primary" variant="tonal" size="x-large">
            <i class="ph-magnifying-glass ph-lg"></i>
          </v-avatar>
        </div>
        <div class="text-subtitle-1 font-weight-bold">
          {{ $t("t-search-not-found-message") }}
        </div>
      </div>
    </v-card-text>
  </Card>


  <PreviewDialog100001 v-model="previewDialog100001"  />
  <GenerateDialog100001 v-model="generateDialog100001"  />


  <PreviewDialog100002 v-model="previewDialog100002"  />
  <GenerateDialog100002 v-model="generateDialog100002"  />



</template>
