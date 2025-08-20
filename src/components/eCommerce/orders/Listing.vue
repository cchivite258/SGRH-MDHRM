<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import Table from "@/app/common/components/Table.vue";
import { ordersHeader, orders } from "@/components/eCommerce/orders/utils";
import { OrdersType } from "@/components/eCommerce/orders/types";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Status from "@/app/common/components/Status.vue";
import { formateDate, getAfterDateFromDay } from "@/app/common/dateFormate";
import CreateUpdateOrderDialog from "@/components/eCommerce/orders/CreateUpdateOrderDialog.vue";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
const mappedOrders = orders.map((data) => {
  return {
    ...data,
    isChecked: false,
  };
});
const router = useRouter();

const filteredOrders = ref<OrdersType[]>(mappedOrders.reverse());
const finalData = ref(filteredOrders.value);
const orderDialog = ref(false);
const selectedOrder = ref<OrdersType | null>(null);
const confirmationDialog = ref(false);
const deleteId = ref<any>(null);

const page = ref(1);
const noOfItems = computed(() => {
  return finalData.value.length;
});
const tableData = ref<OrdersType[]>([]);

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

  const data = filteredOrders.value.slice(config.value.start, config.value.end);
  tableData.value = [];

  setTimeout(() => {
    tableData.value = data;
  }, 200);
};

onMounted(() => {
  getPaginatedData();
});

watch(page, (newPage: number) => {
  config.value.page = newPage;
  getPaginatedData();
});

watch(orderDialog, (dialog: boolean) => {
  if (!dialog) {
    selectedOrder.value = null;
  }
});

watch(confirmationDialog, (dialog: boolean) => {
  if (!dialog) {
    deleteId.value = null;
  }
});

const onCreateEditClick = (id: string | number) => {
  if (id === -1) {
    selectedOrder.value = {
      id,
      order_date: new Date(),
      delivery_date: getAfterDateFromDay({ endDay: 5 }),
      product: "",
      customer: "",
      img: "",
      name: "",
      pay_method: "",
      price: "",
      ratings: "4.5",
      delivery_status: "",
    };
  } else {
    const item = filteredOrders.value.find((item) => item.id === id);
    if (item) {
      selectedOrder.value = item;
    }
  }
  orderDialog.value = true;
};

const onCreateUpdate = (updatedData: OrdersType) => {
  const { delivery_date, order_date, img } = updatedData;
  const data = {
    ...updatedData,
    id: orders.length + 1,
    img: img.src ? img.src : img,
    order_date: formateDate(order_date),
    delivery_date: formateDate(delivery_date),
  };
  if (updatedData.id === -1) {
    filteredOrders.value.unshift(data);
  } else {
    filteredOrders.value = filteredOrders.value.map((data) => {
      if (data.id === updatedData.id) {
        return {
          ...data,
          ...updatedData,
          order_date: formateDate(order_date),
          delivery_date: formateDate(delivery_date),
        };
      }

      return data;
    });
  }
  updateTableData(filteredOrders.value);

  orderDialog.value = false;
};

const onDelete = (itemId: string | number) => {
  deleteId.value = itemId;
  confirmationDialog.value = true;
};

const onConfirmDelete = () => {
  filteredOrders.value = filteredOrders.value.filter((item) => {
    return item.id !== deleteId.value;
  });
  updateTableData(filteredOrders.value);

  confirmationDialog.value = false;
};

const updateTableData = (newVal: OrdersType[]) => {
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
  }, 200);
};

const onView = () => {
  router.push({ path: "/ecommerce/order-overview" });
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
  <v-card class="mt-5">
    <v-card-title class="py-5">
      <v-row justify="space-between">
        <v-col cols="5" lg="3">
          <QuerySearch
            placeholder="Search for Order ID, customer, order status, etc..."
          />
        </v-col>
        <v-col cols="auto">
          <ListMenu
            :listItems="['Order Date', 'Order ID', 'Amount', 'Status']"
          />
          <v-btn color="primary" @click="onCreateEditClick(-1)">
            <i class="ph-plus-circle px-1" /> Add Order
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text>
      <Table
        v-model="page"
        :headerItems="ordersHeader"
        is-pagination
        :config="config"
        @on-select-all="onSelectAll"
      >
        <template #body>
          <tr
            v-for="item in tableData"
            :key="'ecommerce-order-item-' + item.id"
          >
            <td>
              <v-checkbox
                v-model="item.isChecked"
                hide-details
                color="primary"
              />
            </td>
            <td class="text-primary font-weight-bold">
              #TBS{{ 25000 + Number(item.id) }}
            </td>
            <td>{{ formateDate(item.order_date) }}</td>
            <td>{{ formateDate(item.delivery_date) }}</td>
            <td>{{ item.product }}</td>
            <td>{{ item.customer }}</td>
            <td>
              <v-avatar size="small" density="compact" class="me-2">
                <v-img :src="item.img" />
              </v-avatar>
              {{ item.name }}
            </td>
            <td>{{ item.pay_method }}</td>
            <td>{{ item.price }}</td>
            <td class="text-subtitle-2 font-weight-bold">{{ item.ratings }}</td>
            <td>
              <Status :status="item.delivery_status" />
            </td>
            <td>
              <TableAction
                @onView="onView"
                @onEdit="onCreateEditClick(item.id)"
                @onDelete="onDelete(item.id)"
              />
            </td>
          </tr>
        </template>
      </Table>
    </v-card-text>
  </v-card>

  <CreateUpdateOrderDialog
    v-if="selectedOrder"
    v-model="orderDialog"
    :selectedOrder="selectedOrder"
    @onCreateUpdate="onCreateUpdate"
  />
  <RemoveItemConfirmationDialog
    v-model="confirmationDialog"
    @onConfirm="onConfirmDelete"
  />
</template>
