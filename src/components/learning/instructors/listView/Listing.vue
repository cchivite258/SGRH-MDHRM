<script lang="ts" setup>
import { InstructorDataType } from "@/components/learning/instructors/types";
import { type PropType, ref, computed, onMounted, watch } from "vue";
import { listViewHeader } from "@/components/learning/instructors/listView/utils";
import Table from "@/app/common/components/Table.vue";
import Status from "@/app/common/components/Status.vue";

const emit = defineEmits(["onEdit", "onDelete"]);
const prop = defineProps({
  data: {
    type: Array as PropType<InstructorDataType[]>,
    default: () => [],
  },
});

const data = computed(() => prop.data);

const page = ref(1);
const noOfItems = computed(() => {
  return data.value.length;
});
const tableData = ref<InstructorDataType[]>([]);
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

watch(data, (newData: InstructorDataType[]) => {
  updateTableData(newData);
});

const updateTableData = (newVal: InstructorDataType[]) => {
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
  tableData.value = tableData.value.map((item) => {
    return {
      ...item,
      isChecked: !item.isChecked,
    };
  });
};
</script>
<template>
  <Table
    v-model="page"
    :headerItems="listViewHeader"
    is-pagination
    :config="config"
    :loading="loading"
    @on-select-all="onSelectAll"
  >
    <template #body>
      <tr
        v-for="(item, index) in tableData"
        :key="'cart-item-' + index"
        height="55"
        style="cursor: pointer"
      >
        <td>
          <v-checkbox v-model="item.isChecked" hide-details color="primary" />
        </td>
        <td class="text-primary font-weight-bold">#TBS11590{{ item.id }}</td>
        <td>
          <div class="d-flex align-center">
            <v-avatar density="compact" class="me-2">
              <v-img :src="item.img" :alt="item.img_alt" />
            </v-avatar>
            <span>{{ item.name }}</span>
          </div>
        </td>
        <td>{{ item.total_course }}</td>
        <td>{{ item.email }}</td>
        <td>{{ item.experience }}</td>
        <td>{{ item.students }}</td>
        <td>{{ item.contact }}</td>
        <td><i class="bx bxs-star me-1 text-warning" /> {{ item.rating }}</td>
        <td><Status :status="item.status" /></td>
        <td>
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-btn
                v-bind="props"
                icon="ph-eye ph-sm"
                color="primary"
                density="compact"
                elevation="0"
                :variant="!isHovering ? 'tonal' : 'elevated'"
                rounded
                to="/instructors/overview"
              />
            </template>
          </v-hover>
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-btn
                v-bind="props"
                icon="ph-pencil ph-sm"
                color="secondary"
                density="compact"
                elevation="0"
                :variant="!isHovering ? 'tonal' : 'elevated'"
                rounded
                class="mx-1"
                @click="emit('onEdit', item)"
              />
            </template>
          </v-hover>
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-btn
                v-bind="props"
                icon="ph-trash ph-sm"
                color="danger"
                density="compact"
                elevation="0"
                :variant="!isHovering ? 'tonal' : 'elevated'"
                rounded
                @click="emit('onDelete', item.id)"
              />
            </template>
          </v-hover>
        </td>
      </tr>
    </template>
  </Table>
  <div v-if="!data.length" class="text-center">
    <v-avatar size="80" color="primary" variant="text">
      <i class="ph-magnifying-glass" style="font-size: 30px" color="primary" />
    </v-avatar>
    <div class="font-weight-bold text-subtitle-1 mb-1">
      Sorry! No Result Found
    </div>
    <div class="text-muted">
      We've searched more than 150+ customers We did not find any customers for
      you search.
    </div>
  </div>
</template>
