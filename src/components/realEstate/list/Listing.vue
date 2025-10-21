<script lang="ts" setup>
import { computed, type PropType, ref, onMounted, watch } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { propertyHeader } from "@/components/realEstate/list/utils";
import { PropertyType } from "@/components/realEstate/types";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isAllSelect = ref(false);

const emit = defineEmits(["update:modelValue", "onAdd", "onEdit", "onDelete"]);
const prop = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  data: {
    type: Array as PropType<PropertyType[]>,
    default: () => [],
  },
});

const data = computed(() => prop.data);

const page = ref(1);
const noOfItems = computed(() => {
  return data.value.length;
});
const tableData = ref<PropertyType[]>([]);
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

watch(data, (newData: PropertyType[]) => {
  updateTableData(newData);
});

const mappedData = computed(() => {
  return prop.data
    .map((item) => {
      return {
        ...item,
        isCheck: false,
      };
    })
    .toReversed();
});

const filteredData = ref(mappedData.value);

const query = computed({
  get() {
    return prop.modelValue || "";
  },
  set(updatedQuery: string) {
    emit("update:modelValue", updatedQuery);
  },
});

const onView = () => {
  router.push({ path: "/real-estate/property-overview" });
};

const onSelectAll = () => {
  isAllSelect.value = !isAllSelect.value;

  tableData.value = tableData.value.map((item) => {
    return {
      ...item,
      isCheck: isAllSelect.value,
    };
  });
};

const updateTableData = (newVal: PropertyType[]) => {
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
</script>
<template>
  <v-card class="mt-5">
    <v-card-text>
      <v-row justify="space-between" class="mb-4">
        <v-col lg="3">
          <QuerySearch
            v-model="query"
            placeholder="Search for property, price or something..."
          />
        </v-col>
        <v-col lg="auto">
          <v-btn color="secondary" @click="emit('onAdd')">
            <i class="ph-house-line me-1" /> Add Property
          </v-btn>
        </v-col>
      </v-row>

      <Table
        v-model="page"
        is-pagination
        :config="config"
        :loading="loading"
        :headerItems="propertyHeader"
        @onSelectAll="onSelectAll"
      >
        <template #body>
          <tr
            v-for="(item, index) in tableData"
            :key="'real-estate-item-' + index"
            style="cursor: pointer"
          >
            <td>
              <v-checkbox color="primary" v-model="item.isCheck" hideDetails />
            </td>
            <td class="text-primary" @click="onView">#TBS{{ item.id }}</td>
            <td @click="onView">{{ item.title }}</td>
            <td>{{ item.location }}</td>
            <td>{{ item.bedroom }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.area }}</td>
            <td>{{ item.agent }}</td>
            <td class="font-weight-medium">${{ item.price }}</td>
            <td>
              <v-chip
                :color="item.requirement === 'Rent' ? 'info' : 'danger'"
                label
                density="compact"
                class="px-2"
              >
                <span class="status-chip">{{ item.requirement }}</span>
              </v-chip>
            </td>
            <td>
              <TableAction
                @onView="onView"
                @onEdit="emit('onEdit', item)"
                @onDelete="emit('onDelete', item.id)"
              />
            </td>
          </tr>
        </template>
      </Table>
    </v-card-text>
  </v-card>
</template>
