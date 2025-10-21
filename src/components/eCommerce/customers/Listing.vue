<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import Table from "@/app/common/components/Table.vue";
import { customersOptions } from "@/components/eCommerce/customers/utils";
import { CustomersType } from "@/components/eCommerce/customers/types";
import Status from "@/app/common/components/Status.vue";
import { formateDate } from "@/app/common/dateFormate";

const emit = defineEmits(["onView", "onEdit", "onDelete"]);
const prop = defineProps({
  customers: {
    type: Object,
    default: () => {},
  },
});

const customers = computed(() => {
  return prop.customers;
});

const page = ref(1);
const noOfItems = computed(() => {
  return customers.value.length;
});
const tableData = ref<any[]>([]);
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
  tableData.value = customers.value.slice(config.value.start, config.value.end);
};

onMounted(() => {
  getPaginatedData();
});

watch(page, (newPage: number) => {
  config.value.page = newPage;
  getPaginatedData();
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

watch(customers, (newVal: any) => {
  updateTableData(newVal);
});

const onSelect = (option: string, data: CustomersType) => {
  switch (option) {
    case "view":
      emit("onView", data);
      break;
    case "edit":
      emit("onEdit", data);
      break;
    case "delete":
      emit("onDelete", data);
      break;
    default:
      break;
  }
};
</script>
<template>
  <v-card>
    <v-card-text>
      <Table v-model="page" is-pagination :config="config" :loading="loading">
        <template #body>
          <tr
            v-for="(item, index) in tableData"
            :key="'eCommerce-customer-' + index"
            height="50"
          >
            <td>
              <div class="d-flex align-center">
                <div class="d-flex align-center">
                  <v-avatar density="compact" class="mx-2">
                    <v-img :src="item.img" />
                  </v-avatar>
                  <div class="font-weight-bold">{{ item.name }}</div>
                </div>
              </div>
            </td>
            <td>{{ item.email }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ formateDate(item.create_date) }}</td>
            <td class="text-center"><Status :status="item.status" /></td>

            <td>
              <ListMenuWithIcon
                :menuItems="customersOptions"
                @onSelect="onSelect($event, item)"
              />
            </td>
          </tr>
        </template>
      </Table>

      <div v-if="!customers.length" class="text-center">
        <v-avatar size="80" color="primary" variant="text">
          <i
            class="ph-magnifying-glass"
            style="font-size: 30px"
            color="primary"
          />
        </v-avatar>
        <div class="font-weight-bold text-subtitle-1 mb-1">
          Sorry! No Result Found
        </div>
        <div class="text-muted">
          We've searched more than 150+ customers We did not find any customers
          for you search.
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
