<script lang="ts" setup>
import { ref, watch } from "vue";
import Dashboard from "@/components/realEstate/list/Dashboard.vue";
import Listing from "@/components/realEstate/list/Listing.vue";
import { properties } from "@/components/realEstate/utils";
import { PropertyType } from "@/components/realEstate/types";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import CreateEditDialog from "@/components/realEstate/CreateEditDialog.vue";

const query = ref("");

const dialog = ref(false);
const realEstateData = ref<PropertyType | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<number | null>(null);

const filteredItems = ref<PropertyType[]>(properties);
const finalData = ref<PropertyType[]>(filteredItems.value);

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    realEstateData.value = null;
  }
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

watch(query, (newVal: string) => {
  filteredItems.value = finalData.value.filter((item) => {
    const val = newVal.toLowerCase();
    return (
      item.title.toLowerCase().includes(val) ||
      item.location.toLowerCase().includes(val) ||
      item.agent.toLowerCase().includes(val)
    );
  });
});

const onCreateEditClick = (data: PropertyType | null) => {
  if (!data) {
    realEstateData.value = {
      id: -1,
      type: "",
      title: "",
      img: "",
      img_alt: "image.png",
      location: "",
      bedroom: "",
      bathroom: "",
      area: "",
      rating: "4.5",
      price: "",
      isBookmark: false,
      agent: "",
      requirement: "",
    };
  } else {
    realEstateData.value = data;
  }
  dialog.value = true;
};

const onCreateUpdate = (data: PropertyType) => {
  if (data.id === -1) {
    const preparedData = {
      ...data,
      id: properties.length + 1,
      img: data.img.src ? data.img.src : data.img,
    };

    filteredItems.value.push(preparedData);
  } else {
    filteredItems.value = filteredItems.value.map((item) => {
      if (item.id === data.id) {
        return {
          ...item,
          ...data,
          img: data.img.src ? data.img.src : data.img,
        };
      }
      return item;
    });
  }

  finalData.value = filteredItems.value;
  dialog.value = false;
};

const onDelete = (id: number) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = () => {
  filteredItems.value = filteredItems.value.filter(
    (item) => item.id !== deleteId.value
  );
  finalData.value = filteredItems.value;
  deleteDialog.value = false;
};
</script>
<template>
  <Dashboard />
  <Listing
    v-model="query"
    :data="filteredItems"
    @onAdd="onCreateEditClick(null)"
    @onEdit="onCreateEditClick"
    @onDelete="onDelete"
  />

  <CreateEditDialog
    v-if="realEstateData"
    v-model="dialog"
    :data="realEstateData"
    @onCreateUpdate="onCreateUpdate"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    @onConfirm="onConfirmDelete"
  />
</template>
