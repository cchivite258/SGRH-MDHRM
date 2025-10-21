<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import TopBar from "@/components/realEstate/agent/gridView/TopBar.vue";
import { filter } from "@/components/realEstate/agent/gridView/utils";
import { AgentListingType } from "@/components/realEstate/agent/types";
import { FilterType } from "@/components/realEstate/agent/gridView/type";
import { agentListingData } from "@/components/realEstate/agent/utils";
import Listing from "@/components/realEstate/agent/gridView/Listing.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import CreateUpdateAgentDialog from "@/components/realEstate/agent/CreateUpdateAgentDialog.vue";
import Pagination from "@/app/common/components/Pagination.vue";

const defaultFilters = ref<FilterType>(filter);
const page = ref(1);
const dialog = ref(false);
const agentData = ref<AgentListingType | null>(null);

const filteredData = ref<AgentListingType[]>(agentListingData.toReversed());
const finalData = ref<AgentListingType[]>(filteredData.value);

const deleteDialog = ref(false);
const deleteId = ref<number | null>(null);

const query = computed(() => defaultFilters.value.query);
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

const status = computed(() => defaultFilters.value.status);

watch(status, (newVal: string) => {
  if (newVal !== "") {
    filteredData.value = finalData.value.filter((item) => {
      return item.status === newVal;
    });
  } else {
    filteredData.value = finalData.value;
  }
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
  <TopBar v-model="defaultFilters" @onAdd="onCreateEditClick(null)" />
  <Listing
    :data="filteredData"
    @onEdit="onCreateEditClick"
    @onDelete="onDelete"
  />
  <Pagination v-model="page" v-if="filteredData.length" />

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
