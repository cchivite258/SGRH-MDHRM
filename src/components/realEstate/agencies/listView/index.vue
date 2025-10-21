<script lang="ts" setup>
import { ref, watch } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { agenciesList } from "@/components/realEstate/agencies/listView/utils";
import Listing from "@/components/realEstate/agencies/listView/Listing.vue";
import CreateEditDialog from "@/components/realEstate/agencies/listView/CreateEditDialog.vue";
import { AgenciesListViewType } from "@/components/realEstate/agencies/listView/types";
import { getFullYear } from "@/app/common/dateFormate";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";

const query = ref("");

const dialog = ref(false);
const dialogData = ref<AgenciesListViewType | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<number | null>(null);

watch(query, (newQuery: string) => {
  filteredData.value = finalData.value.filter((item) => {
    const val = newQuery.toLowerCase();
    if (
      item.name.toLowerCase().includes(val) ||
      item.location.toLowerCase().includes(val) ||
      item.email.toLowerCase().includes(val)
    ) {
      return item;
    }
  });
});

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    dialogData.value = null;
  }
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

const mappedData = agenciesList
  .map((item) => {
    return {
      ...item,
      isChecked: false,
    };
  })
  .toReversed();

const filteredData = ref<AgenciesListViewType[]>(mappedData);
const finalData = ref<AgenciesListViewType[]>(filteredData.value);

const onCreateEditClick = (data: AgenciesListViewType | null) => {
  if (!data) {
    dialogData.value = {
      id: -1,
      since: new Date(),
      img: "",
      img_alt: "",
      name: "",
      location: "",
      property: "",
      employee: "",
      email: "",
      contact: "",
      isChecked: false,
    };
  } else {
    dialogData.value = data;
  }

  dialog.value = true;
};

const onCreateUpdate = (data: AgenciesListViewType) => {
  const since: string | Date | number =
    typeof data.since === "object" ? getFullYear(data.since) : data.since;
  if (data.id === -1) {
    filteredData.value.unshift({
      ...data,
      id: finalData.value.length + 1,
      img: data.img.src ? data.img.src : data.img,
      since,
    });
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
  dialog.value = false;
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
};
</script>
<template>
  <v-card>
    <v-card-title>
      <v-row justify="space-between">
        <v-col lg="4">
          <QuerySearch
            v-model="query"
            placeholder="Search for agencies, email, address or something..."
          />
        </v-col>
        <v-col lg="auto">
          <ListMenu
            isSortBy
            :listItems="[
              'Since',
              'Agencies Name',
              'Address',
              'Total Property',
              'Employee',
              'Email',
              'Contacts',
            ]"
          />
          <v-btn color="secondary" @click="onCreateEditClick(null)">
            <i class="ph-plus-circle me-1" /> Add Agencies
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-4">
      <Listing
        :data="filteredData"
        @onEdit="onCreateEditClick($event)"
        @onDelete="onDelete"
      />
    </v-card-text>
  </v-card>

  <CreateEditDialog
    v-if="dialogData"
    v-model="dialog"
    :data="dialogData"
    @onCreateUpdate="onCreateUpdate"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    @onConfirm="onConfirmDelete"
  />
</template>
