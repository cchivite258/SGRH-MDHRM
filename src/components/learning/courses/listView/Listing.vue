<script lang="ts" setup>
import { computed, type PropType, ref, onMounted, watch } from "vue";
import { courseListHeader } from "@/components/learning/courses/listView/utils";
import Table from "@/app/common/components/Table.vue";
import Status from "@/app/common/components/Status.vue";
import { CourseListType } from "@/components/learning/courses/listView/types";
import { useRouter } from "vue-router";
import TableAction from "@/app/common/components/TableAction.vue";

const emit = defineEmits(["onEdit", "onDelete"]);
const prop = defineProps({
  data: {
    type: Array as PropType<CourseListType[]>,
    default: () => [],
  },
});

const router = useRouter();
const filteredData = computed(() => {
  return prop.data.map((item: CourseListType) => {
    return {
      ...item,
      isChecked: false,
    };
  });
});

const page = ref(1);
const noOfItems = computed(() => {
  return filteredData.value.length;
});
const tableData = ref<CourseListType[]>([]);
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

  const data = filteredData.value.slice(config.value.start, config.value.end);

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

const updateTableData = (newVal: CourseListType[]) => {
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

watch(page, (newPage: number) => {
  config.value.page = newPage;
  getPaginatedData();
});
watch(filteredData, (newData: CourseListType[]) => {
  updateTableData(newData);
});

const onCategoryClick = () => {
  router.push({ path: "/learning/grid" });
};

const redirectToOverview = () => {
  router.push({ path: "/learning/overview" });
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
    :headerItems="courseListHeader"
    is-pagination
    :config="config"
    :loading="loading"
    @on-select-all="onSelectAll"
  >
    <template #body>
      <tr v-for="item in tableData" :key="item.name">
        <td>
          <v-checkbox v-model="item.isChecked" hide-details color="primary" />
        </td>
        <td class="curser-pointer" @click="onCategoryClick">
          {{ item.category }}
        </td>
        <td class="curser-pointer" @click="redirectToOverview">
          <div class="d-flex">
            <v-avatar rounded size="25" class="me-2">
              <v-img :src="item.img" />
            </v-avatar>
            {{ item.name }}
          </div>
        </td>
        <td>{{ item.instructor }}</td>
        <td>{{ item.lessons }}</td>
        <td>{{ item.duration }}</td>
        <td>{{ item.students }}</td>
        <td>{{ item.fees }}</td>
        <td>{{ item.rating }}</td>
        <td><Status :status="item.status" /></td>
        <td>
          <TableAction
            @onView="redirectToOverview"
            @onEdit="emit('onEdit', item)"
            @onDelete="emit('onDelete', item.id)"
          />
        </td>
      </tr>
    </template>
  </Table>
  <div v-if="!filteredData.length" class="text-center">
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
