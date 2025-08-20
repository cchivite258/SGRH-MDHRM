<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import { listViewHeader } from "@/components/realEstate/agent/listView/utils";
import { agentListingData } from "@/components/realEstate/agent/utils";
import { AgentListingType } from "@/components/realEstate/agent/types";
import Status from "@/app/common/components/Status.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateAgentDialog from "@/components/realEstate/agent/CreateUpdateAgentDialog.vue";
import { formateDate } from "@/app/common/dateFormate";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";

const router = useRouter();
const dialog = ref(false);
const agentData = ref<AgentListingType | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<number | null>(null);
const isSelectAll = ref(false);
const mappedData = agentListingData
  .map((item) => {
    return {
      ...item,
      isCheck: false,
    };
  })
  .toReversed();

const filteredData = ref<AgentListingType[]>(mappedData);
const finalData = ref<AgentListingType[]>(filteredData.value);
const query = ref("");

const page = ref(1);
const noOfItems = computed(() => {
  return finalData.value.length;
});
const tableData = ref<AgentListingType[]>([]);
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

  const data = finalData.value.slice(config.value.start, config.value.end);

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

watch(filteredData, (newData: AgentListingType[]) => {
  updateTableData(newData);
});

const updateTableData = (newVal: AgentListingType[]) => {
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

watch(query, (newQuery: string) => {
  filteredData.value = finalData.value.filter((item) => {
    const val = newQuery.toLowerCase();
    if (
      item.name.toLowerCase().includes(val) ||
      item.location.includes(val) ||
      item.email.includes(val)
    ) {
      return item;
    }
  });
  updateTableData(filteredData.value);
});

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    agentData.value = null;
  }
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

const onCreateEditClick = (data: AgentListingType | null) => {
  if (!data) {
    agentData.value = {
      id: -1,
      joining_date: new Date(),
      img: "",
      img_alt: "avatar.jpg",
      name: "",
      property: "149",
      location: "",
      email: "",
      contact: "",
      status: "",
      new: true,
    };
  } else {
    agentData.value = data;
  }

  dialog.value = true;
};

const onSubmit = (data: AgentListingType) => {
  if (data.id === -1) {
    const preparedData = {
      ...data,
      id: finalData.value.length + 1,
      img: data.img.src ? data.img.src : data.img,
    };

    filteredData.value.unshift(preparedData);
  } else {
    filteredData.value = filteredData.value.map((item) => {
      if (item.id === data.id) {
        return {
          ...item,
          ...data,
        };
      }
      return item;
    });
  }
  finalData.value = filteredData.value;
  updateTableData(filteredData.value);
  dialog.value = false;
};

const onView = () => {
  router.push({ path: "/real-estate-agent/overview" });
};

const onDelete = (id: number) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = () => {
  filteredData.value = finalData.value.filter(
    (item) => item.id !== deleteId.value
  );

  finalData.value = filteredData.value;
  deleteDialog.value = false;
  updateTableData(filteredData.value);
};

const onSelectAll = () => {
  isSelectAll.value = !isSelectAll.value;
  tableData.value = tableData.value.map((item) => {
    return {
      ...item,
      isCheck: isSelectAll.value,
    };
  });
};
</script>
<template>
  <v-card>
    <v-card-title>
      <v-row justify="space-between">
        <v-col lg="3">
          <QuerySearch
            v-model="query"
            placeholder="Search for agent, email, address or something..."
          />
        </v-col>
        <v-col lg="auto">
          <v-btn color="secondary" @click="onCreateEditClick(null)">
            <i class="ph-user-plus me-1" /> Add Agent
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text>
      <Table
        v-model="page"
        :headerItems="listViewHeader"
        :config="config"
        :loading="loading"
        is-pagination
        @on-select-all="onSelectAll"
      >
        <template #body>
          <tr
            v-for="(item, index) in tableData"
            :key="'agent-listing-item-' + index"
            height="50"
          >
            <td>
              <v-checkbox v-model="item.isCheck" hide-details color="primary" />
            </td>
            <td
              class="text-primary font-weight-bold curser-pointer"
              @click="onView"
            >
              #TBS{{ item.id }}
            </td>
            <td>{{ formateDate(item.joining_date) }}</td>
            <td>
              <v-avatar :image="item.img" rounded size="small" class="me-2" />
              {{ item.name }}
            </td>
            <td>{{ item.location }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.contact }}</td>
            <td><Status :status="item.status" /></td>
            <td>
              <TableAction
                @onEdit="onCreateEditClick(item)"
                @onView="onView"
                @onDelete="onDelete(item.id)"
              />
            </td>
          </tr>
        </template>
      </Table>

      <div v-if="!filteredData.length" class="text-center pa-7">
        <div class="mb-3">
          <v-avatar color="primary" variant="tonal" size="x-large">
            <i class="ph-magnifying-glass ph-lg"></i>
          </v-avatar>
        </div>
        <div class="text-subtitle-1 font-weight-bold">
          Sorry! No Result Found
        </div>
        <div class="text-muted mt-1">
          We've searched more than 150+ agent We did not find any agent for you
          search.
        </div>
      </div>
    </v-card-text>
  </v-card>

  <CreateUpdateAgentDialog
    v-if="agentData"
    v-model="dialog"
    :data="agentData"
    @onSubmit="onSubmit"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    @onConfirm="onConfirmDelete"
  />
</template>
