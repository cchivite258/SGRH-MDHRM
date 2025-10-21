<script lang="ts" setup>
import { ref, watch } from "vue";
import { filters } from "@/components/realEstate/map/utils";
import TopFilters from "@/components/realEstate/map/TopFilters.vue";
import Listing from "@/components/realEstate/map/Listing.vue";
import { properties } from "@/components/realEstate/utils";
import { FilterType } from "@/components/realEstate/map/types";
import { PropertyType } from "@/components/realEstate/types";
import CreateEditDialog from "@/components/realEstate/CreateEditDialog.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";

const defaultFilters = ref<FilterType>(filters);
const filteredData = ref(properties);
const finalData = ref(filteredData.value);

const dialog = ref(false);
const realEstateData = ref<PropertyType | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<number | null>(null);

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

    filteredData.value.unshift(preparedData);
  } else {
    filteredData.value = filteredData.value.map((item) => {
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

  finalData.value = filteredData.value;
  dialog.value = false;
};

const onDelete = (id: number) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = () => {
  filteredData.value = filteredData.value.filter(
    (item) => item.id !== deleteId.value
  );
  finalData.value = filteredData.value;
  deleteDialog.value = false;
};
</script>
<template>
  <TopFilters v-model="defaultFilters" @onAdd="" />
  <v-row class="mt-3">
    <v-col cols="12" lg="5" class="pe-lg-0">
      <Listing
        :data="filteredData"
        @onEdit="onCreateEditClick"
        @onDelete="onDelete"
      />
    </v-col>
    <v-col cols="12" lg="7" class="ps-lg-0">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6509156.773725123!2d-123.79622260161696!3d37.19312212390098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb9fe5f285e3d%3A0x8b5109a227086f55!2sCalifornia%2C%20USA!5e0!3m2!1sen!2sin!4v1678106410566!5m2!1sen!2sin"
        style="border: 0; height: 100%; width: 100%"
        :allowfullscreen="true"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="rounded"
      ></iframe>
    </v-col>
  </v-row>

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
