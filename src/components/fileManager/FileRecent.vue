<script lang="ts" setup>
import { ref } from "vue";
import {
  recentFileListing,
  recentFileHeading,
  recentFileOptions,
} from "@/components/fileManager/utils";
import { v4 as uuidv4 } from "uuid";
import Table from "@/app/common/components/Table.vue";
import { formateDate } from "@/app/common/dateFormate";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";

const emit = defineEmits(["onView"]);

const mappedListing = recentFileListing.map((item) => {
  return {
    ...item,
    isChecked: false,
    id: uuidv4(),
  };
});
const filteredData = ref(mappedListing);
const isAllChecked = ref(false);
const dialog = ref(false);
const deleteItem = ref<any>(null);
const page = ref(1);

const onCheckAllClick = () => {
  isAllChecked.value = !isAllChecked.value;

  filteredData.value = filteredData.value.map((value) => {
    return {
      ...value,
      isChecked: isAllChecked.value,
    };
  });
};

const onSelect = (option: string, value: { [key: string]: any }) => {
  switch (option) {
    case "view":
      emit("onView");
      break;

    case "delete":
      dialog.value = true;
      deleteItem.value = value;
      break;

    default:
      break;
  }
};

const onConfirmDelete = () => {
  filteredData.value = filteredData.value.filter((item) => {
    return item.name !== deleteItem.value.name;
  });

  dialog.value = false;
};
</script>
<template>
  <Card title="File Recent" elevation="0">
    <template #title-action>
      <ListMenu isSortBy :listItems="['Doc Type', 'Size', 'Date']" />
    </template>
    <Table :headerItems="recentFileHeading" @onSelectAll="onCheckAllClick">
      <template #body>
        <tr v-for="item in filteredData" :key="'file-recent-item-' + item.id">
          <td width="50">
            <v-checkbox v-model="item.isChecked" hide-details color="primary" />
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.item }}</td>
          <td>{{ item.size }} {{ item.sizeType }}</td>
          <td>{{ formateDate(item.date) }}</td>

          <td>
            <ListMenuWithIcon
              :menuItems="recentFileOptions"
              @onSelect="onSelect($event, item)"
            />
          </td>
        </tr>
      </template>
    </Table>

    <div class="d-flex justify-end">
      <v-pagination
        v-model="page"
        :length="2"
        density="compact"
        color="primary"
        variant="text"
        total-visible="3"
        prev-icon="ph-arrow-left"
        next-icon="ph-arrow-right"
        class="table-pagination"
      />
    </div>
  </Card>
  <ConfirmationDialog v-model="dialog" @onConfirm="onConfirmDelete">
    <v-btn
      variant="text"
      class="confirm-close-icon"
      icon="ph-x"
      @click="dialog = false"
    />

    <v-card-text class="text-center ma-md-5">
      <div class="text-danger">
        <i class="ph ph-trash ph-4x"></i>
      </div>
      <div class="mt-4">
        <h4>Are you sure ?</h4>
        <p class="text-muted mx-4 mb-0 text-subtitle-1">
          Are you sure you want to remove this record ?
        </p>
      </div>
    </v-card-text>
  </ConfirmationDialog>
</template>
