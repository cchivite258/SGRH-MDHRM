<script lang="ts" setup>
import { type PropType, computed, ref, onMounted, watch } from "vue";
import { AgenciesListViewType } from "@/components/realEstate/agencies/listView/types";
import Table from "@/app/common/components/Table.vue";
import { listHeader } from "@/components/realEstate/agencies/listView/utils";
import TableAction from "@/app/common/components/TableAction.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["onEdit", "onDelete"]);
const prop = defineProps({
  data: Array as PropType<AgenciesListViewType[]>,
  default: () => [],
});

const data = computed(() => prop.data || []);
const isSelectAll = ref(false);
const page = ref(1);
const noOfItems = computed(() => {
  return data.value.length;
});
const tableData = ref<AgenciesListViewType[]>([]);
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

  const finalData = data.value.slice(config.value.start, config.value.end);

  loading.value = true;
  tableData.value = [];

  setTimeout(() => {
    tableData.value = finalData;
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

watch(data, (newData: AgenciesListViewType[]) => {
  updateTableData(newData);
});

const updateTableData = (newVal: AgenciesListViewType[]) => {
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

const onView = () => {
  router.push("/real-estate-agencies/overview");
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
  <Table
    :headerItems="listHeader"
    v-model="page"
    is-pagination
    :config="config"
    :loading="loading"
    @on-select-all="onSelectAll"
  >
    <template #body>
      <tr
        v-for="(item, index) in tableData"
        :key="'eCommerce-order-item-' + index"
        height="50"
      >
        <td>
          <v-checkbox v-model="item.isChecked" color="primary" hide-details />
        </td>
        <td class="text-primary font-weight-bold">#TBA0{{ item.id }}</td>
        <td>{{ item.since }}</td>
        <td>
          <v-avatar :image="item.img" size="20" class="me-2" />
          {{ item.name }}
        </td>
        <td>{{ item.location }}</td>
        <td>{{ item.property }}</td>
        <td>{{ item.employee }}</td>
        <td>{{ item.email }}</td>
        <td>{{ item.contact }}</td>
        <td>
          <TableAction
            @onEdit="emit('onEdit', item)"
            @onView="onView"
            @onDelete="emit('onDelete', item.id)"
          />
        </td>
      </tr>
    </template>
  </Table>

  <div v-if="!(data && data.length)" class="text-center pa-7">
    <div class="mb-3">
      <v-avatar color="primary" variant="tonal" size="x-large">
        <i class="ph-magnifying-glass ph-lg"></i>
      </v-avatar>
    </div>
    <div class="text-subtitle-1 font-weight-bold">Sorry! No Result Found</div>
    <div class="text-muted mt-1">
      We've searched more than 150+ agencies We did not find any agencies for
      you search.
    </div>
  </div>
</template>
