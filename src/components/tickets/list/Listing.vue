<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import { ticketHeaders, ticketList } from "@/components/tickets/list/utils";
import Status from "@/app/common/components/Status.vue";
import CreateEditDialog from "@/components/tickets/list/CreateEditDialog.vue";
import { useRouter } from "vue-router";
import { TicketListingType } from "@/components/tickets/list/types";
import { formateDate } from "@/app/common/dateFormate";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";

const router = useRouter();
const dialog = ref(false);
const ticketData = ref<TicketListingType | null>(null);

const deleteDialog = ref(false);
const deletedId = ref<number | null>(null);

const isAllChecked = ref(false);
const mappedData = ticketList.map((item) => {
  return {
    ...item,
    isChecked: false,
  };
});

const filteredData = ref<TicketListingType[]>(mappedData);
const finalData = ref<TicketListingType[]>(filteredData.value);

const page = ref(1);
const noOfItems = computed(() => {
  return finalData.value.length;
});
const tableData = ref<TicketListingType[]>([]);
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

const updateTableData = (newVal: TicketListingType[]) => {
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

onMounted(() => {
  getPaginatedData();
});

watch(page, (newPage: number) => {
  config.value.page = newPage;
  getPaginatedData();
});

const query = ref("");

watch(query, (newQuery: string) => {
  filteredData.value = mappedData.filter((item) => {
    const val = newQuery.toLowerCase();
    if (
      item.ticketTitle.toLowerCase().includes(val) ||
      item.clientName.toLowerCase().includes(val)
    ) {
      return item;
    }
  });
  updateTableData(filteredData.value);
});

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    ticketData.value = null;
  }
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deletedId.value = null;
  }
});

const onSelectAll = () => {
  isAllChecked.value = !isAllChecked.value;
  tableData.value = tableData.value.map((item) => {
    return {
      ...item,
      isChecked: isAllChecked.value,
    };
  });
};

const onCreateEditClick = (data: TicketListingType | null) => {
  if (!data) {
    ticketData.value = {
      id: -1,
      ticketTitle: "",
      clientName: "",
      createDate: "",
      dueDate: "",
      priority: "",
      status: "",
      assignedTo: [],
    };
  } else {
    ticketData.value = data;
  }
  dialog.value = true;
};

const onView = () => {
  router.push({ path: "/tickets/overview" });
};

const onCreateUpdate = (data: TicketListingType) => {
  if (data.id === -1) {
    filteredData.value.unshift({
      ...data,
      id: ticketList.length + 1,
      isChecked: false,
    });
  } else {
    filteredData.value = filteredData.value.map((item) => {
      if (data.id === item.id) {
        return {
          ...item,
          ...data,
        };
      }
      return item;
    });
  }
  updateTableData(filteredData.value);

  dialog.value = false;
};

const onDelete = (id: number) => {
  deletedId.value = id;
  deleteDialog.value = true;
};

const onConfirm = () => {
  filteredData.value = filteredData.value.filter(
    (item) => item.id !== deletedId.value
  );
  deleteDialog.value = false;
  updateTableData(filteredData.value);
};
</script>
<template>
  <Card title="Tickets List" class="mt-5">
    <template #title-action>
      <v-row justify="end" align="center">
        <v-col lg="3">
          <QuerySearch
            v-model="query"
            placeholder="Search for tickets, date, client or something..."
          />
        </v-col>
        <v-col cols="auto">
          <v-btn color="secondary" @click="onCreateEditClick(null)">
            <i class="ph-plus-circle me-1" /> Add Ticket
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <v-card-text>
      <Table
        v-model="page"
        is-pagination
        :config="config"
        :loading="loading"
        :headerItems="ticketHeaders"
        @onSelectAll="onSelectAll"
      >
        <template #body>
          <tr
            v-for="(item, index) in tableData"
            :key="'ticket-list-item-' + index"
            height="50"
          >
            <td>
              <v-checkbox
                v-model="item.isChecked"
                hide-details
                color="primary"
              />
            </td>
            <td class="text-primary font-weight-bold">
              #TBS{{ 243019 + item.id }}
            </td>
            <td>
              <div class="d-flex">
                <div
                  class="position-relative"
                  v-for="(avatar, index) in item.assignedTo"
                  :key="avatar.assigneeName"
                >
                  <v-tooltip
                    v-if="index < 3"
                    :text="avatar.assigneeName"
                    location="top"
                  >
                    <template v-slot:activator="{ props }">
                      <v-avatar
                        v-bind="props"
                        size="30"
                        class="avatar-group-item curser-pointer"
                      >
                        <v-img :src="avatar.assigneeImg" />
                      </v-avatar>
                    </template>
                  </v-tooltip>
                </div>
                <v-tooltip
                  v-if="item.assignedTo.length > 3"
                  :text="`+${item.assignedTo.length - 3} more`"
                  location="top"
                >
                  <template v-slot:activator="{ props }">
                    <v-avatar
                      v-bind="props"
                      size="30"
                      class="avatar-group-item curser-pointer"
                      color="primary"
                    >
                      +1
                    </v-avatar>
                  </template>
                </v-tooltip>
              </div>
            </td>
            <td>{{ item.ticketTitle }}</td>
            <td>{{ item.clientName }}</td>
            <td>{{ formateDate(item.createDate) }}</td>
            <td>{{ formateDate(item.dueDate) }}</td>
            <td><Status :status="item.priority" variant="elevated" /></td>
            <td><Status :status="item.status" /></td>
            <td>
              <TableAction
                @onView="onView"
                @onEdit="onCreateEditClick(item)"
                @onDelete="onDelete(item.id)"
              />
            </td>
          </tr>
        </template>
      </Table>

      <div v-if="!filteredData.length" class="text-center my-10">
        <v-avatar size="80" color="primary" variant="tonal" class="mb-3">
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
          We've searched more than 6k+ tickets We did not find any tickets for
          you search.
        </div>
      </div>
    </v-card-text>
  </Card>
  <CreateEditDialog
    v-if="ticketData"
    :data="ticketData"
    v-model="dialog"
    @onCreateUpdate="onCreateUpdate"
  />
  <RemoveItemConfirmationDialog
    v-if="deletedId"
    v-model="deleteDialog"
    @onConfirm="onConfirm"
  />
</template>
